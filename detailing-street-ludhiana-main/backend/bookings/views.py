import datetime
import secrets
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from bson import ObjectId

from .mongo import get_collection

def generate_booking_id() -> str:
    today_str = datetime.date.today().strftime('%Y%m%d')
    rand_hex = secrets.token_hex(3).upper()
    return f'DS-{today_str}-{rand_hex}'

def serialize_mongo_doc(doc: dict) -> dict:
    if not doc:
        return {}
    doc['_id'] = str(doc.get('_id', ''))
    return doc

class AppointmentCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        customer_name = (data.get('customerName') or '').strip()
        phone_number = (data.get('phoneNumber') or '').strip()
        service = (data.get('service') or '').strip()

        if not customer_name:
            return Response({'success': False, 'error': 'Customer name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not phone_number:
            return Response({'success': False, 'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not service:
            return Response({'success': False, 'error': 'Service is required.'}, status=status.HTTP_400_BAD_REQUEST)

        booking_id = generate_booking_id()
        now = datetime.datetime.now(datetime.timezone.utc)

        doc = {
            'bookingId': booking_id,
            'customerName': customer_name,
            'phoneNumber': phone_number,
            'email': (data.get('email') or '').strip(),
            'carModel': (data.get('carModel') or '').strip(),
            'service': service,
            'preferredDate': (data.get('preferredDate') or '').strip(),
            'preferredTime': (data.get('preferredTime') or '').strip(),
            'message': (data.get('message') or '').strip(),
            'amount': float(data.get('amount') or 0),
            'status': 'Pending',
            'createdAt': now,
            'updatedAt': now,
        }

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
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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
