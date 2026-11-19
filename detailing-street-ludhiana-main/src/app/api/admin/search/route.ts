import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { Customer } from '@/models/Customer';
import { Vehicle } from '@/models/Vehicle';
import { Service } from '@/models/Service';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          appointments: [],
          vehicles: [],
          customers: [],
          services: [],
          staff: [],
        },
      });
    }

    await connectDB();

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const db = mongoose.connection.db;

    const [appointments, vehicles, customers, services, staff] = await Promise.all([
      Appointment.find({
        $or: [
          { customerName: regex },
          { bookingId: regex },
          { phoneNumber: regex },
          { service: regex },
          { carModel: regex },
        ],
      })
        .select('bookingId customerName service status preferredDate carModel')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),

      Vehicle.find({
        $or: [
          { registration: regex },
          { make: regex },
          { model: regex },
          { ownerName: regex },
        ],
      })
        .select('registration make model ownerName type')
        .limit(4)
        .lean(),

      Customer.find({
        $or: [
          { name: regex },
          { phone: regex },
          { email: regex },
        ],
      })
        .select('customerId name phone email type')
        .limit(4)
        .lean(),

      Service.find({
        $or: [
          { name: regex },
          { category: regex },
        ],
      })
        .select('serviceId name category price')
        .limit(4)
        .lean(),

      db
        ? db
            .collection('staff')
            .find({
              $or: [
                { name: regex },
                { phone: regex },
                { email: regex },
                { role: regex },
              ],
            })
            .project({ name: 1, role: 1, phone: 1, status: 1 })
            .limit(4)
            .toArray()
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      results: {
        appointments,
        vehicles,
        customers,
        services,
        staff,
      },
    });
  } catch (error: any) {
    console.error('Admin search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
