export const STAFF_ROLES = [
  'Owner',
  'Manager',
  'Detailing Specialist',
  'Technician',
  'Service Advisor',
  'Other',
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];
export type StaffStatus = 'Active' | 'Inactive';

export interface StaffRecord {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: StaffRole;
  specialization: string;
  joiningDate: string;
  status: StaffStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
