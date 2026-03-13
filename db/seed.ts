import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { config } from "dotenv";
import { VENUES_CONFIG } from "../lib/constants";

config({ path: ".env.local" });

async function main() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_CONNECTION_URL is not set');
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('Syncing venues from constants...');

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
  }

  console.log('Sync completed successfully.');
  client.close();
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
