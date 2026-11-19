import re

from rest_framework import serializers


STAFF_ROLES = (
    'Owner',
    'Manager',
    'Detailing Specialist',
    'Technician',
    'Service Advisor',
    'Other',
)


class EmptyStringAsNullDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value == '':
            return None
        return super().to_internal_value(value)


class StaffInputSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=1, max_length=100)
    phone = serializers.CharField(max_length=24)
    email = serializers.EmailField(required=False, allow_blank=True, max_length=254)
    role = serializers.ChoiceField(choices=STAFF_ROLES)
    specialization = serializers.CharField(required=False, allow_blank=True, max_length=80)
    joiningDate = EmptyStringAsNullDateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
    status = serializers.ChoiceField(choices=('Active', 'Inactive'), default='Active')
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)

    def to_internal_value(self, data):
        if hasattr(data, 'keys'):
            unknown_fields = set(data.keys()) - set(self.fields.keys())
            if unknown_fields:
                raise serializers.ValidationError({
                    field: ['Unknown field.']
                    for field in sorted(unknown_fields)
                })
        return super().to_internal_value(data)

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Enter a full name.')
        return value

    def validate_phone(self, value):
        phone = value.strip()
        digits = re.sub(r'\D', '', phone)
        if not re.fullmatch(r'\+?[\d\s().-]+', phone) or not 7 <= len(digits) <= 15:
            raise serializers.ValidationError('Enter a valid phone number containing 7 to 15 digits.')
        return phone

    def validate_email(self, value):
        return value.strip().lower()

    def validate_specialization(self, value):
        return value.strip()

    def validate_notes(self, value):
        return value.strip()


class StaffStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=('Active', 'Inactive'))

    def to_internal_value(self, data):
        if hasattr(data, 'keys'):
            unknown_fields = set(data.keys()) - set(self.fields.keys())
            if unknown_fields:
                raise serializers.ValidationError({
                    field: ['Unknown field.']
                    for field in sorted(unknown_fields)
                })
        return super().to_internal_value(data)
