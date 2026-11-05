// 1987 가려진 기록 — 정적 게임 + 학생 진행 기록 API
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const TEACHER_PW = process.env.TEACHER_PASSWORD || '7891';
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

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

/* ---------- AI 피드백 (Anthropic Messages API) ---------- */
const AI_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const AI_SYSTEM = `당신은 한국 중학교 영어 교사의 보조 교사입니다. 학생 조가 영어로 쓴 '비밀 제보서'(외신 기자에게 보내는 짧은 제보 글)에 대한 피드백 초안을 씁니다. 교사가 읽고 고친 뒤 학생에게 보냅니다.

[수업 배경 · 이 사실들만 기준으로 판단하세요]
- 기사(1987년 1월 16일 보도): 1월 14일, 서울의 경찰 사무실(police office)에서 21세 대학생이 숨짐. 경찰은 이른 아침 집에서 학생을 데려가 친구에 대해 조사함. 경찰은 책상을 '탁' 치자 놀라 쓰러진 쇼크사(shock)라고 주장했고, 며칠 뒤 사건을 종결(closed the case)함. 신문은 'shock'이라는 말만 씀.
- 학생들이 찾은 증거: 부검 소견에 목·가슴의 멍(bruises on his neck and chest), 폐의 출혈 반점, "질식한 것으로 보임"(asphyxia). 처음 온 의사는 바닥이 물로 흥건하고, 배가 불러 있고, 폐에서 물소리를 들음(water in the lungs). 목격자는 학생이 숨쉬기 힘들어하는 것을 봄. 신문사에 '쇼크사라고만 쓸 것'이라는 보도 지시 쪽지가 있었음.
- 진짜 사망 원인: asphyxia(질식).
- 1월 16일은 기사가 나온 날이고, 학생이 숨진 날은 1월 14일입니다.

[제보서 다섯 칸]
① WHAT: 언제, 어디서, 누가, 어떤 일을 당했나 (날짜는 학생이 기사에서 직접 찾아 씀)
② POLICE CLAIM: 경찰의 주장(said/claimed/according to)과 그 뒤에 한 일
③ TRUTH: But 또는 However로 시작, die of + 진짜 원인
④ EVIDENCE: 진실을 보여 주는 증거 2개 이상(몸의 흔적, 의사의 관찰 등)
⑤ WHY & REQUEST: because + 알려야 하는 이유, Please + 부탁

[학생 수준] 중학생, 영어 초급(A2). 문법 용어는 최소로, 쉬운 말로.

[출력 형식 · 반드시 이대로, 다른 말 없이]
1. 구성
+ (잘한 점)
- (고칠 점)
2. 언어 사용
+ (잘한 점)
- (고칠 점)
(마지막 줄: 다음에 할 일 한 문장. 고칠 점이 없으면 "이제 완성본으로 옮겨 쓰고 전송하세요.", 있으면 "− 표시된 부분을 고친 뒤 다시 검토 요청하세요.")

[작성 규칙]
- 한국어 해요체, 따뜻하지만 구체적으로. 각 줄은 한두 문장.
- 각 줄 앞에 칸 번호(①~⑤)를 붙일 수 있으면 붙이세요.
- 고칠 점에는 학생이 쓴 표현을 짧게 인용하고, 고친 영어 예시를 함께 주세요. 예) - ③ "he die by asphixia" → However, he died of asphyxia. 처럼 고쳐요.
- '구성'은 내용·순서·빠진 정보, '언어 사용'은 시제·어법·철자·대소문자·마침표·단어 선택을 다룹니다.
- 각 부분 + 는 1~3줄, - 는 0~4줄. 정말 잘했으면 - 를 쓰지 않아도 됩니다.
- 제보서 전체를 대신 다시 써 주지 마세요. 위 배경에 없는 사실을 지어내지 마세요.
- 마크다운(**, #, 표)을 쓰지 마세요.`;
async function aiFeedback(g) {
  const L = [['CODE NAME', g.codename], ['① WHAT', g.f_s1], ['② POLICE CLAIM', g.f_s2], ['③ TRUTH', g.f_s3], ['④ EVIDENCE', g.f_s4], ['⑤ WHY & REQUEST', g.f_s5]].map(([h, v]) => `${h}: ${String(v || '').trim() || '(비어 있음)'}`).join('\n');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: 1200, system: AI_SYSTEM, messages: [{ role: 'user', content: `다음은 한 조의 비밀 제보서입니다. 형식에 맞춰 피드백 초안을 써 주세요.\n\n${L}` }] }),
    signal: AbortSignal.timeout(45000)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status));
  const t = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
  if (!t) throw new Error('empty');
  return t.replace(/\*\*/g, '').slice(0, 1500);
}

