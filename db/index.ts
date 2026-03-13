import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
// Using a proxy or lazy initialization to handle cases where DATABASE_URL is missing during build
const createClient = () => {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return postgres(connectionString, { prepare: false });
};

// Next.js evaluates this at build time. We use a dummy for the client if connectionString is missing.
const client = connectionString ? postgres(connectionString, { prepare: false }) : null;

export const db = drizzle(client as any, { schema });
export * from './schema';
