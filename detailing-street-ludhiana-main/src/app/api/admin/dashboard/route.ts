import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { Customer } from '@/models/Customer';
import { Vehicle } from '@/models/Vehicle';
import { Service } from '@/models/Service';

export async function GET() {
  try {
    await connectDB();

    const [totalAppointments, pendingCount, appointments, totalCustomers, totalVehicles, totalServices] =
      await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'Pending' }),
        Appointment.find().sort({ createdAt: -1 }).limit(10),
        Customer.countDocuments(),
        Vehicle.countDocuments(),
        Service.countDocuments(),
      ]);

    const completed = await Appointment.find({ status: 'Completed' });
    const revenue = completed.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return NextResponse.json({
      success: true,
      metrics: {
        totalBookings: totalAppointments,
        pendingAppointments: pendingCount,
        revenue: revenue,
        completedServices: completed.length,
        totalCustomers,
        totalVehicles,
        totalServices,
      },
      recentAppointments: appointments,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

