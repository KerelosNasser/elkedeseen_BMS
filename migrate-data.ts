import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./db/schema";
import { config } from "dotenv";

// Load env vars
config({ path: ".env.local" });

async function migrate() {
  // Try SERVICE_URL first, then fallback to DATABASE_URL
  const rawPgUrl = process.env.SERVICE_URL || process.env.DATABASE_URL;
  const rawTursoUrl = process.env.TURSO_CONNECTION_URL;
  const rawTursoToken = process.env.TURSO_AUTH_TOKEN;

  // Sanitize: remove any leading/trailing single or double quotes that might be in the .env file
  const pgUrl = rawPgUrl?.replace(/^['"]|['"]$/g, '');
  const tursoUrl = rawTursoUrl?.replace(/^['"]|['"]$/g, '');
  const tursoToken = rawTursoToken?.replace(/^['"]|['"]$/g, '');

  if (!pgUrl || !tursoUrl) {
    console.error("❌ Missing environment variables. Ensure SERVICE_URL (or DATABASE_URL) and TURSO_CONNECTION_URL are set.");
    return;
  }

  console.log("🔗 Connecting to source (Postgres) and destination (Turso)...");

  // Source: Postgres (Neon/Aiven)
  const pgClient = postgres(pgUrl, { ssl: "require" });
  
  // Destination: Turso (SQLite)
  const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });
  const dbTurso = drizzleTurso(tursoClient, { schema });

  // Order matters due to Foreign Key constraints
  const migrationPlan = [
    { name: "users", table: schema.users },
    { name: "venues", table: schema.venues },
    { name: "bookings", table: schema.bookings },
    { name: "booking_attendees", table: schema.bookingAttendees },
    { name: "recurring_approvals", table: schema.recurringApprovals },
    { name: "sessions", table: schema.sessions },
  ];

  console.log("🚀 Starting data migration...");

  for (const { name, table } of migrationPlan) {
    try {
      console.log(`📦 Migrating table: ${name}...`);

      // 1. Fetch raw data from Postgres using the client directly
      // This avoids dialect mismatch issues in Drizzle's high-level API
      const rows = await pgClient.unsafe(`SELECT * FROM ${name}`);

      if (rows.length === 0) {
        console.log(`  ⚠️ No data found in ${name}, skipping.`);
        continue;
      }

      console.log(`  Found ${rows.length} records. Transferring...`);

      // 2. Insert into Turso in chunks
      const chunkSize = 50;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        
        // SQLite/Turso doesn't support the same batch size as Postgres, 
        // and Drizzle handles the mapping of Date objects to timestamps automatically.
        await dbTurso.insert(table).values(chunk).onConflictDoNothing();
      }

      console.log(`  ✅ Table ${name} migrated successfully.`);
    } catch (error) {
      console.error(`  ❌ Error migrating ${name}:`, error);
    }
  }

  console.log("\n✨ Migration process finished!");
  
  await pgClient.end();
  tursoClient.close();
}

migrate().catch((err) => {
  console.error("💥 Critical migration error:", err);
  process.exit(1);
});
