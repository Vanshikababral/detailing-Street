import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  serviceId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    serviceId: {
      type: String,
      unique: true,
      default: () => `SRV-${Date.now().toString().slice(-4)}`,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

