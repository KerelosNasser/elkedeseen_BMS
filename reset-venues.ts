import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./db/schema";
import { config } from "dotenv";
import path from "path";
import { VENUES_CONFIG } from "./lib/constants";

// Load environment variables manually to avoid import order issues
config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_CONNECTION_URL is not set in .env.local');
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('🗑️  Deleting all existing venues...');
  await db.delete(schema.venues);

  console.log('🌱 Seeding new venues from constants...');
  for (const venue of VENUES_CONFIG) {
    await db.insert(schema.venues).values({
      id: venue.id,
      nameAr: venue.nameAr,
      section: venue.section,
      capacity: venue.capacity,
      isDouble: venue.isDouble,
      sortOrder: venue.sortOrder,
    });
    console.log(` ✅ Added: ${venue.nameAr}`);
  }

  console.log('\n✨ Database reset and sync completed successfully!');
  client.close();
}

main().catch((err) => {
  console.error('💥 Error resetting database:', err);
  process.exit(1);
});
