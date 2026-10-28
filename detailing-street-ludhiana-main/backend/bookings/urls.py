from django.urls import path

from .views import (
    AppointmentCreateView,
    AppointmentDetailView,
    AppointmentListView,
    health_check,
)

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path(
        'book-appointment/',
        AppointmentCreateView.as_view(),
        name='book-appointment',
    ),
    path('appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path(
        'appointments/<int:pk>/',
        AppointmentDetailView.as_view(),
        name='appointment-detail',
    ),
]
