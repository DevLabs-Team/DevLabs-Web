const { Pool } = require('pg');
const SCHEMA = require('./schema');

require('dotenv').config ? require('dotenv').config() : null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  try {
    await pool.query(SCHEMA);
    console.log('\n  ✔ Tablas creadas/verificadas en PostgreSQL');
    console.log('  → posts, announcements, polls, session\n');
  } catch (e) {
    console.error('  ✘ Error creando las tablas:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
