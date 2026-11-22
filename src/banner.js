// ============================================================================
//  Банер на сајтот — едно место, ист на компјутер и на телефон.
//  ЛЕТЕЧКИ: тесна лента залепена на дното на екранот, видлива додека посетителот скрола
//  (барање на сопственикот, 22.11.2026). Се прикажува на почетната (src/App.jsx, на двата
//  чекора) и на секоја статична страница (scripts/prerender.mjs, таму води кон калкулаторот).
//  Текстот, изгледот и анимацијата се само тука — двете места го цртаат истиот HTML и CSS.
//
//  Изглед (барање на сопственикот): „светликав, како реклама“, без логото (логото веќе е
//  на врвот на страницата). Тегет позадина со сјај, натпис што светка, печат „0 ден.“ и
//  ѕвездички. Сјајот е бавен премин, не трепкање.
//
//  Лентата не смее да пречи:
//   - страницата добива празен простор на дното (`kb-pad`), па подножјето не е покриено;
//   - на телефон се трга додека се пишува во поле (тастатурата го стеснува екранот);
//   - при prefers-reduced-motion сè стои мирно; при печатење не се прикажува.
//
//  Текстот е тврдење за услугата и мора да е точен, исто како знаците на доверба:
//  ако некогаш се воведе плаќање од корисниците — прво смени го ова.
//  Банер за давател (платен или не) оди тука само со негова писмена согласност и со
//  јасна ознака „Спонзорирано“. Тоа е промена на моделот → прво сопственикот.
// ============================================================================
import { BRAND as B } from './brand.js';

export const BANNER = {
  kicker: '100 %',
  badge: 'Бесплатно',
  title: 'Споредбата ништо не те чини',
  price: '0',
  unit: 'ден.',
  cta: 'Спореди бесплатно',
};

// Печат со 18 зраци (точките се впишани, не се пресметуваат — ист HTML на сервер и во прелистувач).
const SEAL_POINTS = '50.0,1.0 57.4,8.1 66.8,4.0 71.2,13.2 81.5,12.5 82.6,22.7 92.4,25.5 89.9,35.5 98.3,41.5 92.5,50.0 98.3,58.5 89.9,64.5 92.4,74.5 82.6,77.3 81.5,87.5 71.3,86.8 66.8,96.0 57.4,91.9 50.0,99.0 42.6,91.9 33.2,96.0 28.7,86.8 18.5,87.5 17.4,77.3 7.6,74.5 10.1,64.5 1.7,58.5 7.5,50.0 1.7,41.5 10.1,35.5 7.6,25.5 17.4,22.7 18.5,12.5 28.8,13.2 33.2,4.0 42.6,8.1';
const seal = `<svg class="kb-seal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48" aria-hidden="true"><defs><linearGradient id="kb-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${B.accentLight}"/><stop offset="1" stop-color="${B.accent}"/></linearGradient></defs><polygon fill="url(#kb-g)" points="${SEAL_POINTS}"/><circle cx="50" cy="50" r="35.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="2 3"/><text x="50" y="58" text-anchor="middle" font-size="40" font-weight="900" fill="${B.ink}">${BANNER.price}</text><text x="50" y="75" text-anchor="middle" font-size="15" font-weight="800" fill="${B.ink}">${BANNER.unit}</text></svg>`;

// Ѕвездички: [лево %, горе %, големина px, доцнење s] — меѓу текстот и печатот и во аглите.
const STARS = [[1.2, 10, 7, 0], [70, 12, 9, 0.7], [77, 66, 7, 1.3], [97.6, 6, 8, 1.0]];
const stars = STARS.map(([x, y, s, d]) => `<svg class="kb-star" viewBox="0 0 24 24" width="${s}" height="${s}" style="left:${x}%;top:${y}%;animation-delay:${d}s" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z"/></svg>`).join('');

// Содржина на лентата. `asLink` — кога целата лента е линк кон калкулаторот (статичните страници).
export const bannerInner = (asLink = false) => `${stars}<span class="kb-body"><strong class="kb-big">${BANNER.kicker} ${BANNER.badge}</strong><span class="kb-title">${BANNER.title}${asLink ? ` <span class="kb-go" aria-hidden="true">→</span><span class="kb-sr">. ${BANNER.cta}</span>` : ''}</span></span>${seal}`;

// `.kb` — лентата; `.kb-pad` — на обвивката на страницата, празен простор колку лентата.
export const BANNER_CSS = `html{scroll-padding-bottom:96px}
.kb-pad{padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))}
.kb{position:fixed;z-index:50;left:0;right:0;bottom:calc(10px + env(safe-area-inset-bottom,0px));margin:0 auto;width:min(calc(100% - 20px),500px);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:10px;overflow:hidden;padding:8px 12px 8px 16px;border-radius:16px;color:#fff;text-decoration:none;background:radial-gradient(circle at 90% 50%,rgba(110,170,230,.6),transparent 40%),linear-gradient(120deg,${B.primaryDark},${B.primary});box-shadow:0 10px 28px rgba(10,25,45,.42),inset 0 0 0 1px rgba(255,255,255,.14);animation:kb-in .5s ease-out both}
.kb-body{position:relative;z-index:1;min-width:0}
.kb-big{display:block;font-size:clamp(17px,5.3vw,21px);font-weight:900;letter-spacing:.4px;line-height:1.15;text-transform:uppercase;white-space:nowrap;color:${B.accentLight};background:linear-gradient(100deg,${B.accentLight} 0%,${B.accentLight} 35%,#fff 50%,${B.accentLight} 65%,${B.accentLight} 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:kb-shine 3.5s linear infinite}
.kb-title{display:block;font-size:13px;font-weight:600;line-height:1.3;margin-top:2px;color:rgba(255,255,255,.95)}
.kb-go{color:${B.accentLight};font-weight:800}
.kb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.kb-seal{position:relative;z-index:1;flex-shrink:0;transform:rotate(-10deg);filter:drop-shadow(0 3px 8px rgba(0,0,0,.3));animation:kb-pulse 2.6s ease-in-out infinite}
.kb-star{position:absolute;z-index:0;fill:#fff;opacity:.15;animation:kb-twinkle 2.4s ease-in-out infinite}
.kb::after{content:"";position:absolute;z-index:2;top:-20%;bottom:-20%;left:0;width:34%;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);transform:translateX(-160%) skewX(-20deg);animation:kb-sweep 6s ease-in-out infinite}
a.kb:hover{filter:brightness(1.08)}
@keyframes kb-in{from{transform:translateY(130%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes kb-shine{0%{background-position:130% 0}100%{background-position:-30% 0}}
@keyframes kb-sweep{0%,40%{transform:translateX(-160%) skewX(-20deg)}75%,100%{transform:translateX(460%) skewX(-20deg)}}
@keyframes kb-twinkle{0%,100%{opacity:.12;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
@keyframes kb-pulse{0%,100%{transform:rotate(-10deg) scale(1)}50%{transform:rotate(-10deg) scale(1.07)}}
@media (hover:none){body:has(input:focus) .kb{display:none}}
@media (prefers-reduced-motion:reduce){.kb,.kb-big,.kb-seal,.kb-star{animation:none}.kb::after{display:none}.kb-star{opacity:.7}}
@media print{.kb{display:none}.kb-pad{padding-bottom:0}}`;
