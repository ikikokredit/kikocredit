// ============================================================================
//  Пресметка на кредит — заедничка за сајтот (App.jsx) и за статичните страници
//  (scripts/prerender.mjs), за да даваат ист резултат.
// ============================================================================

export const calculateLoan = (amount, monthlyPayment, svt) => {
  const monthlyRate = svt / 100 / 12;
  if (monthlyPayment <= amount * monthlyRate) return null;

  let balance = amount;
  let totalInterest = 0;
  let months = 0;
  let lastPayment = 0;

  while (balance > 0 && months < 360) {
    months++;
    const interestThisMonth = balance * monthlyRate;
    totalInterest += interestThisMonth;

    if (balance + interestThisMonth <= monthlyPayment) {
      lastPayment = balance + interestThisMonth;
      balance = 0;
    } else {
      const principalThisMonth = monthlyPayment - interestThisMonth;
      balance -= principalThisMonth;
    }
  }

  const totalPayment = (months - 1) * monthlyPayment + lastPayment;

  return {
    months,
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    lastPayment: Math.round(lastPayment)
  };
};

// Ист формат како во прелистувачот, но без зависност од локалните податоци
// (Node при build може да нема „mk-MK"): 1234567 → „1.234.567 ден."
export const formatNumber = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const formatMKD = (amount) => formatNumber(amount) + ' ден.';

// Процент со децимална запирка (не зависи од локалните податоци на прелистувачот)
export const formatPct = (v) => {
  const n = Math.round(v * 100) / 100;
  let s = n.toFixed(n * 10 % 1 === 0 ? 1 : 2);
  return s.replace('.', ',') + ' %';
};
