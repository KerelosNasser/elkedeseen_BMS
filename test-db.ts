import { config } from 'dotenv';
config({ path: '.env.local' });

// Imports must come AFTER dotenv config if they rely on env vars at module level
import { db } from './db/index';
import { venues } from './db/schema';

async function test() {
  try {
    console.log('Testing connection to Aiven...');
    console.log('URL check:', process.env.SERVICE_URL ? '✅ URL Found' : '❌ URL Missing');
    
    const result = await db.select().from(venues);
    console.log('✅ Successfully connected to Aiven!');
    console.log(`📊 Found ${result.length} venues in the database.`);
    
    // List some venues to be sure
    result.forEach(v => console.log(` - ${v.nameAr} (${v.section})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

test();
