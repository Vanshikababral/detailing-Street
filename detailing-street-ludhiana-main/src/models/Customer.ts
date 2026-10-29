import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  type: 'New' | 'Regular' | 'VIP';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: {
      type: String,
      unique: true,
      default: () => `CUST-${Date.now().toString().slice(-6)}`,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },
    totalVisits: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastVisit: { type: String, default: '' },
    type: {
      type: String,
      enum: ['New', 'Regular', 'VIP'],
      default: 'New',
    },
  },
  { timestamps: true }
);

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

