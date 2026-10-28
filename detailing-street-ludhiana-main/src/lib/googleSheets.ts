import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getGoogleSheetsClient() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Google Sheets credentials in environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: privateKey,
      client_email: clientEmail,
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export interface BookingData {
  customerName: string;
  phoneNumber: string;
  email: string;
  carModel: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

// Generate unique Booking ID: DS-101, DS-102, etc.
export async function generateBookingId(): Promise<string> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Bookings';

  if (!spreadsheetId) return `DS-${Date.now()}`;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    const bookingCount = rows.length - 1;
    const nextId = Math.max(bookingCount, 0) + 101;
    return `DS-${nextId}`;
  } catch {
    return `DS-${Date.now().toString().slice(-6)}`;
  }
}

export async function appendBookingToSheet(data: BookingData): Promise<string> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Bookings';

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  const bookingId = await generateBookingId();

  const now = new Date();
  const submittedAt = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const values = [
    [
      bookingId,
      data.customerName,
      data.phoneNumber,
      data.email,
      data.carModel,
      data.service,
      data.preferredDate,
      data.preferredTime,
      data.message,
      'New Lead',
      submittedAt,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:K`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });

  return bookingId;
}

export async function ensureSheetHeaders(): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Bookings';

  if (!spreadsheetId) return;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:K1`,
  });

  const existingHeaders = response.data.values?.[0];
  if (!existingHeaders || existingHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:K1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'Booking ID',
          'Customer Name',
          'Phone Number',
          'Email',
          'Car Model',
          'Service',
          'Preferred Date',
          'Preferred Time',
          'Message',
          'Booking Status',
          'Submitted At',
        ]],
      },
    });
  }
}