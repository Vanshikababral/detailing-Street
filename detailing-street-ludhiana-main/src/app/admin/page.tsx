import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';

export default function AdminPage() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}

