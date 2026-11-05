import re
from datetime import date

from django.utils import timezone
from rest_framework import serializers


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


class AppointmentCreateSerializer(serializers.Serializer):
    customerName = serializers.CharField(min_length=2, max_length=100)
    phoneNumber = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True, max_length=254)
    carModel = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )
    vehicleRegistration = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
    )
    vehicleMake = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=80,
    )
    vehicleModel = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )
    state = serializers.CharField(required=False, allow_blank=True, max_length=100)
    address = serializers.CharField(required=False, allow_blank=True, max_length=300)
    city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    zipCode = serializers.CharField(required=False, allow_blank=True, max_length=20)
    service = serializers.CharField(min_length=2, max_length=120)
    preferredDate = EmptyStringAsNullDateField(
        required=False,
        allow_null=True,
        input_formats=['%Y-%m-%d'],
    )
    preferredTime = EmptyStringAsNullTimeField(
        required=False,
        allow_null=True,
        input_formats=['%I:%M %p', '%H:%M', '%H:%M:%S'],
    )
    message = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
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

    def validate_service(self, value):
        value = value.strip()
        active_service_names = self.context.get('active_service_names', set())
        if value not in SERVICES and value not in active_service_names:
            raise serializers.ValidationError('Select an active service from the catalog.')
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

    def validate(self, attrs):
        registration = attrs.get('vehicleRegistration', '').strip()
        if registration and not (
            attrs.get('vehicleMake', '').strip()
            and attrs.get('vehicleModel', '').strip()
        ):
            raise serializers.ValidationError({
                'vehicleRegistration': 'Enter the vehicle make and model when providing a registration.'
            })
        return attrs
