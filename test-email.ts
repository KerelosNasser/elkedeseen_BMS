import { config } from 'dotenv';
import path from 'path';

// 1. Load the environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// 2. Import the mail utility
import { sendEmail } from './lib/mail';

async function test() {
  console.log('--- 📧 Email System Connectivity Test ---');
  
  // Check if variables are loaded
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP_USER or SMTP_PASS is missing in .env.local');
    console.log('Note: If you just added them, make sure to save the file.');
    process.exit(1);
  }

  console.log(`🔗 Attempting to send test email via: ${process.env.SMTP_HOST}`);
  console.log(`👤 Sending from: ${process.env.SMTP_USER}`);
  console.log(`🎯 Sending to: ${process.env.ADMIN_EMAILS || process.env.SMTP_USER}`);

  try {
    const result = await sendEmail({
      to: process.env.ADMIN_EMAILS?.split(',')[0] || process.env.SMTP_USER,
      subject: '🚀 حجز قاعات كنيسة القديسيين: تجربة البريد الإلكتروني ✅',
      html: `
        <div dir="rtl" style="font-family: sans-serif; border: 2px solid #d4af37; padding: 20px; border-radius: 10px;">
          <h2 style="color: #8b0000;">تهانينا! 🎉</h2>
          <p>إذا كنت تقرأ هذه الرسالة، فهذا يعني أن إعدادات البريد الإلكتروني (SMTP) في تطبيقك تعمل بشكل مثالي.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">تم الإرسال من: نظام حجز قاعات كنيسة القديسيين</p>
        </div>
      `,
      fromName: 'نظام حجز القاعات'
    });

    if (result.success) {
      console.log('✅ SUCCESS! Check your inbox (or spam folder).');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ FAILED to send email.');
      console.error(result.error);
    }
  } catch (err) {
    console.error('💥 Critical error during test:');
    console.error(err);
  }
}

test();
