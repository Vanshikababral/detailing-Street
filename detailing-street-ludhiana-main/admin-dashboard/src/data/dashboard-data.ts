import type { IconName } from '../components/dashboard/Icon';

export type DashboardMetric = {
  label: string;
  value: string;
  trend: string;
  trendTone: 'positive' | 'attention';
  icon: IconName;
};

export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed';

export type DemoAppointment = {
  customer: string;
  service: string;
  dateTime: string;
  time: string;
  status: AppointmentStatus;
};

export const dashboardDataNotice =
  'Demonstration data only — these values are not live business records.';

export const dashboardMetrics: DashboardMetric[] = [
  { label: 'Total Bookings', value: '24', trend: '+12%', trendTone: 'positive', icon: 'appointments' },
  { label: 'Pending Appointments', value: '8', trend: '+3%', trendTone: 'attention', icon: 'clock' },
  { label: 'Revenue', value: '₹48,500', trend: '+18%', trendTone: 'positive', icon: 'revenue' },
  { label: 'Completed Services', value: '16', trend: '+10%', trendTone: 'positive', icon: 'completed' },
];

export const bookingTrend = [
  { day: '23 Oct', bookings: 12 },
  { day: '24 Oct', bookings: 18 },
  { day: '25 Oct', bookings: 15 },
  { day: '26 Oct', bookings: 24 },
  { day: '27 Oct', bookings: 20 },
  { day: '28 Oct', bookings: 29 },
  { day: '29 Oct', bookings: 24 },
];

export const recentAppointments: DemoAppointment[] = [
  { customer: 'Aman Singh', service: 'Ceramic Coating', dateTime: '29 Oct, 09:00 AM', time: '09:00 AM', status: 'Confirmed' },
  { customer: 'Priya Kaur', service: 'Interior Detailing', dateTime: '29 Oct, 11:30 AM', time: '11:30 AM', status: 'Pending' },
  { customer: 'Rohit Kumar', service: 'PPF Installation', dateTime: '29 Oct, 02:00 PM', time: '02:00 PM', status: 'Confirmed' },
  { customer: 'Simran Sandhu', service: 'Full Detailing', dateTime: '29 Oct, 04:30 PM', time: '04:30 PM', status: 'Pending' },
  { customer: 'Vikram Pandey', service: 'Engine Bay Cleaning', dateTime: '29 Oct, 06:00 PM', time: '06:00 PM', status: 'Completed' },
];

export const upcomingAppointments = recentAppointments.slice(1, 4);

export const quickActions: { label: string; icon: IconName }[] = [
  { label: 'New Appointment', icon: 'appointments' },
  { label: 'Add Customer', icon: 'customers' },
  { label: 'Add Vehicle', icon: 'vehicles' },
  { label: 'Generate Report', icon: 'reports' },
];
