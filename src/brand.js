// ============================================================================
//  Бренд на KikoCredit — единствен извор за бои и лого.
//  Се користи во src/App.jsx, src/StatsView.jsx и scripts/prerender.mjs.
//
//  Цел на изгледот (22.11.2026): независен сајт за СПОРЕДБА — мирен, читлив,
//  со јасни знаци на доверба. Да не личи на давател на брзи кредити.
// ============================================================================

export const BRAND = {
  name: 'Кико',
  descriptor: 'споредба на кредити',
  tagline: 'Независна споредба на кредити',

  ink: '#1B1A3D',        // наслови
  text: '#3A3D55',       // обичен текст
  muted: '#666B85',      // помошен текст (контраст 5,2 на бело)
  primary: '#3F35B8',    // копчиња, линкови (бело врз неа: 8,1)
  primaryDark: '#2A2478',// горна лента
  primarySoft: '#EEEDFB',// светла позадина на ознаки
  accent: '#F97316',     // лисицата и ситни акценти — не за текст
  bg: '#F3F4FA',         // позадина на страницата
  card: '#FFFFFF',
  border: '#E2E4F0',
  success: '#15803D',    // „Најповолно“
  successSoft: '#E8F5EC',
  danger: '#B42318',     // вкупна камата
};

// ── Лого ────────────────────────────────────────────────────────────────────
// Лисицата на Кико — сопствен цртеж (не емоџи), ист на секој уред. Фасетирана глава,
// симетрична околу x = 60 (viewBox 0 0 120 120): левата половина е осветлена, десната во
// сенка — „две страни една до друга“, како две понуди што се споредуваат.
// На темна позадина оди самата лисица (foxSvg); на светла — плочката (faviconSvg).
const FOX_P = {
  T: [19, 5], Ei: [46, 36], Tc: [60, 42], Eo: [13, 50], Ck: [3, 70], Jw: [31, 93],
  H: [25, 63], Cn: [60, 74], Sn: [49, 86], Nl: [52.500, 91], Nb: [60, 101], Ch: [60, 113],
  Bo: [28, 52], Bc: [60, 57],
};
const FOX_LIGHT = { earOut: '#F97316', earIn: '#7C2D12', crown: '#FF9A3C', forehead: '#FB8424', side: '#EA580C', snout: '#F97316', cheek: '#FFFFFF' };
const FOX_SHADE = { earOut: '#DD5A0A', earIn: '#65210D', crown: '#F4700F', forehead: '#E8640C', side: '#B93C0B', snout: '#DD5A0A', cheek: '#E6E3F5' };
const FOX_INK = '#16153A';
const foxPts = (arr, mirror) => arr.map(([x, y]) => `${mirror ? 120 - x : x},${y}`).join(' ');
const foxFacets = (c, m) => {
  const P = FOX_P;
  return [
    [c.earOut, [P.T, P.Ei, P.Eo]],
    [c.earIn, [[23, 17], [40, 37], [19, 43]]],
    [c.crown, [P.Eo, P.Ei, P.Tc, P.Bc, P.Bo]],
    [c.forehead, [P.Eo, P.Bo, P.Bc, P.Cn, P.H]],
    [c.side, [P.Eo, P.H, P.Ck]],
    [c.snout, [P.H, P.Cn, [60, 91], P.Nl, P.Sn]],
    [c.cheek, [P.Ck, P.H, P.Sn, P.Nl, P.Nb, P.Ch, P.Jw]],
  ].map(([fill, a]) => `<polygon fill="${fill}" stroke="${fill}" stroke-width=".4" stroke-linejoin="round" points="${foxPts(a, m)}"/>`).join('');
};
const foxEye = (m) => `<polygon fill="${FOX_INK}" stroke="${FOX_INK}" stroke-width="1.600" stroke-linejoin="round" points="${foxPts([[29, 60], [38, 55], [46.500, 61.500], [38, 64.500]], m)}"/>`
  + `<circle fill="#fff" cx="${m ? 79.500 : 40.500}" cy="58.600" r="1.500"/>`;
