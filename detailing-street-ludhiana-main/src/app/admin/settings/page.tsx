import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { SettingsPage } from '@/components/admin/settings/SettingsPage';

export default function Settings() {
  return (
    <DashboardShell>
      <SettingsPage />
    </DashboardShell>
  );
}

