const express = require('express');
const session = require('express-session');
const https = require('https');
const path = require('path');
const { Pool } = require('pg');
const connectPgSimple = require('connect-pg-simple');
const SCHEMA = require('./db/schema');

require('dotenv').config ? require('dotenv').config() : null;

const app = express();

const GITHUB = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  org: 'DevLabs-Team',
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/callback',
};

const PRODUCTION = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: PRODUCTION ? { rejectUnauthorized: false } : undefined,
});

app.set('trust proxy', true);
app.use(session({
  store: new (connectPgSimple(session))({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60,
  }),
  secret: process.env.SESSION_SECRET || 'devlabs-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: PRODUCTION,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── GitHub helpers ── */
function githubGet(urlPath, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'DevLabs-Web', 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = 'token ' + token;
    const opts = { hostname: 'api.github.com', path: urlPath, headers: headers };
    const req = https.get(opts, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(body); } catch { parsed = body; }
        if (res.statusCode >= 400) {
          const err = new Error('GitHub GET ' + urlPath + ' -> ' + res.statusCode + ' ' + (typeof parsed === 'object' && parsed.message || ''));
          err.status = res.statusCode;
          return reject(err);
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, function () { req.destroy(new Error('GitHub GET timeout ' + urlPath)); });
  });
}
function githubPost(urlPath, data, token, host) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = { 'User-Agent': 'DevLabs-Web', 'Accept': 'application/json', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['Authorization'] = 'token ' + token;
    const opts = { hostname: host || 'api.github.com', path: urlPath, method: 'POST', headers: headers };
    const req = https.request(opts, (res) => {
      let b = '';
      res.on('data', (c) => b += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(b); } catch { parsed = b; }
        if (res.statusCode >= 400) {
          const err = new Error('GitHub POST ' + urlPath + ' -> ' + res.statusCode + ' ' + (typeof parsed === 'object' && parsed.message || ''));
          err.status = res.statusCode;
          return reject(err);
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, function () { req.destroy(new Error('GitHub POST timeout ' + urlPath)); });
    req.write(body);
    req.end();
  });
}

/* ── DB helpers ── */
let tablesReady = null;
function ensureTables() {
  if (!tablesReady) {
    tablesReady = pool.query(SCHEMA).catch(function (e) {
      tablesReady = null;
      throw e;
    });
  }
  return tablesReady;
}

async function query(text, params) {
  await ensureTables();
  return pool.query(text, params);
}

/* ── Auth ── */
app.get('/auth/login', (req, res) => {
  res.redirect('https://github.com/login/oauth/authorize?client_id=' + GITHUB.clientId + '&scope=read:org&redirect_uri=' + encodeURIComponent(GITHUB.callbackURL));
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/');
  try {
    const tokenRes = await githubPost('/login/oauth/access_token', { client_id: GITHUB.clientId, client_secret: GITHUB.clientSecret, code }, null, 'github.com');
    if (tokenRes.error) return res.redirect('/?error=oauth_failed');
    const token = tokenRes.access_token;
    const user = await githubGet('/user', token);
    if (!user.login) return res.redirect('/?error=user_fetch_failed');

    const membership = await githubGet('/orgs/' + GITHUB.org + '/memberships/' + user.login, token);
    if (membership.state !== 'active') return res.redirect('/?error=not_org_member');

    const orgRes = await githubGet('/orgs/' + GITHUB.org, token);
    const isOwner = membership.role === 'admin' || orgRes.owner && orgRes.owner.login === user.login;

    req.session.user = {
      login: user.login,
      name: user.name || user.login,
      avatar: user.avatar_url,
      bio: user.bio || '',
      role: isOwner ? 'owner' : 'member',
      token,
    };
    req.session.save(function (err) {
      if (err) { console.error('Session save error:', err); return res.redirect('/?error=session_save'); }
      res.redirect('/');
    });
  } catch (e) {
    console.error('OAuth error:', e.message, e.stack);
    res.redirect('/?error=auth_error&msg=' + encodeURIComponent(String(e.message || e)));
  }
});

app.get('/auth/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

app.get('/auth/debug', async (req, res) => {
  let db = 'unknown';
  try {
    await pool.query('SELECT 1');
    db = 'ok';
  } catch (e) {
    db = 'error: ' + (e.message || e);
  }
  res.json({
    hasUser: !!req.session.user,
    role: req.session.user ? req.session.user.role : null,
    login: req.session.user ? req.session.user.login : null,
    isProd: PRODUCTION,
    callback: GITHUB.callbackURL,
    hasClientId: !!GITHUB.clientId,
    hasDbUrl: !!process.env.DATABASE_URL,
    db: db,
    cookie: req.headers.cookie || null,
    sessionId: req.session && req.session.id,
  });
});

app.get('/auth/me', (req, res) => {
  if (!req.session.user) return res.json(null);
  const { login, name, avatar, bio, role } = req.session.user;
  res.json({ login, name, avatar, bio, role });
});

/* ── Members (equipo) ── */
const MEMBER_TOKEN = process.env.GITHUB_TOKEN || null;

async function refreshMembers(token) {
  let members = await githubGet('/orgs/' + GITHUB.org + '/members?per_page=100', token);
  if (!Array.isArray(members)) return;
  const now = new Date().toISOString();
  for (const m of members) {
    if (!m || !m.login) continue;
    await pool.query(
      `INSERT INTO members (login, avatar_url, name, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (login) DO UPDATE SET avatar_url = $2, updated_at = $4`,
      [m.login, m.avatar_url || '', m.login, now]
    );
  }
  const logins = members.filter(m => m && m.login).map(m => m.login);
  await pool.query(`DELETE FROM members WHERE login <> ALL($1::text[])`, [logins]);
}

app.get('/api/members', async (req, res) => {
  try {
    await ensureTables();
    let refreshed = false;

    // 1) Prefer server-level token (works for everyone, no session needed)
    if (MEMBER_TOKEN) {
      try {
        await refreshMembers(MEMBER_TOKEN);
        refreshed = true;
      } catch (e) {
        console.error('Member refresh (server token) error:', e.message);
      }
    }

    // 2) Fallback: use the logged-in owner's token
    if (!MEMBER_TOKEN && req.session.user && req.session.user.token) {
      try {
        await refreshMembers(req.session.user.token);
        refreshed = true;
      } catch (e) {
        console.error('Member refresh (session token) error:', e.message);
      }
    }

    // 3) Serve from cache to anyone
    const { rows } = await pool.query('SELECT login, avatar_url, name FROM members ORDER BY updated_at DESC');
    res.json(rows);
  } catch (e) {
    console.error('Members error:', e);
    res.status(500).json({ error: 'DB error' });
  }
});

/* ── Posts (actualizaciones) ── */
app.get('/api/posts', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(rows.map(row => ({ ...row, repoUrl: row.repo_url, authorAvatar: row.author_avatar, createdAt: row.created_at })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/posts', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const { project, repoUrl, title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  try {
    const { rows } = await query(
      `INSERT INTO posts (id, project, repo_url, title, content, author, author_avatar, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [genId(), project || '', repoUrl || '', title, content, req.session.user.login, req.session.user.avatar, new Date().toISOString()]
    );
    const row = rows[0];
    res.json({ ...row, repoUrl: row.repo_url, authorAvatar: row.author_avatar, createdAt: row.created_at });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.delete('/api/posts/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { rows } = await query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const post = rows[0];
    if (req.session.user.role !== 'owner' && post.author !== req.session.user.login) return res.status(403).json({ error: 'Forbidden' });
    await query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

/* ── Announcements (anuncios) ── */
app.get('/api/announcements', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows.map(row => ({ ...row, authorAvatar: row.author_avatar, createdAt: row.created_at })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/announcements', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  const { title, content, type } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  try {
    const { rows } = await query(
      `INSERT INTO announcements (id, title, content, type, author, author_avatar, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [genId(), title, content, type || 'general', req.session.user.login, req.session.user.avatar, new Date().toISOString()]
    );
    const row = rows[0];
    res.json({ ...row, authorAvatar: row.author_avatar, createdAt: row.created_at });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.delete('/api/announcements/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

/* ── Polls (encuestas) ── */
app.get('/api/polls', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM polls ORDER BY created_at DESC');
    res.json(rows.map(row => ({ ...row, createdAt: row.created_at, voters: row.voters || [], options: row.options || [] })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/polls', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  const { question, options } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2) return res.status(400).json({ error: 'Question and at least 2 options required' });
  try {
    const { rows } = await query(
      `INSERT INTO polls (id, question, options, voters, open, author, created_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7) RETURNING *`,
      [genId(), question, JSON.stringify(options.map(o => ({ text: o, votes: 0 }))), JSON.stringify([]), true, req.session.user.login, new Date().toISOString()]
    );
    const row = rows[0];
    res.json({ ...row, createdAt: row.created_at, voters: row.voters || [], options: row.options || [] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/polls/:id/vote', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const { optionIndex } = req.body;
  try {
    const { rows } = await query('SELECT * FROM polls WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const poll = rows[0];
    if (!poll.open) return res.status(400).json({ error: 'Poll closed' });
    if (poll.voters.includes(req.session.user.login)) return res.status(400).json({ error: 'Already voted' });
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) return res.status(400).json({ error: 'Invalid option' });

    const options = poll.options.slice();
    options[optionIndex].votes++;
    const voters = poll.voters.concat(req.session.user.login);

    const { rows: updated } = await query(
      `UPDATE polls SET options = $2::jsonb, voters = $3::jsonb WHERE id = $1 RETURNING *`,
      [req.params.id, JSON.stringify(options), JSON.stringify(voters)]
    );
    const row = updated[0];
    res.json({ ...row, createdAt: row.created_at, voters: row.voters || [], options: row.options || [] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/polls/:id/close', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  try {
    const { rows } = await query('UPDATE polls SET open = false WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const row = rows[0];
    res.json({ ...row, createdAt: row.created_at, voters: row.voters || [], options: row.options || [] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'DB error' }); }
});

/* ── SPA fallback ── */
app.get('*', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', req.path);
  if (require('fs').existsSync(htmlPath) && require('fs').statSync(htmlPath).isFile()) return res.sendFile(htmlPath);
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── Export for Vercel (and optional local listen) ── */
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('\n  ⚡ DevLabs Team running at http://localhost:' + PORT);
    console.log('  → GitHub OAuth: configure .env with your client ID/secret\n');
  });
}

module.exports = app;
