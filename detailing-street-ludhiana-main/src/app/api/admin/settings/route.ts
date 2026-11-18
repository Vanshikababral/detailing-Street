import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Setting } from '@/models/Setting';
import { getAdminCredentials } from '@/lib/auth';

export interface StudioSettings {
  // Studio Profile
  studioName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workingHours: string;
  instagram: string;

  // Notifications
  notificationEmail: string;
  sendCustomerConfirmation: boolean;
  sendStatusUpdateEmails: boolean;
}

const DEFAULT_SETTINGS: StudioSettings = {
  studioName: 'Detailing Street Ludhiana',
  tagline: 'Paint Protection & Studio Auto Detailing',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '9115555035',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'sarvottamchandel1509@gmail.com',
  address: 'Detailing Street, Ferozepur Road',
  city: 'Ludhiana',
  state: 'Punjab',
  zipCode: '141001',
  workingHours: 'Monday – Sunday: 9:00 AM – 8:00 PM',
  instagram: '@detailingstreetludhiana',

  notificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'kenznajeeb@gmail.com',
  sendCustomerConfirmation: true,
  sendStatusUpdateEmails: true,
};

export async function GET() {
  try {
    await connectDB();
    const doc = await Setting.findOne({ key: 'studio_settings' });
    const saved = doc?.value || {};
    const settings: StudioSettings = {
      ...DEFAULT_SETTINGS,
      ...saved,
    };

    const creds = getAdminCredentials();
    const systemInfo = {
      activeAdminEmail: creds.email,
      smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpUser: process.env.SMTP_USER || 'Not set',
      databaseName: process.env.MONGODB_DATABASE || 'test',
    };

    return NextResponse.json({ success: true, settings, systemInfo });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const incomingSettings = body.settings || {};

    const updated = await Setting.findOneAndUpdate(
      { key: 'studio_settings' },
      {
        $set: {
          value: {
            ...DEFAULT_SETTINGS,
            ...incomingSettings,
          },
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      settings: updated.value,
      message: 'Settings saved successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

