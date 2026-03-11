import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  fromName, 
  replyTo 
}: { 
  to: string | string[]; 
  subject: string; 
  html: string;
  fromName?: string;
  replyTo?: string;
}) {
  // If SMTP is not configured, log to console for development
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\x1b[36m%s\x1b[0m', '📧 [EMAIL SYSTEM - MOCK MODE]');
    console.log(`\x1b[33mTo:\x1b[0m ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`\x1b[33mFrom Name:\x1b[0m ${fromName || 'System'}`);
    console.log(`\x1b[33mReply-To:\x1b[0m ${replyTo || 'N/A'}`);
    console.log(`\x1b[33mSubject:\x1b[0m ${subject}`);
    console.log(`\x1b[33mContent Preview:\x1b[0m ${html.substring(0, 100).replace(/<[^>]*>/g, '')}...`);
    console.log('\x1b[36m%s\x1b[0m', '---------------------------');
    return { success: true, message: 'Email logged to console (SMTP not configured)' };
  }

  try {
    const systemFrom = process.env.SMTP_FROM || `"VocaCast Notifications" <${process.env.SMTP_USER}>`;
    // We keep the system email as the sender to satisfy SMTP auth, 
    // but we change the display name and replyTo to match the action-taker.
    const fromParts = systemFrom.match(/<(.+)>/);
    const systemEmailOnly = fromParts ? fromParts[1] : process.env.SMTP_USER;
    const finalFrom = fromName ? `"${fromName}" <${systemEmailOnly}>` : systemFrom;

    const info = await transporter.sendMail({
      from: finalFrom,
      to: Array.isArray(to) ? to.join(', ') : to,
      replyTo,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendBookingNotification({
  venueName,
  bookerName,
  bookerEmail,
  date,
  startTime,
  endTime,
  adminEmails,
}: {
  venueName: string;
  bookerName: string;
  bookerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  adminEmails: string[];
}) {
  const subject = `حجز جديد: ${venueName}`;
  const html = `
    <div dir="rtl" style="font-family: sans-serif;">
      <h2>تم تسجيل حجز جديد في النظام</h2>
      <p><strong>بواسطة:</strong> ${bookerName} (${bookerEmail})</p>
      <p><strong>القاعة:</strong> ${venueName}</p>
      <p><strong>التاريخ:</strong> ${date}</p>
      <p><strong>الوقت:</strong> من ${startTime} إلى ${endTime}</p>
      <hr />
      <p>يمكنك مراجعة كافة الحجوزات من خلال <a href="${APP_URL}">رابط التطبيق</a></p>
    </div>
  `;

  return sendEmail({ 
    to: adminEmails, 
    subject, 
    html, 
    fromName: bookerName, 
    replyTo: bookerEmail 
  });
}

export async function sendApprovalRequestNotification({
  venueName,
  bookerName,
  bookerEmail,
  dayOfWeek,
  startTime,
  endTime,
  adminEmails,
}: {
  venueName: string;
  bookerName: string;
  bookerEmail: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  adminEmails: string[];
}) {
  const subject = `طلب موافقة على حجز متكرر: ${venueName}`;
  const html = `
    <div dir="rtl" style="font-family: sans-serif;">
      <h2>هناك طلب حجز متكرر جديد يتطلب موافقتك</h2>
      <p><strong>بواسطة:</strong> ${bookerName} (${bookerEmail})</p>
      <p><strong>القاعة:</strong> ${venueName}</p>
      <p><strong>اليوم:</strong> ${dayOfWeek}</p>
      <p><strong>الوقت:</strong> من ${startTime} إلى ${endTime}</p>
      <p style="color: #d9534f; font-weight: bold;">يتطلب هذا الحجز دخولك للتطبيق للموافقة أو الرفض.</p>
      <hr />
      <p><a href="${APP_URL}/dashboard/approvals" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">فتح صفحة الموافقات</a></p>
    </div>
  `;

  return sendEmail({ 
    to: adminEmails, 
    subject, 
    html, 
    fromName: bookerName, 
    replyTo: bookerEmail 
  });
}
