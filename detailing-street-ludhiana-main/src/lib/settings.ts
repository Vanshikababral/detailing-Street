import { connectDB } from '@/lib/mongodb';
import { Setting } from '@/models/Setting';

export interface PublicStudioSettings {
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
}

export const DEFAULT_PUBLIC_SETTINGS: PublicStudioSettings = {
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
};

export async function getPublicSettings(): Promise<PublicStudioSettings> {
  try {
    await connectDB();
    const doc = await Setting.findOne({ key: 'studio_settings' }).lean();
    if (doc && doc.value) {
      return {
        ...DEFAULT_PUBLIC_SETTINGS,
        ...doc.value,
      };
    }
  } catch (err) {
    console.error('Error fetching studio settings:', err);
  }
  return DEFAULT_PUBLIC_SETTINGS;
}

