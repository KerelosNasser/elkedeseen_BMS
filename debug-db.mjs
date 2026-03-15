import postgres from 'postgres';

/**
 * PostgreSQL Direct Connection Debug Script
 */

const dbUrl = process.env.DATABASE_URL;

async function debug() {
  if (!dbUrl) {
    process.exit(1);
  }

  // Masking password for safe logging
  try {
    new URL(dbUrl);
  } catch (e) {
    process.exit(1);
  }

  const sql = postgres(dbUrl, {
    connect_timeout: 5,
    max: 1,
    prepare: false
  });

  try {
    await sql`SELECT version(), now()`;
  } catch (error) {
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

debug();
