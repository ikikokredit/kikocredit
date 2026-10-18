// ============================================================================
//  scripts/prerender.mjs — се извршува по `vite build` (види package.json → build)
// ----------------------------------------------------------------------------
//  1. Ја пред-генерира почетната страница (React → HTML во dist/index.html), за
//     пребарувачите и AI-асистентите да ја видат содржината без JavaScript.
//  2. Прави статични страници за секој АКТИВЕН давател и за секоја група:
//       /krediti/                      сите даватели + чести прашања
//       /krediti/banki/                банки и штедилници
//       /krediti/finansiski-drustva/   финансиски друштва
//       /krediti/<slug>/               еден давател
//  3. Ги генерира dist/sitemap.xml и dist/llms.txt од истите податоци.
//
//  Сè се црта од src/institutions.js — при ажурирање на условите страниците се
//  обновуваат сами. Неактивни даватели (active: false) НЕ добиваат страница и не
//  смеат да се споменат никаде (на пр. Тиго Фајнанс, на негово барање).
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  activeInstitutions, financialInstitutions, typeLabel, DATA_UPDATED,
} from '../src/institutions.js';
import { calculateLoan, formatMKD, formatNumber, formatPct } from '../src/loan.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://kikocredit.com';
const YEAR = DATA_UPDATED.slice(0, 4);

// ── помошни ─────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const write = (rel, content) => {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};
const nameKey = (i) => i.name.toLowerCase();
const byName = (a, b) => (nameKey(a) > nameKey(b)) - (nameKey(a) < nameKey(b)); // ист редослед како App.jsx
const bySvt = (a, b) => a.svt - b.svt || byName(a, b);
const isBankish = (i) => i.type === 'bank' || i.type === 'savings';

const GROUPS = {
  bank: {
    slug: 'banki', short: 'Банки и штедилници', icon: '🏦',
    h1: 'Потрошувачки кредити од банки и штедилници',
    title: 'Потрошувачки кредити од банки во Македонија — споредба',
    items: activeInstitutions.filter(isBankish),
  },
  finance: {
    slug: 'finansiski-drustva', short: 'Финансиски друштва', icon: '💳',
    h1: 'Кредити од финансиски друштва',
    title: 'Кредити од финансиски друштва во Македонија — споредба',
    items: activeInstitutions.filter((i) => i.type === 'finance'),
  },
};
const groupOf = (i) => (isBankish(i) ? GROUPS.bank : GROUPS.finance);
const lenderPath = (i) => `/krediti/${i.slug}/`;

const amountText = (i) => (i.minAmount != null
  ? `од ${formatNumber(i.minAmount)} до ${formatMKD(i.maxAmount)}`
  : `до ${formatMKD(i.maxAmount)}`);
const monthsText = (i) => (i.minMonths > 1
  ? `од ${i.minMonths} до ${i.maxMonths} месеци`
  : `до ${i.maxMonths} месеци`);
const svtText = (i) => formatPct(i.svt) + (i.svtVerified ? '' : '*');

// Пример пресметка со истата логика како калкулаторот на почетната страница.
function examplePlan(i) {
  const bankish = isBankish(i);
  const lo = i.minAmount ?? 0;
  const amount = Math.min(Math.max(bankish ? 300000 : 30000, lo), i.maxAmount);
  const months = Math.min(Math.max(bankish ? 60 : 12, i.minMonths), i.maxMonths);
  const r = i.svt / 100 / 12;
  const annuity = r === 0 ? amount / months : amount * r / (1 - Math.pow(1 + r, -months));
  const payment = Math.ceil(annuity / 100) * 100;
  const res = calculateLoan(amount, payment, i.svt);
  if (!res || res.months > i.maxMonths) return null;
  return { amount, payment, ...res };
}

// ── заеднички изглед („Кико": лисица, виолетов градиент, бели картички 24px) ──
const GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-90CTTKZNVH"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-90CTTKZNVH');</script>`;

