import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function testConnection() {
  console.log('--- Direct Aiven Connection Test ---');
  
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local not found at', envPath);
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/SERVICE_URL=(.+)/);
    
    if (!match) {
      console.error('❌ SERVICE_URL not found in .env.local');
      return;
    }

    const url = match[1].trim();
    console.log('🔗 URL found. Attempting connection...');

    const sql = postgres(url, { ssl: 'require' });
    const result = await sql`SELECT 1 as success`;
    
    if (result[0].success === 1) {
      console.log('✅ DATABASE CONNECTED SUCCESSFULLY!');
    }
    
    await sql.end();
  } catch (err) {
    console.error('❌ CONNECTION FAILED');
    console.error(err);
  }
}

testConnection();
