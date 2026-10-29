import { initialCustomers, type Customer } from './customers-data';

export type VehicleType = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'Other';
export type VehicleServiceStatus = 'Recently Serviced' | 'Due for Service' | 'Never Serviced';

export type VehicleServiceRecord = {
  service: string;
  date: string;
  amount: number;
};

export type Vehicle = {
  id: string;
  registration: string;
  make: string;
  model: string;
  type: VehicleType;
  ownerId: string;
  ownerName: string;
  lastServiced: string;
  serviceHistory: VehicleServiceRecord[];
  notes: string;
};

export type VehicleFormValues = {
  registration: string;
  make: string;
  model: string;
  type: VehicleType;
  ownerId: string;
  notes: string;
};

type VehicleDetails = Omit<Vehicle, 'id' | 'registration' | 'make' | 'model' | 'type' | 'ownerId' | 'ownerName' | 'lastServiced' | 'serviceHistory'> & {
  type: VehicleType;
};

const vehicleDetailsByRegistration: Record<string, VehicleDetails> = {
  PB10XX0001: { type: 'SUV', notes: 'Customer prefers weekday morning appointments.' },
  PB10XX0002: { type: 'Sedan', notes: '' },
  PB10XX0003: { type: 'SUV', notes: 'Premium paint protection interest.' },
  PB10XX0004: { type: 'Hatchback', notes: '' },
  PB10XX0005: { type: 'SUV', notes: '' },
  PB10XX0006: { type: 'SUV', notes: 'Ask about exterior care packages.' },
  PB10XX0007: { type: 'SUV', notes: '' },
  PB10XX0008: { type: 'Hatchback', notes: '' },
  PB10XX0009: { type: 'Sedan', notes: 'Usually serviced on Saturdays.' },
  PB10XX0010: { type: 'Sedan', notes: '' },
  PB10XX0011: { type: 'Luxury', notes: 'Owner also has a second vehicle in the sample directory.' },
  PB10XX0012: { type: 'Luxury', notes: '' },
};

function splitMakeAndModel(vehicleModel: string) {
  const withoutYear = vehicleModel.replace(/^\d{4}\s+/, '');
  const [make, ...modelParts] = withoutYear.split(' ');
  return { make, model: modelParts.join(' ') };
}

function createServiceHistory(customer: Customer, lastServiced: string, vehicleIndex: number) {
  const visits = customer.vehicles.length > 1
    ? customer.visits.slice(vehicleIndex)
    : customer.visits;
  const relevantVisits = visits.filter((visit) => visit.date <= lastServiced);

  if (relevantVisits.length) {
    return relevantVisits.map((visit) => ({
      service: visit.service,
      date: visit.date,
      amount: visit.amount,
    }));
  }

  const latestVisit = customer.visits.find((visit) => visit.date === lastServiced);
  return latestVisit
    ? [{ service: latestVisit.service, date: latestVisit.date, amount: latestVisit.amount }]
    : [];
}

export const initialVehicles: Vehicle[] = initialCustomers.flatMap((customer) =>
  customer.vehicles.map((customerVehicle, vehicleIndex) => {
    const registration = customerVehicle.registration.toUpperCase().replace(/[\s-]/g, '');
    const details = vehicleDetailsByRegistration[registration] ?? { type: 'Other', notes: '' };
    const { make, model } = splitMakeAndModel(customerVehicle.model);

    return {
      id: `VEH-${registration}`,
      registration,
      make,
      model,
      type: details.type,
      ownerId: customer.id,
      ownerName: customer.name,
      lastServiced: customerVehicle.lastServiced,
      serviceHistory: createServiceHistory(customer, customerVehicle.lastServiced, vehicleIndex),
      notes: details.notes,
    };
  }),
);

export const vehicleMetrics = [
  { label: 'Total Vehicles', value: '192', icon: 'vehicles' },
  { label: 'Serviced This Month', value: '38', icon: 'completed' },
  { label: 'Due for Service', value: '24', icon: 'clock' },
  { label: 'Unique Customers', value: '156', icon: 'customers' },
] as const;

export const vehicleTypes: VehicleType[] = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Other'];

export const vehicleDataNotice =
  'Fictional demonstration vehicle records linked to the sample Customers directory. Preview changes are not saved to the database.';

export const vehicleServiceDueDays = 90;

export function getVehicleServiceStatus(lastServiced: string, now = new Date()): VehicleServiceStatus {
  if (!lastServiced) return 'Never Serviced';
  const serviceDate = new Date(`${lastServiced}T12:00:00`);
  const elapsedDays = Math.floor((now.getTime() - serviceDate.getTime()) / 86_400_000);
  return elapsedDays > vehicleServiceDueDays ? 'Due for Service' : 'Recently Serviced';
}
