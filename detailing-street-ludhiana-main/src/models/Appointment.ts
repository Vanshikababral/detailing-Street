import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointment extends Document {
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  carModel?: string;
  service: string;
  preferredDate?: string;
  preferredTime?: string;
  amount?: number;
  message?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

function generateBookingId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DS-${dateStr}-${randomHex}`;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    bookingId: {
      type: String,
      unique: true,
      default: generateBookingId,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    carModel: {
      type: String,
      trim: true,
      default: '',
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: String,
      default: '',
    },
    preferredTime: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
