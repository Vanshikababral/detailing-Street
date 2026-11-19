import logging
import re
from datetime import datetime, time, timezone as datetime_timezone

from bson import ObjectId
from django.utils import timezone
from pymongo import ASCENDING, DESCENDING, ReturnDocument
from pymongo.errors import DuplicateKeyError, PyMongoError
from rest_framework import status
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .mongo import get_collection
from .staff_auth import AdminSessionAuthentication
from .staff_serializers import STAFF_ROLES, StaffInputSerializer, StaffStatusSerializer


logger = logging.getLogger(__name__)
PAGE_SIZE = 25
PHONE_INDEX_NAME = 'staff_phone_normalized_unique'


def staff_error(message, http_status):
    return Response({'success': False, 'error': message}, status=http_status)


def serializer_error(serializer):
    details = []
    for field, messages in serializer.errors.items():
        if not isinstance(messages, (list, tuple)):
            messages = [messages]
        details.extend(f'{field}: {message}' for message in messages)
    return staff_error(' '.join(details), status.HTTP_400_BAD_REQUEST)


def serialize_staff(document):
    joining_date = document.get('joiningDate')
    if isinstance(joining_date, datetime):
        joining_date = joining_date.date()
    joining_date = joining_date.isoformat() if joining_date else ''

    created_at = document.get('createdAt')
    updated_at = document.get('updatedAt')

    return {
        '_id': str(document.get('_id', '')),
        'name': document.get('name', ''),
        'phone': document.get('phone', ''),
        'email': document.get('email', ''),
        'role': document.get('role', ''),
        'specialization': document.get('specialization', ''),
        'joiningDate': joining_date,
        'status': document.get('status', 'Active'),
        'notes': document.get('notes', ''),
        'createdAt': created_at.isoformat() if created_at else '',
        'updatedAt': updated_at.isoformat() if updated_at else '',
    }


def normalized_phone(phone):
    return re.sub(r'\D', '', phone)


def ensure_staff_phone_index(collection):
    collection.create_index(
        [('phoneNormalized', ASCENDING)],
        unique=True,
        name=PHONE_INDEX_NAME,
    )


def staff_document_from_input(data, now):
    joining_date = data.get('joiningDate')
    joining_datetime = (
        datetime.combine(joining_date, time.min, tzinfo=datetime_timezone.utc)
        if joining_date
        else None
    )
    return {
        'name': data['name'],
        'phone': data['phone'],
        'phoneNormalized': normalized_phone(data['phone']),
        'email': data.get('email', ''),
        'role': data['role'],
        'specialization': data.get('specialization', ''),
        'joiningDate': joining_datetime,
        'status': data.get('status', 'Active'),
        'notes': data.get('notes', ''),
        'createdAt': now,
        'updatedAt': now,
    }


