import type { Metadata } from 'next';
import { VehiclesPage } from '../../components/vehicles/VehiclesPage';

export const metadata: Metadata = {
  title: 'Vehicles | Detailing Street Admin',
  description: 'Manage fictional demonstration vehicles for Detailing Street Ludhiana.',
};

export default function VehiclesRoute() {
  return <VehiclesPage />;
}
