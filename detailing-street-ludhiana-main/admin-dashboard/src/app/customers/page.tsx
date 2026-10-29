import type { Metadata } from 'next';
import { CustomersPage } from '../../components/customers/CustomersPage';

export const metadata: Metadata = {
  title: 'Customers | Detailing Street Admin',
  description: 'Manage fictional demonstration customer profiles for Detailing Street Ludhiana.',
};

export default function CustomersRoute() {
  return <CustomersPage />;
}
