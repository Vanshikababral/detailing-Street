import type { Metadata } from 'next';
import { ServicesPage } from '../../components/services/ServicesPage';

export const metadata: Metadata = {
  title: 'Services & Pricing | Detailing Street Admin',
  description: 'Manage the fictional demonstration services and pricing for Detailing Street Ludhiana.',
};

export default function ServicesRoute() {
  return <ServicesPage />;
}