/* ---------- 2~3차시 미션 웹앱 API ---------- */
const STUDENT_KEYS = /^(codename|final|f_[a-z0-9]{1,8}|p_\d{1,3})$/;
async function mission(req, res, url) {
  const route = url.pathname.slice(7);
  const body = req.method === 'POST' ? JSON.parse((await readBody(req)) || '{}') : {};
  if (route === 'student' && req.method === 'POST') {
    const cls = norm(body.cls), no = norm(body.no), team = norm(body.team);
    if (!cls || !no || !team) return send(res, 400, { error: 'cls, no, team required' });
    const patch = { cls, no, team, updated: Date.now() };
    if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim().slice(0, 20);
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
  if (route === 'demoreset' && req.method === 'POST') return send(res, 200, { deleted: (await store.kvDel('ms:0_')) + (await store.kvDel('mg:0_')) }); // 교사 시연(0반) 기록만 비움
  if (!isTeacher(req)) return send(res, 401, { error: 'password' });
  if (route === 'all') return send(res, 200, { students: await store.kvList('ms:'), groups: await store.kvList('mg:') });
  if (route === 'feedback' && req.method === 'POST') {
    const cls = norm(body.cls), team = norm(body.team);
    return send(res, 200, await store.kvMerge('mg:' + cls + '_' + team, { cls, team, t_feedback: String(body.feedback || '').slice(0, 1500), t_fbAt: Date.now(), status: 'feedback' }));
  }
  if (route === 'aifeedback' && req.method === 'POST') { // AI 피드백 초안 (교사 전용 · Render 환경변수 ANTHROPIC_API_KEY 필요)
    if (!process.env.ANTHROPIC_API_KEY) return send(res, 501, { error: 'nokey' });
    const g = await store.kvGet('mg:' + norm(body.cls) + '_' + norm(body.team));
    if (!g) return send(res, 404, { error: 'nogroup' });
    try { return send(res, 200, { feedback: await aiFeedback(g) }) } catch (e) { console.error('ai feedback', e.message); return send(res, 502, { error: 'ai', detail: String(e.message || e).slice(0, 200) }) }
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
    let file = path.normalize(path.join(PUBLIC, p));
    if (p === '/video/prologue.mp4' && !fs.existsSync(file)) { // 업로드된 영상 이름이 달라도 재생되게
      try { const v = fs.readdirSync(path.join(PUBLIC, 'video')).find(n => n.toLowerCase().endsWith('.mp4')); if (v) file = path.join(PUBLIC, 'video', v); } catch (e) {}
    }
    if (!file.startsWith(PUBLIC)) return send(res, 403, 'forbidden', 'text/plain');
    if (path.extname(file) === '.mp4') { // 영상: Range 요청 지원 (iPad/Safari 재생용)
      return fs.stat(file, (err, st) => {
        if (err) return send(res, 404, 'not found', 'text/plain');
        const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || ''); const head = { 'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=86400' };
        if (!m) { res.writeHead(200, { ...head, 'content-length': st.size }); return fs.createReadStream(file).pipe(res) }
        let a = m[1] ? +m[1] : st.size - +m[2], b = m[1] && m[2] ? +m[2] : st.size - 1; if (!m[1]) b = st.size - 1;
        if (isNaN(a) || a < 0 || a >= st.size || b < a) { res.writeHead(416, { 'content-range': 'bytes */' + st.size }); return res.end() }
        b = Math.min(b, st.size - 1); res.writeHead(206, { ...head, 'content-range': `bytes ${a}-${b}/${st.size}`, 'content-length': b - a + 1 }); fs.createReadStream(file, { start: a, end: b }).pipe(res);
      });
    }
    fs.readFile(file, (err, buf) => {
      if (err) return send(res, 404, 'not found', 'text/plain');
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': p.startsWith('/img/') || p.startsWith('/lib/') || p.startsWith('/mission/media/') ? 'public, max-age=86400' : 'no-cache' });
      res.end(buf);
    });
  } catch (e) { console.error(e); send(res, 500, { error: 'server' }) }
});
server.listen(PORT, () => console.log('listening on ' + PORT));