const FOX_INNER = foxFacets(FOX_LIGHT, false) + foxFacets(FOX_SHADE, true)
  + `<path fill="${FOX_INK}" stroke="${FOX_INK}" stroke-width="2.400" stroke-linejoin="round" d="M54 91.500h12L60 99.500z"/>`
  + foxEye(false) + foxEye(true);

export const foxSvg = (size = 40, title = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img"${title ? ` aria-label="${title}"` : ' aria-hidden="true"'}>${FOX_INNER}</svg>`;

// Плочка: лисицата на заоблен индиго квадрат — икона за прелистувач/телефон и лого на светла позадина.
export const faviconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"${size ? ` width="${size}" height="${size}"` : ''}>`
  + '<defs><linearGradient id="kiko-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A40C8"/><stop offset="1" stop-color="#1F1A5C"/></linearGradient></defs>'
  + `<rect width="120" height="120" rx="27" fill="url(#kiko-bg)"/><g transform="translate(18 19) scale(.7)">${FOX_INNER}</g></svg>`;

// Името „Кико“ како контури (Unbounded ExtraBold, SIL Open Font License) — исто на секој уред,
// без вчитување фонт. Истиот фонт го користат и сликите за социјалните мрежи.
const WORDMARK_W = 3263;
const WORDMARK_D = 'M64.8 750V0H296V567L236 518L634.8 0H879.4L275.6 750ZM424.2 398.6 594.8 261.2 889.6 750H625.8ZM924.2 750V176.8H1149.8V623.4L1105.2 608L1374.6 176.8H1668.2V750H1442.6V289.2L1487.4 304.8L1209 750ZM1762.2 750V176.8H1991.4V574.4L1925.2 550.8L2228.6 176.8H2467L1963.8 750ZM2225.8 750 2067.4 471.6 2242.4 355.2 2481.8 750ZM2862.3 767.2Q2750.6 767.2 2666.7 729.3Q2582.8 691.4 2536.1 622.7Q2489.4 554 2489.4 463.7Q2489.4 372.4 2536.1 303.9Q2582.8 235.4 2666.8 197.5Q2750.9 159.6 2862.5 159.6Q2974.2 159.6 3058.1 197.5Q3142 235.4 3188.7 303.8Q3235.4 372.2 3235.4 463.7Q3235.4 554.2 3188.7 622.8Q3142 691.4 3058 729.3Q2973.9 767.2 2862.3 767.2ZM2862.6 598.8Q2907.6 598.8 2939.1 582.8Q2970.6 566.8 2987.4 536.3Q3004.2 505.8 3004.2 463.8Q3004.2 420.6 2987.4 390.3Q2970.6 360 2939.1 344Q2907.6 328 2862.6 328Q2818.2 328 2786.2 344Q2754.2 360 2737.4 390.3Q2720.6 420.6 2720.6 463.4Q2720.6 506.2 2737.4 536.5Q2754.2 566.8 2786.2 582.8Q2818.2 598.8 2862.6 598.8Z';
export const wordmarkSvg = (height = 22, color = '#fff') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -12 ${WORDMARK_W} 776" width="${Math.round(height * WORDMARK_W / 776 * 10) / 10}" height="${height}" role="img" aria-label="${BRAND.name}"><path fill="${color}" d="${WORDMARK_D}"/></svg>`;

// Мали линиски икони за знаците на доверба (наместо емоџи).
const icon = (d) => (size = 22, color = BRAND.primary) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONS = {
  shield: icon('<path d="M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.800-.7-8-4.500-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>'),
  lock: icon('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  check: icon('<circle cx="12" cy="12" r="9"/><path d="M8 12.500l2.800 2.800L16 9.500"/>'),
  scale: icon('<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.500 6a3 3 0 005 0zM19 8l-2.500 6a3 3 0 005 0z"/>'),
  stats: icon('<path d="M4 20h16"/><path d="M7 20v-7M12 20V5M17 20v-10"/>'),
};
