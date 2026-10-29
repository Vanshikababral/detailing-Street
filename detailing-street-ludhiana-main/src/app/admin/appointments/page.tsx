import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { AppointmentsPage } from '@/components/admin/appointments/AppointmentsPage';

export default function Appointments() {
  return (
    <DashboardShell>
      <AppointmentsPage />
    </DashboardShell>
  );
}

