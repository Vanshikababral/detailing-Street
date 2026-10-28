import secrets

from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone


def generate_booking_id() -> str:
    return f'DS-{timezone.localdate():%Y%m%d}-{secrets.token_hex(6).upper()}'


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        CONFIRMED = 'Confirmed', 'Confirmed'
        COMPLETED = 'Completed', 'Completed'
        CANCELLED = 'Cancelled', 'Cancelled'

    booking_id = models.CharField(
        max_length=24,
        unique=True,
        editable=False,
        default=generate_booking_id,
    )
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+?[0-9\s()-]{7,20}$',
                message='Enter a valid phone number.',
            )
        ],
    )
    email = models.EmailField(blank=True, default='')
    car_model = models.CharField(max_length=100, blank=True, default='')
    service = models.CharField(max_length=100)
    preferred_date = models.DateField(blank=True, null=True)
    preferred_time = models.TimeField(blank=True, null=True)
    message = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=Q(
                    status__in=('Pending', 'Confirmed', 'Completed', 'Cancelled')
                ),
                name='appointment_status_valid',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.booking_id} - {self.customer_name}'
