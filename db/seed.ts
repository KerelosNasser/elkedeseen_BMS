import { db } from './index';
import * as schema from './schema';
import { VENUES_CONFIG } from '../lib/constants';
import { notInArray } from 'drizzle-orm';

async function main() {
  console.log('🔄 Starting Venue Synchronization (PostgreSQL)...');

  // 1. Get all IDs from our config
  const validIds = VENUES_CONFIG.map((v) => v.id);

  // 2. Remove venues that are NOT in our config (orphaned venues)
  console.log('🧹 Cleaning up old/orphaned venues...');
  await db.delete(schema.venues).where(notInArray(schema.venues.id, validIds));

  // 3. Upsert venues from config
  console.log('🌱 Upserting venues from constants.ts...');
  for (const venue of VENUES_CONFIG) {
    await db
      .insert(schema.venues)
      .values({
        id: venue.id,
        nameAr: venue.nameAr,
        section: venue.section,
        capacity: venue.capacity,
        isDouble: venue.isDouble,
        sortOrder: venue.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.venues.id,
        set: {
          nameAr: venue.nameAr,
          section: venue.section,
          capacity: venue.capacity,
          isDouble: venue.isDouble,
          sortOrder: venue.sortOrder,
        },
      });
    console.log(` ✅ Synchronized: ${venue.nameAr}`);
  }

  console.log('\n✨ Database sync completed successfully!');
  // With postgres-js, we don't necessarily need to close the connection manually in a script
  // but if needed: process.exit(0)
}

main().catch((err) => {
  console.error('💥 Sync failed:', err);
  process.exit(1);
});
