import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { VehiclesPage } from '@/components/admin/vehicles/VehiclesPage';

export default function Vehicles() {
  return (
    <DashboardShell>
      <VehiclesPage />
    </DashboardShell>
  );
}

