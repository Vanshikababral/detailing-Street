export type ServiceStatus = 'Active' | 'Inactive';

export type ServiceCategory =
  | 'Exterior Care'
  | 'Interior Care'
  | 'Full Detailing'
  | 'Paint Protection'
  | 'Engine Care'
  | 'Restoration';

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  durationMinutes: number;
  status: ServiceStatus;
};

export type ServiceFormValues = Omit<Service, 'id'>;

export const initialServices: Service[] = [
  {
    id: 'SRV-001',
    name: 'Exterior Car Wash',
    category: 'Exterior Care',
    description: 'Careful hand wash, wheel cleaning, and streak-free exterior drying.',
    price: 499,
    durationMinutes: 30,
    status: 'Active',
  },
  {
    id: 'SRV-002',
    name: 'Interior Deep Cleaning',
    category: 'Interior Care',
    description: 'Deep vacuuming and surface cleaning for a refreshed cabin.',
    price: 1499,
    durationMinutes: 90,
    status: 'Active',
  },
  {
    id: 'SRV-003',
    name: 'Full Car Detailing',
    category: 'Full Detailing',
    description: 'A complete interior and exterior detailing treatment.',
    price: 3999,
    durationMinutes: 180,
    status: 'Active',
  },
  {
    id: 'SRV-004',
    name: 'Ceramic Coating',
    category: 'Paint Protection',
    description: 'Paint preparation and ceramic protection application.',
    price: 12999,
    durationMinutes: 360,
    status: 'Active',
  },
  {
    id: 'SRV-005',
    name: 'Paint Protection Film',
    category: 'Paint Protection',
    description: 'Precision-cut film installation for high-impact paint areas.',
    price: 24999,
    durationMinutes: 480,
    status: 'Active',
  },
  {
    id: 'SRV-006',
    name: 'Engine Bay Cleaning',
    category: 'Engine Care',
    description: 'Careful degreasing and dressing of accessible engine bay surfaces.',
    price: 999,
    durationMinutes: 45,
    status: 'Active',
  },
  {
    id: 'SRV-007',
    name: 'Headlight Restoration',
    category: 'Restoration',
    description: 'Lens cleaning and polishing to improve clarity and appearance.',
    price: 1499,
    durationMinutes: 60,
    status: 'Inactive',
  },
  {
    id: 'SRV-008',
    name: 'Premium Polishing',
    category: 'Exterior Care',
    description: 'Multi-stage paint polishing for a refined gloss finish.',
    price: 2499,
    durationMinutes: 120,
    status: 'Inactive',
  },
];

export const serviceCategories: ServiceCategory[] = [
  'Exterior Care',
  'Interior Care',
  'Full Detailing',
  'Paint Protection',
  'Engine Care',
  'Restoration',
];

export const initialServiceSummary = {
  total: 12,
  active: 10,
  inactive: 2,
  averagePrice: 3250,
} as const;

export const serviceDataNotice =
  'Fictional business figures summarize a 12-service demo catalog; the table shows sample records. Changes are temporary previews and are not saved to the database.';
