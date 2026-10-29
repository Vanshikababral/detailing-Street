import mongoose, { Schema, Model } from 'mongoose';

export interface IVehicle {
  registration: string;
  make: string;
  model: string;
  type: string;
  ownerId: string;
  ownerName: string;
  notes?: string;
  lastServiced?: string;
  serviceDue?: string;
  serviceCount: number;
  totalSpent: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    registration: { type: String, required: true, unique: true, uppercase: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    type: { type: String, default: 'Sedan' },
    ownerId: { type: String, default: '' },
    ownerName: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    lastServiced: { type: String, default: '' },
    serviceDue: { type: String, default: '' },
    serviceCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
