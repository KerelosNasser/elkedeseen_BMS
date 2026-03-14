import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing');
    process.exit(1);
  }

  console.log('🔄 Running migrations...');
  
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    // Note: This expects the 'db/migrations' folder to be present in the working directory
    await migrate(db, { migrationsFolder: 'db/migrations' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
