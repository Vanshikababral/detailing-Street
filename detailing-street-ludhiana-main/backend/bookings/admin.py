from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        'booking_id',
        'customer_name',
        'phone',
        'service',
        'preferred_date',
        'status',
        'created_at',
    )
    search_fields = ('booking_id', 'customer_name', 'phone', 'car_model')
    list_filter = (
        'status',
        'service',
        ('preferred_date', admin.DateFieldListFilter),
    )
    list_editable = ('status',)
    ordering = ('-created_at',)
    date_hierarchy = 'preferred_date'
