import nodemailer from 'nodemailer';

let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getEmailLayout(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: sans-serif; background-color: #f5efe4; border: 1px solid #d9c9a8; border-radius: 12px; overflow: hidden; }
        .header { background-color: #9b1c1f; color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; background-color: white; color: #2a2a2a; line-height: 1.6; }
        .footer { background-color: #ede4d3; padding: 20px; text-align: center; font-size: 12px; color: #6b5e4e; }
        .button { display: inline-block; padding: 12px 25px; background-color: #9b1c1f; color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 15px; }
        .info-box { background-color: #faf6ef; border: 1px solid #d4af37; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .label { color: #8b0000; font-weight: bold; }
        .ornament { color: #d4af37; font-size: 20px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header"><h1>حجز قاعات كنيسة القديسيين</h1></div>
        <div class="content" style="text-align: right;">
          <div style="text-align: center;" class="ornament">✤</div>
          ${content}
          <div style="text-align: center;" class="ornament">✤</div>
        </div>
        <div class="footer">نظام إدارة القاعات - كنيسة القديسيين مارمرقس والبابا بطرس</div>
      </div>
    </body>
    </html>
  `;
}

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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your-email@gmail.com') {
    return { success: true, messageId: 'mock-id' };
  }

  try {
    const currentTransporter = getTransporter();
    const systemFrom = process.env.SMTP_FROM || `"حجز قاعات كنيسة القديسيين" <${process.env.SMTP_USER}>`;
    const fromParts = systemFrom.match(/<(.+)>/);
    const systemEmailOnly = fromParts ? fromParts[1] : process.env.SMTP_USER;
    const finalFrom = fromName ? `"${fromName}" <${systemEmailOnly}>` : systemFrom;

    const info = await currentTransporter.sendMail({
      from: finalFrom,
      to: Array.isArray(to) ? to.join(', ') : to,
      replyTo,
      subject,
      html,
    });
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
  const content = `
    <h2 style="color: #9b1c1f;">تم تسجيل حجز جديد</h2>
    <div class="info-box">
      <p><span class="label">القاعة:</span> ${venueName}</p>
      <p><span class="label">بواسطة:</span> ${bookerName}</p>
      <p><span class="label">التاريخ:</span> ${date}</p>
      <p><span class="label">الوقت:</span> ${startTime} - ${endTime}</p>
    </div>
    <div style="text-align: center;">
      <a href="${APP_URL}" class="button">عرض في التطبيق</a>
    </div>
  `;

  return sendEmail({ 
    to: adminEmails, 
    subject, 
    html: getEmailLayout(content), 
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
  const subject = `طلب موافقة على حجز: ${venueName}`;
  const content = `
    <h2 style="color: #9b1c1f;">طلب حجز متكرر جديد</h2>
    <p>هذا الحجز يتطلب موافقة المسؤولين.</p>
    <div class="info-box">
      <p><span class="label">القاعة:</span> ${venueName}</p>
      <p><span class="label">بواسطة:</span> ${bookerName}</p>
      <p><span class="label">اليوم:</span> ${dayOfWeek}</p>
      <p><span class="label">الوقت:</span> ${startTime} - ${endTime}</p>
    </div>
    <div style="text-align: center;">
      <a href="${APP_URL}/admin/approvals" class="button">مراجعة الطلب</a>
    </div>
  `;

  return sendEmail({ 
    to: adminEmails, 
    subject, 
    html: getEmailLayout(content), 
    fromName: bookerName, 
    replyTo: bookerEmail 
  });
}

export async function sendBookingStatusUpdateNotification({
  to,
  venueName,
  title,
  status,
  adminName,
}: {
  to: string;
  venueName: string;
  title: string;
  status: 'active' | 'rejected';
  adminName?: string;
}) {
  const isApproved = status === 'active';
  const subject = `${isApproved ? '✅ تمت الموافقة' : '❌ تم رفض'} حجزك: ${title}`;
  const statusText = isApproved ? 'مقبول ومؤكد' : 'مرفوض';
  const color = isApproved ? '#28a745' : '#d9534f';

  const content = `
    <h2 style="color: ${color};">تحديث بخصوص طلب حجزك</h2>
    <div class="info-box" style="border-color: ${color}">
      <p><span class="label">الحدث:</span> ${title}</p>
      <p><span class="label">الحالة:</span> <span style="color: ${color}">${statusText}</span></p>
      ${adminName ? `<p><span class="label">بواسطة:</span> ${adminName}</p>` : ''}
    </div>
    <div style="text-align: center;">
      <a href="${APP_URL}" class="button">فتح التطبيق</a>
    </div>
  `;

  return sendEmail({ to, subject, html: getEmailLayout(content) });
}
