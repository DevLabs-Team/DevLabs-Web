const { Pool } = require('pg');

require('dotenv').config ? require('dotenv').config() : null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  project TEXT DEFAULT '',
  repo_url TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  author TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  voters JSONB DEFAULT '[]',
  open BOOLEAN DEFAULT true,
  author TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

async function run() {
  try {
    await pool.query(SCHEMA);
    console.log('\n  ✔ Tablas creadas/verificadas en PostgreSQL');
    console.log('  → posts, announcements, polls\n');
  } catch (e) {
    console.error('  ✘ Error creando las tablas:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
