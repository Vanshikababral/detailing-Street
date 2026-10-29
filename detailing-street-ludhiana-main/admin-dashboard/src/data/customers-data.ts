export type CustomerType = 'New' | 'Returning';

export type CustomerVehicle = {
  registration: string;
  model: string;
  lastServiced: string;
};

export type CustomerVisit = {
  service: string;
  date: string;
  amount: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  type: CustomerType;
  vehicles: CustomerVehicle[];
  visits: CustomerVisit[];
  totalVisits: number;
  lastVisit: string;
  totalSpent: number;
};

export const initialCustomers: Customer[] = [
  {
    id: 'CUST-0156',
    name: 'Aarav Mehta',
    phone: '+91 90000 10001',
    email: 'aarav.mehta@example.test',
    notes: 'Prefers weekday morning appointments.',
    type: 'Returning',
    vehicles: [{ registration: 'PB10XX0001', model: '2023 Hyundai Creta', lastServiced: '2026-10-12' }],
    visits: [
      { service: 'Ceramic Coating', date: '2026-10-12', amount: 18500 },
      { service: 'Interior Detailing', date: '2026-06-18', amount: 4500 },
      { service: 'Exterior Detailing', date: '2026-02-04', amount: 5200 },
    ],
    totalVisits: 3,
    lastVisit: '2026-10-12',
    totalSpent: 28200,
  },
  {
    id: 'CUST-0155',
    name: 'Anika Sharma',
    phone: '+91 90000 10002',
    email: 'anika.sharma@example.test',
    notes: '',
    type: 'New',
    vehicles: [{ registration: 'PB10XX0002', model: '2022 Honda City', lastServiced: '2026-10-09' }],
    visits: [{ service: 'Interior Detailing', date: '2026-10-09', amount: 4200 }],
    totalVisits: 1,
    lastVisit: '2026-10-09',
    totalSpent: 4200,
  },
  {
    id: 'CUST-0154',
    name: 'Kabir Anand',
    phone: '+91 90000 10003',
    email: 'kabir.anand@example.test',
    notes: 'Two vehicles registered.',
    type: 'Returning',
    vehicles: [
      { registration: 'PB10XX0003', model: '2024 Toyota Fortuner', lastServiced: '2026-10-07' },
      { registration: 'PB10XX0004', model: '2021 Maruti Swift', lastServiced: '2026-08-22' },
    ],
    visits: [
      { service: 'PPF Installation', date: '2026-10-07', amount: 32000 },
      { service: 'Paint Correction', date: '2026-08-22', amount: 12000 },
      { service: 'Engine Bay Cleaning', date: '2026-04-15', amount: 2500 },
      { service: 'Full Detailing', date: '2025-12-03', amount: 8500 },
    ],
    totalVisits: 4,
    lastVisit: '2026-10-07',
    totalSpent: 55000,
  },
  {
    id: 'CUST-0153',
    name: 'Meera Joshi',
    phone: '+91 90000 10004',
    email: 'meera.joshi@example.test',
    notes: '',
    type: 'Returning',
    vehicles: [{ registration: 'PB10XX0005', model: '2022 MG Hector', lastServiced: '2026-10-03' }],
    visits: [
      { service: 'Paint Correction', date: '2026-10-03', amount: 13500 },
      { service: 'Ceramic Coating', date: '2026-05-28', amount: 19000 },
    ],
    totalVisits: 2,
    lastVisit: '2026-10-03',
    totalSpent: 32500,
  },
  {
    id: 'CUST-0152',
    name: 'Rohan Kapoor',
    phone: '+91 90000 10005',
    email: 'rohan.kapoor@example.test',
    notes: 'Interested in exterior care packages.',
    type: 'New',
    vehicles: [{ registration: 'PB10XX0006', model: '2023 Tata Nexon', lastServiced: '2026-09-27' }],
    visits: [{ service: 'Exterior Detailing', date: '2026-09-27', amount: 5500 }],
    totalVisits: 1,
    lastVisit: '2026-09-27',
    totalSpent: 5500,
  },
  {
    id: 'CUST-0151',
    name: 'Isha Verma',
    phone: '+91 90000 10006',
    email: 'isha.verma@example.test',
    notes: '',
    type: 'Returning',
    vehicles: [{ registration: 'PB10XX0007', model: '2024 Kia Seltos', lastServiced: '2026-09-19' }],
    visits: [
      { service: 'Full Detailing', date: '2026-09-19', amount: 8500 },
      { service: 'Interior Detailing', date: '2026-06-11', amount: 4600 },
      { service: 'Engine Bay Cleaning', date: '2026-01-30', amount: 2800 },
    ],
    totalVisits: 3,
    lastVisit: '2026-09-19',
    totalSpent: 15900,
  },
  {
    id: 'CUST-0150',
    name: 'Dev Malhotra',
    phone: '+91 90000 10007',
    email: 'dev.malhotra@example.test',
    notes: '',
    type: 'New',
    vehicles: [{ registration: 'PB10XX0008', model: '2021 Volkswagen Polo', lastServiced: '2026-09-12' }],
    visits: [{ service: 'Ceramic Coating', date: '2026-09-12', amount: 17500 }],
    totalVisits: 1,
    lastVisit: '2026-09-12',
    totalSpent: 17500,
  },
  {
    id: 'CUST-0149',
    name: 'Tara Bhatia',
    phone: '+91 90000 10008',
    email: 'tara.bhatia@example.test',
    notes: 'Usually books on Saturdays.',
    type: 'Returning',
    vehicles: [{ registration: 'PB10XX0009', model: '2022 Skoda Slavia', lastServiced: '2026-09-05' }],
    visits: [
      { service: 'PPF Installation', date: '2026-09-05', amount: 28500 },
      { service: 'Full Detailing', date: '2026-03-16', amount: 9000 },
    ],
    totalVisits: 2,
    lastVisit: '2026-09-05',
    totalSpent: 37500,
  },
  {
    id: 'CUST-0148',
    name: 'Nikhil Sood',
    phone: '+91 90000 10009',
    email: 'nikhil.sood@example.test',
    notes: '',
    type: 'New',
    vehicles: [{ registration: 'PB10XX0010', model: '2020 Honda Civic', lastServiced: '2026-08-29' }],
    visits: [{ service: 'Engine Bay Cleaning', date: '2026-08-29', amount: 3000 }],
    totalVisits: 1,
    lastVisit: '2026-08-29',
    totalSpent: 3000,
  },
  {
    id: 'CUST-0147',
    name: 'Rhea Khanna',
    phone: '+91 90000 10010',
    email: 'rhea.khanna@example.test',
    notes: 'Owns a sedan and an SUV.',
    type: 'Returning',
    vehicles: [
      { registration: 'PB10XX0011', model: '2023 BMW 3 Series', lastServiced: '2026-08-18' },
      { registration: 'PB10XX0012', model: '2022 Audi Q3', lastServiced: '2026-07-02' },
    ],
    visits: [
      { service: 'Ceramic Coating', date: '2026-08-18', amount: 26000 },
      { service: 'Paint Correction', date: '2026-07-02', amount: 14500 },
      { service: 'Interior Detailing', date: '2026-03-09', amount: 6200 },
    ],
    totalVisits: 3,
    lastVisit: '2026-08-18',
    totalSpent: 46700,
  },
];

export const customerDataNotice =
  'Fictional demonstration customer data only. Changes are local preview edits and are not saved to the database.';

export const customerMetrics = [
  { label: 'Total Customers', value: '156', icon: 'customers' },
  { label: 'Returning Customers', value: '48', icon: 'completed' },
  { label: 'New This Month', value: '18', icon: 'trend' },
  { label: 'Total Vehicles', value: '192', icon: 'vehicles' },
] as const;
