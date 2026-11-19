import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';

export async function GET() {
  try {
    await connectDB();
    const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean();

    const db = mongoose.connection.db;
    const appointmentsColl = db ? db.collection('appointments') : null;

    const vehiclesWithCounts = await Promise.all(
      vehicles.map(async (v) => {
        let count = v.serviceCount || 0;
        if (appointmentsColl) {
          const matchingCompleted = await appointmentsColl.countDocuments({
            $or: [
              { vehicleRegistration: v.registration },
              { carModel: `${v.make} ${v.model}` },
            ],
            status: 'Completed',
          });
          count = Math.max(count, matchingCompleted);
        }
        return {
          ...v,
          serviceCount: count,
        };
      })
    );

    return NextResponse.json({ success: true, vehicles: vehiclesWithCounts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const vehicle = await Vehicle.create(body);
    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;
    const vehicle = await Vehicle.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, vehicle });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await Vehicle.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

