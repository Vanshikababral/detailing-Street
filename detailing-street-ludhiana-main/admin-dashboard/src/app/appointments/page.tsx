import type { Metadata } from 'next';
import { AppointmentsPage } from '../../components/appointments/AppointmentsPage';

export const metadata: Metadata = {
  title: 'Appointments | Detailing Street Admin',
  description: 'Manage demonstration bookings for Detailing Street Ludhiana.',
};

export default function AppointmentsRoute() {
  return <AppointmentsPage />;
}
