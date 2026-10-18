// ============================================================================
//  Даватели на потрошувачки кредити во Македонија — единствен извор на податоци
// ----------------------------------------------------------------------------
//  Последна проверка: 20.09.2026 (постапка: CLAUDE.md → „проверка/ажурирање на условите")
//
//  Полиња:
//    id            – стабилен идентификатор (не се менува; се користи во статистиката)
//    active        – false = не се прикажува (не постои / не работи / побара да не се прикажува)
//    type          – 'bank' | 'savings' | 'finance'
//    minAmount / maxAmount   – износ во денари (minAmount: null = нема објавен минимум)
//    minMonths / maxMonths   – рок во месеци
//    interestRate  – номинална годишна каматна стапка (%), информативно
//    svt           – стапка на вкупни трошоци (%) — СЕ КОРИСТИ ВО ПРЕСМЕТКАТА И СОРТИРАЊЕТО
//    svtVerified   – true само ако СВТ е прочитана од сајтот (репрезентативен пример/тарифник);
//                    false = објавена не е, па е употребена номиналната или последната позната
//    applyUrl      – страница на институцијата каде клиентот аплицира (копчето „Аплицирај")
//    verifiedAt    – датум на последна проверка (ISO)
//    source        – страница од која се проверени податоците
//    slug          – стабилен дел од адресата: kikocredit.com/krediti/<slug>/ (не се менува)
//    notes         – услови, ограничувања, што не е потврдено. ЈАВНО: се прикажува на
//                    страницата на давателот, па се пишува за корисници
//    internalNote  – (опционално) работна забелешка, НЕ се прикажува никаде
// ============================================================================

export const DATA_UPDATED = '2026-09-20';
export const DATA_UPDATED_LABEL = 'Септември 2026';

// Законски максимум на вкупните трошоци што го наведуваат самите друштва: 60 %.
export const SVT_LEGAL_MAX = 60;

export const TYPE_LABELS = {
  bank: '🏦 Банка',
  savings: '🏦 Штедилница',
  finance: '💳 Фин. друштво',
};

