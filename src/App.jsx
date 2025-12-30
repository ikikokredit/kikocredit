import React, { useState, useEffect } from 'react';

// Financial institutions data - December 2025
const financialInstitutions = [
  { id: 1, name: 'Иуте Кредит', svt: 34.5, interestRate: 2.9, logo: '⚡', type: 'finance', maxAmount: 600000, maxMonths: 60, email: 'info@iutecredit.mk', phone: '13333', website: 'iute.mk' },
  { id: 2, name: 'Тиго Фајнанс', svt: 38.0, interestRate: 3.5, logo: '🐯', type: 'finance', maxAmount: 300000, maxMonths: 24, email: 'info@tigo.mk', phone: '13700', website: 'tigo.mk' },
  { id: 3, name: 'Солидус', svt: 40.0, interestRate: 9.0, logo: '🔷', type: 'finance', maxAmount: 300000, maxMonths: 36, email: 'info@solidus.mk', phone: '', website: 'solidus.mk' },
  { id: 4, name: 'Минт СН', svt: 45.0, interestRate: 9.0, logo: '🌿', type: 'finance', maxAmount: 300000, maxMonths: 30, email: 'info@krediti.com.mk', phone: '15007', website: 'krediti.com.mk' },
  { id: 5, name: 'One Finance', svt: 48.0, interestRate: 9.0, logo: '1️⃣', type: 'finance', maxAmount: 120000, maxMonths: 24, email: 'info@onefinance.mk', phone: '', website: 'onefinance.mk' },
  { id: 6, name: 'Монимакс (brzkredit)', svt: 50.0, interestRate: 10.0, logo: '💰', type: 'finance', maxAmount: 250000, maxMonths: 30, email: 'info@brzkredit.com', phone: '', website: 'brzkredit.com' },
  { id: 7, name: 'Мој Кредит', svt: 52.0, interestRate: 9.0, logo: '🏠', type: 'finance', maxAmount: 250000, maxMonths: 120, email: 'info@mojkredit.mk', phone: '', website: 'mojkredit.mk' },
  { id: 8, name: 'Кредо Кард', svt: 54.0, interestRate: 9.0, logo: '💳', type: 'finance', maxAmount: 120000, maxMonths: 24, email: 'fdkredokard@gmail.com', phone: '023243003', website: 'kredo.mk' },
  { id: 9, name: 'FlexCredit', svt: 55.0, interestRate: 9.0, logo: '🔄', type: 'finance', maxAmount: 150000, maxMonths: 24, email: 'info@flexcredit.mk', phone: '13505', website: 'flexcredit.mk' },
  { id: 10, name: 'CrediYES', svt: 56.0, interestRate: 9.0, logo: '✅', type: 'finance', maxAmount: 120000, maxMonths: 24, email: 'info@crediyes.mk', phone: '026147444', website: 'crediyes.mk' },
  { id: 11, name: 'FixCredit', svt: 58.0, interestRate: 0.0, logo: '🔧', type: 'finance', maxAmount: 150000, maxMonths: 24, email: 'info@fixcredit.mk', phone: '044521005', website: 'fixcredit.mk' },
  { id: 12, name: 'SmartKredit', svt: 60.0, interestRate: 9.0, logo: '🧠', type: 'finance', maxAmount: 100000, maxMonths: 12, email: 'info@smartkredit.mk', phone: '071299288', website: 'smartkredit.mk' },
  { id: 13, name: 'М Кеш', svt: 65.8, interestRate: 12.0, logo: '💵', type: 'finance', maxAmount: 100000, maxMonths: 12, email: 'office@mcash.mk', phone: '025115000', website: 'mcash.mk' },
  { id: 14, name: 'Credissimo', svt: 66.75, interestRate: 9.0, logo: '🎯', type: 'finance', maxAmount: 30000, maxMonths: 6, email: 'support@credissimo.mk', phone: '15020', website: 'credissimo.mk' },
  { id: 15, name: 'XtraCredit', svt: 66.75, interestRate: 9.0, logo: '✖️', type: 'finance', maxAmount: 300000, maxMonths: 24, email: 'support@xtracredit.mk', phone: '13114', website: 'xtracredit.mk' },
  { id: 16, name: 'Easy Finance', svt: 69.6, interestRate: 0.0, logo: '⚡', type: 'finance', maxAmount: 50000, maxMonths: 12, email: 'info@easyfinance.mk', phone: '', website: 'easyfinance.mk' },
];

