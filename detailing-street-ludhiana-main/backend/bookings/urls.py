from django.urls import path
from .views import (
    AppointmentCreateView,
    AppointmentListView,
    DashboardStatsView,
    AdminLoginView,
    health_check,
)

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('auth/login/', AdminLoginView.as_view(), name='admin-login'),
    path('book-appointment/', AppointmentCreateView.as_view(), name='book-appointment'),
    path('appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
