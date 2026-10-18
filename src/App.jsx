import React, { useState, useEffect, useMemo } from 'react';
import { activeInstitutions, DATA_UPDATED_LABEL, typeLabel } from './institutions.js';
import { calculateLoan, formatMKD, formatPct } from './loan.js';
import StatsView from './StatsView.jsx';

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
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>🦊</span>
          <h1 style={styles.brandName}>Кико</h1>
        </div>
        <p style={styles.tagline}>Најди го најдобриот кредит за тебе</p>
        <button onClick={onAdminClick} style={styles.adminButton} aria-label="Статистика">
          ⚙️
        </button>
      </header>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${(step / 2) * 100}%`}}></div>
        </div>
        <div style={styles.progressSteps}>
          <span style={step >= 1 ? styles.activeStep : styles.inactiveStep}>Износ и рата</span>
          <span style={step >= 2 ? styles.activeStep : styles.inactiveStep}>Понуди</span>
        </div>
      </div>

      {step === 1 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Колку ти треба?</h2>

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
            Пресметај понуди 📊
          </button>

          <p style={styles.legalNote}>
            Споредба на {activeInstitutions.length} банки и финансиски друштва во Македонија.
            Пресметката е информативна; кредитот го склучуваш директно со институцијата.
          </p>
        </div>
      )}

      {step === 1 && (
        <nav style={styles.lendersNav} aria-label="Даватели">
          <h2 style={styles.lendersTitle}>Кого споредуваме</h2>
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
            <span style={styles.disclaimerIcon}>ℹ️</span>
            <p style={styles.disclaimerText}>
              Понудите се подредени по <strong>најнизок вкупен трошок</strong>.
              Со клик на „Аплицирај" одиш на страницата на институцијата; конечните услови се договараат директно со неа.
              <br/><small style={{opacity: 0.7}}>Ажурирано: {DATA_UPDATED_LABEL}</small>
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
              {index === bestIndex && <span style={styles.bestBadge}>⭐ Најповолно</span>}

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
                Аплицирај кај {offer.name} →
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
        <p suppressHydrationWarning>© {new Date().getFullYear()} KikoCredit.com - Твој кредитен советник</p>
        <p style={styles.footerSmall}>
          KikoCredit не е давател на кредит и не наплаќа ништо од корисниците. Податоците се преземени од
          официјалните страници на институциите; за точните услови важи понудата на самата институција.
        </p>
      </footer>
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

const styles = {
  app: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
    position: 'relative',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '48px',
  },
  brandName: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'white',
    margin: 0,
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '16px',
    marginTop: '8px',
  },
  adminButton: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
  },
  progressContainer: {
    marginBottom: '24px',
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'white',
    transition: 'width 0.3s ease',
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '12px',
  },
  activeStep: {
    color: 'white',
    fontWeight: '600',
  },
  inactiveStep: {
    color: 'rgba(255,255,255,0.5)',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '32px 24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '24px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  primaryButton: {
    width: '100%',
    padding: '18px',
    fontSize: '18px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  legalNote: {
    marginTop: '16px',
    marginBottom: 0,
    fontSize: '12px',
    color: '#888',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  backButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    color: '#666',
    background: 'transparent',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  resultsContainer: {
    paddingBottom: '20px',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  summaryText: {
    margin: 0,
    fontSize: '16px',
    color: '#333',
  },
  disclaimerCard: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  disclaimerIcon: {
    fontSize: '20px',
  },
  disclaimerText: {
    margin: 0,
    fontSize: '13px',
    color: '#555',
    lineHeight: '1.4',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterChip: {
    flex: 1,
    minWidth: '90px',
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    background: 'rgba(255,255,255,0.18)',
    border: '2px solid rgba(255,255,255,0.35)',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterChipActive: {
    background: 'white',
    color: '#5a4fb0',
    border: '2px solid white',
  },
  filterCount: {
    opacity: 0.75,
    fontWeight: '500',
    fontSize: '12px',
    marginLeft: '4px',
  },
  sectionTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  offerCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '16px',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  bestOffer: {
    border: '3px solid #4CAF50',
    boxShadow: '0 8px 30px rgba(76, 175, 80, 0.3)',
  },
  bestBadge: {
    position: 'absolute',
    top: '-12px',
    left: '20px',
    background: '#4CAF50',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  offerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  institutionLogo: {
    fontSize: '32px',
  },
  institutionName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    display: 'block',
  },
  financeBadge: {
    fontSize: '11px',
    color: '#9c27b0',
    background: '#f3e5f5',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  offerDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  offerDetail: {
    textAlign: 'center',
    padding: '8px',
    background: '#f5f5f5',
    borderRadius: '8px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#888',
    marginBottom: '4px',
  },
  detailValue: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  detailValueHighlight: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#e53935',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '2px dashed #eee',
    marginBottom: '12px',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#333',
  },
  selectButton: {
    display: 'block',
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  svtNote: {
    margin: '10px 0 0',
    fontSize: '11px',
    color: '#999',
    lineHeight: '1.4',
  },
  lendersNav: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  lendersTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  lendersGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  lendersGroupLink: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  lendersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  lenderChip: {
    fontSize: '13px',
    color: 'white',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '14px',
    padding: '4px 10px',
    textDecoration: 'none',
  },
  lendersAll: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '12px',
    textDecoration: 'none',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  footerSmall: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: '1.4',
    marginTop: '8px',
  },
};
