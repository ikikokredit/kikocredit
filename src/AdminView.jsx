import React, { useEffect, useMemo, useState } from 'react';

// ============================================================================
//  Контролен панел — kikocredit.com/#admin (или копчето ⚙️)
//  Лозинката се проверува на серверот (env ADMIN_PASSWORD). Овде се чува само
//  во sessionStorage, т.е. до затворање на табот.
// ============================================================================

const TOKEN_KEY = 'kiko_admin_token';
const STATUSES = ['Нова', 'Контактиран', 'Одобрено', 'Одбиено', 'Затворена'];

const formatMKD = (v) => (v == null ? '' : new Intl.NumberFormat('mk-MK').format(v) + ' ден.');
const formatDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleString('mk-MK', { dateStyle: 'short', timeStyle: 'short' });
};

// HTTP заглавијата дозволуваат само ISO-8859-1, па лозинка со кирилица би го
// скршила повикот уште во прелистувачот. Затоа секогаш ја праќаме base64-кодирана.
const encodeToken = (pw) => {
  const bytes = new TextEncoder().encode(pw);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return 'b64:' + btoa(bin);
};

export default function AdminView({ onClose, endpoint }) {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(() => { try { return !!sessionStorage.getItem(TOKEN_KEY); } catch { return false; } });
  const [password, setPassword] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const authHeaders = (t = token) => ({ Authorization: `Bearer ${encodeToken(t)}` });

  const forget = () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch {} setToken(''); setRows([]); };

  // Проверува лозинка кај серверот; враќа true само при успех.
  const verify = async (t) => {
    try {
      const res = await fetch(endpoint, { headers: authHeaders(t) });
      if (res.status === 401) { setError('Погрешна лозинка.'); return false; }
      if (res.status === 503) { setError('Базата не е поставена (DATABASE_URL на Vercel).'); return false; }
      if (!res.ok) { setError(`Грешка ${res.status}`); return false; }
      const data = await res.json();
      setRows(data.applications || []);
      setError('');
      return true;
    } catch (e) {
      setError('Серверот не одговара.');
      return false;
    }
  };

  // Освежување ВНАТРЕ во панелот — не те исфрла при моментален прекин на мрежата.
  const load = async (t = token) => {
    if (!t) return;
    setLoading(true);
    const ok = await verify(t);
    if (!ok) { /* пораката ја постави verify */ }
    setLoading(false);
  };

  // При отворање: ако има зачувана лозинка, прво ја проверуваме кај серверот.
  useEffect(() => {
    let saved = '';
    try { saved = sessionStorage.getItem(TOKEN_KEY) || ''; } catch {}
    if (!saved) { setChecking(false); return; }
    (async () => {
      const ok = await verify(saved);
      if (ok) setToken(saved); else forget();
      setChecking(false);
    })();
    /* eslint-disable-next-line */
  }, []);

  const login = async (e) => {
    e.preventDefault();
    const t = password.trim();
    if (!t || loading) return;
    setLoading(true); setError('');
    const ok = await verify(t);           // панелот се отвора САМО ако серверот потврди
    if (ok) {
      try { sessionStorage.setItem(TOKEN_KEY, t); } catch {}
      setToken(t);
      setPassword('');
    }
    setLoading(false);
  };

  const logout = () => forget();

  const updateStatus = async (id, status) => {
    const prev = rows;
    setRows(rows.map(r => (r.id === id ? { ...r, status } : r)));
    const res = await fetch(endpoint, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (!res.ok) { setRows(prev); setError(`Статусот не е зачуван (${res.status}).`); }
  };

  const remove = async (id) => {
    if (!window.confirm('Да се избрише ова барање трајно?')) return;
    const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) setRows(rows.filter(r => r.id !== id)); else setError(`Бришењето не успеа (${res.status}).`);
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!needle) return true;
      return [r.first_name, r.last_name, r.phone, r.institution_name, r.salary].some(v => String(v || '').toLowerCase().includes(needle));
    });
  }, [rows, q, statusFilter]);

  const exportCsv = () => {
    const cols = ['id', 'created_at', 'first_name', 'last_name', 'phone', 'salary', 'amount', 'monthly_payment', 'months', 'total_interest', 'total_payment', 'institution_name', 'status'];
    const esc = v => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cols.join(';'), ...filtered.map(r => cols.map(c => esc(r[c])).join(';'))];
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kikocredit-aplikacii-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const counts = useMemo(() => {
    const c = { total: rows.length, today: 0, nova: 0 };
    const today = new Date().toDateString();
    for (const r of rows) {
      if (new Date(r.created_at).toDateString() === today) c.today++;
      if (r.status === 'Нова') c.nova++;
    }
    return c;
  }, [rows]);

  return (
    <div style={s.container}>
      <header style={s.header}>
        <div style={s.logoRow}>
          <span style={s.logo}>🦊</span>
          <h1 style={s.brand}>Кико</h1>
          <span style={s.badge}>Контролен панел</span>
        </div>
        <button onClick={onClose} style={s.closeBtn} title="Назад кон сајтот">✕</button>
      </header>

      {checking ? (
        <div style={s.card}><p style={{ margin: 0, textAlign: 'center', color: '#666' }}>Се проверува…</p></div>
      ) : !token ? (
        <form onSubmit={login} style={s.card}>
          <h2 style={s.cardTitle}>Најава</h2>
          <label style={s.label}>Лозинка</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={s.input} autoFocus autoComplete="current-password" />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Се проверува…' : 'Влези 🔐'}
          </button>
        </form>
      ) : (
        <>
          <div style={s.statsRow}>
            <div style={s.stat}><span style={s.statNum}>{counts.total}</span><span style={s.statLabel}>вкупно</span></div>
            <div style={s.stat}><span style={s.statNum}>{counts.today}</span><span style={s.statLabel}>денес</span></div>
            <div style={s.stat}><span style={{ ...s.statNum, color: '#e53935' }}>{counts.nova}</span><span style={s.statLabel}>нови</span></div>
          </div>

          <div style={s.toolbar}>
            <input placeholder="Барај по име, презиме, телефон, друштво…" value={q} onChange={e => setQ(e.target.value)} style={{ ...s.input, flex: 1, minWidth: '200px' }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...s.input, width: 'auto' }}>
              <option value="">Сите статуси</option>
              {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
            <button onClick={() => load()} style={s.secondaryBtn} disabled={loading}>{loading ? '…' : '🔄 Освежи'}</button>
            <button onClick={exportCsv} style={s.secondaryBtn} disabled={!filtered.length}>⬇️ CSV</button>
            <button onClick={logout} style={s.secondaryBtn}>Одјава</button>
          </div>

          {error && <p style={s.errorBanner}>{error}</p>}

          {filtered.length === 0 && !loading && (
            <div style={s.card}><p style={{ margin: 0, color: '#666', textAlign: 'center' }}>Нема барања{q || statusFilter ? ' за овој филтер' : ''}.</p></div>
          )}

          {filtered.map(r => (
            <div key={r.id} style={s.row}>
              <div style={s.rowHead}>
                <div>
                  <strong style={s.name}>{r.first_name} {r.last_name}</strong>
                  <span style={s.meta}>{formatDate(r.created_at)} · #{r.id}</span>
                </div>
                <select value={r.status || 'Нова'} onChange={e => updateStatus(r.id, e.target.value)} style={{ ...s.statusSel, ...(statusColor(r.status)) }}>
                  {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div style={s.grid}>
                <Cell label="Телефон"><a href={`tel:${r.phone}`} style={s.link}>{r.phone}</a></Cell>
                <Cell label="Друштво">{r.institution_name}</Cell>
                <Cell label="Износ">{formatMKD(r.amount)}</Cell>
                <Cell label="Рата">{formatMKD(r.monthly_payment)} × {r.months}</Cell>
                <Cell label="Примања">{r.salary}</Cell>
                <Cell label="Вк. трошок">{formatMKD(r.total_interest)}</Cell>
              </div>
              <div style={s.rowFoot}>
                <button onClick={() => remove(r.id)} style={s.dangerBtn}>🗑 Избриши</button>
              </div>
            </div>
          ))}
        </>
      )}

      <footer style={s.footer}><p>© {new Date().getFullYear()} KikoCredit.com — интерен панел</p></footer>
    </div>
  );
}

