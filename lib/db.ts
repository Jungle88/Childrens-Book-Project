import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'storybook.db');
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
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
  return db;
}
