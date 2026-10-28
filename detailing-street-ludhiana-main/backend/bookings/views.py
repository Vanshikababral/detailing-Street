from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework import generics, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentReadSerializer


class AppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(
            {
                'success': True,
                'bookingId': appointment.booking_id,
                'message': (
                    f'Booking {appointment.booking_id} submitted! '
                    'Our team will contact you shortly.'
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class AppointmentListView(generics.ListAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentReadSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [SessionAuthentication]


class AppointmentDetailView(generics.RetrieveAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentReadSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [SessionAuthentication]


@require_GET
def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'detailing-street-ludhiana-api'})
