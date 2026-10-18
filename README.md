# kikocredit — објави за социјални мрежи (гранка `social`)

Оваа гранка **не е дел од сајтот** и никогаш не се спојува во `main`.
Ги чува сликите и редот на објави за Facebook (страница KikoCredit) и Instagram (@kikocredit).

- `posts/queue.json` — ред на објави: датум, време, слика (`image_url`), опис, `approved`.
- `posts/*.jpg` — сликите (1080×1350), јавно достапни преку raw.githubusercontent.com.

Закажаната задача „KikoCredit — објави на социјални мрежи“ (вт, чт, нед во 18:57, Скопје)
ја објавува објавата за тој ден **само ако `approved: true`**. Pece ги одобрува објавите.

## Алатки за следните серии (`tools/`)
- `make_posts.py` — ги црта сликите 1080×1350 во стилот „Кико“ (прва серија како пример).
  Користи `tools/fonts/` (Manrope, Unbounded — SIL Open Font License) и Noto Color Emoji.
- `build_calendar.py` + `calendar_template.html` — страница-календар со слики и описи.
Правила за содржина: едукација, без имиња и логоа на банки/друштва, бројки само од
калкулаторот (`src/loan.js`) и податоците на сајтот; тон на „ти“, без притисок за земање кредит.

## Неделен водич (секоја недела)
- `posts/vodici.json` — споделувања на новите водичи од kikocredit.com/vodici/ (одделно од
  `queue.json`, за да не се судрат со редовната објава во недела во 18:57). Полиња: `date`,
  `slug`, `url`, `pr`, `image_url`, `alt`, `caption`, `approved`, `published`.
- `tools/make_guide_image.py` — слика 1080×1350 „📚 Нов водич“ со наслов и 2–3 точки.
- Тек: четврток — нацрт (PR во main + ставка со `approved: false`); Pece одговара „одобрени“
  → PR добива ознака `odobreno`, ставката `approved: true`; недела попладне — спојување,
  проверка дека страницата е жива и споделување на Facebook и Instagram.

