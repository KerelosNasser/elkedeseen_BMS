import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { config } from "dotenv";
import path from "path";
import { VENUES_CONFIG } from "../lib/constants";
import { notInArray } from "drizzle-orm";

config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_CONNECTION_URL is not set in .env.local');
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('🔄 Starting Venue Synchronization...');

  // 1. Get all IDs from our config
  const validIds = VENUES_CONFIG.map(v => v.id);

  // 2. Remove venues that are NOT in our config (orphaned venues)
  // This cleans up old UUID-based venues from the migration
  console.log('🧹 Cleaning up old/orphaned venues...');
  await db.delete(schema.venues).where(notInArray(schema.venues.id, validIds));

  // 3. Upsert venues from config
  console.log('🌱 Upserting venues from constants.ts...');
  for (const venue of VENUES_CONFIG) {
    await db.insert(schema.venues).values({
      id: venue.id,
      nameAr: venue.nameAr,
      section: venue.section,
      capacity: venue.capacity,
      isDouble: venue.isDouble,
      sortOrder: venue.sortOrder,
    }).onConflictDoUpdate({
      target: schema.venues.id,
      set: {
        nameAr: venue.nameAr,
        section: venue.section,
        capacity: venue.capacity,
        isDouble: venue.isDouble,
        sortOrder: venue.sortOrder,
      }
    });
    console.log(` ✅ Synchronized: ${venue.nameAr}`);
  }

  console.log('\n✨ Database sync completed successfully!');
  client.close();
}

main().catch((err) => {
  console.error('💥 Sync failed:', err);
  process.exit(1);
});
