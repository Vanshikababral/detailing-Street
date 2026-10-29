export type AppointmentStatus =
  | 'Confirmed'
  | 'Pending'
  | 'Completed'
  | 'Cancelled';

export type Appointment = {
  id: string;
  customer: string;
  phone: string;
  vehicle: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  status: AppointmentStatus;
};

type AppointmentSeed = Omit<Appointment, 'id'>;

const appointmentSeeds: AppointmentSeed[] = [
  { customer: 'Aman Singh', phone: '+91 98765 41021', vehicle: '2023 Hyundai Creta', service: 'Ceramic Coating', date: '2026-10-29', time: '09:00 AM', amount: 18500, status: 'Confirmed' },
  { customer: 'Priya Kaur', phone: '+91 98765 41022', vehicle: '2022 Honda City', service: 'Interior Detailing', date: '2026-10-29', time: '11:30 AM', amount: 4500, status: 'Pending' },
  { customer: 'Rohit Kumar', phone: '+91 98765 41023', vehicle: '2024 Toyota Fortuner', service: 'PPF Installation', date: '2026-10-29', time: '02:00 PM', amount: 32000, status: 'Confirmed' },
  { customer: 'Simran Sandhu', phone: '+91 98765 41024', vehicle: '2021 Kia Seltos', service: 'Full Detailing', date: '2026-10-29', time: '04:30 PM', amount: 8500, status: 'Pending' },
  { customer: 'Vikram Pandey', phone: '+91 98765 41025', vehicle: '2020 Maruti Swift', service: 'Engine Bay Cleaning', date: '2026-10-29', time: '06:00 PM', amount: 2500, status: 'Completed' },
  { customer: 'Neha Sharma', phone: '+91 98765 41026', vehicle: '2023 Tata Nexon', service: 'Paint Correction', date: '2026-10-30', time: '09:30 AM', amount: 12000, status: 'Confirmed' },
  { customer: 'Arjun Mehta', phone: '+91 98765 41027', vehicle: '2022 Mahindra XUV700', service: 'Ceramic Coating', date: '2026-10-30', time: '10:30 AM', amount: 22000, status: 'Pending' },
  { customer: 'Kavya Verma', phone: '+91 98765 41028', vehicle: '2021 Volkswagen Polo', service: 'Exterior Detailing', date: '2026-10-30', time: '12:00 PM', amount: 5500, status: 'Confirmed' },
  { customer: 'Harpreet Gill', phone: '+91 98765 41029', vehicle: '2024 Hyundai Venue', service: 'Interior Detailing', date: '2026-10-30', time: '01:30 PM', amount: 4800, status: 'Pending' },
  { customer: 'Ishita Rao', phone: '+91 98765 41030', vehicle: '2023 Skoda Slavia', service: 'PPF Installation', date: '2026-10-30', time: '03:00 PM', amount: 28500, status: 'Confirmed' },
  { customer: 'Dev Malhotra', phone: '+91 98765 41031', vehicle: '2020 Honda Civic', service: 'Full Detailing', date: '2026-10-30', time: '04:30 PM', amount: 9200, status: 'Pending' },
  { customer: 'Meera Joshi', phone: '+91 98765 41032', vehicle: '2022 MG Hector', service: 'Paint Correction', date: '2026-10-30', time: '06:00 PM', amount: 13500, status: 'Confirmed' },
  { customer: 'Kabir Anand', phone: '+91 98765 41033', vehicle: '2021 Toyota Innova Crysta', service: 'Engine Bay Cleaning', date: '2026-10-31', time: '09:00 AM', amount: 3000, status: 'Pending' },
  { customer: 'Ananya Bhatia', phone: '+91 98765 41034', vehicle: '2024 Kia Sonet', service: 'Ceramic Coating', date: '2026-10-31', time: '10:30 AM', amount: 19500, status: 'Confirmed' },
  { customer: 'Manav Sethi', phone: '+91 98765 41035', vehicle: '2022 Jeep Compass', service: 'Exterior Detailing', date: '2026-10-31', time: '12:00 PM', amount: 6200, status: 'Pending' },
  { customer: 'Jasleen Grewal', phone: '+91 98765 41036', vehicle: '2023 BMW 3 Series', service: 'PPF Installation', date: '2026-10-31', time: '02:00 PM', amount: 42000, status: 'Confirmed' },
  { customer: 'Rajat Kapoor', phone: '+91 98765 41037', vehicle: '2020 Renault Duster', service: 'Full Detailing', date: '2026-10-31', time: '03:30 PM', amount: 7800, status: 'Pending' },
  { customer: 'Tanya Arora', phone: '+91 98765 41038', vehicle: '2022 Mercedes-Benz GLA', service: 'Ceramic Coating', date: '2026-10-31', time: '05:00 PM', amount: 26000, status: 'Completed' },
  { customer: 'Nikhil Sood', phone: '+91 98765 41039', vehicle: '2021 Hyundai Tucson', service: 'Paint Correction', date: '2026-11-01', time: '09:30 AM', amount: 14500, status: 'Confirmed' },
  { customer: 'Pooja Chawla', phone: '+91 98765 41040', vehicle: '2023 Maruti Brezza', service: 'Interior Detailing', date: '2026-11-01', time: '11:00 AM', amount: 4200, status: 'Completed' },
  { customer: 'Aditya Khanna', phone: '+91 98765 41041', vehicle: '2024 Tata Harrier', service: 'PPF Installation', date: '2026-11-01', time: '01:00 PM', amount: 35000, status: 'Confirmed' },
  { customer: 'Rhea Bansal', phone: '+91 98765 41042', vehicle: '2022 Audi Q3', service: 'Full Detailing', date: '2026-11-01', time: '03:00 PM', amount: 11000, status: 'Completed' },
  { customer: 'Sahil Khurana', phone: '+91 98765 41043', vehicle: '2021 Mahindra Thar', service: 'Engine Bay Cleaning', date: '2026-11-01', time: '04:30 PM', amount: 3200, status: 'Confirmed' },
  { customer: 'Dia Malhotra', phone: '+91 98765 41044', vehicle: '2023 Volvo XC40', service: 'Ceramic Coating', date: '2026-11-01', time: '06:00 PM', amount: 24000, status: 'Confirmed' },
];

export const initialAppointments: Appointment[] = appointmentSeeds.map((appointment, index) => ({
  ...appointment,
  id: `DS-${String(1048 - index).padStart(4, '0')}`,
}));

export const appointmentSummaryStatuses: AppointmentStatus[] = [
  'Confirmed',
  'Pending',
  'Completed',
  'Cancelled',
];

export const appointmentServices = [
  'Ceramic Coating',
  'Engine Bay Cleaning',
  'Exterior Detailing',
  'Full Detailing',
  'Interior Detailing',
  'Paint Correction',
  'PPF Installation',
];

export const appointmentDataNotice =
  'All appointments on this page are demonstration data. Preview edits are not saved to the database.';