const CSS = `*{box-sizing:border-box}
body{margin:0;font-family:'Segoe UI','Roboto','Helvetica Neue',sans-serif;color:#333;line-height:1.5}
.app{min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}
.container{max-width:600px;margin:0 auto;padding:20px;display:flex;flex-direction:column;gap:20px}
.stack{display:flex;flex-direction:column;gap:20px;min-width:0}
a{color:#5a4fb0}
.header{text-align:center}
.logo-link{display:inline-flex;align-items:center;gap:12px;text-decoration:none}
.logo{font-size:48px;line-height:1}
.brand{font-size:36px;font-weight:800;color:#fff;text-shadow:2px 2px 4px rgba(0,0,0,.2)}
.tagline{color:rgba(255,255,255,.9);font-size:16px;margin:8px 0 0}
.crumbs{font-size:13px;color:rgba(255,255,255,.75)}
.crumbs a{color:#fff;text-decoration:none}
.crumbs a:hover{text-decoration:underline}
.card{background:#fff;border-radius:24px;padding:28px 22px;box-shadow:0 20px 60px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:16px;min-width:0}
.card h1{font-size:24px;font-weight:700;margin:0;line-height:1.25}
.card h2{font-size:18px;font-weight:700;margin:4px 0 0}
.card p{margin:0}
.lead{color:#555;font-size:15px}
.ident{display:flex;align-items:center;gap:12px}
.ident .emoji{font-size:32px;line-height:1}
.ident .name{font-size:18px;font-weight:700;display:block}
.badge{font-size:11px;color:#9c27b0;background:#f3e5f5;padding:2px 8px;border-radius:10px}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fact{text-align:center;padding:10px 8px;background:#f5f5f5;border-radius:8px}
.fact .k{display:block;font-size:11px;color:#888;margin-bottom:4px}
.fact .v{display:block;font-size:15px;font-weight:600;color:#333}
.example{background:#f4f2fd;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:8px}
.example .total{display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-top:2px dashed #ddd8f5;padding-top:10px;font-weight:600}
.example .total span:last-child{font-size:20px;font-weight:800}
.btn{display:block;text-align:center;text-decoration:none;font-weight:700;font-size:17px;color:#fff;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:16px}
.small{font-size:12px;color:#888}
.note{font-size:12px;color:#999}
.section-title{color:#fff;font-size:18px;font-weight:600;margin:0}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-size:13px;color:#fff;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:14px;padding:4px 10px;text-decoration:none}
.chip:hover{background:rgba(255,255,255,.28)}
.white-link{color:#fff;font-weight:600;text-decoration:none}
.table-wrap{overflow-x:auto;margin:0 -6px}
table{border-collapse:collapse;width:100%;min-width:420px;font-size:14px}
th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#888;font-weight:600;text-align:left;padding:8px 6px;border-bottom:2px solid #eee}
td{padding:10px 6px;border-bottom:1px solid #f0f0f0;vertical-align:top}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
td a{font-weight:600;text-decoration:none}
.faq{display:flex;flex-direction:column;gap:14px}
.faq h3{font-size:15px;margin:0 0 4px}
.footer{text-align:center;color:rgba(255,255,255,.6);font-size:12px;padding:8px 0 12px}
.footer p{margin:0}
.footer .small{color:rgba(255,255,255,.5);font-size:11px;margin-top:8px}
@media (max-width:420px){.card{padding:24px 16px}.brand{font-size:30px}.logo{font-size:40px}}`;

