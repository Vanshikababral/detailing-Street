import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/models/Service';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ status: 'Active' })
      .select('name price durationMinutes')
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Failed to load the service catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load the service catalog.' },
      { status: 500 }
    );
  }
}
