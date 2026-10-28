import re
from datetime import date

from django.utils import timezone
from rest_framework import serializers

from .models import Appointment


SERVICES = (
    'Paint Protection Film (PPF)',
    'Ceramic Coating',
    'Premium Washing',
    'Car Accessories',
    'Coloured Wrap',
    'Borophene Coating',
    'Tinting Film',
    'Other / Consultation',
)


class EmptyStringAsNullDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value == '':
            return None
        return super().to_internal_value(value)


class EmptyStringAsNullTimeField(serializers.TimeField):
    def to_internal_value(self, value):
        if value == '':
            return None
        return super().to_internal_value(value)


class AppointmentCreateSerializer(serializers.ModelSerializer):
    customerName = serializers.CharField(source='customer_name', max_length=100)
    phoneNumber = serializers.CharField(source='phone', max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True, max_length=254)
    carModel = serializers.CharField(
        source='car_model',
        required=False,
        allow_blank=True,
        max_length=100,
    )
    service = serializers.ChoiceField(choices=SERVICES)
    preferredDate = EmptyStringAsNullDateField(
        source='preferred_date',
        required=False,
        allow_null=True,
        input_formats=['%Y-%m-%d'],
    )
    preferredTime = EmptyStringAsNullTimeField(
        source='preferred_time',
        required=False,
        allow_null=True,
        input_formats=['%I:%M %p', '%H:%M', '%H:%M:%S'],
    )
    message = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
    )

    class Meta:
        model = Appointment
        fields = (
            'customerName',
            'phoneNumber',
            'email',
            'carModel',
            'service',
            'preferredDate',
            'preferredTime',
            'message',
        )

    def to_internal_value(self, data):
        if hasattr(data, 'keys'):
            unknown_fields = set(data.keys()) - set(self.fields.keys())
            if unknown_fields:
                raise serializers.ValidationError(
                    {
                        field: ['Unknown field.']
                        for field in sorted(unknown_fields)
                    }
                )
        return super().to_internal_value(data)

    def validate_customerName(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Enter at least 2 characters.')
        return value

    def validate_phoneNumber(self, value):
        phone = re.sub(r'\s+', '', value)
        if not re.fullmatch(r'[6-9]\d{9}', phone):
            raise serializers.ValidationError(
                'Enter a valid 10-digit Indian mobile number.'
            )
        return phone

    def validate_preferredDate(self, value: date | None):
        if value is not None and value < timezone.localdate():
            raise serializers.ValidationError('Choose today or a future date.')
        return value


class AppointmentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = (
            'id',
            'booking_id',
            'customer_name',
            'phone',
            'email',
            'car_model',
            'service',
            'preferred_date',
            'preferred_time',
            'message',
            'status',
            'created_at',
        )