class StaffAPIView(APIView):
    authentication_classes = [AdminSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def handle_exception(self, exc):
        response = super().handle_exception(exc)
        if isinstance(exc, NotAuthenticated):
            return staff_error('Admin session required.', status.HTTP_401_UNAUTHORIZED)
        return response


class StaffListCreateView(StaffAPIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        role = request.query_params.get('role', 'All')
        staff_status = request.query_params.get('status', 'All')
        page_value = request.query_params.get('page', '1')

        if len(query) > 100:
            return staff_error('Search must be 100 characters or fewer.', status.HTTP_400_BAD_REQUEST)
        if role != 'All' and role not in STAFF_ROLES:
            return staff_error('Select a valid role filter.', status.HTTP_400_BAD_REQUEST)
        if staff_status not in ('All', 'Active', 'Inactive'):
            return staff_error('Select a valid status filter.', status.HTTP_400_BAD_REQUEST)
        try:
            requested_page = int(page_value)
        except (TypeError, ValueError):
            return staff_error('Page number is invalid.', status.HTTP_400_BAD_REQUEST)
        if requested_page < 1 or requested_page > 100000:
            return staff_error('Page number is invalid.', status.HTTP_400_BAD_REQUEST)

        collection = get_collection('staff')
        filters = {}
        if role != 'All':
            filters['role'] = role
        if staff_status != 'All':
            filters['status'] = staff_status
        if query:
            search_conditions = [
                {'name': {'$regex': re.escape(query), '$options': 'i'}},
                {'phone': {'$regex': re.escape(query), '$options': 'i'}},
            ]
            query_digits = normalized_phone(query)
            if query_digits:
                search_conditions.append({'phoneNormalized': {'$regex': query_digits}})
            filters['$or'] = search_conditions

        try:
            total = collection.count_documents(filters)
            page_count = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
            page = min(requested_page, page_count)
            records = collection.find(filters).sort([
                ('createdAt', DESCENDING),
                ('_id', DESCENDING),
            ]).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)
            metrics = {
                'total': collection.count_documents({}),
                'active': collection.count_documents({'status': 'Active'}),
                'inactive': collection.count_documents({'status': 'Inactive'}),
                'detailingSpecialists': collection.count_documents({'role': 'Detailing Specialist'}),
            }
            return Response({
                'success': True,
                'staff': [serialize_staff(document) for document in records],
                'metrics': metrics,
                'roles': STAFF_ROLES,
                'pagination': {
                    'page': page,
                    'pageSize': PAGE_SIZE,
                    'total': total,
                    'pageCount': page_count,
                },
            })
        except PyMongoError:
            logger.exception('Failed to load staff directory.')
            return staff_error('Staff records could not be loaded. Please try again.', status.HTTP_503_SERVICE_UNAVAILABLE)

    def post(self, request):
        serializer = StaffInputSerializer(data=request.data)
        if not serializer.is_valid():
            return serializer_error(serializer)

        collection = get_collection('staff')
        now = timezone.now()
        document = staff_document_from_input(serializer.validated_data, now)
        try:
            ensure_staff_phone_index(collection)
            result = collection.insert_one(document)
            document['_id'] = result.inserted_id
            return Response(
                {'success': True, 'staff': serialize_staff(document)},
                status=status.HTTP_201_CREATED,
            )
        except DuplicateKeyError:
            return staff_error(
                'A staff member with this phone number already exists.',
                status.HTTP_409_CONFLICT,
            )
        except PyMongoError:
            logger.exception('Failed to create staff record.')
            return staff_error('Staff member could not be added. Please try again.', status.HTTP_503_SERVICE_UNAVAILABLE)


class StaffDetailView(StaffAPIView):
    def put(self, request, staff_id):
        if not ObjectId.is_valid(staff_id):
            return staff_error('Staff record was not found.', status.HTTP_404_NOT_FOUND)

        serializer = StaffInputSerializer(data=request.data)
        if not serializer.is_valid():
            return serializer_error(serializer)

        collection = get_collection('staff')
        document = staff_document_from_input(serializer.validated_data, timezone.now())
        document.pop('createdAt')
        try:
            ensure_staff_phone_index(collection)
            updated = collection.find_one_and_update(
                {'_id': ObjectId(staff_id)},
                {'$set': document},
                return_document=ReturnDocument.AFTER,
            )
            if not updated:
                return staff_error('Staff record was not found.', status.HTTP_404_NOT_FOUND)
            return Response({'success': True, 'staff': serialize_staff(updated)})
        except DuplicateKeyError:
            return staff_error(
                'A staff member with this phone number already exists.',
                status.HTTP_409_CONFLICT,
            )
        except PyMongoError:
            logger.exception('Failed to update staff record.')
            return staff_error('Staff member could not be updated. Please try again.', status.HTTP_503_SERVICE_UNAVAILABLE)

    def patch(self, request, staff_id):
        if not ObjectId.is_valid(staff_id):
            return staff_error('Staff record was not found.', status.HTTP_404_NOT_FOUND)

        serializer = StaffStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return serializer_error(serializer)

        collection = get_collection('staff')
        try:
            updated = collection.find_one_and_update(
                {'_id': ObjectId(staff_id)},
                {'$set': {'status': serializer.validated_data['status'], 'updatedAt': timezone.now()}},
                return_document=ReturnDocument.AFTER,
            )
            if not updated:
                return staff_error('Staff record was not found.', status.HTTP_404_NOT_FOUND)
            return Response({'success': True, 'staff': serialize_staff(updated)})
        except PyMongoError:
            logger.exception('Failed to change staff status.')
            return staff_error('Staff status could not be changed. Please try again.', status.HTTP_503_SERVICE_UNAVAILABLE)

    def delete(self, request, staff_id):
        if not ObjectId.is_valid(staff_id):
            return staff_error('Staff record was not found.', status.HTTP_404_NOT_FOUND)

        try:
            deleted = get_collection('staff').find_one_and_delete({'_id': ObjectId(staff_id)})
            if not deleted:
                return staff_error('Staff record was not found.', status.HTTP_404_NOT_FOUND)
            return Response({'success': True})
        except PyMongoError:
            logger.exception('Failed to delete staff record.')
            return staff_error('Staff member could not be deleted. Please try again.', status.HTTP_503_SERVICE_UNAVAILABLE)
