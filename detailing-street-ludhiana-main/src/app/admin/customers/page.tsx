import { DashboardShell } from '@/components/admin/dashboard/DashboardShell';
import { CustomersPage } from '@/components/admin/customers/CustomersPage';

export default function Customers() {
  return (
    <DashboardShell>
      <CustomersPage />
    </DashboardShell>
  );
}

