import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { ServicesPage } from '@/components/admin/services/ServicesPage';

export default function Services() {
  return (
    <DashboardShell>
      <ServicesPage />
    </DashboardShell>
  );
}

