import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { StaffPageContent } from '@/components/admin/staff/StaffPageContent';

export default function StaffPage() {
  return (
    <DashboardShell>
      <StaffPageContent />
    </DashboardShell>
  );
}
