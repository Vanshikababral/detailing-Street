import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { sendAppointmentEmails } from '@/lib/mailer';

// Rate limiting (in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 10;
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= maxRequests) return true;
  record.count++;
  return false;
}

function sanitize(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"`;]/g, '')
    .slice(0, 500);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

const ALLOWED_SERVICES = [
  'Paint Protection Film (PPF)',
  'Ceramic Coating',
  'Premium Washing',
  'Car Accessories',
  'Coloured Wrap',
  'Borophene Coating',
  'Tinting Film',
  'Other / Consultation',
];

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait 15 minutes or call 9115555035.' },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ success: false, error: 'Invalid request format.' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const {
      customerName,
      phoneNumber,
      email,
      carModel,
      service,
      preferredDate,
      preferredTime,
      message,
    } = body as Record<string, unknown>;

    if (typeof customerName !== 'string' || !customerName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }
    if (customerName.trim().length < 2 || customerName.trim().length > 100) {
      return NextResponse.json({ success: false, error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
    }
    if (typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }
    if (!validatePhone(phoneNumber)) {
      return NextResponse.json({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' }, { status: 400 });
    }
    if (typeof service !== 'string' || !service.trim()) {
      return NextResponse.json({ success: false, error: 'Please select a service.' }, { status: 400 });
    }
    if (!ALLOWED_SERVICES.includes(service)) {
      return NextResponse.json({ success: false, error: 'Invalid service selected.' }, { status: 400 });
    }
    if (email !== undefined && email !== '' && (typeof email !== 'string' || !validateEmail(email))) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Connect to MongoDB
    await connectDB();

    // Create appointment in MongoDB
    const appointment = await Appointment.create({
      customerName: sanitize(customerName),
      phoneNumber: phoneNumber.replace(/\s/g, '').slice(0, 10),
      email: typeof email === 'string' && email ? sanitize(email).slice(0, 200) : '',
      carModel: typeof carModel === 'string' ? sanitize(carModel).slice(0, 100) : '',
      service: service.trim(),
      preferredDate: typeof preferredDate === 'string' ? sanitize(preferredDate).slice(0, 20) : '',
      preferredTime: typeof preferredTime === 'string' ? sanitize(preferredTime).slice(0, 20) : '',
      message: typeof message === 'string' ? sanitize(message).slice(0, 500) : '',
    });

    // Send asynchronous notifications to customer & studio admin
    sendAppointmentEmails({
      bookingId: appointment.bookingId,
      customerName: appointment.customerName,
      phoneNumber: appointment.phoneNumber,
      email: appointment.email,
      carModel: appointment.carModel,
      service: appointment.service,
      preferredDate: appointment.preferredDate,
      preferredTime: appointment.preferredTime,
      message: appointment.message,
    }).catch((emailErr) => console.error('[Mailer] Background email error:', emailErr));

    return NextResponse.json({
      success: true,
      bookingId: appointment.bookingId,
      message: `Booking ${appointment.bookingId} submitted! Our team will contact you shortly.`,
    });
  } catch (err: any) {
    console.error('[Booking MongoDB Error]:', err);
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'MongoDB is not configured yet. Please add MONGODB_URI to .env.local' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Something went wrong saving your booking. Please try again or call 9115555035.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, appointments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
