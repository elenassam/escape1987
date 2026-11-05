// 1987 가려진 기록 — 정적 게임 + 학생 진행 기록 API
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const TEACHER_PW = process.env.TEACHER_PASSWORD || '7891';
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };

/* ---------- storage: Postgres (DATABASE_URL) or local JSON file ---------- */
let store;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } });
  const ready = pool.query(`CREATE TABLE IF NOT EXISTS progress (key TEXT PRIMARY KEY, cls TEXT NOT NULL, no TEXT NOT NULL, data JSONB NOT NULL, updated BIGINT NOT NULL)`).then(() => pool.query(`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '{}', updated BIGINT NOT NULL)`));
  store = {
    async upsert(key, cls, no, data) { await ready; await pool.query(`INSERT INTO progress (key, cls, no, data, updated) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated = EXCLUDED.updated, cls = EXCLUDED.cls, no = EXCLUDED.no`, [key, cls, no, data, Date.now()]) },
    async all() { await ready; const r = await pool.query('SELECT data FROM progress ORDER BY cls, no'); return r.rows.map(x => x.data) },
    async delCls(cls) { await ready; const r = await pool.query('DELETE FROM progress WHERE cls = $1', [cls]); return r.rowCount },
    async kvGet(k) { await ready; const r = await pool.query('SELECT data FROM kv WHERE k = $1', [k]); return r.rows[0] ? r.rows[0].data : null },
    async kvMerge(k, patch) { await ready; const r = await pool.query(`INSERT INTO kv (k, data, updated) VALUES ($1, $2, $3) ON CONFLICT (k) DO UPDATE SET data = kv.data || EXCLUDED.data, updated = EXCLUDED.updated RETURNING data`, [k, patch, Date.now()]); return r.rows[0].data },
    async kvList(prefix) { await ready; const r = await pool.query('SELECT data FROM kv WHERE k LIKE $1', [prefix + '%']); return r.rows.map(x => x.data) },
    async kvDel(prefix) { await ready; const r = await pool.query('DELETE FROM kv WHERE k LIKE $1', [prefix + '%']); return r.rowCount },
  };
  console.log('storage: postgres');
} else {
  const FILE = path.join(__dirname, 'progress.json');
  let mem = {}; try { mem = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch (e) { }
  const persist = () => fs.writeFile(FILE, JSON.stringify(mem), () => { });
  store = {
    async upsert(key, cls, no, data) { mem[key] = data; persist() },
    async all() { return Object.entries(mem).filter(([k]) => !k.startsWith('kv:')).map(([, v]) => v) },
    async delCls(cls) { let n = 0; for (const k of Object.keys(mem)) if (!k.startsWith('kv:') && mem[k].cls === cls) { delete mem[k]; n++ } persist(); return n },
    async kvGet(k) { return mem['kv:' + k] || null },
    async kvMerge(k, patch) { mem['kv:' + k] = Object.assign(mem['kv:' + k] || {}, patch); persist(); return mem['kv:' + k] },
    async kvList(prefix) { return Object.keys(mem).filter(k => k.startsWith('kv:' + prefix)).map(k => mem[k]) },
    async kvDel(prefix) { let n = 0; for (const k of Object.keys(mem)) if (k.startsWith('kv:' + prefix)) { delete mem[k]; n++ } persist(); return n },
  };
  console.log('storage: local file (DATABASE_URL not set — data is lost when the server restarts on Render)');
}

const norm = v => { const m = String(v ?? '').match(/\d+/); return m ? String(parseInt(m[0], 10)) : '' };
const send = (res, code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)) };
function readBody(req, limit = 300000) { return new Promise((ok, bad) => { let n = 0, chunks = []; req.on('data', c => { n += c.length; if (n > limit) { bad(new Error('too large')); req.destroy() } else chunks.push(c) }); req.on('end', () => ok(Buffer.concat(chunks).toString('utf8'))); req.on('error', bad) }) }
const isTeacher = req => req.headers['x-teacher-pw'] === TEACHER_PW;

