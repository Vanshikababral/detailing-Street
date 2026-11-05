import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { SectionPlaceholder } from '@/components/admin/dashboard/SectionPlaceholder';

export default function ReportsPage() {
  return (
    <DashboardShell>
      <SectionPlaceholder
        description="Review booking activity and business performance over time."
        icon="reports"
        title="Reports"
      />
    </DashboardShell>
  );
}
