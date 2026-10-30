import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentEmails } from '@/lib/mailer';

const DJANGO_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to Django backend
    const djangoRes = await fetch(`${DJANGO_URL}/api/book-appointment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await djangoRes.json();

    if (!djangoRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to submit appointment to Django' },
        { status: djangoRes.status || 400 }
      );
    }

    // Send emails
    sendAppointmentEmails({
      bookingId: data.bookingId,
      customerName: body.customerName,
      phoneNumber: body.phoneNumber,
      email: body.email,
      carModel: body.carModel,
      service: body.service,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      message: body.message,
    }).catch((e) => console.error('[Mailer Error]:', e));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Next.js -> Django Proxy Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Could not connect to Django backend. Make sure Django is running on port 8000.' },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const res = await fetch(`${DJANGO_URL}/api/appointments/`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}