/* ---------- 2~3차시 미션 웹앱 API ---------- */
const STUDENT_KEYS = /^(codename|final|f_[a-z0-9]{1,8}|p_\d{1,3})$/;
async function mission(req, res, url) {
  const route = url.pathname.slice(7);
  const body = req.method === 'POST' ? JSON.parse((await readBody(req)) || '{}') : {};
  if (route === 'student' && req.method === 'POST') {
    const cls = norm(body.cls), no = norm(body.no), team = norm(body.team);
    if (!cls || !no || !team) return send(res, 400, { error: 'cls, no, team required' });
    const patch = { cls, no, team, updated: Date.now() };
    if (body.act && /^act[1-3]$/.test(body.act) && body.data && typeof body.data === 'object') patch[body.act] = { ...body.data, at: Date.now() };
    await store.kvMerge('ms:' + cls + '_' + no, patch);
    return send(res, 200, { ok: true });
  }
  if (route === 'group') {
    const cls = norm(body.cls || url.searchParams.get('cls')), team = norm(body.team || url.searchParams.get('team'));
    if (!cls || !team) return send(res, 400, { error: 'cls, team required' });
    const k = 'mg:' + cls + '_' + team;
    if (req.method === 'GET') return send(res, 200, (await store.kvGet(k)) || { cls, team });
    const patch = { cls, team, updated: Date.now() };
    for (const [key, v] of Object.entries(body.patch || {})) if (STUDENT_KEYS.test(key)) patch[key] = typeof v === 'string' ? v.slice(0, 1200) : v;
    if (body.status === 'review') { patch.status = 'review'; patch.reviewAt = Date.now() }
    if (body.status === 'final') { patch.status = 'final'; patch.finalAt = Date.now() }
    if (body.member) patch['m_' + norm(body.member)] = Date.now();
    return send(res, 200, await store.kvMerge(k, patch));
  }
  if (!isTeacher(req)) return send(res, 401, { error: 'password' });
  if (route === 'all') return send(res, 200, { students: await store.kvList('ms:'), groups: await store.kvList('mg:') });
  if (route === 'feedback' && req.method === 'POST') {
    const cls = norm(body.cls), team = norm(body.team);
    return send(res, 200, await store.kvMerge('mg:' + cls + '_' + team, { cls, team, t_feedback: String(body.feedback || '').slice(0, 1500), t_fbAt: Date.now(), status: 'feedback' }));
  }
  if (route === 'clear' && req.method === 'POST') { const cls = norm(body.cls); if (!cls) return send(res, 400, { error: 'cls' }); return send(res, 200, { deleted: (await store.kvDel('ms:' + cls + '_')) + (await store.kvDel('mg:' + cls + '_')) }) }
  return send(res, 404, { error: 'route' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/health') return send(res, 200, { ok: true });
    if (url.pathname === '/api/progress') {
      if (req.method === 'POST') {
        const d = JSON.parse(await readBody(req));
        const cls = norm(d.cls), no = norm(d.no);
        if (!cls || !no || !d.name) return send(res, 400, { error: 'cls, no, name required' });
        d.cls = cls; d.no = no; d.name = String(d.name).slice(0, 20); d.updated = Date.now();
        await store.upsert(cls + '_' + no, cls, no, d);
        return send(res, 200, { ok: true });
      }
      if (!isTeacher(req)) return send(res, 401, { error: 'password' });
      if (req.method === 'GET') return send(res, 200, await store.all());
      if (req.method === 'DELETE') { const cls = norm(url.searchParams.get('cls')); if (!cls) return send(res, 400, { error: 'cls' }); return send(res, 200, { deleted: await store.delCls(cls) }) }
      return send(res, 405, { error: 'method' });
    }
    if (url.pathname.startsWith('/api/m/')) return mission(req, res, url);
    // static files
    let p = decodeURIComponent(url.pathname); if (p === '/mission') { res.writeHead(302, { location: '/mission/' }); return res.end() } if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(PUBLIC, p));
    if (!file.startsWith(PUBLIC)) return send(res, 403, 'forbidden', 'text/plain');
    fs.readFile(file, (err, buf) => {
      if (err) return send(res, 404, 'not found', 'text/plain');
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': p.startsWith('/img/') || p.startsWith('/lib/') || p.startsWith('/mission/media/') ? 'public, max-age=86400' : 'no-cache' });
      res.end(buf);
    });
  } catch (e) { console.error(e); send(res, 500, { error: 'server' }) }
});
server.listen(PORT, () => console.log('listening on ' + PORT));
