import postgres from 'postgres';

/**
 * PostgreSQL Direct Connection Debug Script
 * 
 * Usage from the server:
 * 1. Log into the container: docker exec -it elkedeseen-bms sh
 * 2. Run the script: node debug-db.mjs
 */

const dbUrl = process.env.DATABASE_URL;

async function debug() {
  console.log('--- Database Connection Debugger ---');
  
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  // Masking password for safe logging
  try {
    const url = new URL(dbUrl);
    console.log(`Checking connection to: ${url.protocol}//${url.username}:****@${url.host}${url.pathname}`);
  } catch (e) {
    console.error('❌ Error: DATABASE_URL is not a valid URL format.');
    process.exit(1);
  }

  const sql = postgres(dbUrl, {
    connect_timeout: 5,
    max: 1,
    prepare: false
  });

  try {
    console.log('🔌 Attempting to connect...');
    const result = await sql`SELECT version(), now()`;
    console.log('✅ SUCCESS! Connection established.');
    console.log('Database Version:', result[0].version);
    console.log('Server Time:', result[0].now);
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('--- Error Details ---');
    console.error('Code:', error.code || 'N/A');
    console.error('Message:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Tip: Check if the password is correct. If it contains special characters like "=", ensure they are URL-encoded or that the password is not Base64-encoded by mistake.');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
      console.log('\n💡 Tip: The database server is unreachable. Check the IP address/Host and ensures that the database is running and accessible from the app container.');
    }
  } finally {
    await sql.end();
    process.exit(0);
  }
}

debug();
