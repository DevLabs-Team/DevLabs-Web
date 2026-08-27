const express = require('express');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config ? require('dotenv').config() : null;

const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  org: 'DevLabs-Team',
  callbackURL: 'http://localhost:' + PORT + '/auth/callback',
};

app.use(session({
  secret: process.env.SESSION_SECRET || 'devlabs-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
['', 'posts', 'announcements', 'polls'].forEach((d) => {
  const dir = path.join(DATA_DIR, d);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function githubGet(urlPath, token) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'api.github.com', path: urlPath, headers: { 'User-Agent': 'DevLabs-Web', 'Authorization': token ? 'token ' + token : undefined } };
    https.get(opts, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(body); } });
    }).on('error', reject);
  });
}
function githubPost(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = { hostname: 'api.github.com', path: urlPath, method: 'POST', headers: { 'User-Agent': 'DevLabs-Web', 'Authorization': 'token ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(opts, (res) => {
      let b = '';
      res.on('data', (c) => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(b); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ── Auth ── */
app.get('/auth/login', (req, res) => {
  res.redirect('https://github.com/login/oauth/authorize?client_id=' + GITHUB.clientId + '&scope=read:org&redirect_uri=' + encodeURIComponent(GITHUB.callbackURL));
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/');
  try {
    const tokenRes = await githubPost('/login/oauth/access_token', { client_id: GITHUB.clientId, client_secret: GITHUB.clientSecret, code }, null);
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
    res.redirect('/');
  } catch (e) {
    console.error('OAuth error:', e);
    res.redirect('/?error=auth_error');
  }
});

app.get('/auth/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

app.get('/auth/me', (req, res) => {
  if (!req.session.user) return res.json(null);
  const { login, name, avatar, bio, role } = req.session.user;
  res.json({ login, name, avatar, bio, role });
});

/* ── Posts (actualizaciones) ── */
app.get('/api/posts', (req, res) => {
  const files = fs.readdirSync(path.join(DATA_DIR, 'posts')).filter(f => f.endsWith('.json')).sort().reverse();
  res.json(files.map(f => readJSON(path.join(DATA_DIR, 'posts', f))));
});

app.post('/api/posts', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const { project, repoUrl, title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const post = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), project: project || '', repoUrl: repoUrl || '', title, content, author: req.session.user.login, authorAvatar: req.session.user.avatar, createdAt: new Date().toISOString() };
  writeJSON(path.join(DATA_DIR, 'posts', post.id + '.json'), post);
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const file = path.join(DATA_DIR, 'posts', req.params.id + '.json');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  const post = readJSON(file);
  if (req.session.user.role !== 'owner' && post.author !== req.session.user.login) return res.status(403).json({ error: 'Forbidden' });
  fs.unlinkSync(file);
  res.json({ ok: true });
});

/* ── Announcements (anuncios) ── */
app.get('/api/announcements', (req, res) => {
  const files = fs.readdirSync(path.join(DATA_DIR, 'announcements')).filter(f => f.endsWith('.json')).sort().reverse();
  res.json(files.map(f => readJSON(path.join(DATA_DIR, 'announcements', f))));
});

app.post('/api/announcements', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  const { title, content, type } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const ann = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), title, content, type: type || 'general', author: req.session.user.login, authorAvatar: req.session.user.avatar, createdAt: new Date().toISOString() };
  writeJSON(path.join(DATA_DIR, 'announcements', ann.id + '.json'), ann);
  res.json(ann);
});

app.delete('/api/announcements/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  const file = path.join(DATA_DIR, 'announcements', req.params.id + '.json');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(file);
  res.json({ ok: true });
});

/* ── Polls (encuestas) ── */
app.get('/api/polls', (req, res) => {
  const files = fs.readdirSync(path.join(DATA_DIR, 'polls')).filter(f => f.endsWith('.json')).sort().reverse();
  res.json(files.map(f => readJSON(path.join(DATA_DIR, 'polls', f))));
});

app.post('/api/polls', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  const { question, options } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2) return res.status(400).json({ error: 'Question and at least 2 options required' });
  const poll = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), question, options: options.map(o => ({ text: o, votes: 0 })), voters: [], open: true, author: req.session.user.login, createdAt: new Date().toISOString() };
  writeJSON(path.join(DATA_DIR, 'polls', poll.id + '.json'), poll);
  res.json(poll);
});

app.post('/api/polls/:id/vote', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const file = path.join(DATA_DIR, 'polls', req.params.id + '.json');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  const poll = readJSON(file);
  if (!poll.open) return res.status(400).json({ error: 'Poll closed' });
  if (poll.voters.includes(req.session.user.login)) return res.status(400).json({ error: 'Already voted' });
  const { optionIndex } = req.body;
  if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) return res.status(400).json({ error: 'Invalid option' });
  poll.options[optionIndex].votes++;
  poll.voters.push(req.session.user.login);
  writeJSON(file, poll);
  res.json(poll);
});

app.post('/api/polls/:id/close', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') return res.status(403).json({ error: 'Owner only' });
  const file = path.join(DATA_DIR, 'polls', req.params.id + '.json');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  const poll = readJSON(file);
  poll.open = false;
  writeJSON(file, poll);
  res.json(poll);
});

/* ── SPA fallback ── */
app.get('*', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', req.path);
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) return res.sendFile(htmlPath);
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log('\n  ⚡ DevLabs Team running at http://localhost:' + PORT);
  console.log('  → GitHub OAuth: configure .env with your client ID/secret\n');
});
