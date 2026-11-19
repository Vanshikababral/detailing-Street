import base64
import hashlib
import hmac
import json
from datetime import timedelta
import os
from unittest.mock import MagicMock, Mock, patch

from bson import ObjectId
from django.utils import timezone
from django.test import SimpleTestCase
from pymongo.errors import DuplicateKeyError
from rest_framework import status
from rest_framework.test import APIClient

from . import mongo


class AppointmentApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.payload = {
            'customerName': 'Test Customer',
            'phoneNumber': '9876543210',
            'email': 'customer@example.com',
            'carModel': 'Test Model',
            'service': 'Ceramic Coating',
            'preferredDate': (timezone.localdate() + timedelta(days=1)).isoformat(),
            'preferredTime': '9:00 AM',
            'message': 'Please call before confirming.',
        }
        self.create_url = '/api/book-appointment/'
        self.collections = {
            'appointments': Mock(),
            'customers': Mock(),
            'vehicles': Mock(),
            'services': Mock(),
        }
        self.get_collection_patch = patch(
            'bookings.views.get_collection',
            side_effect=lambda name: self.collections[name],
        )
        self.get_collection = self.get_collection_patch.start()
        self.addCleanup(self.get_collection_patch.stop)
        self.collections['appointments'].insert_one.return_value.inserted_id = ObjectId(
            '507f1f77bcf86cd799439011'
        )
        self.collections['customers'].update_one.return_value.upserted_id = ObjectId(
            '507f1f77bcf86cd799439012'
        )
        self.collections['services'].distinct.return_value = []
        self.collections['services'].find_one.return_value = None

    def test_create_appointment_returns_booking_reference(self):
        response = self.client.post(self.create_url, self.payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertRegex(response.data['bookingId'], r'^DS-\d{8}-[A-F0-9]{12}$')
        self.assertIn('submitted', response.data['message'])
        self.assertEqual(response.data['appointment']['_id'], '507f1f77bcf86cd799439011')
        self.get_collection.assert_any_call('appointments')
        document = self.collections['appointments'].insert_one.call_args.args[0]
        self.assertEqual(document['customerName'], 'Test Customer')
        self.assertEqual(document['phoneNumber'], '9876543210')
        self.assertEqual(document['preferredTime'], '09:00 AM')
        self.assertEqual(document['preferredDate'], self.payload['preferredDate'])
        self.assertEqual(document['amount'], 0)
        self.collections['customers'].update_one.assert_called_once()
        self.collections['vehicles'].update_one.assert_not_called()

    def test_create_appointment_syncs_customer_and_registered_vehicle(self):
        payload = {
            **self.payload,
            'vehicleRegistration': 'pb10ab1234',
            'vehicleMake': 'Honda',
            'vehicleModel': 'City',
            'state': 'Punjab',
            'address': 'Test Road',
            'city': 'Ludhiana',
            'zipCode': '141001',
        }

        response = self.client.post(self.create_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        appointment = self.collections['appointments'].insert_one.call_args.args[0]
        self.assertEqual(appointment['carModel'], 'Honda City')
        self.assertEqual(appointment['vehicleRegistration'], 'PB10AB1234')
        customer_update = self.collections['customers'].update_one.call_args
        self.assertEqual(customer_update.args[0], {'phone': '9876543210'})
        self.assertEqual(customer_update.args[1]['$set']['city'], 'Ludhiana')
        vehicle_update = self.collections['vehicles'].update_one.call_args
        self.assertEqual(vehicle_update.args[0], {'registration': 'PB10AB1234'})
        self.assertEqual(vehicle_update.args[1]['$set']['model'], 'City')

    def test_optional_form_fields_can_be_omitted_or_empty(self):
        payload = {
            'customerName': 'Test Customer',
            'phoneNumber': '9876543210',
            'service': 'Premium Washing',
            'email': '',
            'carModel': '',
            'preferredDate': '',
            'preferredTime': '',
            'message': '',
        }

        response = self.client.post(self.create_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        document = self.collections['appointments'].insert_one.call_args.args[0]
        self.assertEqual(document['carModel'], '')
        self.assertEqual(document['preferredDate'], '')
        self.assertEqual(document['preferredTime'], '')

    def test_missing_required_fields_return_field_errors(self):
        response = self.client.post(self.create_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(set(response.data), {'customerName', 'phoneNumber', 'service'})

    def test_invalid_email_and_date_return_field_errors(self):
        for field, value in (
            ('email', 'not-an-email'),
            ('preferredDate', '28-10-2026'),
            ('phoneNumber', '123'),
            ('service', 'Unknown service'),
        ):
            with self.subTest(field=field):
                payload = {**self.payload, field: value}
                response = self.client.post(self.create_url, payload, format='json')

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(field, response.data)

    def test_custom_active_catalog_service_is_accepted(self):
        self.collections['services'].distinct.return_value = ['Interior Detailing']
        response = self.client.post(
            self.create_url,
            {**self.payload, 'service': 'Interior Detailing'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.collections['services'].distinct.assert_called_once_with(
            'name',
            {'status': 'Active'},
        )

    def test_vehicle_registration_requires_make_and_model(self):
        response = self.client.post(
            self.create_url,
            {**self.payload, 'vehicleRegistration': 'PB10AB1234'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('vehicleRegistration', response.data)
        self.collections['appointments'].insert_one.assert_not_called()
        self.collections['customers'].update_one.assert_not_called()

    def test_oversized_message_is_rejected(self):
        payload = {**self.payload, 'message': 'x' * 2001}

        response = self.client.post(self.create_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)

    def test_unexpected_fields_are_rejected(self):
        payload = {**self.payload, 'unexpected': 'extra data'}

        response = self.client.post(self.create_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('unexpected', response.data)

    def test_past_preferred_date_is_rejected(self):
        payload = {
            **self.payload,
            'preferredDate': (timezone.localdate() - timedelta(days=1)).isoformat(),
        }

        response = self.client.post(self.create_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('preferredDate', response.data)
        self.collections['appointments'].insert_one.assert_not_called()

    def test_api_creates_distinct_booking_references(self):
        with patch(
            'bookings.views.secrets.token_hex',
            side_effect=('abcdef123456', '0123456789ab'),
        ):
            first = self.client.post(self.create_url, self.payload, format='json')
            second = self.client.post(self.create_url, self.payload, format='json')

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(first.data['bookingId'], second.data['bookingId'])

    def test_mongo_insert_is_not_attempted_for_invalid_payload(self):
        response = self.client.post(self.create_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.collections['appointments'].insert_one.assert_not_called()

    def test_health_endpoint_returns_success(self):
        response = self.client.get('/api/health/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], 'ok')


class MongoDatabaseConfigTests(SimpleTestCase):
    def test_database_name_can_be_configured_without_changing_the_uri(self):
        client = MagicMock()
        with (
            patch.dict(os.environ, {'MONGODB_DATABASE': 'detailing_street'}),
            patch.object(mongo, '_client', client),
        ):
            database = mongo.get_db()

        self.assertIs(database, client.__getitem__.return_value)
        client.__getitem__.assert_called_once_with('detailing_street')

    def test_empty_database_name_is_rejected(self):
        with (
            patch.dict(os.environ, {'MONGODB_DATABASE': '  '}),
            patch.object(mongo, '_client', Mock()),
        ):
            with self.assertRaisesMessage(ValueError, 'MONGODB_DATABASE must not be empty.'):
                mongo.get_db()


class StaffApiTests(SimpleTestCase):
    def setUp(self):
        self.environment = patch.dict(os.environ, {
            'ADMIN_EMAIL': 'admin@example.com',
            'ADMIN_SESSION_SECRET': 'test-session-secret',
        })
        self.environment.start()
        self.addCleanup(self.environment.stop)

        payload = {
            'email': 'admin@example.com',
            'role': 'Owner',
            'exp': int(timezone.now().timestamp() * 1000) + 60_000,
        }
        payload_base64 = base64.b64encode(
            json.dumps(payload, separators=(',', ':')).encode('utf-8')
        ).decode('ascii')
        signature = hmac.new(
            b'test-session-secret',
            payload_base64.encode('ascii'),
            hashlib.sha256,
        ).hexdigest()

        self.client = APIClient()
        self.client.cookies['admin_session'] = f'{payload_base64}.{signature}'
        self.staff_id = ObjectId('507f1f77bcf86cd799439011')
        self.document = {
            '_id': self.staff_id,
            'name': 'Test Detailer',
            'phone': '+91 98765 43210',
            'phoneNormalized': '919876543210',
            'email': 'detailer@example.test',
            'role': 'Detailing Specialist',
            'specialization': 'Paint protection film',
            'joiningDate': timezone.now(),
            'status': 'Active',
            'notes': '',
            'createdAt': timezone.now(),
            'updatedAt': timezone.now(),
        }
        self.collection = Mock()
        self.collection.insert_one.return_value.inserted_id = self.staff_id
        self.get_collection_patch = patch(
            'bookings.staff_views.get_collection',
            return_value=self.collection,
        )
        self.get_collection = self.get_collection_patch.start()
        self.addCleanup(self.get_collection_patch.stop)

    def test_staff_api_rejects_requests_without_admin_session(self):
        self.client.cookies.clear()

        response = self.client.get('/api/staff/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {
            'success': False,
            'error': 'Admin session required.',
        })
        self.get_collection.assert_not_called()

    def test_staff_list_returns_database_metrics_and_records(self):
        cursor = MagicMock()
        cursor.sort.return_value = cursor
        cursor.skip.return_value = cursor
        cursor.limit.return_value = [self.document]
        self.collection.find.return_value = cursor
        self.collection.count_documents.side_effect = [1, 5, 4, 1, 2]

        response = self.client.get('/api/staff/?q=detailer&role=Detailing%20Specialist&status=Active')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['staff'][0]['_id'], str(self.staff_id))
        self.assertEqual(response.data['metrics'], {
            'total': 5,
            'active': 4,
            'inactive': 1,
            'detailingSpecialists': 2,
        })
        self.collection.find.assert_called_once_with({
            'role': 'Detailing Specialist',
            'status': 'Active',
            '$or': [
                {'name': {'$regex': 'detailer', '$options': 'i'}},
                {'phone': {'$regex': 'detailer', '$options': 'i'}},
            ],
        })

    def test_create_staff_persists_normalized_phone_and_returns_record(self):
        payload = {
            'name': ' New Team Member ',
            'phone': '+91 (98765) 43210',
            'email': 'NEW@example.test',
            'role': 'Detailing Specialist',
            'specialization': 'PPF',
            'joiningDate': '2025-03-10',
            'status': 'Active',
            'notes': 'Experienced installer.',
        }

        response = self.client.post('/api/staff/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['staff']['_id'], str(self.staff_id))
        self.collection.create_index.assert_called_once()
        inserted = self.collection.insert_one.call_args.args[0]
        self.assertEqual(inserted['name'], 'New Team Member')
        self.assertEqual(inserted['phoneNormalized'], '919876543210')
        self.assertEqual(inserted['email'], 'new@example.test')
        self.assertEqual(inserted['joiningDate'].date().isoformat(), '2025-03-10')

    def test_invalid_staff_input_is_rejected_without_database_write(self):
        response = self.client.post(
            '/api/staff/',
            {
                'name': 'New Team Member',
                'phone': '123',
                'role': 'Unknown role',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.collection.insert_one.assert_not_called()

    def test_duplicate_staff_phone_returns_conflict(self):
        self.collection.insert_one.side_effect = DuplicateKeyError('duplicate phone')

        response = self.client.post(
            '/api/staff/',
            {
                'name': 'Another Detailer',
                'phone': '9876543210',
                'role': 'Technician',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('already exists', response.data['error'])

    def test_update_status_and_delete_staff_record(self):
        self.collection.find_one_and_update.return_value = {
            **self.document,
            'status': 'Inactive',
        }
        patch_response = self.client.patch(
            f'/api/staff/{self.staff_id}/',
            {'status': 'Inactive'},
            format='json',
        )

        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['staff']['status'], 'Inactive')

        self.collection.find_one_and_delete.return_value = self.document
        delete_response = self.client.delete(f'/api/staff/{self.staff_id}/')

        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_response.data, {'success': True})

    def test_edit_staff_details_updates_record_without_replacing_created_at(self):
        updated_document = {
            **self.document,
            'name': 'Updated Team Member',
            'phone': '9876543210',
            'phoneNormalized': '9876543210',
        }
        self.collection.find_one_and_update.return_value = updated_document
        payload = {
            'name': 'Updated Team Member',
            'phone': '9876543210',
            'role': 'Manager',
            'status': 'Active',
        }

        response = self.client.put(
            f'/api/staff/{self.staff_id}/',
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['staff']['name'], 'Updated Team Member')
        self.assertEqual(
            self.collection.find_one_and_update.call_args.args[1]['$set']['phoneNormalized'],
            '9876543210',
        )
        self.assertNotIn(
            'createdAt',
            self.collection.find_one_and_update.call_args.args[1]['$set'],
        )
