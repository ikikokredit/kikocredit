// ============================================================================
//  Банер на сајтот — едно место, ист на компјутер и на телефон.
//  Се прикажува на почетната (под калкулаторот, src/App.jsx) и пред подножјето на
//  секоја статична страница (scripts/prerender.mjs). Текстот, изгледот и анимацијата
//  се само тука — двете места го цртаат истиот HTML и CSS.
//
//  Изглед (барање на сопственикот, 22.11.2026): „светликав, како реклама“, без логото
//  (логото веќе е на врвот на страницата). Тегет позадина со портокалов сјај, натпис
//  што светка, печат „0 ден.“ и ѕвездички. Сјајот е бавен премин, не трепкање.
//  Кај корисници што бараат помалку движење (prefers-reduced-motion) сè стои мирно.
//
//  Текстот е тврдење за услугата и мора да е точен, исто како знаците на доверба:
//  ако некогаш се воведе плаќање од корисниците, регистрација или форма за лични
//  податоци — прво смени го ова.
//  Банер за давател (платен или не) оди тука само со негова писмена согласност и со
//  јасна ознака „Спонзорирано“. Тоа е промена на моделот → прво сопственикот.
// ============================================================================
import { BRAND as B } from './brand.js';

export const BANNER = {
  kicker: '100 %',
  badge: 'Бесплатно',
  title: 'Споредбата ништо не те чини',
  text: 'Без регистрација и без лични податоци.',
  price: '0',
  unit: 'ден.',
  cta: 'Спореди бесплатно',
};

// Печат со 18 зраци (точките се впишани, не се пресметуваат — ист HTML на сервер и во прелистувач).
const SEAL_POINTS = '50.0,1.0 57.4,8.1 66.8,4.0 71.2,13.2 81.5,12.5 82.6,22.7 92.4,25.5 89.9,35.5 98.3,41.5 92.5,50.0 98.3,58.5 89.9,64.5 92.4,74.5 82.6,77.3 81.5,87.5 71.3,86.8 66.8,96.0 57.4,91.9 50.0,99.0 42.6,91.9 33.2,96.0 28.7,86.8 18.5,87.5 17.4,77.3 7.6,74.5 10.1,64.5 1.7,58.5 7.5,50.0 1.7,41.5 10.1,35.5 7.6,25.5 17.4,22.7 18.5,12.5 28.8,13.2 33.2,4.0 42.6,8.1';
const seal = `<svg class="kb-seal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="84" height="84" aria-hidden="true"><defs><linearGradient id="kb-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${B.accentLight}"/><stop offset="1" stop-color="${B.accent}"/></linearGradient></defs><polygon fill="url(#kb-g)" points="${SEAL_POINTS}"/><circle cx="50" cy="50" r="35.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" stroke-dasharray="2 3"/><text x="50" y="58" text-anchor="middle" font-size="40" font-weight="900" fill="${B.ink}">${BANNER.price}</text><text x="50" y="74" text-anchor="middle" font-size="13" font-weight="800" fill="${B.ink}">${BANNER.unit}</text></svg>`;

// Ѕвездички: [лево %, горе %, големина px, доцнење s]
// (распоредени околу текстот и печатот, не врз нив)
const STARS = [[1.5, 5, 9, 0], [57, 8, 12, 0.7], [95, 7, 13, 1.0], [61, 83, 10, 1.3], [79, 88, 9, 0.4]];
const stars = STARS.map(([x, y, s, d]) => `<svg class="kb-star" viewBox="0 0 24 24" width="${s}" height="${s}" style="left:${x}%;top:${y}%;animation-delay:${d}s" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z"/></svg>`).join('');

// Содржина на банерот. `withCta` — со копче кон калкулаторот (на статичните страници).
export const bannerInner = (withCta = false) => `${stars}<span class="kb-body"><span class="kb-kicker">${BANNER.kicker}</span><strong class="kb-big">${BANNER.badge}</strong><span class="kb-title">${BANNER.title}</span><span class="kb-text">${BANNER.text}</span>${withCta ? `<span class="kb-cta">${BANNER.cta} →</span>` : ''}</span>${seal}`;

export const BANNER_CSS = `.kb{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;overflow:hidden;padding:18px;border-radius:16px;color:#fff;text-decoration:none;background:radial-gradient(circle at 85% 50%,rgba(110,170,230,.55),transparent 46%),linear-gradient(120deg,${B.primaryDark},${B.primary});box-shadow:0 10px 26px rgba(22,50,79,.28)}
.kb-body{position:relative;z-index:1;min-width:0}
.kb-kicker{display:block;font-size:14px;font-weight:800;letter-spacing:.5px;color:${B.accentLight}}
.kb-big{display:block;font-size:clamp(25px,7.6vw,33px);font-weight:900;letter-spacing:.5px;line-height:1.1;text-transform:uppercase;color:${B.accentLight};background:linear-gradient(100deg,${B.accentLight} 0%,${B.accentLight} 35%,#fff 50%,${B.accentLight} 65%,${B.accentLight} 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:kb-shine 3s linear infinite}
.kb-title{display:block;font-size:15.5px;font-weight:700;line-height:1.3;margin-top:8px;text-wrap:balance}
.kb-text{display:block;font-size:12.5px;line-height:1.4;color:rgba(255,255,255,.88);margin-top:3px}
.kb-cta{display:inline-block;margin-top:12px;padding:9px 14px;border-radius:10px;background:${B.accent};color:${B.ink};font-size:14px;font-weight:800}
a.kb:hover .kb-cta{background:${B.accentLight}}
.kb-seal{position:relative;z-index:1;flex-shrink:0;transform:rotate(-10deg);filter:drop-shadow(0 4px 10px rgba(0,0,0,.3));animation:kb-pulse 2.6s ease-in-out infinite}
.kb-star{position:absolute;z-index:0;fill:#fff;opacity:.15;animation:kb-twinkle 2.4s ease-in-out infinite}
.kb::after{content:"";position:absolute;z-index:2;top:-20%;bottom:-20%;left:0;width:38%;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);transform:translateX(-160%) skewX(-20deg);animation:kb-sweep 4.5s ease-in-out infinite}
@keyframes kb-shine{0%{background-position:130% 0}100%{background-position:-30% 0}}
@keyframes kb-sweep{0%,30%{transform:translateX(-160%) skewX(-20deg)}75%,100%{transform:translateX(420%) skewX(-20deg)}}
@keyframes kb-twinkle{0%,100%{opacity:.12;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
@keyframes kb-pulse{0%,100%{transform:rotate(-10deg) scale(1)}50%{transform:rotate(-10deg) scale(1.07)}}
@media (max-width:380px){.kb{padding:16px 14px}.kb-seal{width:72px;height:72px}}
@media (prefers-reduced-motion:reduce){.kb::after{display:none}.kb-big,.kb-seal,.kb-star{animation:none}.kb-star{opacity:.7}}`;