const Cell = ({ label, children }) => (
  <div style={s.cell}>
    <span style={s.cellLabel}>{label}</span>
    <span style={s.cellValue}>{children}</span>
  </div>
);

const statusColor = (st) => ({
  'Нова': { background: '#fff3e0', color: '#e65100' },
  'Контактиран': { background: '#e3f2fd', color: '#1565c0' },
  'Одобрено': { background: '#e8f5e9', color: '#2e7d32' },
  'Одбиено': { background: '#ffebee', color: '#c62828' },
  'Затворена': { background: '#eceff1', color: '#455a64' },
}[st] || {});

const s = {
  container: { maxWidth: '760px', margin: '0 auto', padding: '20px', minHeight: '100vh', fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif" },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { fontSize: '36px' },
  brand: { fontSize: '28px', fontWeight: '800', color: 'white', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' },
  badge: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  closeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', color: 'white', cursor: 'pointer' },
  card: { background: 'white', borderRadius: '24px', padding: '28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', marginBottom: '16px' },
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '20px', textAlign: 'center' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', background: 'white' },
  primaryBtn: { width: '100%', padding: '16px', fontSize: '17px', fontWeight: '700', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '16px' },
  secondaryBtn: { padding: '12px 14px', fontSize: '14px', fontWeight: '600', color: '#4a4a8a', background: 'white', border: '2px solid #e0e0e0', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  dangerBtn: { padding: '8px 12px', fontSize: '13px', color: '#c62828', background: 'transparent', border: '1px solid #ffcdd2', borderRadius: '10px', cursor: 'pointer' },
  error: { color: '#c62828', fontSize: '14px', marginTop: '12px', textAlign: 'center' },
  errorBanner: { background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '12px', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: '84px', background: 'rgba(255,255,255,0.92)', borderRadius: '16px', padding: '12px', textAlign: 'center' },
  statNum: { display: 'block', fontSize: '24px', fontWeight: '800', color: '#333' },
  statLabel: { fontSize: '12px', color: '#777' },
  toolbar: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
  row: { background: 'white', borderRadius: '20px', padding: '16px 18px', marginBottom: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
  rowHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' },
  name: { display: 'block', fontSize: '17px', color: '#333' },
  meta: { fontSize: '12px', color: '#888' },
  statusSel: { padding: '6px 10px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' },
  cell: { background: '#f5f5f5', borderRadius: '8px', padding: '8px 10px' },
  cellLabel: { display: 'block', fontSize: '11px', color: '#888', marginBottom: '2px' },
  cellValue: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', wordBreak: 'break-word' },
  link: { color: '#4a4a8a', textDecoration: 'none' },
  rowFoot: { display: 'flex', justifyContent: 'flex-end', marginTop: '10px' },
  footer: { textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' },
};
