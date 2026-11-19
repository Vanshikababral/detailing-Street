from django.urls import path
from .views import (
    AppointmentCreateView,
    AppointmentListView,
    DashboardStatsView,
    health_check,
)
from .staff_views import StaffDetailView, StaffListCreateView

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('book-appointment/', AppointmentCreateView.as_view(), name='book-appointment'),
    path('appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('staff/', StaffListCreateView.as_view(), name='staff-list-create'),
    path('staff/<str:staff_id>/', StaffDetailView.as_view(), name='staff-detail'),
]
