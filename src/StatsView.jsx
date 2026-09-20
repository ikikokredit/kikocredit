import React, { useEffect, useMemo, useState } from 'react';
import { typeLabel } from './institutions.js';

// ============================================================================
//  Статистика — kikocredit.com/#admin (или копчето ⚙️)
//  Покажува кои институции добиваат кликови на „Аплицирај", со кои износи и рати.
//  Нема лични податоци. Лозинката се проверува на серверот (env ADMIN_PASSWORD).
// ============================================================================

const TOKEN_KEY = 'kiko_admin_token';

const formatMKD = (v) => (v == null ? '—' : new Intl.NumberFormat('mk-MK').format(v) + ' ден.');
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

export default function StatsView({ onClose, endpoint }) {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(() => { try { return !!sessionStorage.getItem(TOKEN_KEY); } catch { return false; } });
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = (t = token) => ({ Authorization: `Bearer ${encodeToken(t)}` });
  const forget = () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch {} setToken(''); setData(null); };

  // Проверува лозинка кај серверот; враќа true само при успех.
  const verify = async (t) => {
    try {
      const res = await fetch(endpoint, { headers: authHeaders(t) });
      if (res.status === 401) { setError('Погрешна лозинка.'); return false; }
      if (res.status === 503) { setError('Базата не е поставена (DATABASE_URL на Vercel).'); return false; }
      if (!res.ok) { setError(`Грешка ${res.status}`); return false; }
      setData(await res.json());
      setError('');
      return true;
    } catch (e) {
      setError('Серверот не одговара.');
      return false;
    }
  };

  const load = async (t = token) => { if (!t) return; setLoading(true); await verify(t); setLoading(false); };

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
    const ok = await verify(t);
    if (ok) { try { sessionStorage.setItem(TOKEN_KEY, t); } catch {} setToken(t); setPassword(''); }
    setLoading(false);
  };

  const exportCsv = () => {
    if (!data) return;
    const cols = ['institution_id', 'institution_name', 'type', 'clicks', 'clicks7', 'clicks30', 'avg_amount', 'avg_installment', 'avg_months', 'last_click'];
    const esc = v => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cols.join(';'), ...data.byInstitution.map(r => cols.map(c => esc(r[c])).join(';'))];
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kikocredit-klikovi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const maxClicks = useMemo(() => Math.max(1, ...((data?.byInstitution || []).map(r => r.clicks))), [data]);
  const maxDay = useMemo(() => Math.max(1, ...((data?.byDay || []).map(r => r.clicks))), [data]);

  return (
    <div style={s.container}>
      <header style={s.header}>
        <div style={s.logoRow}>
          <span style={s.logo}>🦊</span>
          <h1 style={s.brand}>Кико</h1>
          <span style={s.badge}>Статистика</span>
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
            <div style={s.stat}><span style={s.statNum}>{data?.totals?.total ?? 0}</span><span style={s.statLabel}>вкупно кликови</span></div>
            <div style={s.stat}><span style={s.statNum}>{data?.totals?.last30 ?? 0}</span><span style={s.statLabel}>30 дена</span></div>
            <div style={s.stat}><span style={s.statNum}>{data?.totals?.last7 ?? 0}</span><span style={s.statLabel}>7 дена</span></div>
            <div style={s.stat}><span style={{ ...s.statNum, color: '#4a4a8a' }}>{data?.totals?.today ?? 0}</span><span style={s.statLabel}>денес</span></div>
          </div>

          <div style={s.toolbar}>
            <button onClick={() => load()} style={s.secondaryBtn} disabled={loading}>{loading ? '…' : '🔄 Освежи'}</button>
            <button onClick={exportCsv} style={s.secondaryBtn} disabled={!data?.byInstitution?.length}>⬇️ CSV</button>
            <button onClick={forget} style={s.secondaryBtn}>Одјава</button>
          </div>

          {error && <p style={s.errorBanner}>{error}</p>}

          {data?.byDay?.length > 0 && (
            <div style={s.card}>
              <h3 style={s.h3}>Кликови по ден (30 дена)</h3>
              <div style={s.bars}>
                {data.byDay.map(d => (
                  <div key={d.day} style={s.barCol} title={`${d.day}: ${d.clicks}`}>
                    <div style={{ ...s.bar, height: `${Math.max(4, (d.clicks / maxDay) * 80)}px` }} />
                    <span style={s.barLabel}>{String(d.day).slice(8, 10)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={s.card}>
            <h3 style={s.h3}>По институција</h3>
            {(!data?.byInstitution || data.byInstitution.length === 0) && (
              <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>Сè уште нема кликови на „Аплицирај".</p>
            )}
            {(data?.byInstitution || []).map(r => (
              <div key={r.institution_id} style={s.instRow}>
                <div style={s.instHead}>
                  <div>
                    <strong style={s.instName}>{r.institution_name}</strong>
                    <span style={s.instType}>{typeLabel(r.type)}</span>
                  </div>
                  <span style={s.instClicks}>{r.clicks} <small style={{ fontWeight: 400, color: '#888' }}>({r.clicks7} / 7 д.)</small></span>
                </div>
                <div style={s.track}><div style={{ ...s.fill, width: `${(r.clicks / maxClicks) * 100}%` }} /></div>
                <div style={s.instMeta}>
                  <span>Просечен износ: <b>{formatMKD(r.avg_amount)}</b></span>
                  <span>Рата: <b>{formatMKD(r.avg_installment)}</b></span>
                  <span>Рати: <b>{r.avg_months ?? '—'}</b></span>
                  <span>Последен: <b>{formatDate(r.last_click)}</b></span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <h3 style={s.h3}>Последни кликови</h3>
            {(!data?.recent || data.recent.length === 0) && (
              <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>Нема.</p>
            )}
            {(data?.recent || []).map(r => (
              <div key={r.id} style={s.recentRow}>
                <span style={s.recentTime}>{formatDate(r.created_at)}</span>
                <span style={s.recentName}>{r.institution_name}</span>
                <span style={s.recentVals}>{formatMKD(r.amount)} · {formatMKD(r.monthly_payment)} × {r.months ?? '—'} · {r.device === 'mobile' ? '📱' : '💻'}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <footer style={s.footer}><p>© {new Date().getFullYear()} KikoCredit.com — интерна статистика, без лични податоци</p></footer>
    </div>
  );
}

const s = {
  container: { maxWidth: '760px', margin: '0 auto', padding: '20px', minHeight: '100vh', fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif" },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { fontSize: '36px' },
  brand: { fontSize: '28px', fontWeight: '800', color: 'white', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' },
  badge: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  closeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', color: 'white', cursor: 'pointer' },
  card: { background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', marginBottom: '16px' },
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '20px', textAlign: 'center' },
  h3: { margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#333' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', background: 'white' },
  primaryBtn: { width: '100%', padding: '16px', fontSize: '17px', fontWeight: '700', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '16px' },
  secondaryBtn: { padding: '12px 14px', fontSize: '14px', fontWeight: '600', color: '#4a4a8a', background: 'white', border: '2px solid #e0e0e0', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { color: '#c62828', fontSize: '14px', marginTop: '12px', textAlign: 'center' },
  errorBanner: { background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '12px', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: '76px', background: 'rgba(255,255,255,0.92)', borderRadius: '16px', padding: '12px', textAlign: 'center' },
  statNum: { display: 'block', fontSize: '24px', fontWeight: '800', color: '#333' },
  statLabel: { fontSize: '11px', color: '#777' },
  toolbar: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
  bars: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px', overflowX: 'auto' },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '18px', flex: 1 },
  bar: { width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px 4px 0 0' },
  barLabel: { fontSize: '10px', color: '#999' },
  instRow: { padding: '12px 0', borderTop: '1px solid #f0f0f0' },
  instHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  instName: { display: 'block', fontSize: '15px', color: '#333' },
  instType: { fontSize: '11px', color: '#9c27b0', background: '#f3e5f5', padding: '2px 8px', borderRadius: '10px' },
  instClicks: { fontSize: '18px', fontWeight: '800', color: '#333', whiteSpace: 'nowrap' },
  track: { height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' },
  fill: { height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  instMeta: { display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: '12px', color: '#666' },
  recentRow: { display: 'grid', gridTemplateColumns: '110px 1fr', gap: '2px 10px', padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: '13px' },
  recentTime: { color: '#888', fontSize: '12px', gridRow: 'span 2' },
  recentName: { fontWeight: '600', color: '#333' },
  recentVals: { color: '#666', fontSize: '12px' },
  footer: { textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' },
};