function layout({ path, title, description, crumbs, main, jsonLd, ogType = 'website' }) {
  const url = SITE + path;
  const crumbHtml = crumbs.map((c, n) => (n === crumbs.length - 1
    ? `<span>${esc(c.name)}</span>`
    : `<a href="${c.path}">${esc(c.name)}</a>`)).join(' › ');
  const breadcrumbLd = {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, n) => ({ '@type': 'ListItem', position: n + 1, name: c.name, item: SITE + c.path })),
  };
  const ld = { '@context': 'https://schema.org', '@graph': [breadcrumbLd, ...jsonLd] };
  return `<!DOCTYPE html>
<html lang="mk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${GA}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="mk_MK">
<meta property="og:site_name" content="KikoCredit">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦊</text></svg>">
<meta name="theme-color" content="#667eea">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>${CSS}</style>
</head>
<body>
<div class="app"><div class="container">
<header class="header">
<a href="/" class="logo-link" aria-label="KikoCredit — почетна"><span class="logo">🦊</span><span class="brand">Кико</span></a>
<p class="tagline">Најди го најдобриот кредит за тебе</p>
</header>
<nav class="crumbs" aria-label="Каде си">${crumbHtml}</nav>
<main class="stack">
${main}
</main>
<footer class="footer">
<p>© ${YEAR} KikoCredit.com - Твој кредитен советник</p>
<p class="small">KikoCredit не е давател на кредит и не наплаќа ништо од корисниците. Податоците се преземени од официјалните страници на институциите; за точните услови важи понудата на самата институција.</p>
</footer>
</div></div>
</body>
</html>
`;
}

const CRUMB_HOME = { name: 'Почетна', path: '/' };
const CRUMB_ALL = { name: 'Сите даватели', path: '/krediti/' };
const groupCrumb = (g) => ({ name: g.short, path: `/krediti/${g.slug}/` });

const svtNote = `<p class="note">* СВТ не е објавена на сајтот на институцијата — пресметката е приближна.</p>`;

function lenderTable(items) {
  // Ознаката за тип се прикажува само кога табелата меша типови (банка / штедилница)
  const mixed = new Set(items.map((i) => i.type)).size > 1;
  const typeTag = (i) => (mixed ? `<br><span class="small">${esc(typeLabel(i.type).replace(/^\S+\s/, ''))}</span>` : '');
  const rows = [...items].sort(bySvt).map((i) => `<tr>
<td><a href="${lenderPath(i)}">${esc(i.name)}</a>${typeTag(i)}</td>
<td class="num">${formatMKD(i.maxAmount)}</td>
<td class="num">${i.maxMonths} мес.</td>
<td class="num">${svtText(i)}</td>
</tr>`).join('\n');
  return `<div class="table-wrap"><table>
<thead><tr><th>Давател</th><th class="num">Износ до</th><th class="num">Рок до</th><th class="num">СВТ</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>`;
}

const itemListLd = (items) => ({
  '@type': 'ItemList',
  itemListElement: [...items].sort(bySvt).map((i, n) => ({
    '@type': 'ListItem', position: n + 1, name: i.name, url: SITE + lenderPath(i),
  })),
});

const ctaCalc = `<a class="btn" href="/">Пресметај рата за твојот износ →</a>`;

