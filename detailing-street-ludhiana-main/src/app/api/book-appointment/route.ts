import { NextRequest, NextResponse } from 'next/server';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 5;

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

const DJANGO_VALIDATION_MESSAGES: Record<string, string> = {
  customerName: 'Please enter your full name.',
  phoneNumber: 'Please enter a valid 10-digit mobile number.',
  email: 'Please enter a valid email address.',
  carModel: 'Please check the car model and try again.',
  service: 'Please select a valid service.',
  preferredDate: 'Please select today or a future date.',
  preferredTime: 'Please select a valid preferred time.',
  message: 'Please shorten your message and try again.',
};

function getValidationError(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    const fields = Object.keys(data);
    for (const field of fields) {
      if (DJANGO_VALIDATION_MESSAGES[field]) {
        return DJANGO_VALIDATION_MESSAGES[field];
      }
    }
  }

  return 'Please check your booking details and try again.';
}

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

    const optionalStringFields: Array<[string, unknown]> = [
      ['email', email],
      ['carModel', carModel],
      ['preferredDate', preferredDate],
      ['preferredTime', preferredTime],
      ['message', message],
    ];
    for (const [field, value] of optionalStringFields) {
      if (value !== undefined && typeof value !== 'string') {
        return NextResponse.json(
          { success: false, error: DJANGO_VALIDATION_MESSAGES[field] || 'Please check your booking details and try again.' },
          { status: 400 }
        );
      }
    }

    if (typeof customerName !== 'string' || !customerName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
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
    if (customerName.trim().length < 2 || customerName.trim().length > 100) {
      return NextResponse.json({ success: false, error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
    }

    const djangoBaseUrl = process.env.DJANGO_API_BASE_URL;
    if (!djangoBaseUrl) {
      return NextResponse.json(
        { success: false, error: 'Booking service is not configured. Please call us at 9115555035.' },
        { status: 503 }
      );
    }

    let djangoUrl: URL;
    try {
      djangoUrl = new URL('/api/book-appointment/', djangoBaseUrl);
      if (!['http:', 'https:'].includes(djangoUrl.protocol) || djangoUrl.username || djangoUrl.password) {
        throw new Error('Invalid booking service URL.');
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Booking service is unavailable. Please try again or call us at 9115555035.' },
        { status: 503 }
      );
    }

    const bookingPayload = {
      customerName: sanitize(customerName),
      phoneNumber: phoneNumber.replace(/\s/g, '').slice(0, 10),
      email: typeof email === 'string' && email ? sanitize(email).slice(0, 200) : '',
      carModel: typeof carModel === 'string' ? sanitize(carModel).slice(0, 100) : '',
      service: service.trim(),
      preferredDate: typeof preferredDate === 'string' ? sanitize(preferredDate).slice(0, 20) : '',
      preferredTime: typeof preferredTime === 'string' ? sanitize(preferredTime).slice(0, 20) : '',
      message: typeof message === 'string' ? sanitize(message).slice(0, 500) : '',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let djangoResponse: Response;
    let djangoData: unknown;
    try {
      djangoResponse = await fetch(djangoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(bookingPayload),
        signal: controller.signal,
      });
      try {
        djangoData = await djangoResponse.json();
      } catch {
        if (controller.signal.aborted) {
          return NextResponse.json(
            { success: false, error: 'Booking request timed out. Please try again or call us at 9115555035.' },
            { status: 504 }
          );
        }
        return NextResponse.json(
          { success: false, error: 'Booking service returned an unexpected response. Please try again or call us at 9115555035.' },
          { status: 502 }
        );
      }
    } catch {
      if (controller.signal.aborted) {
        return NextResponse.json(
          { success: false, error: 'Booking request timed out. Please try again or call us at 9115555035.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Booking service is unavailable. Please try again or call us at 9115555035.' },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!djangoResponse.ok) {
      if (djangoResponse.status === 400) {
        return NextResponse.json(
          { success: false, error: getValidationError(djangoData) },
          { status: 400 }
        );
      }
      if (djangoResponse.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please wait before trying again or call us at 9115555035.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Booking service is unavailable. Please try again or call us at 9115555035.' },
        { status: 503 }
      );
    }

    if (
      typeof djangoData !== 'object' ||
      djangoData === null ||
      !('success' in djangoData) ||
      djangoData.success !== true ||
      !('bookingId' in djangoData) ||
      typeof djangoData.bookingId !== 'string' ||
      !djangoData.bookingId
    ) {
      return NextResponse.json(
        { success: false, error: 'Booking service returned an unexpected response. Please try again or call us at 9115555035.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: djangoData.bookingId,
      message:
        'message' in djangoData && typeof djangoData.message === 'string'
          ? djangoData.message
          : `Booking ${djangoData.bookingId} submitted! Our team will contact you shortly.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again or call 9115555035.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}