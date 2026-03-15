import { db } from './index';
import * as schema from './schema';
import { VENUES_CONFIG } from '../lib/constants';
import { notInArray } from 'drizzle-orm';

async function main() {

  const validIds = (VENUES_CONFIG as any[]).map((v) => v.id);

  if (validIds.length > 0) {
    await db.delete(schema.venues).where(notInArray(schema.venues.id, validIds));
  }


  for (const venue of (VENUES_CONFIG as any[])) {
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
  }


}

main().catch((err) => {
  console.error('💥 Sync failed:', err);
  process.exit(1);
});
