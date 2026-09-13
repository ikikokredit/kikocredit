// ============================================================================
//  Финансиски друштва — единствен извор на податоци за споредбата на kikocredit.com
// ----------------------------------------------------------------------------
//  Последна проверка: 13.09.2026 (види CLAUDE.md за постапката на проверка)
//
//  Полиња:
//    id            – стабилен идентификатор (не се менува, се користи во базата)
//    active        – false = не се прикажува (друштвото не постои / не работи)
//    minAmount / maxAmount   – износ во денари
//    minMonths / maxMonths   – рок во месеци
//    interestRate  – номинална годишна каматна стапка (%), само информативно
//    svt           – стапка на вкупни трошоци (%) — СЕ КОРИСТИ ВО ПРЕСМЕТКАТА
//    svtVerified   – true само ако СВТ е прочитана од сајтот/репрезентативен пример
//    verifiedAt    – датум на последна проверка (ISO)
//    source        – страница од која се проверени податоците
//    notes         – што не можело да се потврди / што треба рачно да се провери
// ============================================================================

export const DATA_UPDATED = '2026-09-13';
export const DATA_UPDATED_LABEL = 'Септември 2026';

// Законски максимум на вкупните трошоци што го наведуваат самите друштва
// (FixCredit, Credissimo, Мој Кредит): 60 %. Ниедна СВТ не смее да е над ова.
export const SVT_LEGAL_MAX = 60;

