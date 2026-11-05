import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/models/Service';
import { DEFAULT_SERVICES } from '@/lib/serviceCatalog';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, services });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    if (body.seedDefaults === true) {
      for (const service of DEFAULT_SERVICES) {
        await Service.updateOne(
          { name: service.name },
          {
            $setOnInsert: {
              ...service,
              serviceId: `SRV-${randomUUID().slice(0, 8).toUpperCase()}`,
              description: '',
              price: 0,
              durationMinutes: 0,
              status: 'Active',
            },
          },
          { upsert: true }
        );
      }

      const services = await Service.find().sort({ name: 1 });
      return NextResponse.json({ success: true, services });
    }

    const service = await Service.create(body);
    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;
    const service = await Service.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