export const financialInstitutions = [
  // ───────────────────────────── ФИНАНСИСКИ ДРУШТВА ─────────────────────────────
  {
    id: 1, slug: 'iute-kredit', active: true, type: 'finance', name: 'Иуте Кредит', logo: '⚡',
    minAmount: 6000, maxAmount: 300000, minMonths: 2, maxMonths: 60,
    interestRate: 12.25, svt: 34.5, svtVerified: false,
    applyUrl: 'https://iute.mk/cash-kredit/', website: 'iute.mk', phone: '13333',
    verifiedAt: '2026-09-20', source: 'https://iute.mk/en/pricelist/',
    notes: 'Нови клиенти до 300.000, повторни до 600.000. СВТ 34,5 % важи за „Иуте Премиум"; стандардна СВТ не е објавена.',
  },
  {
    id: 2, slug: 'tigo-fajnans', active: false, type: 'finance', name: 'Тиго Фајнанс', logo: '🐯',
    minAmount: 500, maxAmount: 720000, minMonths: 3, maxMonths: 72,
    interestRate: 3.5, svt: 38.0, svtVerified: false,
    applyUrl: 'https://www.tigo.mk/', website: 'tigo.mk', phone: '13700',
    verifiedAt: '2026-09-14', source: 'https://www.tigo.mk/info/kredit-na-rati',
    notes: 'ДЕАКТИВИРАНО 14.09.2026: друштвото (ФД ФИНМАК ДОО Скопје) писмено побара засега да не се прикажува на платформата.',
  },
  {
    id: 3, slug: 'solidus', active: true, type: 'finance', name: 'Солидус', logo: '🔷',
    minAmount: 10000, maxAmount: 180000, minMonths: 1, maxMonths: 48,
    interestRate: 9.0, svt: 40.0, svtVerified: false,
    applyUrl: 'https://solidus.mk/apliciraj/', website: 'solidus.mk', phone: '071231202',
    verifiedAt: '2026-09-20', source: 'https://solidus.mk',
    notes: 'СВТ не е објавена на сајтот (упатува на тарифник).',
  },
  {
    id: 4, slug: 'mint-sn', active: true, type: 'finance', name: 'Минт СН', logo: '🌿',
    minAmount: 6000, maxAmount: 300000, minMonths: 1, maxMonths: 30,
    interestRate: 9.0, svt: 45.0, svtVerified: false,
    applyUrl: 'https://krediti.com.mk/', website: 'krediti.com.mk', phone: '15007',
    verifiedAt: '2026-09-20', source: 'https://krediti.com.mk',
    notes: 'Рок и СВТ не се објавени на сајтот.',
  },
  {
    id: 5, slug: 'one-finance', active: true, type: 'finance', name: 'One Finance', logo: '1️⃣',
    minAmount: 15000, maxAmount: 120000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 48.0, svtVerified: false,
    applyUrl: 'https://onefinance.mk/', website: 'onefinance.mk', phone: '022720072',
    verifiedAt: '2026-09-20', source: 'https://onefinance.mk',
    notes: 'СВТ не е објавена; постои месечен надомест за администрирање. Апликацијата е на почетната страница.',
  },
  {
    id: 6, slug: 'moneymax', active: true, type: 'finance', name: 'MoneyMAX (Монимакс)', logo: '💰',
    minAmount: null, maxAmount: 250000, minMonths: 1, maxMonths: 30,
    interestRate: 10.0, svt: 50.0, svtVerified: false,
    applyUrl: 'https://moneymax.mk/', website: 'moneymax.mk', phone: '046230233',
    verifiedAt: '2026-09-20', source: 'https://moneymax.mk',
    notes: 'ФД Монимакс Финансиско ДООЕЛ Охрид. СВТ не е објавена.',
  },
  {
    id: 7, slug: 'moj-kredit', active: true, type: 'finance', name: 'Мој Кредит', logo: '🏠',
    minAmount: 3000, maxAmount: 250000, minMonths: 2, maxMonths: 120,
    interestRate: 9.0, svt: 52.0, svtVerified: false,
    applyUrl: 'https://www.mojkredit.mk/#loan-calculator', website: 'mojkredit.mk', phone: '023223309',
    verifiedAt: '2026-09-20', source: 'https://www.mojkredit.mk/',
    notes: 'СВТ не е објавена; тарифникот содржи само надоместоци за доцнење.',
  },
  {
    id: 8, slug: 'kredo-kard', active: true, type: 'finance', name: 'Кредо Кард', logo: '💳',
    minAmount: null, maxAmount: 120000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 54.0, svtVerified: false,
    applyUrl: 'https://www.kredokard.mk/#apliciraj', website: 'kredokard.mk', phone: '023243003',
    verifiedAt: '2026-09-20', source: 'https://www.kredokard.mk/opsti-uslovi',
    notes: 'Условите „се утврдуваат во договорот" — износ, рок и СВТ не се објавени; прикажани се приближни вредности.',
  },
  {
    id: 9, slug: 'flexcredit', active: true, type: 'finance', name: 'FlexCredit', logo: '🔄',
    minAmount: null, maxAmount: 600000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 55.0, svtVerified: false,
    applyUrl: 'https://flexcredit.mk/', website: 'flexcredit.mk', phone: '13505',
    verifiedAt: '2026-09-20', source: 'https://flexcredit.mk/',
    notes: 'Нуди потрошувачки кредит до 600.000 ден. Рокот и СВТ не се објавени на сајтот — прикажаните вредности се приближни.',
    internalNote: 'Сајтот блокира автоматско читање; рок и СВТ за рачна проверка.',
  },
  {
    id: 10, slug: 'crediyes', active: false, type: 'finance', name: 'CrediYES', logo: '✅',
    minAmount: 3000, maxAmount: 120000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 56.0, svtVerified: false,
    applyUrl: 'https://crediyes.mk', website: 'crediyes.mk', phone: '026147444',
    verifiedAt: '2026-09-13', source: 'https://crediyes.mk',
    notes: 'ОТСТРАНЕТО: „Креди Јес ДОО Скопје – во ликвидација".',
  },
  {
    id: 11, slug: 'fixcredit', active: true, type: 'finance', name: 'FixCredit', logo: '🔧',
    minAmount: 5000, maxAmount: 150000, minMonths: 3, maxMonths: 16,
    interestRate: 36.0, svt: 57.0, svtVerified: true,
    applyUrl: 'https://fixcredit.mk/#calculator', website: 'fixcredit.mk', phone: '025120002',
    verifiedAt: '2026-09-20', source: 'https://fixcredit.mk',
    notes: 'Реп. пример: 10.000 ден. / 3 мес. → камата 828 + адм. трошок 800 = 11.628; СВТ 57 %. Камата 3 % месечно.',
  },
  {
    id: 12, slug: 'smartkredit', active: true, type: 'finance', name: 'SmartKredit', logo: '🧠',
    minAmount: null, maxAmount: 100000, minMonths: 2, maxMonths: 12,
    interestRate: 9.0, svt: 60.0, svtVerified: false,
    applyUrl: 'https://smartkredit.mk/', website: 'smartkredit.mk', phone: '071299288',
    verifiedAt: '2026-09-20', source: 'https://smartkredit.mk/',
    notes: 'Условите се објавени само во PDF тарифник; прикажаните вредности се приближни.',
    internalNote: 'Условите се само во PDF тарифник — рачна проверка.',
  },
  {
    id: 13, slug: 'mcash', active: true, type: 'finance', name: 'М Кеш', logo: '💵',
    minAmount: 5000, maxAmount: 150000, minMonths: 1, maxMonths: 12,
    interestRate: 12.0, svt: 60.0, svtVerified: false,
    applyUrl: 'https://mcash.mk/krediti/kredit-na-rati', website: 'mcash.mk', phone: '025115000',
    verifiedAt: '2026-09-20', source: 'https://mcash.mk/tarifa',
    notes: 'Камата 12 % + „експресна обработка" 15–60 % од главнината. СВТ сведена на законскиот максимум.',
  },
  {
    id: 14, slug: 'credissimo', active: true, type: 'finance', name: 'Credissimo', logo: '🎯',
    minAmount: 3000, maxAmount: 200000, minMonths: 1, maxMonths: 6,
    interestRate: 9.0, svt: 60.0, svtVerified: true,
    applyUrl: 'https://credissimo.mk/', website: 'credissimo.mk', phone: '15020',
    verifiedAt: '2026-09-20', source: 'https://credissimo.mk/',
    notes: 'Реп. пример: 30.000 / 6 мес. → камата 792 + трошоци 3.498 = 34.290; СВТ макс. 60 %. Макс. рок не е објавен (пример 6 мес.).',
  },
  {
    id: 15, slug: 'xtracredit', active: false, type: 'finance', name: 'XtraCredit', logo: '✖️',
    minAmount: 3000, maxAmount: 300000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 60.0, svtVerified: false,
    applyUrl: 'https://xtracredit.mk', website: 'xtracredit.mk', phone: '13114',
    verifiedAt: '2026-09-13', source: 'https://xtracredit.mk',
    notes: 'ОТСТРАНЕТО: доменот пренасочува кон credissimo.mk.',
  },
  {
    id: 16, slug: 'easy-finance', active: true, type: 'finance', name: 'Easy Finance', logo: '⚡',
    minAmount: 5000, maxAmount: 50000, minMonths: 3, maxMonths: 24,
    interestRate: 23.0, svt: 48.2, svtVerified: true,
    applyUrl: 'https://easyfinance.mk/', website: 'easyfinance.mk', phone: '023113333',
    verifiedAt: '2026-09-20', source: 'https://easyfinance.mk/',
    notes: 'Реп. пример: 20.000 / 12 мес. → рата 2.050, камата 4.600, СВТ 48,20 %. Макс. износ не е потврден.',
  },

  // ───────────────────────────────── БАНКИ ─────────────────────────────────
  {
    id: 17, slug: 'komercijalna-banka', active: true, type: 'bank', name: 'Комерцијална банка', logo: '🏛️',
    minAmount: 10000, maxAmount: 2600000, minMonths: 12, maxMonths: 95,
    interestRate: 5.1, svt: 5.53, svtVerified: true,
    applyUrl: 'https://www.kb.mk/online-kredit.nspx', website: 'kb.mk', phone: '023296800',
    verifiedAt: '2026-09-20', source: 'https://www.kb.mk/online-kredit.nspx',
    notes: 'Онлајн потрошувачки кредит: 5,1 % фиксна првите 3 г., потоа 5,9 % променлива; без трошоци за одобрување. Услов: плата на сметка во банката (6 приливи); аплицирање преку мБанка + OneID. До 500.000 за вработени на определено.',
  },
  {
    id: 18, slug: 'stopanska-banka', active: true, type: 'bank', name: 'Стопанска банка', logo: '🏦',
    minAmount: 15000, maxAmount: 1500000, minMonths: 6, maxMonths: 120,
    interestRate: 5.5, svt: 9.5, svtVerified: false,
    applyUrl: 'https://www.stb.com.mk/appForm/potrosuvacki-kredit-bez-obezbeduvanje-1500000', website: 'stb.com.mk', phone: '15110',
    verifiedAt: '2026-09-20', source: 'https://www.stb.com.mk/naselenie/krediti/potroshuvacki-kredit/do-1-500-000-denari-25-000-evra/',
    notes: 'Без обезбедување до 1.500.000: 5,5 % фиксна првите 2 г. (со осигурување), потоа променлива 7,65–9,50 %. СВТ не е објавена на страницата — прикажана е променливата стапка за клиенти без плата во банката (9,50 %). Трошоци: 600 + 2.000 ден. Рок 60/84/120 мес. според износот.',
  },
  {
    id: 19, slug: 'nlb-banka', active: true, type: 'bank', name: 'НЛБ Банка', logo: '💠',
    minAmount: null, maxAmount: 600000, minMonths: 1, maxMonths: 60,
    interestRate: 9.3, svt: 10.2, svtVerified: true,
    applyUrl: 'https://www.nlb.mk/fizicki-lica/krediti/potrosuvacki-krediti/potrosuvacki-kredit', website: 'nlb.mk', phone: '0215600',
    verifiedAt: '2026-09-20', source: 'https://www.nlb.mk/fizicki-lica/krediti/potrosuvacki-krediti/potrosuvacki-kredit',
    notes: 'Реп. пример: 600.000 / 60 мес., 9,30 % фиксна, СВТ 10,20 %, ануитет 12.484, вкупно 758.954. Трошоци: 4.000 + 900 + полиса 1.000/год. За приматели и неприматели на плата.',
  },
  {
    id: 20, slug: 'halkbank', active: true, type: 'bank', name: 'Халкбанк', logo: '🔶',
    minAmount: null, maxAmount: 2500000, minMonths: 1, maxMonths: 120,
    interestRate: 5.4, svt: 5.57, svtVerified: true,
    applyUrl: 'https://www.halkbank.mk/mk-MK/krediti/potrosuvacki-krediti/do-2500000', website: 'halkbank.mk', phone: '023240800',
    verifiedAt: '2026-09-20', source: 'https://www.halkbank.mk/mk-MK/krediti/potrosuvacki-krediti/do-2500000',
    notes: 'До 2.500.000: 5,4 % фиксна (до 95 мес., СВТ 5,57 %) / 5,9 % (до 120 мес., СВТ 6,09 %), со осигурување. Трошоци: 500 + 450 ден.',
  },
  {
    id: 21, slug: 'sparkasse-banka', active: true, type: 'bank', name: 'Шпаркасе Банка', logo: '🔺',
    minAmount: null, maxAmount: 2400000, minMonths: 1, maxMonths: 95,
    interestRate: 5.1, svt: 6.16, svtVerified: true,
    applyUrl: 'https://www.sparkasse.mk/mk/forms/online-application', website: 'sparkasse.mk', phone: '023200500',
    verifiedAt: '2026-09-20', source: 'https://www.sparkasse.mk/mk/private-clients/krediti/s-plus-potroshuvachki-kredit-so-zivotno-osiguruvanje/s-plus-potroshuvachki-kredit',
    notes: 'S Plus: фиксна од 5,1 % за целиот период (со пакет-понуда), реп. пример 2.400.000 / 95 мес. со животно осигурување → СВТ 6,16 %.',
  },
  {
    id: 22, slug: 'prokredit-banka', active: true, type: 'bank', name: 'ПроКредит Банка', logo: '🟢',
    minAmount: null, maxAmount: 3000000, minMonths: 1, maxMonths: 120,
    interestRate: 5.5, svt: 6.03, svtVerified: true,
    applyUrl: 'https://www.pcb.mk/potroshuvacki-kredit.nspx', website: 'pcb.mk', phone: '023219899',
    verifiedAt: '2026-09-20', source: 'https://www.pcb.mk/potroshuvacki-kredit.nspx',
    notes: 'Промотивен потрошувачки пакет: 5,5 % фиксна за целиот период, СВТ од 6,03 %. Провизија за исплата 1 % (мин. 4.500) + апликација 1.000 ден. Апликацијата е таб на истата страница.',
  },
  {
    id: 23, slug: 'unibanka', active: true, type: 'bank', name: 'УНИБанка', logo: '🟣',
    minAmount: null, maxAmount: 2000000, minMonths: 1, maxMonths: 95,
    interestRate: 4.8, svt: 5.53, svtVerified: true,
    applyUrl: 'https://unibank.mk/mk-MK/pocetna/fizicki-lica/krediti.nspx', website: 'unibank.mk', phone: '023111111',
    verifiedAt: '2026-09-20', source: 'https://unibank.mk/mk-MK/pocetna/fizicki-lica/krediti.nspx',
    notes: 'Фиксна за целиот период од 4,8 % (без ризико осигурување, СВТ 5,53 %) или од 4,3 % (со, СВТ 5,56–5,70 %). Надомест за одобрување 1,5–2,5 %. Без жиранти до 2.000.000.',
  },
  {
    id: 24, slug: 'ttk-banka', active: true, type: 'bank', name: 'ТТК Банка', logo: '🟥',
    minAmount: 20000, maxAmount: 1200000, minMonths: 12, maxMonths: 84,
    interestRate: 5.2, svt: 6.86, svtVerified: true,
    applyUrl: 'https://www.ttk.com.mk/Web/%D0%A4%D0%98%D0%97%D0%98%D0%A7%D0%9A%D0%98_%D0%9B%D0%98%D0%A6%D0%90/%D0%9A%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B8/%D0%9A%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B8_%D0%B1%D0%B5%D0%B7_%D1%80%D0%B8%D0%B7%D0%B8%D0%BA%D0%BE_%D0%B6%D0%B8%D0%B2%D0%BE%D1%82%D0%BD%D0%BE_%D0%BE%D1%81%D0%B8%D0%B3%D1%83%D1%80%D1%83%D0%B2%D0%B0%D1%9A%D0%B5/%D0%A1%D0%9C%D0%90%D0%A0%D0%A2_%D0%BF%D0%BE%D1%82%D1%80%D0%BE%D1%88%D1%83%D0%B2%D0%B0%D1%87%D0%BA%D0%B8_%D0%BA%D1%80%D0%B5%D0%B4%D0%B8%D1%82.aspx', website: 'ttk.com.mk', phone: '023247000',
    verifiedAt: '2026-09-20', source: 'https://www.ttk.com.mk/',
    notes: 'СМАРТ потрошувачки кредит: 5,20 % фиксна првите 2 г., потоа 7,85 % променлива; реп. пример 400.000 / 60 мес. → СВТ 6,86 %. Трошоци: 600 + 1 % (2.000–4.000) + меница 500. Услов: плата/пензија преку ТТК.',
  },
  {
    id: 25, slug: 'centralna-kooperativna-banka', active: true, type: 'bank', name: 'Централна кооперативна банка', logo: '🟩',
    minAmount: null, maxAmount: 1500000, minMonths: 1, maxMonths: 95,
    interestRate: 6.1, svt: 7.16, svtVerified: true,
    applyUrl: 'https://www.ccbank.mk/AplikacijaZaKredit.aspx', website: 'ccbank.mk', phone: '023249300',
    verifiedAt: '2026-09-20', source: 'https://www.ccbank.mk/',
    notes: 'Стандарден потрошувачки кредит: 6,10 % фиксна првата година, потоа 7,25 % променлива; СВТ 7,16 % (редовни услови; промотивно 5,67 %). Надомест за документација 1.500 ден. До 1.000.000 за клиенти надвор од листата на банката.',
  },
  {
    id: 26, slug: 'silk-road-banka', active: true, type: 'bank', name: 'Силк Роуд Банка', logo: '🟠',
    minAmount: null, maxAmount: 1500000, minMonths: 6, maxMonths: 95,
    interestRate: 5.95, svt: 6.17, svtVerified: true,
    applyUrl: 'https://www.srb.mk/KreditiPotrosuvacki', website: 'srb.mk', phone: '023250000',
    verifiedAt: '2026-09-20', source: 'https://www.srb.mk/KreditiPotrosuvacki',
    notes: 'Фикс Премиум: 5,95 % фиксна за целиот период (СВТ 6,17 %) без полиса; 5,45 % (СВТ 5,64 %) со осигурување. Надомест 800 ден. Услов: плата/пензија во банката.',
  },
  {
    id: 27, slug: 'mbank', active: true, type: 'bank', name: 'mBank (Капитал банка)', logo: '🔵',
    minAmount: null, maxAmount: 2000000, minMonths: 1, maxMonths: 84,
    interestRate: 5.5, svt: 5.5, svtVerified: false,
    applyUrl: 'https://mbank.mk/loans', website: 'mbank.mk', phone: '023102462',
    verifiedAt: '2026-09-20', source: 'https://mbank.mk/loans',
    notes: '5,5 % фиксна за целиот период (МКД и ЕУР); СВТ и надоместоци не се објавени — прикажана е номиналната стапка. До 900.000 без нотар, жиранти и кокредитобарател.',
  },
  {
    id: 28, slug: 'alta-banka', active: true, type: 'bank', name: 'АЛТА банка', logo: '⬛',
    minAmount: null, maxAmount: 2000000, minMonths: 1, maxMonths: 120,
    interestRate: 6.1, svt: 6.1, svtVerified: false,
    applyUrl: 'https://www.altabanka.com.mk/platen-promet-vo-zemjata-fizicki-lica.nspx/kreditiranje-na-naselenie/potroshuvacki-krediti-paketi/paket-za-vraboteni-vo-privatni-firmi/kredit-za-vraboteni-vo-privatni-firmi.nspx', website: 'altabanka.com.mk', phone: '023087007',
    verifiedAt: '2026-09-20', source: 'https://www.altabanka.com.mk/',
    notes: 'Поранешна Стопанска банка Битола. Кредит за вработени во приватни фирми: 6,10 % фиксна (95 мес.) / 6,30 % (120 мес.) без ризико; 5,70/5,90 % со. Трошоци: 800 + 5.000 ден. СВТ не е објавена — прикажана е номиналната стапка.',
  },

  // ─────────────────────────────── ШТЕДИЛНИЦИ ───────────────────────────────
  {
    id: 29, slug: 'shtedilnica-moznosti', active: true, type: 'savings', name: 'Штедилница Можности', logo: '🟤',
    minAmount: null, maxAmount: 1500000, minMonths: 1, maxMonths: 132,
    interestRate: 5.7, svt: 10.79, svtVerified: true,
    applyUrl: 'https://moznosti.com.mk/oficijalno-online-baranje/', website: 'moznosti.com.mk', phone: '023401060',
    verifiedAt: '2026-09-20', source: 'https://moznosti.com.mk/credit/potrosuvacki-kredit-mkd/',
    notes: 'Потрошувачки кредит: 5,7 % фиксна + манипулативен 1 % + провизија за управување 0,353–0,400 % месечно; реп. пример 240.000 / 95 мес. → СВТ 10,788 % (сајтот наведува и „од 13,88 %"). Целна група: вработени во АД, буџет, ЈП и прифатливи ДОО.',
  },
];

export const activeInstitutions = financialInstitutions.filter(i => i.active);
export const typeLabel = (t) => TYPE_LABELS[t] || TYPE_LABELS.finance;

// Проверка на конзистентност — паѓа при build ако податоците се невалидни
for (const i of financialInstitutions) {
  if (i.svt > SVT_LEGAL_MAX) throw new Error(`${i.name}: svt ${i.svt} > законски максимум ${SVT_LEGAL_MAX}`);
  if (i.minAmount != null && i.minAmount > i.maxAmount) throw new Error(`${i.name}: minAmount > maxAmount`);
  if (i.minMonths > i.maxMonths) throw new Error(`${i.name}: minMonths > maxMonths`);
  if (!/^https?:\/\//.test(i.applyUrl)) throw new Error(`${i.name}: невалиден applyUrl`);
  if (!TYPE_LABELS[i.type]) throw new Error(`${i.name}: непознат type ${i.type}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(i.slug || '')) throw new Error(`${i.name}: невалиден slug`);
}
if (new Set(financialInstitutions.map(i => i.slug)).size !== financialInstitutions.length) {
  throw new Error('slug мора да биде единствен за секој давател');
}
