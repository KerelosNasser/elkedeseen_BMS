import { config } from 'dotenv';
import path from 'path';

// Load env before anything else
config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from './db/index';
import { venues } from './db/schema';

async function test() {
  console.log('--- Turso Connectivity Test ---');
  
  if (!process.env.TURSO_CONNECTION_URL) {
    console.error('❌ TURSO_CONNECTION_URL is missing in process.env');
    process.exit(1);
  }

  try {
    console.log('🔌 Attempting to connect to Turso...');
    const result = await db.select().from(venues).limit(1);
    console.log('✅ SUCCESS! Connection established and verified.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(error);
    process.exit(1);
  }
}

test();