// ── страница за еден давател ───────────────────────────────────────────────
function lenderPage(i) {
  const g = groupOf(i);
  const path = lenderPath(i);
  // Ако институцијата објавила свој репрезентативен пример (во notes), не прикажуваме
  // наш приближен пример што би можел да се разликува од нејзиниот.
  const hasOwnExample = /реп\.\s*пример/i.test(i.notes);
  const ex = hasOwnExample ? null : examplePlan(i);
  const others = g.items.filter((o) => o.id !== i.id).sort(byName);
  const title = `${i.name} — кредит: услови и СВТ | KikoCredit`;
  const description = `${i.name}: потрошувачки кредит ${amountText(i)}, рок ${monthsText(i)}, СВТ ${formatPct(i.svt)}${i.svtVerified ? '' : ' (приближно)'}. Пример пресметка и споредба со други даватели.`;

  const exampleHtml = ex ? `<div class="example">
<h2 style="margin:0">Пример пресметка</h2>
<p>За <strong>${formatMKD(ex.amount)}</strong> со месечна рата од <strong>${formatMKD(ex.payment)}</strong>:</p>
<div class="facts">
<div class="fact"><span class="k">Бр. рати</span><span class="v">${ex.months}</span></div>
<div class="fact"><span class="k">Вк. камата</span><span class="v">${formatMKD(ex.totalInterest)}</span></div>
</div>
<div class="total"><span>Вкупно за враќање:</span><span>${formatMKD(ex.totalPayment)}</span></div>
<p class="small">Приближно: пресметано со СВТ од ${svtText(i)} како годишна стапка, исто како калкулаторот на почетната страница. Конечните услови ги дава ${esc(i.name)}.</p>
</div>` : '';

  const main = `<article class="card">
<div class="ident"><span class="emoji" aria-hidden="true">${i.logo}</span><div><span class="name">${esc(i.name)}</span><span class="badge">${esc(typeLabel(i.type))}</span></div></div>
<h1>${esc(i.name)} — услови за потрошувачки кредит</h1>
<p class="lead">Кај ${esc(i.name)} можеш да земеш потрошувачки кредит ${amountText(i)}, со рок ${monthsText(i)}.</p>
<div class="facts">
<div class="fact"><span class="k">Износ</span><span class="v">${i.minAmount != null ? formatNumber(i.minAmount) + ' – ' : 'до '}${formatMKD(i.maxAmount)}</span></div>
<div class="fact"><span class="k">Рок</span><span class="v">${i.minMonths}–${i.maxMonths} мес.</span></div>
<div class="fact"><span class="k">Камата (СВТ)</span><span class="v">${svtText(i)}</span></div>
<div class="fact"><span class="k">Проверено</span><span class="v">${fmtDate(i.verifiedAt)}</span></div>
</div>
<h2>Што треба да знаеш</h2>
<p>${esc(i.notes)}</p>
${exampleHtml}
${ctaCalc}
<p class="small">Официјален сајт: <a href="https://${esc(i.website)}/" target="_blank" rel="noopener nofollow">${esc(i.website)}</a> · Извор на условите: <a href="${esc(i.source)}" target="_blank" rel="noopener nofollow">${esc(host(i.source))}</a></p>
${i.svtVerified ? '' : svtNote}
</article>
<section style="display:flex;flex-direction:column;gap:10px">
<h2 class="section-title">Спореди со други: ${esc(g.short.toLowerCase())}</h2>
<div class="chips">${others.map((o) => `<a class="chip" href="${lenderPath(o)}">${esc(o.name)}</a>`).join('')}</div>
<a class="white-link" href="/krediti/${g.slug}/">Табела: ${esc(g.short.toLowerCase())} по СВТ →</a>
</section>`;

  const loan = {
    '@type': 'LoanOrCredit',
    name: `Потрошувачки кредит — ${i.name}`,
    url: SITE + path,
    provider: { '@type': isBankish(i) ? 'BankOrCreditUnion' : 'FinancialService', name: i.name, url: `https://${i.website}/` },
    areaServed: { '@type': 'Country', name: 'Северна Македонија' },
    amount: {
      '@type': 'MonetaryAmount', currency: 'MKD', maxValue: i.maxAmount,
      ...(i.minAmount != null ? { minValue: i.minAmount } : {}),
    },
    loanTerm: { '@type': 'QuantitativeValue', minValue: i.minMonths, maxValue: i.maxMonths, unitCode: 'MON' },
    // СВТ се означува само ако е објавена од институцијата (приближните вредности не)
    ...(i.svtVerified ? { annualPercentageRate: i.svt } : {}),
  };

  return layout({
    path, title, description, ogType: 'article',
    crumbs: [CRUMB_HOME, CRUMB_ALL, groupCrumb(g), { name: i.name, path }],
    main, jsonLd: [loan],
  });
}

