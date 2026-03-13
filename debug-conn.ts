import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function test() {
  try {
    console.log('--- Aiven Manual Connectivity Test ---');
    
    // Read .env.local manually to be 100% sure
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const serviceUrlMatch = envContent.match(/SERVICE_URL=(.+)/);
    
    if (!serviceUrlMatch) {
      console.error('❌ Could not find SERVICE_URL in .env.local');
      return;
    }
    
    const serviceUrl = serviceUrlMatch[1].trim();
    console.log('✅ Found SERVICE_URL in file.');
    
    // Try raw connection
    const sql = postgres(serviceUrl, { ssl: 'require' });
    
    console.log('🔌 Connecting to Aiven...');
    const result = await sql`SELECT 1 as connected`;
    
    if (result[0].connected === 1) {
      console.log('🚀 SUCCESS! Direct connection to Aiven established.');
      
      // Let's check the venues table too
      const venues = await sql`SELECT count(*) as count FROM venues`;
      console.log(`📊 Venues table accessible! Count: ${venues[0].count}`);
    }
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(error);
    process.exit(1);
  }
}

test();