const calculateLoan = (amount, monthlyPayment, svt) => {
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

const formatMKD = (amount) => {
  return new Intl.NumberFormat('mk-MK').format(amount) + ' ден.';
};

// Admin Panel Component
const AdminPanel = ({ applications, onBack }) => {
  const [filter, setFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredApplications = applications.filter(app => {
    if (filter !== 'all' && app.institutionId !== parseInt(filter)) return false;
    if (dateFrom && new Date(app.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(app.date) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const stats = financialInstitutions.map(inst => {
    const count = filteredApplications.filter(app => app.institutionId === inst.id).length;
    return {
      ...inst,
      count,
      revenue: count * 100
    };
  }).filter(s => s.count > 0);

  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0);

  const exportData = () => {
    let csv = 'Институција,Број на апликации,Приход (ден.)\n';
    stats.forEach(s => {
      csv += `${s.name},${s.count},${s.revenue}\n`;
    });
    csv += `\nВКУПНО,${filteredApplications.length},${totalRevenue}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kikocredit-izvestaj-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div style={adminStyles.container}>
      <header style={adminStyles.header}>
        <button onClick={onBack} style={adminStyles.backButton}>← Назад</button>
        <h1 style={adminStyles.title}>🦊 KikoCredit Админ</h1>
      </header>

      {/* Stats Cards */}
      <div style={adminStyles.statsGrid}>
        <div style={adminStyles.statCard}>
          <span style={adminStyles.statNumber}>{filteredApplications.length}</span>
          <span style={adminStyles.statLabel}>Апликации</span>
        </div>
        <div style={adminStyles.statCardHighlight}>
          <span style={adminStyles.statNumber}>{formatMKD(totalRevenue)}</span>
          <span style={adminStyles.statLabel}>Приход</span>
        </div>
      </div>

      {/* Filters */}
      <div style={adminStyles.filterSection}>
        <h3 style={adminStyles.filterTitle}>Филтри</h3>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={adminStyles.select}
        >
          <option value="all">Сите институции</option>
          {financialInstitutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>

        <div style={adminStyles.dateFilters}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={adminStyles.dateInput}
          />
          <span style={{color: 'white'}}>до</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={adminStyles.dateInput}
          />
        </div>
      </div>

      {/* Stats by Institution */}
      <div style={adminStyles.section}>
        <div style={adminStyles.sectionHeader}>
          <h3 style={adminStyles.sectionTitle}>Апликации по институција</h3>
          <button onClick={exportData} style={adminStyles.exportButton}>
            📥 Експорт CSV
          </button>
        </div>
        
        {stats.length === 0 ? (
          <p style={adminStyles.noData}>Нема апликации за избраниот период</p>
        ) : (
          stats.map(s => (
            <div key={s.id} style={adminStyles.institutionRow}>
              <div style={adminStyles.institutionInfo}>
                <span style={adminStyles.institutionLogo}>{s.logo}</span>
                <span style={adminStyles.institutionName}>{s.name}</span>
              </div>
              <div style={adminStyles.institutionStats}>
                <span style={adminStyles.countBadge}>{s.count} апл.</span>
                <span style={adminStyles.revenueBadge}>{formatMKD(s.revenue)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Applications List */}
      <div style={adminStyles.section}>
        <h3 style={adminStyles.sectionTitle}>Листа на апликации</h3>
        
        {filteredApplications.length === 0 ? (
          <p style={adminStyles.noData}>Нема апликации</p>
        ) : (
          filteredApplications.slice().reverse().map(app => (
            <div key={app.id} style={adminStyles.applicationCard}>
              <div style={adminStyles.appHeader}>
                <span style={adminStyles.appInstitution}>{app.institution}</span>
                <span style={adminStyles.appDate}>
                  {new Date(app.date).toLocaleDateString('mk-MK')} {new Date(app.date).toLocaleTimeString('mk-MK', {hour: '2-digit', minute: '2-digit'})}
                </span>
              </div>
              <div style={adminStyles.appDetails}>
                <p><strong>👤</strong> {app.customer.firstName} {app.customer.lastName}</p>
                <p><strong>📞</strong> {app.customer.phone}</p>
                <p><strong>💰</strong> {formatMKD(app.amount)} • {app.months} рати</p>
                <p><strong>💵</strong> Примања: {app.customer.salary}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CustomerView = ({ onSubmitApplication, onAdminClick }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [results, setResults] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    salary: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleCalculate = () => {
    const amt = parseFloat(amount);
    const payment = parseFloat(monthlyPayment);
    
    if (!amt || !payment || amt <= 0 || payment <= 0) {
      alert('Ве молиме внесете валидни вредности');
      return;
    }

    const calculatedResults = financialInstitutions
      .map(inst => {
        if (amt > inst.maxAmount) return null;
        
        const loanDetails = calculateLoan(amt, payment, inst.svt);
        if (!loanDetails) return null;
        if (loanDetails.months > inst.maxMonths) return null;
        
        return {
          ...inst,
          ...loanDetails
        };
      })
      .filter(r => r !== null)
      .sort((a, b) => a.totalInterest - b.totalInterest);

    if (calculatedResults.length === 0) {
      alert('Месечната рата е премала за бараниот износ. Ве молиме зголемете ја ратата.');
      return;
    }

    setResults(calculatedResults);
    setStep(2);
  };

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
    setStep(3);
  };

  const handleSubmit = () => {
    if (!customerData.firstName || !customerData.lastName || !customerData.phone || !customerData.salary) {
      alert('Ве молиме пополнете ги сите полиња');
      return;
    }

    const application = {
      id: Date.now(),
      date: new Date().toISOString(),
      customer: customerData,
      amount: parseFloat(amount),
      monthlyPayment: parseFloat(monthlyPayment),
      institution: selectedOffer.name,
      institutionId: selectedOffer.id,
      institutionEmail: selectedOffer.email,
      months: selectedOffer.months,
      totalInterest: selectedOffer.totalInterest,
      totalPayment: selectedOffer.totalPayment,
      status: 'Испратена'
    };

    sendEmailToInstitution(application, selectedOffer);
    sendToGoogleSheets(application, selectedOffer);
    
    onSubmitApplication(application);
    setSubmitted(true);
    setStep(4);
  };

  const sendToGoogleSheets = async (application, offer) => {
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby2PNuRnoVSAhjJl5uPDKaYo9jqnXgxO2mJ-JgRNOyuaTmTnh--MBSCeDFiAYx80VecUg/exec';
    
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: application.customer.firstName,
          lastName: application.customer.lastName,
          phone: application.customer.phone,
          salary: application.customer.salary,
          amount: application.amount,
          monthlyPayment: application.monthlyPayment,
          institution: offer.name,
          institutionEmail: offer.email
        })
      });
      console.log('✅ Data sent to Google Sheets');
    } catch (error) {
      console.error('❌ Google Sheets error:', error);
    }
  };

  const sendEmailToInstitution = async (application, offer) => {
    const EMAILJS_SERVICE_ID = 'service_3u4ug0c';
    const EMAILJS_TEMPLATE_ID = 'template_mib4nae';
    const EMAILJS_PUBLIC_KEY = 'jK-ZcW9KXBg_3515a';

    const templateParams = {
      to_email: offer.email,
      to_name: offer.name,
      from_name: 'KikoCredit.com',
      customer_name: `${application.customer.firstName} ${application.customer.lastName}`,
      customer_phone: application.customer.phone,
      customer_salary: application.customer.salary,
      loan_amount: formatMKD(application.amount),
      monthly_payment: formatMKD(application.monthlyPayment),
      num_installments: offer.months,
      total_cost: formatMKD(offer.totalInterest),
      total_payment: formatMKD(offer.totalPayment),
      application_id: `KK-${Date.now()}`,
      application_date: new Date().toLocaleString('mk-MK')
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: templateParams
        })
      });
      
      if (response.ok) {
        console.log('✅ Email sent to:', offer.email);
      } else {
        console.error('❌ Email failed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Email error:', error);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setMonthlyPayment('');
    setResults([]);
    setSelectedOffer(null);
    setCustomerData({ firstName: '', lastName: '', phone: '', salary: '' });
    setSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>🦊</span>
          <h1 style={styles.brandName}>Кико</h1>
        </div>
        <p style={styles.tagline}>Најди го најдобриот кредит за тебе</p>
        <button onClick={onAdminClick} style={styles.adminButton}>
          ⚙️
        </button>
      </header>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${(step / 4) * 100}%`}}></div>
        </div>
        <div style={styles.progressSteps}>
          <span style={step >= 1 ? styles.activeStep : styles.inactiveStep}>Износ</span>
          <span style={step >= 2 ? styles.activeStep : styles.inactiveStep}>Понуди</span>
          <span style={step >= 3 ? styles.activeStep : styles.inactiveStep}>Податоци</span>
          <span style={step >= 4 ? styles.activeStep : styles.inactiveStep}>Готово</span>
        </div>
      </div>

      {step === 1 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Колку ти треба?</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Износ на кредит (ден.)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="пр. 50000"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Месечна рата која можеш да ја плаќаш (ден.)</label>
            <input
              type="number"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              placeholder="пр. 5000"
              style={styles.input}
            />
          </div>

          <button onClick={handleCalculate} style={styles.primaryButton}>
            Пресметај понуди 📊
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={styles.resultsContainer}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryText}>
              За <strong>{formatMKD(parseFloat(amount))}</strong> со рата од <strong>{formatMKD(parseFloat(monthlyPayment))}</strong>
            </p>
          </div>

          <div style={styles.disclaimerCard}>
            <span style={styles.disclaimerIcon}>ℹ️</span>
            <p style={styles.disclaimerText}>
              Понудите се подредени по <strong>најнизок вкупен трошок</strong>.
              Конечните услови се договараат директно со институцијата.
              <br/><small style={{opacity: 0.7}}>Ажурирано: Декември 2025</small>
            </p>
          </div>

          <h2 style={styles.sectionTitle}>Достапни понуди</h2>
          
          {results.map((offer, index) => (
            <div 
              key={offer.id} 
              style={{
                ...styles.offerCard,
                ...(index === 0 ? styles.bestOffer : {})
              }}
              onClick={() => handleSelectOffer(offer)}
            >
              {index === 0 && <span style={styles.bestBadge}>⭐ Најповолно</span>}
              
              <div style={styles.offerHeader}>
                <span style={styles.institutionLogo}>{offer.logo}</span>
                <div>
                  <span style={styles.institutionName}>{offer.name}</span>
                  <span style={styles.financeBadge}>
                    💳 Фин. друштво
                  </span>
                </div>
              </div>
              
              <div style={styles.offerDetails}>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Износ</span>
                  <span style={styles.detailValue}>{formatMKD(parseFloat(amount))}</span>
                </div>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Рата</span>
                  <span style={styles.detailValue}>{formatMKD(parseFloat(monthlyPayment))}</span>
                </div>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Бр. рати</span>
                  <span style={styles.detailValue}>{offer.months}</span>
                </div>
                <div style={styles.offerDetail}>
                  <span style={styles.detailLabel}>Вк. трошок</span>
                  <span style={styles.detailValueHighlight}>{formatMKD(offer.totalInterest)}</span>
                </div>
              </div>
              
              <div style={styles.totalRow}>
                <span>Вкупно за враќање:</span>
                <span style={styles.totalAmount}>{formatMKD(offer.totalPayment)}</span>
              </div>
              
              <button style={styles.selectButton}>
                Избери →
              </button>
            </div>
          ))}

          <button onClick={() => setStep(1)} style={styles.backButton}>
            ← Назад
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Твои податоци</h2>
          
          <div style={styles.selectedOfferMini}>
            <span>{selectedOffer.logo} {selectedOffer.name}</span>
            <span>{formatMKD(parseFloat(amount))} • {selectedOffer.months} рати</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Име</label>
            <input
              type="text"
              value={customerData.firstName}
              onChange={(e) => setCustomerData({...customerData, firstName: e.target.value})}
              placeholder="Вашето име"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Презиме</label>
            <input
              type="text"
              value={customerData.lastName}
              onChange={(e) => setCustomerData({...customerData, lastName: e.target.value})}
              placeholder="Вашето презиме"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Телефон</label>
            <input
              type="tel"
              value={customerData.phone}
              onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
              placeholder="07X XXX XXX"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Месечни примања</label>
            <select
              value={customerData.salary}
              onChange={(e) => setCustomerData({...customerData, salary: e.target.value})}
              style={styles.input}
            >
              <option value="">Избери...</option>
              <option value="до 15.000">до 15.000 ден</option>
              <option value="15.000 - 25.000">15.000 - 25.000 ден</option>
              <option value="25.000 - 40.000">25.000 - 40.000 ден</option>
              <option value="40.000 - 60.000">40.000 - 60.000 ден</option>
              <option value="над 60.000">над 60.000 ден</option>
            </select>
          </div>

          <button onClick={handleSubmit} style={styles.primaryButton}>
            Испрати барање ✉️
          </button>

          <button onClick={() => setStep(2)} style={styles.backButton}>
            ← Назад
          </button>
        </div>
      )}

      {step === 4 && (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Барањето е испратено!</h2>
          <p style={styles.successText}>
            Твоето барање е испратено до <strong>{selectedOffer.name}</strong>.
            Очекувај повик од нивни претставник наскоро.
          </p>
          
          <div style={styles.successDetails}>
            <p><strong>Износ:</strong> {formatMKD(parseFloat(amount))}</p>
            <p><strong>Месечна рата:</strong> {formatMKD(parseFloat(monthlyPayment))}</p>
            <p><strong>Период:</strong> {selectedOffer.months} рати</p>
          </div>

          <div style={styles.disclaimerCardSuccess}>
            <p style={styles.disclaimerTextSmall}>
              ⚠️ Оваа пресметка е информативна. Финалните услови (камата, период, рата) 
              ќе бидат договорени директно со {selectedOffer.name}.
            </p>
          </div>

          <button onClick={resetForm} style={styles.primaryButton}>
            Нова пресметка 🔄
          </button>
        </div>
      )}

      <footer style={styles.footer}>
        <p>© 2025 KikoCredit.com - Твој кредитен советник</p>
      </footer>
    </div>
  );
};

export default function KikoApp() {
  const [view, setView] = useState('customer');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('kikocredit_applications');
    if (saved) {
      setApplications(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kikocredit_applications', JSON.stringify(applications));
  }, [applications]);

  const handleSubmitApplication = (application) => {
    setApplications([...applications, application]);
    console.log('📧 Email sent to:', application.institution);
  };

  const handleAdminClick = () => {
    const password = prompt('🔐 Внеси лозинка за админ пристап:');
    if (password === 'Overath2810') {
      setView('admin');
    } else if (password !== null) {
      alert('❌ Погрешна лозинка!');
    }
  };

  return (
    <div style={styles.app}>
      {view === 'customer' ? (
        <CustomerView 
          onSubmitApplication={handleSubmitApplication}
          onAdminClick={handleAdminClick}
        />
      ) : (
        <AdminPanel 
          applications={applications}
          onBack={() => setView('customer')}
        />
      )}
    </div>
  );
}

// Customer styles
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
    marginBottom: '20px',
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
    cursor: 'pointer',
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
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  selectedOfferMini: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f0f4ff',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  successCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '40px 24px',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
  },
  successDetails: {
    background: '#f5f5f5',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  disclaimerCardSuccess: {
    background: '#fff8e1',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
  },
  disclaimerTextSmall: {
    margin: 0,
    fontSize: '12px',
    color: '#f57c00',
    lineHeight: '1.4',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
};

// Admin styles
const adminStyles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  backButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
  },
  statCardHighlight: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    color: 'white',
  },
  statNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '800',
  },
  statLabel: {
    display: 'block',
    fontSize: '12px',
    opacity: 0.8,
    marginTop: '4px',
  },
  filterSection: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
  },
  filterTitle: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '12px',
    marginTop: 0,
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: 'none',
    marginBottom: '12px',
  },
  dateFilters: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    borderRadius: '8px',
    border: 'none',
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#333',
    margin: 0,
  },
  exportButton: {
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
  institutionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  institutionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  institutionLogo: {
    fontSize: '24px',
  },
  institutionName: {
    fontSize: '14px',
    fontWeight: '600',
  },
  institutionStats: {
    display: 'flex',
    gap: '8px',
  },
  countBadge: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  revenueBadge: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  applicationCard: {
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  appInstitution: {
    fontWeight: '700',
    color: '#333',
  },
  appDate: {
    fontSize: '12px',
    color: '#888',
  },
  appDetails: {
    fontSize: '14px',
    color: '#555',
  },
};