export const financialInstitutions = [
  {
    id: 1, active: true, name: 'Иуте Кредит', logo: '⚡', type: 'finance',
    minAmount: 6000, maxAmount: 300000, minMonths: 2, maxMonths: 60,
    interestRate: 12.25, svt: 34.5, svtVerified: false,
    email: 'info@iutecredit.mk', phone: '13333', website: 'iute.mk',
    verifiedAt: '2026-09-13', source: 'https://iute.mk/en/pricelist/',
    notes: 'Нови клиенти до 300.000, повторни до 600.000. СВТ 34,5 % важи за „Иуте Премиум“ (вработени во партнерски фирми); стандардна СВТ не е објавена.',
  },
  {
    id: 2, active: true, name: 'Тиго Фајнанс', logo: '🐯', type: 'finance',
    minAmount: 500, maxAmount: 720000, minMonths: 3, maxMonths: 72,
    interestRate: 3.5, svt: 38.0, svtVerified: false,
    email: 'info@tigo.mk', phone: '13700', website: 'tigo.mk',
    verifiedAt: '2026-09-13', source: 'https://www.tigo.mk/info/kredit-na-rati',
    notes: 'СВТ и камата се само во PDF тарифник (важи од 13.05.2026) — за рачна проверка.',
  },
  {
    id: 3, active: true, name: 'Солидус', logo: '🔷', type: 'finance',
    minAmount: 10000, maxAmount: 180000, minMonths: 1, maxMonths: 48,
    interestRate: 9.0, svt: 40.0, svtVerified: false,
    email: 'info@solidus.mk', phone: '071231202', website: 'solidus.mk',
    verifiedAt: '2026-09-13', source: 'https://solidus.mk',
    notes: 'СВТ не е објавена на сајтот (упатува на тарифник).',
  },
  {
    id: 4, active: true, name: 'Минт СН', logo: '🌿', type: 'finance',
    minAmount: 6000, maxAmount: 300000, minMonths: 1, maxMonths: 30,
    interestRate: 9.0, svt: 45.0, svtVerified: false,
    email: 'info@mintsn.mk', phone: '15007', website: 'mintsn.mk',
    verifiedAt: '2026-09-13', source: 'https://krediti.com.mk',
    notes: 'Рок и СВТ не се објавени на сајтот.',
  },
  {
    id: 5, active: true, name: 'One Finance', logo: '1️⃣', type: 'finance',
    minAmount: 15000, maxAmount: 120000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 48.0, svtVerified: false,
    email: 'info@onefinance.mk', phone: '022720072', website: 'onefinance.mk',
    verifiedAt: '2026-09-13', source: 'https://onefinance.mk',
    notes: 'СВТ не е објавена; постои месечен надомест за администрирање.',
  },
  {
    id: 6, active: true, name: 'MoneyMAX (Монимакс)', logo: '💰', type: 'finance',
    minAmount: 1000, maxAmount: 250000, minMonths: 1, maxMonths: 30,
    interestRate: 10.0, svt: 50.0, svtVerified: false,
    email: '', phone: '', website: 'moneymax.mk',
    verifiedAt: '2026-09-13', source: 'https://moneymax.mk',
    notes: 'ФД Монимакс Финансиско ДООЕЛ Охрид. brzkredit.com не работи и припаѓа на друго друштво (ФКЦ БС). E-mail/телефон за потврда.',
  },
  {
    id: 7, active: true, name: 'Мој Кредит', logo: '🏠', type: 'finance',
    minAmount: 3000, maxAmount: 250000, minMonths: 2, maxMonths: 120,
    interestRate: 9.0, svt: 52.0, svtVerified: false,
    email: 'office@mojkredit.mk', phone: '023223309', website: 'mojkredit.mk',
    verifiedAt: '2026-09-13', source: 'https://www.mojkredit.mk/',
    notes: 'СВТ не е објавена; тарифникот содржи само надоместоци за доцнење (макс. 60 % од кредитот).',
  },
  {
    id: 8, active: true, name: 'Кредо Кард', logo: '💳', type: 'finance',
    minAmount: 1000, maxAmount: 120000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 54.0, svtVerified: false,
    email: 'fdkredokard@gmail.com', phone: '023243003', website: 'kredokard.mk',
    verifiedAt: '2026-09-13', source: 'https://www.kredokard.mk/opsti-uslovi',
    notes: 'Условите „се утврдуваат во договорот“ — износ, рок и СВТ не се објавени.',
  },
  {
    id: 9, active: true, name: 'FlexCredit', logo: '🔄', type: 'finance',
    minAmount: 1000, maxAmount: 600000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 55.0, svtVerified: false,
    email: 'info@flexcredit.mk', phone: '13505', website: 'flexcredit.mk',
    verifiedAt: '2026-09-13', source: 'https://flexcredit.mk/',
    notes: 'Сајтот блокира автоматско читање; насловот вели „потрошувачки кредит до 600.000“. Рок и СВТ за рачна проверка.',
  },
  {
    id: 10, active: false, name: 'CrediYES', logo: '✅', type: 'finance',
    minAmount: 3000, maxAmount: 120000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 56.0, svtVerified: false,
    email: 'info@credi-yes.com', phone: '026147444', website: 'crediyes.mk',
    verifiedAt: '2026-09-13', source: 'https://crediyes.mk',
    notes: 'ОТСТРАНЕТО: „Креди Јес ДОО Скопје – во ликвидација“.',
  },
  {
    id: 11, active: true, name: 'FixCredit', logo: '🔧', type: 'finance',
    minAmount: 5000, maxAmount: 150000, minMonths: 3, maxMonths: 16,
    interestRate: 36.0, svt: 57.0, svtVerified: true,
    email: 'info@fixcredit.mk', phone: '025120002', website: 'fixcredit.mk',
    verifiedAt: '2026-09-13', source: 'https://fixcredit.mk',
    notes: 'Репрезентативен пример: 10.000 ден. / 3 мес. → камата 828 + адм. трошок 800 = 11.628; СВТ 57 %. Камата 3 % месечно.',
  },
  {
    id: 12, active: true, name: 'SmartKredit', logo: '🧠', type: 'finance',
    minAmount: 1000, maxAmount: 100000, minMonths: 2, maxMonths: 12,
    interestRate: 9.0, svt: 60.0, svtVerified: false,
    email: 'info@smartkredit.mk', phone: '071299288', website: 'smartkredit.mk',
    verifiedAt: '2026-09-13', source: 'https://smartkredit.mk/',
    notes: 'Условите се само во PDF тарифник — рачна проверка.',
  },
  {
    id: 13, active: true, name: 'М Кеш', logo: '💵', type: 'finance',
    minAmount: 5000, maxAmount: 150000, minMonths: 1, maxMonths: 12,
    interestRate: 12.0, svt: 60.0, svtVerified: false,
    email: 'office@mcash.mk', phone: '025115000', website: 'mcash.mk',
    verifiedAt: '2026-09-13', source: 'https://mcash.mk/tarifa',
    notes: 'Камата 12 % + „експресна обработка“ 15–60 % од главнината. Порано стоеше СВТ 65,8 % (над законскиот максимум) — сведено на 60 %.',
  },
  {
    id: 14, active: true, name: 'Credissimo', logo: '🎯', type: 'finance',
    minAmount: 3000, maxAmount: 200000, minMonths: 1, maxMonths: 6,
    interestRate: 9.0, svt: 60.0, svtVerified: true,
    email: 'support@credissimo.mk', phone: '15020', website: 'credissimo.mk',
    verifiedAt: '2026-09-13', source: 'https://credissimo.mk/',
    notes: 'Реп. пример: 30.000 / 6 мес. → камата 792 + трошоци 3.498 = 34.290 (рата 5.715); СВТ макс. 60 %. Макс. рок не е објавен (пример 6 мес.).',
  },
  {
    id: 15, active: false, name: 'XtraCredit', logo: '✖️', type: 'finance',
    minAmount: 3000, maxAmount: 300000, minMonths: 1, maxMonths: 24,
    interestRate: 9.0, svt: 60.0, svtVerified: false,
    email: 'support@xtracredit.mk', phone: '13114', website: 'xtracredit.mk',
    verifiedAt: '2026-09-13', source: 'https://xtracredit.mk',
    notes: 'ОТСТРАНЕТО: доменот пренасочува кон credissimo.mk — брендот не постои самостојно.',
  },
  {
    id: 16, active: true, name: 'Easy Finance', logo: '⚡', type: 'finance',
    minAmount: 5000, maxAmount: 50000, minMonths: 3, maxMonths: 24,
    interestRate: 23.0, svt: 48.2, svtVerified: true,
    email: 'info@easyfinance.mk', phone: '023113333', website: 'easyfinance.mk',
    verifiedAt: '2026-09-13', source: 'https://easyfinance.mk/',
    notes: 'Реп. пример: 20.000 / 12 мес. → рата 2.050, камата 4.600, СВТ 48,20 %. Макс. износ не е потврден (калкулатор).',
  },
];

export const activeInstitutions = financialInstitutions.filter(i => i.active);

// Едноставна проверка на конзистентност — паѓа при build ако податоците се невалидни
for (const i of financialInstitutions) {
  if (i.svt > SVT_LEGAL_MAX) throw new Error(`${i.name}: svt ${i.svt} > законски максимум ${SVT_LEGAL_MAX}`);
  if (i.minAmount > i.maxAmount) throw new Error(`${i.name}: minAmount > maxAmount`);
  if (i.minMonths > i.maxMonths) throw new Error(`${i.name}: minMonths > maxMonths`);
}
