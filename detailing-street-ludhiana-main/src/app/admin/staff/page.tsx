import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { SectionPlaceholder } from '@/components/admin/dashboard/SectionPlaceholder';

export default function StaffPage() {
  return (
    <DashboardShell>
      <SectionPlaceholder
        description="Manage your studio team and staff access from one place."
        icon="staff"
        title="Staff"
      />
    </DashboardShell>
  );
}
