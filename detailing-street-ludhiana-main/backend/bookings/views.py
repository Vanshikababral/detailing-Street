import datetime
import secrets
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from bson import ObjectId

from .mongo import get_collection
from .serializers import AppointmentCreateSerializer, SERVICES
from .staff_auth import AdminSessionAuthentication
from .sync import sync_customer, sync_vehicle

def generate_booking_id() -> str:
    today_str = timezone.localdate().strftime('%Y%m%d')
    rand_hex = secrets.token_hex(6).upper()
    return f'DS-{today_str}-{rand_hex}'

def serialize_mongo_doc(doc: dict) -> dict:
    if not doc:
        return {}
    doc['_id'] = str(doc.get('_id', ''))
    return doc

class AppointmentCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        requested_service = request.data.get('service')
        active_service_names = set()
        if isinstance(requested_service, str) and requested_service.strip() not in SERVICES:
            active_service_names = set(
                get_collection('services').distinct('name', {'status': 'Active'})
            )

        serializer = AppointmentCreateSerializer(
            data=request.data,
            context={'active_service_names': active_service_names},
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        booking_id = generate_booking_id()
        now = timezone.now()
        preferred_date = data.get('preferredDate')
        preferred_time = data.get('preferredTime')

        doc = {
            'bookingId': booking_id,
            'customerName': data['customerName'],
            'phoneNumber': data['phoneNumber'],
            'email': data.get('email', ''),
            'carModel': ' '.join(
                value for value in (
                    data.get('vehicleMake', '').strip(),
                    data.get('vehicleModel', '').strip(),
                ) if value
            ) or data.get('carModel', ''),
            'vehicleRegistration': data.get('vehicleRegistration', '').strip().upper(),
            'vehicleMake': data.get('vehicleMake', '').strip(),
            'vehicleModel': data.get('vehicleModel', '').strip(),
            'service': data['service'],
            'preferredDate': preferred_date.isoformat() if preferred_date else '',
            'preferredTime': preferred_time.strftime('%I:%M %p') if preferred_time else '',
            'message': data.get('message', ''),
            'state': data.get('state', ''),
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'zipCode': data.get('zipCode', ''),
            'amount': 0,
            'status': 'Pending',
            'createdAt': now,
            'updatedAt': now,
        }

        customer_id = sync_customer(data, get_collection('customers'), now)
        sync_vehicle(data, get_collection('vehicles'), customer_id, now)
        coll = get_collection('appointments')
        result = coll.insert_one(doc)
        doc['_id'] = str(result.inserted_id)

        return Response(
            {
                'success': True,
                'bookingId': booking_id,
                'message': f'Booking {booking_id} submitted! Our team will contact you shortly.',
                'appointment': serialize_mongo_doc(doc),
            },
            status=status.HTTP_201_CREATED,
        )

class AppointmentListView(APIView):
    authentication_classes = [AdminSessionAuthentication]
    permission_classes = [IsAuthenticated]  # Admin only

    def get(self, request, *args, **kwargs):
        coll = get_collection('appointments')
        cursor = coll.find().sort('createdAt', -1)
        appointments = [serialize_mongo_doc(d) for d in cursor]
        return Response({'success': True, 'appointments': appointments})

    def patch(self, request, *args, **kwargs):
        data = request.data
        doc_id = data.get('id')
        booking_id = data.get('bookingId')
        new_status = data.get('status')
        amount = data.get('amount')

        query = {}
        if doc_id:
            try:
                query['_id'] = ObjectId(doc_id)
            except Exception:
                query['bookingId'] = doc_id
        elif booking_id:
            query['bookingId'] = booking_id

        if not query:
            return Response({'success': False, 'error': 'Missing ID or bookingId'}, status=status.HTTP_400_BAD_REQUEST)

        update_fields = {'updatedAt': datetime.datetime.now(datetime.timezone.utc)}
        if new_status:
            update_fields['status'] = new_status
        if amount is not None:
            update_fields['amount'] = float(amount)

        coll = get_collection('appointments')
        updated = coll.find_one_and_update(query, {'$set': update_fields}, return_document=True)

        if updated and new_status == 'Completed':
            vehicle_reg = (updated.get('vehicleRegistration') or '').strip().upper()
            amt = float(updated.get('amount') or 0)
            today_date = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
            if vehicle_reg:
                get_collection('vehicles').update_one(
                    {'registration': vehicle_reg},
                    {
                        '$inc': {'serviceCount': 1, 'totalSpent': amt},
                        '$set': {
                            'lastServiced': today_date,
                            'updatedAt': datetime.datetime.now(datetime.timezone.utc),
                        },
                    }
                )

        return Response({'success': True, 'appointment': serialize_mongo_doc(updated)})

    def delete(self, request, *args, **kwargs):
        doc_id = request.query_params.get('id')
        booking_id = request.query_params.get('bookingId')
        query = {}
        if doc_id:
            try:
                query['_id'] = ObjectId(doc_id)
            except Exception:
                query['bookingId'] = doc_id
        elif booking_id:
            query['bookingId'] = booking_id

        if not query:
            return Response({'success': False, 'error': 'Missing ID'}, status=status.HTTP_400_BAD_REQUEST)

        coll = get_collection('appointments')
        coll.delete_one(query)
        return Response({'success': True})

class DashboardStatsView(APIView):
    authentication_classes = [AdminSessionAuthentication]
    permission_classes = [IsAuthenticated]  # Admin only

    def get(self, request, *args, **kwargs):
        appointments_coll = get_collection('appointments')
        customers_coll = get_collection('customers')
        vehicles_coll = get_collection('vehicles')
        services_coll = get_collection('services')

        total_bookings = appointments_coll.count_documents({})
        pending_count = appointments_coll.count_documents({'status': 'Pending'})
        completed_docs = list(appointments_coll.find({'status': 'Completed'}))
        revenue = sum(doc.get('amount', 0) for doc in completed_docs)

        recent_cursor = appointments_coll.find().sort('createdAt', -1).limit(10)
        recent_appointments = [serialize_mongo_doc(d) for d in recent_cursor]

        return Response({
            'success': True,
            'metrics': {
                'totalBookings': total_bookings,
                'pendingAppointments': pending_count,
                'revenue': revenue,
                'completedServices': len(completed_docs),
                'totalCustomers': customers_coll.count_documents({}),
                'totalVehicles': vehicles_coll.count_documents({}),
                'totalServices': services_coll.count_documents({}),
            },
            'recentAppointments': recent_appointments,
        })

@require_GET
def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'framework': 'Django 5.2 (REST Framework)',
        'database': 'MongoDB Atlas',
        'service': 'detailing-street-ludhiana-api'
    })
