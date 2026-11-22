// ============================================================================
//  /api/clicks — Vercel serverless функција (Node.js, ESM)
// ----------------------------------------------------------------------------
//  POST /api/clicks   → бележи анонимен клик кон давател (јавно, од сајтот):
//                        source "calculator"  – копчето „Аплицирај" во калкулаторот
//                        source "lender_page" – „Оди на страницата на X" на /krediti/<slug>/
//  GET  /api/clicks   → статистика по институција + последни кликови (само со лозинка)
//
//  НЕ се чуваат лични податоци: нема име, телефон, IP. Само институција, износ,
//  рата, рати, СВТ (кај калкулаторот), од каде е кликот, тип уред (mobile/desktop) и време.
//
//  Env-варијабли (Vercel → Project → Settings → Environment Variables):
//    DATABASE_URL     – Postgres connection string (Neon / Vercel Postgres / Supabase)
//    ADMIN_PASSWORD   – лозинка за статистиката (/#admin)
// ============================================================================

import pg from 'pg';
import { timingSafeEqual } from 'node:crypto';

const { Pool } = pg;

let pool = null;
let tableReady = null;
// true откако е потврдено дека табелата ја има колоната `source` (од 22.11.2026).
// Ако надградбата на стара табела не успее, калкулаторот продолжува да се брои како досега.
let hasSource = false;

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
    tableReady = (async () => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS clicks (
          id               SERIAL PRIMARY KEY,
          created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
          institution_id   INTEGER NOT NULL,
          institution_name TEXT NOT NULL,
          type             TEXT,
          amount           NUMERIC(12,2),
          monthly_payment  NUMERIC(12,2),
          months           INTEGER,
          svt              NUMERIC(6,2),
          total_interest   NUMERIC(12,2),
          total_payment    NUMERIC(12,2),
          device           TEXT,
          source           TEXT NOT NULL DEFAULT 'calculator'
        );
        CREATE INDEX IF NOT EXISTS clicks_created_at_idx ON clicks (created_at DESC);
        CREATE INDEX IF NOT EXISTS clicks_institution_idx ON clicks (institution_id);
      `);
      // Табела создадена пред 22.11.2026 нема `source`, а износот и ратата се задолжителни.
      // Кликот од страница на давател нема износ, па табелата се надградува еднаш.
      // Постоечките редови остануваат недопрени и добиваат source = 'calculator'.
      try {
        const cols = await db.query(
          `SELECT column_name, is_nullable FROM information_schema.columns
            WHERE table_schema = current_schema() AND table_name = 'clicks'
              AND column_name IN ('source', 'amount', 'monthly_payment')`);
        const nullable = Object.fromEntries(cols.rows.map(r => [r.column_name, r.is_nullable]));
        if (!('source' in nullable) || nullable.amount === 'NO' || nullable.monthly_payment === 'NO') {
          await db.query(`ALTER TABLE clicks
                            ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'calculator',
                            ALTER COLUMN amount DROP NOT NULL,
                            ALTER COLUMN monthly_payment DROP NOT NULL`);
        }
        hasSource = true;
      } catch (err) {
        hasSource = false;
        console.error('clicks: надградбата на табелата (source) не успеа — се бројат само кликовите од калкулаторот:', err);
      }
    })().catch(err => { tableReady = null; throw err; });
  }
  return tableReady;
}

function isAuthorized(req) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const header = req.headers['authorization'] || '';
  let given = header.startsWith('Bearer ') ? header.slice(7) : '';
  // Клиентот ја праќа лозинката base64-кодирана (HTTP заглавијата не трпат кирилица).
  if (given.startsWith('b64:')) {
    try { given = Buffer.from(given.slice(4), 'base64').toString('utf8'); } catch { given = ''; }
  }
  if (!expected || !given) return false;
  const a = Buffer.from(given, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const TYPES = new Set(['bank', 'savings', 'finance']);
// Од каде е кликот. Без `source` (постариот клиент) = калкулаторот.
const SOURCES = new Set(['calculator', 'lender_page']);

export function validateClick(b) {
  const source = SOURCES.has(b.source) ? b.source : 'calculator';
  const c = {
    institution_id: num(b.institutionId),
    institution_name: str(b.institutionName, 120),
    type: TYPES.has(b.type) ? b.type : null,
    amount: num(b.amount),
    monthly_payment: num(b.monthlyPayment),
    months: num(b.months),
    svt: num(b.svt),
    total_interest: num(b.totalInterest),
    total_payment: num(b.totalPayment),
    source,
  };
  if (str(b.website)) return { error: 'spam' };                                   // honeypot
  if (!Number.isInteger(c.institution_id) || c.institution_id < 1 || c.institution_id > 100000) return { error: 'Невалидна институција' };
  if (!c.institution_name) return { error: 'Недостасува институција' };
  if (source === 'lender_page') {
    // На страницата на давателот нема внесен износ ни рата — се бележи само институцијата.
    Object.assign(c, { amount: null, monthly_payment: null, months: null, svt: null, total_interest: null, total_payment: null });
    return { value: c };
  }
  if (!c.amount || c.amount < 500 || c.amount > 10_000_000) return { error: 'Невалиден износ' };
  if (!c.monthly_payment || c.monthly_payment < 50 || c.monthly_payment > 2_000_000) return { error: 'Невалидна рата' };
  if (c.months != null && (c.months < 1 || c.months > 360)) c.months = null;
  if (c.svt != null && (c.svt < 0 || c.svt > 100)) c.svt = null;
  return { value: c };
}

const deviceClass = (ua = '') => (/Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const db = getPool();
  if (!db) return res.status(503).json({ ok: false, error: 'DATABASE_URL не е поставен' });

  try {
    await ensureTable(db);

    if (req.method === 'POST') {
      const { value, error } = validateClick(body(req));
      if (error === 'spam') return res.status(201).json({ ok: true, id: 0 });
      if (error) return res.status(400).json({ ok: false, error });
      const params = [value.institution_id, value.institution_name, value.type, value.amount, value.monthly_payment, value.months,
        value.svt, value.total_interest, value.total_payment, deviceClass(req.headers['user-agent'])];
      if (!hasSource) {
        // Табелата не е надградена: калкулаторот се брои како досега, другите кликови не можат да се запишат.
        if (value.source !== 'calculator') return res.status(503).json({ ok: false, error: 'Табелата не е надградена' });
        const r = await db.query(
          `INSERT INTO clicks (institution_id, institution_name, type, amount, monthly_payment, months, svt, total_interest, total_payment, device)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`, params);
        return res.status(201).json({ ok: true, id: r.rows[0].id });
      }
      const r = await db.query(
        `INSERT INTO clicks (institution_id, institution_name, type, amount, monthly_payment, months, svt, total_interest, total_payment, device, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`, [...params, value.source]);
      return res.status(201).json({ ok: true, id: r.rows[0].id });
    }

    if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    if (req.method === 'GET') {
      // Пред надградбата сите редови се од калкулаторот.
      const SRC = hasSource ? 'source' : `'calculator'`;
      const [totals, byInstitution, recent, byDay] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS total,
                         COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS last7,
                         COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int AS today,
                         COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS last30,
                         COUNT(*) FILTER (WHERE ${SRC} = 'calculator')::int AS from_calculator,
                         COUNT(*) FILTER (WHERE ${SRC} = 'lender_page')::int AS from_pages
                    FROM clicks`),
        db.query(`SELECT institution_id, institution_name, MAX(type) AS type,
                         COUNT(*)::int AS clicks,
                         COUNT(*) FILTER (WHERE ${SRC} = 'calculator')::int AS clicks_calculator,
                         COUNT(*) FILTER (WHERE ${SRC} = 'lender_page')::int AS clicks_page,
                         COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS clicks7,
                         COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS clicks30,
                         ROUND(AVG(amount))::int AS avg_amount,
                         ROUND(AVG(monthly_payment))::int AS avg_installment,
                         ROUND(AVG(months))::int AS avg_months,
                         MAX(created_at) AS last_click
                    FROM clicks GROUP BY institution_id, institution_name ORDER BY clicks DESC, last_click DESC`),
        db.query(`SELECT id, created_at, institution_id, institution_name, type, amount, monthly_payment, months, svt, total_interest, device, ${SRC} AS source
                    FROM clicks ORDER BY created_at DESC LIMIT 100`),
        db.query(`SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS clicks
                    FROM clicks WHERE created_at >= now() - interval '30 days'
                   GROUP BY 1 ORDER BY 1`),
      ]);
      const n = (row) => ({ ...row, amount: row.amount == null ? null : Number(row.amount), monthly_payment: row.monthly_payment == null ? null : Number(row.monthly_payment), svt: row.svt == null ? null : Number(row.svt), total_interest: row.total_interest == null ? null : Number(row.total_interest) });
      return res.status(200).json({
        ok: true,
        totals: totals.rows[0],
        byInstitution: byInstitution.rows,
        recent: recent.rows.map(n),
        byDay: byDay.rows,
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('clicks API error:', err);
    return res.status(500).json({ ok: false, error: 'Грешка на серверот' });
  }
}
