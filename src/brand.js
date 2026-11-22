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

// Лисицата на Кико — сопствен цртеж (не емоџи), ист на секој уред.
// Работи од 16 px (favicon) до голема слика; на светла и на темна позадина.
export const foxSvg = (size = 40, title = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img"${title ? ` aria-label="${title}"` : ' aria-hidden="true"'}>`
  + '<path fill="#F97316" d="M7 5l19 13h12L57 5l3 29-28 26L4 34z"/>'
  + '<path fill="#C2410C" d="M12 13l11 8-10 9zM52 13l-11 8 10 9z"/>'
  + '<path fill="#FFF" d="M4 34l20 3 8 23zM60 34l-20 3-8 23z"/>'
  + '<path fill="#1B1A3D" d="M27 51h10l-5 9z"/>'
  + '<circle fill="#1B1A3D" cx="23" cy="33" r="3"/><circle fill="#1B1A3D" cx="41" cy="33" r="3"/>'
  + '</svg>';

// Икона за прелистувачот: лисицата на заоблен темен квадрат (се гледа и на светол и на темен таб).
export const faviconSvg = () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
  + `<rect width="64" height="64" rx="14" fill="${BRAND.primaryDark}"/>`
  + '<g transform="translate(8 9) scale(.75)">'
  + '<path fill="#F97316" d="M7 5l19 13h12L57 5l3 29-28 26L4 34z"/>'
  + '<path fill="#C2410C" d="M12 13l11 8-10 9zM52 13l-11 8 10 9z"/>'
  + '<path fill="#FFF" d="M4 34l20 3 8 23zM60 34l-20 3-8 23z"/>'
  + '<path fill="#1B1A3D" d="M27 51h10l-5 9z"/>'
  + '<circle fill="#1B1A3D" cx="23" cy="33" r="3"/><circle fill="#1B1A3D" cx="41" cy="33" r="3"/>'
  + '</g></svg>';

// Мали линиски икони за знаците на доверба (наместо емоџи).
const icon = (d) => (size = 22, color = BRAND.primary) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONS = {
  shield: icon('<path d="M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.800-.7-8-4.500-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>'),
  lock: icon('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  check: icon('<circle cx="12" cy="12" r="9"/><path d="M8 12.500l2.800 2.800L16 9.500"/>'),
  scale: icon('<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.500 6a3 3 0 005 0zM19 8l-2.500 6a3 3 0 005 0z"/>'),
  stats: icon('<path d="M4 20h16"/><path d="M7 20v-7M12 20V5M17 20v-10"/>'),
};