// ── страница за група ─────────────────────────────────────────────────────
function groupPage(g) {
  const path = `/krediti/${g.slug}/`;
  const other = g === GROUPS.bank ? GROUPS.finance : GROUPS.bank;
  const n = g.items.length;
  const lead = g === GROUPS.bank
    ? `Споредба на ${n} банки и штедилници во Северна Македонија: највисок износ, најдолг рок и стапка на вкупни трошоци (СВТ), подредени од најниска СВТ. Кај некои банки условите зависат од тоа дали примаш плата или пензија во банката.`
    : `Споредба на ${n} финансиски друштва во Северна Македонија: највисок износ, најдолг рок и стапка на вкупни трошоци (СВТ), подредени од најниска СВТ. Кредитите од друштва се најчесто за помали износи, а СВТ е значително повисока отколку кај банките — затоа спореди ја вкупната цена пред да аплицираш.`;
  const hasUnverified = g.items.some((i) => !i.svtVerified);
  const main = `<section class="card">
<h1>${esc(g.h1)}</h1>
<p class="lead">${lead}</p>
${lenderTable(g.items)}
${hasUnverified ? svtNote : ''}
<p class="small">Последна проверка на условите: ${fmtDate(DATA_UPDATED)}.</p>
${ctaCalc}
</section>
<a class="white-link" href="/krediti/${other.slug}/">${other.icon} ${esc(other.short)} →</a>`;
  return layout({
    path, title: g.title,
    description: `${g.h1} во Македонија: ${n} даватели, износи, рокови и СВТ на едно место. Бесплатна споредба, без лични податоци.`,
    crumbs: [CRUMB_HOME, CRUMB_ALL, groupCrumb(g)],
    main, jsonLd: [itemListLd(g.items)],
  });
}

// ── сите даватели + чести прашања ─────────────────────────────────────────
const FAQ = [
  ['Што е СВТ?', 'Стапка на вкупни трошоци: годишна стапка што ги вклучува и каматата и другите трошоци на кредитот (надоместоци, провизии). Затоа е подобра за споредба од номиналната каматна стапка.'],
  ['Дали KikoCredit наплаќа нешто?', 'Не. KikoCredit не е давател на кредит и не наплаќа ништо од корисниците.'],
  ['Дали треба да внесам лични податоци?', 'Не. Внесуваш само износ и месечна рата. Со „Аплицирај“ одиш директно на страницата на институцијата и таму поднесуваш барање.'],
  ['Зошто некои стапки имаат ѕвездичка (*)?', 'Институцијата не ја објавила СВТ на својот сајт, па пресметката е приближна. Таквите понуди не добиваат ознака „Најповолно“.'],
  ['Колку се точни податоците?', 'Условите се преземени од официјалните страници на институциите, а датумот на последната проверка стои кај секој давател. За точните услови важи понудата на самата институција.'],
];

function hubPage() {
  const path = '/krediti/';
  const nb = GROUPS.bank.items.length, nf = GROUPS.finance.items.length;
  const main = `<section class="card">
<h1>Сите даватели на потрошувачки кредити во Македонија</h1>
<p class="lead">KikoCredit споредува ${nb + nf} даватели: ${nb} банки и штедилници и ${nf} финансиски друштва. Условите се од официјалните страници на институциите (последна проверка: ${fmtDate(DATA_UPDATED)}).</p>
<h2>${GROUPS.bank.icon} ${GROUPS.bank.short}</h2>
${lenderTable(GROUPS.bank.items)}
<h2>${GROUPS.finance.icon} ${GROUPS.finance.short}</h2>
${lenderTable(GROUPS.finance.items)}
${svtNote}
${ctaCalc}
</section>
<section class="card">
<h2 style="margin:0">Чести прашања</h2>
<div class="faq">
${FAQ.map(([q, a]) => `<div><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('\n')}
</div>
</section>`;
  const faqLd = {
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  return layout({
    path, title: 'Сите даватели на кредити во Македонија | KikoCredit',
    description: `Банки, штедилници и финансиски друштва во Македонија на едно место: ${nb + nf} даватели, износи, рокови и СВТ. Бесплатна споредба на потрошувачки кредити.`,
    crumbs: [CRUMB_HOME, CRUMB_ALL],
    main, jsonLd: [itemListLd(activeInstitutions), faqLd],
  });
}

// ── sitemap.xml и llms.txt ────────────────────────────────────────────────
function sitemap() {
  const urls = [
    ['/', DATA_UPDATED], ['/krediti/', DATA_UPDATED],
    [`/krediti/${GROUPS.bank.slug}/`, DATA_UPDATED], [`/krediti/${GROUPS.finance.slug}/`, DATA_UPDATED],
    ...[...activeInstitutions].sort(byName).map((i) => [lenderPath(i), i.verifiedAt]),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, d]) => `  <url><loc>${SITE}${p}</loc><lastmod>${d}</lastmod></url>`).join('\n')}
</urlset>
`;
}

