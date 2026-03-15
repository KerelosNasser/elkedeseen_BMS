import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  if (!connectionString) {
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    await migrate(db, { migrationsFolder: 'db/migrations' });
  } catch (error) {
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
