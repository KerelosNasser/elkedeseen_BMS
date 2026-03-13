import { db } from './db/index';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('--- PostgreSQL Connectivity Test ---');
  
  try {
    console.log('🔌 Attempting to connect to database...');
    const result = await db.execute(sql`SELECT 1 as connected`);
    console.log('✅ SUCCESS! Connection established.');
    console.log('Result:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
