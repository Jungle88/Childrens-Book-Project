import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

export function getDb(): Client {
  if (client) return client;
  client = createClient({
    // For production on Vercel, switch to Turso: https://turso.tech
    // Set TURSO_DATABASE_URL=libsql://your-db.turso.io and TURSO_AUTH_TOKEN
    // SQLite file won't persist on serverless platforms
    url: process.env.TURSO_DATABASE_URL || 'file:data/storybook.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return client;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, child_name TEXT NOT NULL, child_age INTEGER NOT NULL,
      input_json TEXT NOT NULL, pages_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      views INTEGER NOT NULL DEFAULT 0, shares INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL,
      properties_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
