from datetime import timedelta

from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Appointment


class AppointmentModelTests(TestCase):
    def setUp(self):
        self.appointment_data = {
            'customer_name': 'Test Customer',
            'phone': '+911234567890',
            'email': 'customer@example.com',
            'car_model': 'Test Model',
            'service': 'Ceramic Coating',
            'preferred_date': timezone.localdate() + timedelta(days=1),
        }

    def test_appointment_creation_generates_booking_id_and_timestamp(self):
        appointment = Appointment.objects.create(**self.appointment_data)

        self.assertRegex(appointment.booking_id, r'^DS-\d{8}-[A-F0-9]{12}$')
        self.assertIsNotNone(appointment.created_at)

    def test_status_defaults_to_pending(self):
        appointment = Appointment.objects.create(**self.appointment_data)

        self.assertEqual(appointment.status, Appointment.Status.PENDING)

    def test_booking_ids_are_generated_uniquely_and_enforced_by_database(self):
        first = Appointment.objects.create(**self.appointment_data)
        second = Appointment.objects.create(**self.appointment_data)

        self.assertNotEqual(first.booking_id, second.booking_id)

        with self.assertRaises(IntegrityError), transaction.atomic():
            Appointment.objects.create(
                **self.appointment_data,
                booking_id=first.booking_id,
            )


class AppointmentApiTests(APITestCase):
    def setUp(self):
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
        self.list_url = '/api/appointments/'

    def test_create_appointment_returns_booking_reference(self):
        response = self.client.post(self.create_url, self.payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertRegex(response.data['bookingId'], r'^DS-\d{8}-[A-F0-9]{12}$')
        self.assertIn('submitted', response.data['message'])
        appointment = Appointment.objects.get(booking_id=response.data['bookingId'])
        self.assertEqual(appointment.customer_name, 'Test Customer')
        self.assertEqual(appointment.phone, '9876543210')
        self.assertEqual(appointment.preferred_time.strftime('%I:%M %p'), '09:00 AM')

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
        appointment = Appointment.objects.get(booking_id=response.data['bookingId'])
        self.assertEqual(appointment.car_model, '')
        self.assertIsNone(appointment.preferred_date)
        self.assertIsNone(appointment.preferred_time)

    def test_missing_required_fields_return_field_errors(self):
        response = self.client.post(self.create_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(set(response.data), {'customerName', 'phoneNumber', 'service'})

    def test_invalid_email_and_date_return_field_errors(self):
        for field, value in (
            ('email', 'not-an-email'),
            ('preferredDate', '28-10-2026'),
        ):
            with self.subTest(field=field):
                payload = {**self.payload, field: value}
                response = self.client.post(self.create_url, payload, format='json')

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(field, response.data)

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

    def test_api_creates_distinct_booking_references(self):
        first = self.client.post(self.create_url, self.payload, format='json')
        second = self.client.post(self.create_url, self.payload, format='json')

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(first.data['bookingId'], second.data['bookingId'])

    def test_appointment_records_require_staff_access(self):
        appointment = Appointment.objects.create(
            customer_name='Private Customer',
            phone='9876543210',
            car_model='Private Model',
            service='Ceramic Coating',
            preferred_date=timezone.localdate() + timedelta(days=1),
        )
        detail_url = f'/api/appointments/{appointment.pk}/'

        self.assertEqual(
            self.client.get(self.list_url).status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.get(detail_url).status_code,
            status.HTTP_403_FORBIDDEN,
        )

        user_model = get_user_model()
        regular_user = user_model.objects.create_user(
            username='customer',
            password='test-password',
        )
        self.client.force_authenticate(user=regular_user)
        self.assertEqual(
            self.client.get(self.list_url).status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.get(detail_url).status_code,
            status.HTTP_403_FORBIDDEN,
        )

        staff_user = user_model.objects.create_user(
            username='staff',
            password='test-password',
            is_staff=True,
        )
        self.client.force_authenticate(user=staff_user)
        list_response = self.client.get(self.list_url)
        detail_response = self.client.get(detail_url)

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data['phone'], '9876543210')

    def test_health_endpoint_returns_success(self):
        response = self.client.get('/api/health/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], 'ok')
