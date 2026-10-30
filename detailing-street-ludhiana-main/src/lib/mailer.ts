import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter.
 * Works with custom SMTP or standard Gmail App Passwords.
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

export interface AppointmentEmailPayload {
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  carModel?: string;
  service: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  status?: string;
}

/**
 * Sends notification emails when a customer books an appointment.
 * 1. Confirmation to the customer (if they provided an email)
 * 2. New Lead Alert to the studio owner / business email
 */
export async function sendAppointmentEmails(data: AppointmentEmailPayload): Promise<void> {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn('[Email Warning] SMTP credentials (SMTP_USER, SMTP_PASS) not set. Email not sent.');
    return;
  }

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const businessEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
    'sarvottamchandel1509@gmail.com';

  const brandRed = '#E31C1C';
  const brandDark = '#0A0A0A';
  const brandCard = '#141414';

  // 1. Send confirmation email to Customer (if email provided)
  if (data.email && data.email.trim()) {
    const customerHtml = `
      <div style="background-color: ${brandDark}; color: #ffffff; font-family: Arial, sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: ${brandRed}; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">DETAILING STREET</h1>
          <p style="color: #999; font-size: 13px; margin: 4px 0 0 0;">Ludhiana's #1 Premium Detailing Studio</p>
        </div>

        <div style="background-color: ${brandCard}; padding: 20px; border-radius: 8px; border: 1px solid #2a2a2a; margin-bottom: 20px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Appointment Request Received!</h2>
          <p style="color: #ccc; font-size: 14px; line-height: 1.6;">
            Hi <strong>${data.customerName}</strong>, thank you for choosing Detailing Street. We have received your booking request and our team will contact you within 2 hours to confirm your schedule.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; color: #bbb;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #222;"><strong>Booking ID:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #222; text-align: right; color: ${brandRed}; font-weight: bold;">${data.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #222;"><strong>Service:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #222; text-align: right; color: #fff;">${data.service}</td>
            </tr>
            ${data.carModel ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #222;"><strong>Vehicle Model:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #222; text-align: right; color: #fff;">${data.carModel}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #222;"><strong>Preferred Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #222; text-align: right; color: #fff;">${data.preferredDate || 'Flexible'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #222;"><strong>Preferred Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #222; text-align: right; color: #fff;">${data.preferredTime || 'Flexible'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #eab308; font-weight: bold;">Pending Confirmation</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; font-size: 13px; color: #777; line-height: 1.5;">
          <p>Need urgent assistance? Call us directly at <strong style="color: #fff;">9115555035</strong></p>
          <p>📍 504-R Model Town, Opposite Krishna Hospital, Ludhiana</p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Detailing Street Ludhiana" <${fromEmail}>`,
        to: data.email,
        subject: `Appointment Received: ${data.service} [${data.bookingId}]`,
        html: customerHtml,
      });
    } catch (err) {
      console.error('[Email Error] Failed to send customer confirmation:', err);
    }
  }

  // 2. Send Alert email to Studio Business Owner
  if (businessEmail) {
    const adminHtml = `
      <div style="background-color: ${brandDark}; color: #ffffff; font-family: Arial, sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
        <h2 style="color: ${brandRed}; margin-top: 0; font-size: 20px;">🚨 New Appointment Booking Alert</h2>
        <p style="color: #ccc; font-size: 14px;">A new appointment was just submitted through the website.</p>

        <div style="background-color: ${brandCard}; padding: 18px; border-radius: 8px; border: 1px solid #2a2a2a; margin: 16px 0;">
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Booking ID:</strong> <span style="color: ${brandRed}; font-weight: bold;">${data.bookingId}</span></p>
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Customer:</strong> <span style="color: #fff;">${data.customerName}</span></p>
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Phone:</strong> <a href="tel:${data.phoneNumber}" style="color: #3b82f6;">${data.phoneNumber}</a></p>
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Email:</strong> ${data.email || 'None'}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Vehicle:</strong> ${data.carModel || 'Not specified'}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Service:</strong> <span style="color: #fff; font-weight: bold;">${data.service}</span></p>
          <p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Preferred Schedule:</strong> ${data.preferredDate || 'Any'} at ${data.preferredTime || 'Any'}</p>
          ${data.message ? `<p style="margin: 6px 0; font-size: 14px; color: #ccc;"><strong>Customer Note:</strong> <em>"${data.message}"</em></p>` : ''}
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="http://localhost:3000/admin/appointments" style="background-color: ${brandRed}; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; display: inline-block;">View in Admin Dashboard</a>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Detailing Street Notifications" <${fromEmail}>`,
        to: businessEmail,
        subject: `New Lead: ${data.customerName} - ${data.service} (${data.bookingId})`,
        html: adminHtml,
      });
    } catch (err) {
      console.error('[Email Error] Failed to send admin alert email:', err);
    }
  }
}

/**
 * Sends notification when an appointment status is updated by admin (e.g. Confirmed, Completed)
 */
export async function sendStatusUpdateEmail(data: AppointmentEmailPayload): Promise<void> {
  if (!data.email || !data.email.trim() || !data.status) {
    return;
  }

  const transporter = getMailTransporter();
  if (!transporter) return;

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const brandRed = '#E31C1C';
  const brandDark = '#0A0A0A';
  const brandCard = '#141414';

  const statusColor =
    data.status === 'Confirmed'
      ? '#22c55e'
      : data.status === 'Completed'
      ? '#3b82f6'
      : data.status === 'Cancelled'
      ? '#ef4444'
      : '#eab308';

  const html = `
    <div style="background-color: ${brandDark}; color: #ffffff; font-family: Arial, sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: ${brandRed}; margin: 0; font-size: 24px; text-transform: uppercase;">DETAILING STREET</h1>
        <p style="color: #999; font-size: 13px; margin: 4px 0 0 0;">Ludhiana's #1 Premium Detailing Studio</p>
      </div>

      <div style="background-color: ${brandCard}; padding: 20px; border-radius: 8px; border: 1px solid #2a2a2a;">
        <h2 style="color: #fff; font-size: 18px; margin-top: 0;">Appointment Status Update</h2>
        <p style="color: #ccc; font-size: 14px;">
          Hi <strong>${data.customerName}</strong>, your appointment status for <strong>${data.service}</strong> has been updated to:
        </p>
        <div style="display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 16px; background-color: ${statusColor}22; color: ${statusColor}; margin: 12px 0;">
          ${data.status.toUpperCase()}
        </div>
        <p style="color: #999; font-size: 13px;">Booking Reference: <strong>${data.bookingId}</strong></p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 13px; color: #777;">
        <p>Questions? Call us at <strong style="color: #fff;">9115555035</strong></p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Detailing Street Ludhiana" <${fromEmail}>`,
      to: data.email,
      subject: `Update on your Booking ${data.bookingId}: ${data.status}`,
      html,
    });
  } catch (err) {
    console.error('[Email Error] Failed to send status update email:', err);
  }
}

