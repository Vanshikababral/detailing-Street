import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { SectionPlaceholder } from '@/components/admin/dashboard/SectionPlaceholder';

export default function SettingsPage() {
  return (
    <DashboardShell>
      <SectionPlaceholder
        description="Configure your workspace preferences and business details."
        icon="settings"
        title="Settings"
      />
    </DashboardShell>
  );
}
