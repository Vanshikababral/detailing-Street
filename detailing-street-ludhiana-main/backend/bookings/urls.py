from django.urls import path
from .views import (
    AppointmentCreateView,
    AppointmentListView,
    DashboardStatsView,
    health_check,
)

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('book-appointment/', AppointmentCreateView.as_view(), name='book-appointment'),
    path('appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
