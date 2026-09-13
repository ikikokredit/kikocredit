// ============================================================================
//  /api/applications — Vercel serverless функција (Node.js, ESM)
// ----------------------------------------------------------------------------
//  POST   /api/applications            → зачувува ново барање (јавно, од сајтот)
//  GET    /api/applications            → листа барања        (само со лозинка)
//  PATCH  /api/applications {id,status}→ менува статус       (само со лозинка)
//  DELETE /api/applications?id=…       → брише барање        (само со лозинка)
//
//  Env-варијабли (Vercel → Project → Settings → Environment Variables):
//    DATABASE_URL     – Postgres connection string (Neon / Vercel Postgres /
//                       Supabase). Се прифаќа и POSTGRES_URL.
//    ADMIN_PASSWORD   – лозинка за контролниот панел (/#admin)
//    ALLOW_ORIGIN     – (опционално) дозволен origin за CORS; default: само истиот домен
// ============================================================================

import pg from 'pg';
import { timingSafeEqual } from 'node:crypto';

const { Pool } = pg;

let pool = null;
let tableReady = null;

function getPool() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!url) return null;
  if (!pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    pool = new Pool({
      connectionString: url,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function ensureTable(db) {
  if (!tableReady) {
    tableReady = db.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id               SERIAL PRIMARY KEY,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        first_name       TEXT NOT NULL,
        last_name        TEXT NOT NULL,
        phone            TEXT NOT NULL,
        salary           TEXT,
        amount           NUMERIC(12,2) NOT NULL,
        monthly_payment  NUMERIC(12,2) NOT NULL,
        months           INTEGER,
        total_interest   NUMERIC(12,2),
        total_payment    NUMERIC(12,2),
        institution_id   INTEGER,
        institution_name TEXT NOT NULL,
        status           TEXT NOT NULL DEFAULT 'Нова',
        user_agent       TEXT,
        ip               TEXT
      );
      CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications (created_at DESC);
    `).catch(err => { tableReady = null; throw err; });
  }
  return tableReady;
}

function isAuthorized(req) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const header = req.headers['authorization'] || '';
  let given = header.startsWith('Bearer ') ? header.slice(7) : '';
  // Клиентот ја праќа лозинката base64-кодирана (HTTP заглавијата не трпат
  // кирилица и други не-ISO-8859-1 знаци). Стариот, нешифриран облик исто се прифаќа.
  if (given.startsWith('b64:')) {
    try { given = Buffer.from(given.slice(4), 'base64').toString('utf8'); } catch { given = ''; }
  }
  if (!expected || !given) return false;
  const a = Buffer.from(given, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

function cors(req, res) {
  const allow = process.env.ALLOW_ORIGIN;
  if (allow) {
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  res.setHeader('Cache-Control', 'no-store');
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

export function validateApplication(b) {
  const a = {
    first_name: str(b.firstName, 80),
    last_name: str(b.lastName, 80),
    phone: str(b.phone, 40),
    salary: str(b.salary, 40),
    amount: num(b.amount),
    monthly_payment: num(b.monthlyPayment),
    months: num(b.months),
    total_interest: num(b.totalInterest),
    total_payment: num(b.totalPayment),
    institution_id: num(b.institutionId),
    institution_name: str(b.institutionName, 120),
  };
  if (str(b.website)) return { error: 'spam' };                         // honeypot
  if (!a.first_name || !a.last_name) return { error: 'Недостасува име/презиме' };
  if (!/^\+?[\d\s\-()]{6,20}$/.test(a.phone)) return { error: 'Невалиден телефон' };
  if (!a.amount || a.amount < 1000 || a.amount > 5_000_000) return { error: 'Невалиден износ' };
  if (!a.monthly_payment || a.monthly_payment < 100 || a.monthly_payment > 1_000_000) return { error: 'Невалидна рата' };
  if (!a.institution_name) return { error: 'Недостасува друштво' };
  if (a.months != null && (a.months < 1 || a.months > 360)) a.months = null;
  return { value: a };
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const db = getPool();
  if (!db) return res.status(503).json({ ok: false, error: 'DATABASE_URL не е поставен' });

  try {
    await ensureTable(db);

    if (req.method === 'POST') {
      const { value, error } = validateApplication(body(req));
      if (error === 'spam') return res.status(201).json({ ok: true, id: 0 });   // тивко игнорирај ботови
      if (error) return res.status(400).json({ ok: false, error });
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null;
      const ua = str(req.headers['user-agent'], 300) || null;
      const r = await db.query(
        `INSERT INTO applications
           (first_name,last_name,phone,salary,amount,monthly_payment,months,total_interest,total_payment,institution_id,institution_name,user_agent,ip)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, created_at`,
        [value.first_name, value.last_name, value.phone, value.salary, value.amount, value.monthly_payment, value.months,
         value.total_interest, value.total_payment, value.institution_id, value.institution_name, ua, ip]
      );
      return res.status(201).json({ ok: true, id: r.rows[0].id, created_at: r.rows[0].created_at });
    }

    // Сè подолу бара лозинка
    if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    if (req.method === 'GET') {
      const limit = Math.min(Math.max(num(req.query?.limit) || 500, 1), 2000);
      const r = await db.query(
        `SELECT id, created_at, first_name, last_name, phone, salary, amount, monthly_payment, months,
                total_interest, total_payment, institution_id, institution_name, status
           FROM applications ORDER BY created_at DESC LIMIT $1`, [limit]);
      const applications = r.rows.map(row => ({
        ...row,
        amount: Number(row.amount), monthly_payment: Number(row.monthly_payment),
        total_interest: row.total_interest == null ? null : Number(row.total_interest),
        total_payment: row.total_payment == null ? null : Number(row.total_payment),
      }));
      return res.status(200).json({ ok: true, applications });
    }

    if (req.method === 'PATCH') {
      const b = body(req);
      const id = num(b.id); const status = str(b.status, 40);
      if (!id || !status) return res.status(400).json({ ok: false, error: 'id и status се задолжителни' });
      const r = await db.query('UPDATE applications SET status=$1 WHERE id=$2 RETURNING id', [status, id]);
      if (!r.rowCount) return res.status(404).json({ ok: false, error: 'Не постои' });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const id = num(req.query?.id);
      if (!id) return res.status(400).json({ ok: false, error: 'id е задолжителен' });
      const r = await db.query('DELETE FROM applications WHERE id=$1', [id]);
      if (!r.rowCount) return res.status(404).json({ ok: false, error: 'Не постои' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('applications API error:', err);
    return res.status(500).json({ ok: false, error: 'Грешка на серверот' });
  }
}
