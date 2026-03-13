import 'dotenv/config'; // Try to load .env first
import { config } from 'dotenv';
import path from 'path';

// Force load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from './db/index';
import { venues } from './db/schema';

async function debug() {
  console.log('--- 📊 Current Venues in Database ---');
  try {
    const allVenues = await db.select().from(venues);
    
    if (allVenues.length === 0) {
      console.log('❌ No venues found in database.');
    } else {
      allVenues.forEach(v => {
        console.log(`📍 ID: ${v.id.padEnd(36)} | Name: ${v.nameAr.padEnd(25)} | Section: ${v.section}`);
      });
      console.log(`\nTotal: ${allVenues.length} venues.`);
    }
  } catch (err) {
    console.error('💥 Error querying database:', err);
  }
  process.exit(0);
}

debug();
