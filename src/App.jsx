import React, { useState, useEffect, useMemo } from 'react';
import { activeInstitutions, DATA_UPDATED_LABEL, typeLabel } from './institutions.js';
import { calculateLoan, formatMKD, formatPct } from './loan.js';
import { CONTACT } from './contact.js';
import StatsView from './StatsView.jsx';
import { FEATURED_GUIDES } from './featuredGuides.js';
import { BRAND, mascotImg, wordmarkSvg, ICONS } from './brand.js';
import { BANNER, BANNER_CSS, bannerInner } from './banner.js';

// ============================================================================
//  KikoCredit — споредба на потрошувачки кредити (банки + финансиски друштва)
//  Тек: Износ + рата → Понуди (рати, камата, вкупен трошок) → „Аплицирај" ги носи
//  посетителите на страницата на институцијата. Не се собираат лични податоци;
//  се брои само анонимен клик (институција, износ, рата) за статистика.
// ============================================================================

const CLICKS_ENDPOINT = '/api/clicks';

// calculateLoan, formatMKD и formatPct се во ./loan.js (истите ги користат и статичните страници)

// Анонимно броење на кликовите „Аплицирај" (без лични податоци)
const trackClick = (offer, amount, monthlyPayment) => {
  try {
    const payload = JSON.stringify({
      institutionId: offer.id, institutionName: offer.name, type: offer.type,
      amount, monthlyPayment, months: offer.months, svt: offer.svt,
      totalInterest: offer.totalInterest, totalPayment: offer.totalPayment,
      website: '' // honeypot
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(CLICKS_ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(CLICKS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
  } catch (e) { /* статистиката никогаш не смее да го блокира корисникот */ }
  // Истиот анонимен клик и во Google Analytics (настан apply_click; без лични податоци)
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'apply_click', {
        institution: offer.name, institution_type: offer.type,
        loan_amount: amount, months: offer.months, source_page: 'calculator',
        transport_type: 'beacon',
      });
    }
  } catch (e) { /* исто — никогаш не блокира */ }
};

// Подредување без localeCompare: прелистувачот и Node при build мора да дадат ист редослед
// (инаку пред-генерираниот HTML не се совпаѓа со React).
const nameKey = (i) => i.name.toLowerCase();
const byName = (a, b) => (nameKey(a) > nameKey(b)) - (nameKey(a) < nameKey(b));
const LENDER_GROUPS = [
  { key: 'bank', label: '🏦 Банки и штедилници', href: '/krediti/banki/',
    items: activeInstitutions.filter(i => i.type === 'bank' || i.type === 'savings').sort(byName) },
  { key: 'finance', label: '💳 Финансиски друштва', href: '/krediti/finansiski-drustva/',
    items: activeInstitutions.filter(i => i.type === 'finance').sort(byName) },
];

const FILTERS = [
  { key: 'all', label: 'Сите' },
  { key: 'bank', label: '🏦 Банки' },
  { key: 'finance', label: '💳 Друштва' },
];

// Знаци на доверба на почетната. Секоја реченица мора да е точна — ако се смени моделот
// (на пр. провизија од давателите), прво смени го текстот тука.
const TRUST = [
  { icon: 'shield', title: 'Независна споредба', text: 'Не сме банка ни финансиско друштво и не даваме кредити.' },
  { icon: 'scale', title: 'Подредено по вкупен трошок', text: 'Давателите не плаќаат за местото во листата.' },
  { icon: 'lock', title: 'Без лични податоци', text: 'Не бараме име, телефон ни матичен број.' },
  { icon: 'check', title: 'Проверени услови', text: `Од официјалните страници на давателите. Ажурирано: ${DATA_UPDATED_LABEL}.` },
];

const HOW = [
  { title: 'Внеси износ и рата', text: 'Колку ти треба и колку можеш да плаќаш месечно.' },
  { title: 'Спореди ги понудите', text: 'Број на рати, СВТ и вкупно за враќање кај секој давател.' },
  { title: 'Аплицирај кај давателот', text: 'Те водиме на неговата страница; кредитот го склучуваш директно со него.' },
];

const CustomerView = ({ onAdminClick }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('all');

  const handleCalculate = () => {
    const amt = parseFloat(amount);
    const payment = parseFloat(monthlyPayment);

    if (!amt || !payment || amt <= 0 || payment <= 0) {
      alert('Ве молиме внесете валидни вредности');
      return;
    }

    const calculatedResults = activeInstitutions
      .filter(inst => !inst.paused) // привремено паузиран давател (на пр. под администрација на НБРМ)
      .map(inst => {
        if (amt > inst.maxAmount) return null;
        if (inst.minAmount != null && amt < inst.minAmount) return null;

        const loanDetails = calculateLoan(amt, payment, inst.svt);
        if (!loanDetails) return null;
        if (loanDetails.months > inst.maxMonths) return null;

        return { ...inst, ...loanDetails };
      })
      .filter(r => r !== null)
      .sort((a, b) => a.totalInterest - b.totalInterest);

    if (calculatedResults.length === 0) {
      alert('Месечната рата е премала за бараниот износ. Ве молиме зголемете ја ратата.');
      return;
    }

    setResults(calculatedResults);
    setFilter('all');
    setStep(2);
  };

  const visibleResults = useMemo(() => {
    if (filter === 'all') return results;
    if (filter === 'bank') return results.filter(r => r.type === 'bank' || r.type === 'savings');
    return results.filter(r => r.type === 'finance');
  }, [results, filter]);

  const counts = useMemo(() => ({
    all: results.length,
    bank: results.filter(r => r.type === 'bank' || r.type === 'savings').length,
    finance: results.filter(r => r.type === 'finance').length,
  }), [results]);

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setMonthlyPayment('');
    setResults([]);
    setFilter('all');
  };

  const amt = parseFloat(amount);
  const payment = parseFloat(monthlyPayment);

  // „Најповолно" се доделува само на понуда со ПОТВРДЕНА СВТ — понуда чија СВТ
  // не е објавена (прикажана е номиналната стапка) не смее да се прогласи за најевтина.
  const bestIndex = filter === 'all' ? visibleResults.findIndex(o => o.svtVerified) : -1;

  return (
    <div style={styles.page} className="kb-pad">
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <a href="/" style={styles.logoLink} aria-label="KikoCredit — почетна">
            <span style={styles.logoMark} dangerouslySetInnerHTML={{ __html: mascotImg(46) }} />
            <span>
              <span style={styles.brandName} dangerouslySetInnerHTML={{ __html: wordmarkSvg(21) }} />
              <span style={styles.brandDescriptor}>{BRAND.descriptor}</span>
            </span>
          </a>
          <button onClick={onAdminClick} style={styles.adminButton} aria-label="Статистика"
            dangerouslySetInnerHTML={{ __html: ICONS.stats(18, BRAND.muted) }} />
        </div>
      </header>

      <div style={styles.container}>
      {step === 1 && (
        <div style={styles.card}>
          {/* Единствениот h1 на почетната: прашањето + еден ред што кажува што е сајтот (за посетители и за пребарувачи). */}
          <h1 style={styles.cardTitle}>
            Колку ти треба?{' '}
            <span style={styles.cardLead}>Спореди кредити од {activeInstitutions.length} банки и финансиски друштва</span>
          </h1>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Износ на кредит (ден.)</label>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              placeholder="пр. 50000"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Месечна рата која можеш да ја плаќаш (ден.)</label>
            <input
              type="number"
              inputMode="numeric"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              placeholder="пр. 5000"
              style={styles.input}
            />
          </div>

          <button onClick={handleCalculate} style={styles.primaryButton}>
            Спореди ги понудите
          </button>

          <p style={styles.legalNote}>
            Пресметката е информативна; кредитот го склучуваш директно со институцијата.
          </p>
        </div>
      )}

      {step === 1 && (
        <section style={styles.panel} aria-label="Зошто Кико">
          {TRUST.map(t => (
            <div key={t.title} style={styles.trustItem}>
              <span style={styles.trustIcon} dangerouslySetInnerHTML={{ __html: ICONS[t.icon](22) }} />
              <div>
                <strong style={styles.trustTitle}>{t.title}</strong>
                <span style={styles.trustText}>{t.text}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {step === 1 && (
        <section style={styles.panel} aria-label="Како работи">
          <h2 style={styles.panelTitle}>Како работи</h2>
          {HOW.map((h, n) => (
            <div key={h.title} style={styles.trustItem}>
              <span style={styles.stepNum} aria-hidden="true">{n + 1}</span>
              <div>
                <strong style={styles.trustTitle}>{h.title}</strong>
                <span style={styles.trustText}>{h.text}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {step === 1 && (
        <nav style={styles.panel} aria-label="Водичи">
          <h2 style={styles.panelTitle}>Пред да земеш кредит</h2>
          {FEATURED_GUIDES.map(g => (
            <a key={g.slug} href={`/vodici/${g.slug}/`} style={styles.guideLink}>
              <span style={styles.guideIcon} aria-hidden="true">{g.icon}</span>
              <span style={styles.guideTitle}>{g.title}</span>
              <span style={styles.guideArrow} aria-hidden="true">→</span>
            </a>
          ))}
          <a href="/vodici/" style={styles.lendersAll}>Сите водичи →</a>
        </nav>
      )}

      {step === 1 && (
        <nav style={styles.panel} aria-label="Даватели">
          <h2 style={styles.panelTitle}>Кого споредуваме</h2>
          {LENDER_GROUPS.map(g => (
            <div key={g.key} style={styles.lendersGroup}>
              <a href={g.href} style={styles.lendersGroupLink}>{g.label} ({g.items.length}) →</a>
              <div style={styles.lendersRow}>
                {g.items.map(i => (
                  <a key={i.id} href={`/krediti/${i.slug}/`} style={styles.lenderChip}>{i.name}</a>
                ))}
              </div>
            </div>
          ))}
          <a href="/krediti/" style={styles.lendersAll}>Сите даватели и услови →</a>
        </nav>
      )}

      {step === 2 && (
        <div style={styles.resultsContainer}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryText}>
              За <strong>{formatMKD(amt)}</strong> со рата од <strong>{formatMKD(payment)}</strong>
            </p>
          </div>

          <div style={styles.disclaimerCard}>
            <span style={styles.disclaimerIcon} dangerouslySetInnerHTML={{ __html: ICONS.scale(20) }} />
            <p style={styles.disclaimerText}>
              Понудите се подредени по <strong>најнизок вкупен трошок</strong>; давателите не плаќаат за местото во листата.
              Со клик на „Аплицирај" одиш на страницата на институцијата; конечните услови се договараат директно со неа.
              <br/><small style={{opacity: 0.8}}>Ажурирано: {DATA_UPDATED_LABEL}</small>
            </p>
          </div>

          <div style={styles.filterRow}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{ ...styles.filterChip, ...(filter === f.key ? styles.filterChipActive : {}) }}
              >
                {f.label} <span style={styles.filterCount}>{counts[f.key]}</span>
              </button>
            ))}
          </div>

          <h2 style={styles.sectionTitle}>Достапни понуди</h2>

          {visibleResults.length === 0 && (
            <div style={styles.summaryCard}>
              <p style={styles.summaryText}>Нема понуди во оваа категорија за внесените износ и рата.</p>
            </div>
          )}

          {visibleResults.map((offer, index) => (
            <div
              key={offer.id}
              style={{
                ...styles.offerCard,
                ...(index === bestIndex ? styles.bestOffer : {})
              }}
            >
              {index === bestIndex && <span style={styles.bestBadge}>Најповолно</span>}

              <div style={styles.offerHeader}>
                <span style={styles.institutionLogo}>{offer.logo}</span>
                <div>
                  <span style={styles.institutionName}>{offer.name}</span>
                  <span style={styles.financeBadge}>{typeLabel(offer.type)}</span>
                </div>
              </div>

              <div style={styles.offerDetails}>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Бр. рати</span>
                  <span style={styles.detailValue}>{offer.months}</span>
                </div>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Камата (СВТ){!offer.svtVerified && '*'}</span>
                  <span style={styles.detailValue}>{formatPct(offer.svt)}</span>
                </div>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Рата</span>
                  <span style={styles.detailValue}>{formatMKD(payment)}</span>
                </div>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Вк. камата</span>
                  <span style={styles.detailValueHighlight}>{formatMKD(offer.totalInterest)}</span>
                </div>
              </div>

              <div style={styles.totalRow}>
                <span>Вкупно за враќање:</span>
                <span style={styles.totalAmount}>{formatMKD(offer.totalPayment)}</span>
              </div>

              <a
                href={offer.applyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={() => trackClick(offer, amt, payment)}
                style={styles.selectButton}
              >
                Аплицирај кај {offer.name}{'\u00A0'}→
              </a>
              {!offer.svtVerified && (
                <p style={styles.svtNote}>* СВТ не е објавена на сајтот на институцијата — пресметката е приближна.</p>
              )}
            </div>
          ))}

          <button onClick={resetForm} style={styles.backButton}>
            ← Нова пресметка
          </button>
        </div>
      )}

      <footer style={styles.footer}>
        <p suppressHydrationWarning>© {new Date().getFullYear()} KikoCredit.com — независна споредба на кредити</p>
        <p style={styles.footerSmall}>
          KikoCredit не е давател на кредит и не наплаќа ништо од корисниците. Податоците се преземени од
          официјалните страници на институциите; за точните услови важи понудата на самата институција.
        </p>
        <p style={styles.footerContact}>
          Контакт: {CONTACT.name} · <a href={`mailto:${CONTACT.email}`} style={styles.footerLink}>{CONTACT.email}</a>
        </p>
      </footer>
      </div>

      {/* Летечки банер на дното на екранот (текст, изглед и правила: src/banner.js) */}
      <style dangerouslySetInnerHTML={{ __html: BANNER_CSS }} />
      <aside className="kb" aria-label={BANNER.badge} dangerouslySetInnerHTML={{ __html: bannerInner() }} />
    </div>
  );
};

export default function KikoApp() {
  // ⚙️ или директен линк kikocredit.com/#admin ја отвора статистиката
  // Почнува секогаш со клиентскиот дел (како пред-генерираниот HTML), па веднаш го
  // проверува #admin — така прелистувачот и серверот го цртаат истото.
  const [view, setView] = useState('customer');

  useEffect(() => {
    const onHash = () => setView(window.location.hash === '#admin' ? 'admin' : 'customer');
    onHash();
    window.addEventListener('hashchange', onHash);
    // Стари верзии чуваа лични податоци во прелистувачот — исчисти ги.
    try { localStorage.removeItem('kiko_applications'); } catch (e) { /* ignore */ }
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openAdmin = () => { window.location.hash = 'admin'; };
  const closeAdmin = () => { history.replaceState(null, '', window.location.pathname); setView('customer'); };

  return (
    <div style={styles.app}>
      {view === 'admin' ? (
        <StatsView onClose={closeAdmin} endpoint={CLICKS_ENDPOINT} />
      ) : (
        <CustomerView onAdminClick={openAdmin} />
      )}
    </div>
  );
}

const FONT = "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
const panelBase = {
  background: BRAND.card,
  border: `1px solid ${BRAND.border}`,
  borderRadius: '16px',
  boxShadow: '0 1px 2px rgba(27,26,61,0.04)',
};

const styles = {
  app: {
    fontFamily: FONT,
    minHeight: '100vh',
    background: BRAND.bg,
    color: BRAND.text,
  },
  page: { minHeight: '100vh', boxSizing: 'border-box' },

  // ── горна лента со логото ──
  topbar: { background: '#fff', borderBottom: `1px solid ${BRAND.border}` },
  topbarInner: {
    maxWidth: '480px', margin: '0 auto', padding: '8px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
  },
  logoLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', minWidth: 0 },
  logoMark: { display: 'inline-flex', lineHeight: 0 },
  brandName: { display: 'block', lineHeight: 0 },
  brandDescriptor: { display: 'block', fontSize: '12px', color: BRAND.muted, marginTop: '3px', lineHeight: 1.2, letterSpacing: '0.2px' },
  adminButton: {
    background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: '10px', flexShrink: 0,
    width: '36px', height: '36px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },

  // Без воведен дел (25.11.2026, барање на сопственикот): калкулаторот е прво нешто под лентата.
  container: { maxWidth: '480px', margin: '16px auto 0', padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: '16px' },

  // ── калкулатор ──
  card: { ...panelBase, padding: '24px 20px', boxShadow: '0 10px 30px rgba(27,26,61,0.12)' },
  cardTitle: { fontSize: '22px', fontWeight: '800', color: BRAND.ink, margin: '0 0 20px', textAlign: 'center', lineHeight: 1.25 },
  cardLead: { display: 'block', marginTop: '6px', fontSize: '13px', fontWeight: '500', color: BRAND.muted, lineHeight: 1.4, letterSpacing: 0 },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' },
  input: {
    width: '100%', padding: '15px 16px', fontSize: '18px', color: BRAND.ink, background: '#fff',
    border: `2px solid ${BRAND.border}`, borderRadius: '12px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  primaryButton: {
    width: '100%', padding: '17px', fontSize: '18px', fontWeight: '700', color: '#fff', background: BRAND.primary,
    border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '8px',
  },
  legalNote: { margin: '14px 0 0', fontSize: '12px', color: BRAND.muted, textAlign: 'center', lineHeight: 1.45 },

  // ── знаци на доверба, „како работи“, водичи, даватели ──
  panel: { ...panelBase, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: '14px' },
  panelTitle: { color: BRAND.ink, fontSize: '17px', fontWeight: '800', margin: 0 },
  trustItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  trustIcon: {
    flexShrink: 0, width: '38px', height: '38px', borderRadius: '10px', background: BRAND.primarySoft,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0,
  },
  stepNum: {
    flexShrink: 0, width: '38px', height: '38px', borderRadius: '50%', background: BRAND.primaryDark, color: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800',
  },
  trustTitle: { display: 'block', fontSize: '15px', color: BRAND.ink, lineHeight: 1.3 },
  trustText: { display: 'block', fontSize: '13.5px', color: BRAND.muted, lineHeight: 1.45, marginTop: '2px' },

  guideLink: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: BRAND.bg,
    border: `1px solid ${BRAND.border}`, borderRadius: '12px', color: BRAND.ink, textDecoration: 'none',
  },
  guideIcon: { fontSize: '20px', lineHeight: 1, flexShrink: 0 },
  guideTitle: { flex: 1, fontSize: '15px', fontWeight: '600', lineHeight: 1.35 },
  guideArrow: { fontSize: '16px', color: BRAND.primary, flexShrink: 0 },
  lendersGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  lendersGroupLink: { color: BRAND.primary, fontSize: '14px', fontWeight: '700', textDecoration: 'none' },
  lendersRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  lenderChip: {
    fontSize: '13px', color: BRAND.text, background: BRAND.bg, border: `1px solid ${BRAND.border}`,
    borderRadius: '14px', padding: '4px 10px', textDecoration: 'none',
  },
  lendersAll: {
    color: BRAND.primary, fontSize: '14px', fontWeight: '700', textAlign: 'center', background: BRAND.primarySoft,
    borderRadius: '12px', padding: '12px', textDecoration: 'none',
  },

  // ── понуди ──
  resultsContainer: { display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' },
  summaryCard: { ...panelBase, padding: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(27,26,61,0.12)' },
  summaryText: { margin: 0, fontSize: '16px', color: BRAND.ink },
  disclaimerCard: { ...panelBase, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' },
  disclaimerIcon: { flexShrink: 0, lineHeight: 0, marginTop: '1px' },
  disclaimerText: { margin: 0, fontSize: '13px', color: BRAND.text, lineHeight: 1.45 },
  filterRow: { display: 'flex', gap: '6px' },
  filterChip: {
    flex: '1 1 auto', minWidth: 0, padding: '10px 4px', fontSize: '13px', fontWeight: '600', color: BRAND.text,
    background: '#fff', border: `2px solid ${BRAND.border}`, borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  filterChipActive: { background: BRAND.primary, color: '#fff', border: `2px solid ${BRAND.primary}` },
  filterCount: { opacity: 0.8, fontWeight: '500', fontSize: '12px', marginLeft: '2px' },
  sectionTitle: { color: BRAND.ink, fontSize: '18px', fontWeight: '800', margin: '6px 0 0' },
  offerCard: { ...panelBase, padding: '18px', position: 'relative' },
  bestOffer: { border: `2px solid ${BRAND.success}`, boxShadow: '0 8px 24px rgba(21,128,61,0.18)', marginTop: '8px' },
  bestBadge: {
    position: 'absolute', top: '-12px', left: '18px', background: BRAND.success, color: '#fff',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
  },
  offerHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  institutionLogo: {
    fontSize: '26px', width: '46px', height: '46px', borderRadius: '12px', background: BRAND.bg, border: `1px solid ${BRAND.border}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1,
  },
  institutionName: { fontSize: '18px', fontWeight: '700', color: BRAND.ink, display: 'block' },
  financeBadge: { fontSize: '11px', color: BRAND.primary, background: BRAND.primarySoft, padding: '2px 8px', borderRadius: '10px' },
  offerDetails: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' },
  offerDetail: { textAlign: 'center', padding: '8px', background: BRAND.bg, borderRadius: '10px' },
  detailLabel: { display: 'block', fontSize: '11.5px', color: BRAND.muted, marginBottom: '4px' },
  detailValue: { display: 'block', fontSize: '15px', fontWeight: '700', color: BRAND.ink },
  detailValueHighlight: { display: 'block', fontSize: '15px', fontWeight: '700', color: BRAND.danger },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '12px',
    borderTop: `1px dashed ${BRAND.border}`, marginBottom: '12px', color: BRAND.text,
  },
  totalAmount: { fontSize: '20px', fontWeight: '800', color: BRAND.ink, whiteSpace: 'nowrap' },
  selectButton: {
    display: 'block', width: '100%', padding: '13px 12px', fontSize: '16px', fontWeight: '700', color: '#fff', background: BRAND.primary,
    border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
  },
  svtNote: { margin: '10px 0 0', fontSize: '11.5px', color: BRAND.muted, lineHeight: 1.4 },
  backButton: {
    width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', color: BRAND.primary, background: '#fff',
    border: `2px solid ${BRAND.border}`, borderRadius: '12px', cursor: 'pointer',
  },

  // ── подножје ──
  footer: { textAlign: 'center', padding: '12px 8px 24px', color: BRAND.muted, fontSize: '12px', lineHeight: 1.5 },
  footerSmall: { fontSize: '11.5px', color: BRAND.muted, lineHeight: 1.45, marginTop: '8px' },
  footerContact: { fontSize: '12px', color: BRAND.muted, marginTop: '10px' },
  footerLink: { color: BRAND.primary },
};