function llms() {
  const line = (i) => `- [${i.name}](${SITE}${lenderPath(i)}): ${amountText(i)}, рок ${monthsText(i)}, СВТ ${formatPct(i.svt)}${i.svtVerified ? '' : ' (приближно, не е објавена)'}`;
  return `# KikoCredit

> Бесплатен портал за споредба на потрошувачки кредити во Северна Македонија.
> Внесуваш износ и месечна рата и гледаш број на рати, стапка на вкупни трошоци (СВТ),
> вкупна камата и вкупен износ за враќање кај банки, штедилници и финансиски друштва.

## Како работи
- Понудите се подредени по најнизок вкупен трошок
- Копчето „Аплицирај“ води директно на страницата на институцијата
- KikoCredit не е давател на кредит, не наплаќа ништо од корисниците и не бара лични податоци
- Условите се од официјалните страници на институциите; последна проверка: ${fmtDate(DATA_UPDATED)}

## Каде
Северна Македонија. Износите се во денари (MKD).

## Клучни страници
- [Калкулатор и споредба](${SITE}/)
- [Сите даватели](${SITE}/krediti/)
- [Банки и штедилници](${SITE}/krediti/${GROUPS.bank.slug}/)
- [Финансиски друштва](${SITE}/krediti/${GROUPS.finance.slug}/)

## Банки и штедилници
${[...GROUPS.bank.items].sort(bySvt).map(line).join('\n')}

## Финансиски друштва
${[...GROUPS.finance.items].sort(bySvt).map(line).join('\n')}
`;
}

// ── извршување ────────────────────────────────────────────────────────────
// 1) Почетна страница: React → HTML
const { render } = await import(pathToFileURL(join(ROOT, 'dist-ssr', 'entry-server.js')).href);
const indexFile = join(DIST, 'index.html');
const indexHtml = readFileSync(indexFile, 'utf8');
const MARK = '<div id="root"></div>';
if (!indexHtml.includes(MARK)) throw new Error('dist/index.html: не најдов <div id="root"></div>');
const appHtml = render();
if (!appHtml.includes('Колку ти треба?')) throw new Error('Пред-генерирањето не го даде калкулаторот');
writeFileSync(indexFile, indexHtml.replace(MARK, `<div id="root">${appHtml}</div>`));

// 2) Страници
rmSync(join(DIST, 'krediti'), { recursive: true, force: true });
write('krediti/index.html', hubPage());
for (const g of Object.values(GROUPS)) write(`krediti/${g.slug}/index.html`, groupPage(g));
for (const i of activeInstitutions) write(`krediti/${i.slug}/index.html`, lenderPage(i));

// 3) sitemap.xml, llms.txt
write('sitemap.xml', sitemap());
write('llms.txt', llms());
rmSync(join(ROOT, 'dist-ssr'), { recursive: true, force: true });

// 4) Заштита: неактивни даватели не смеат да се појават во генерираните фајлови
const inactive = financialInstitutions.filter((i) => !i.active);
const generated = [];
const walk = (dir) => readdirSync(dir).forEach((f) => {
  const p = join(dir, f);
  if (statSync(p).isDirectory()) { if (f !== 'assets') walk(p); } else if (/\.(html|xml|txt)$/.test(f)) generated.push(p);
});
walk(DIST);
for (const file of generated) {
  const txt = readFileSync(file, 'utf8');
  for (const i of inactive) {
    if (txt.includes(i.name) || txt.includes(`/krediti/${i.slug}/`)) {
      throw new Error(`Неактивен давател „${i.name}“ се појавува во ${file.replace(DIST, 'dist')}`);
    }
  }
}

console.log(`prerender: почетна + ${activeInstitutions.length} даватели + 3 збирни страници, sitemap.xml, llms.txt`);
