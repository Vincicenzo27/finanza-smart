"use client";
import React, { useState, useEffect } from 'react';

// --- DUMMY DATA INIZIALI ---
const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', merchant: 'Esselunga Milano', amount: -68.50, date: '2026-10-28', category: 'Spesa', source: 'SMS (Intesa Sanpaolo)', verified: true, icon: '🛒' },
  { id: 'tx-2', merchant: 'Accredito Stipendio', amount: 2450.00, date: '2026-10-27', category: 'Entrate', source: 'Bonifico SEPA', verified: true, icon: '💼' },
  { id: 'tx-3', merchant: 'Netflix Premium', amount: -17.99, date: '2026-10-25', category: 'Abbonamenti', source: 'Push (Revolut)', verified: true, icon: '🎬' },
  { id: 'tx-4', merchant: 'Enel Energia', amount: -84.20, date: '2026-10-22', category: 'Utenze', source: 'RID Bancario', verified: true, icon: '⚡' },
  { id: 'tx-5', merchant: 'Pizzeria Da Ciro', amount: -32.00, date: '2026-10-21', category: 'Ristoranti', source: 'Push (N26)', verified: true, icon: '🍕' },
  { id: 'tx-6', merchant: 'Uber Trip', amount: -18.40, date: '2026-10-19', category: 'Trasporti', source: 'Push (Revolut)', verified: true, icon: '🚗' },
  { id: 'tx-7', merchant: 'Amazon.it', amount: -45.90, date: '2026-10-18', category: 'Shopping', source: 'SMS (UniCredit)', verified: true, icon: '📦' },
  { id: 'tx-8', merchant: 'Spotify Family', amount: -14.99, date: '2026-10-15', category: 'Abbonamenti', source: 'Push (Revolut)', verified: true, icon: '🎵' },
];

const RECURRING_SUBSCRIPTIONS = [
  { name: 'Netflix Premium', amount: 17.99, frequency: 'Mensile', status: 'In aumento (+2€)', type: 'warning' },
  { name: 'Spotify Family', amount: 14.99, frequency: 'Mensile', status: 'Attivo', type: 'normal' },
  { name: 'Palestra FitExpress', amount: 39.90, frequency: 'Mensile', status: 'In scadenza', type: 'info' },
  { name: 'iCloud Storage 200GB', amount: 2.99, frequency: 'Mensile', status: 'Attivo', type: 'normal' },
];

const CATEGORIES = [
  { name: 'Spesa', color: '#10B981', budget: 350 },
  { name: 'Ristoranti', color: '#F59E0B', budget: 200 },
  { name: 'Abbonamenti', color: '#8B5CF6', budget: 80 },
  { name: 'Utenze', color: '#EF4444', budget: 180 },
  { name: 'Trasporti', color: '#3B82F6', budget: 120 },
  { name: 'Shopping', color: '#EC4899', budget: 250 },
  { name: 'Altro', color: '#6B7280', budget: 100 },
];

const MOCK_SMS_TEMPLATES = [
  { bank: 'Intesa Sanpaolo', text: 'Intesa: Pagamento POS di 42.50 EUR presso Conad Supermercato il 28/10 ore 18:30 carta *4921.' },
  { bank: 'Revolut', text: 'Revolut: Hai speso 14.50€ presso Bar Express con Carta Web.' },
  { bank: 'UniCredit', text: 'UniCredit Info: Carta termina 1029. Spesa 89.00 EUR presso Zara Milano. Disponibilità aggiornata.' },
  { bank: 'N26', text: 'N26 Notification: Ricevuti 35.00€ da Marco R. con causale Pizza e Birra.' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [hideBalances, setHideBalances] = useState(false);
  const [simulatedNotification, setSimulatedNotification] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [recentNotificationLog, setRecentNotificationLog] = useState([]);
  const [filterCategory, setFilterCategory] = useState('Tutti');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('fin_smart_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('fin_smart_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
  const currentBalance = totalIncome - totalExpenses;
  const projectEndBalance = currentBalance - 340;

  const calculateHealthScore = () => {
    let score = 78;
    if (totalExpenses > totalIncome * 0.8) score -= 15;
    if (totalIncome > 2000) score += 10;
    return Math.min(Math.max(score, 0), 100);
  };

  const handleSimulateBankSMS = () => {
    const randomTemplate = MOCK_SMS_TEMPLATES[Math.floor(Math.random() * MOCK_SMS_TEMPLATES.length)];
    let parsedAmount = -25.00;
    let parsedMerchant = 'Esercente Sconosciuto';
    let parsedCategory = 'Altro';
    let icon = '💳';

    if (randomTemplate.text.includes('Conad')) {
      parsedAmount = -42.50;
      parsedMerchant = 'Conad Supermercato';
      parsedCategory = 'Spesa';
      icon = '🛒';
    } else if (randomTemplate.text.includes('Bar Express')) {
      parsedAmount = -14.50;
      parsedMerchant = 'Bar Express';
      parsedCategory = 'Ristoranti';
      icon = '☕';
    } else if (randomTemplate.text.includes('Zara')) {
      parsedAmount = -89.00;
      parsedMerchant = 'Zara Milano';
      parsedCategory = 'Shopping';
      icon = '🛍️';
    } else if (randomTemplate.text.includes('Marco R.')) {
      parsedAmount = 35.00;
      parsedMerchant = 'Rimborso Marco R.';
      parsedCategory = 'Entrate';
      icon = '💰';
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      merchant: parsedMerchant,
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
      category: parsedCategory,
      source: `SMS Auto-Detect (${randomTemplate.bank})`,
      verified: true,
      icon: icon
    };

    setSimulatedNotification({
      bank: randomTemplate.bank,
      text: randomTemplate.text,
      parsed: newTx
    });

    setRecentNotificationLog(prev => [randomTemplate.text, ...prev.slice(0, 4)]);
  };

  const confirmNotificationTransaction = () => {
    if (simulatedNotification) {
      setTransactions([simulatedNotification.parsed, ...transactions]);
      setSimulatedNotification(null);
    }
  };

  const handleVoiceInputSim = () => {
    setIsRecordingVoice(true);
    setVoiceTranscript('In ascolto...');
    
    setTimeout(() => {
      setVoiceTranscript('"Ho speso 18 euro per aperitivo con amici"');
    }, 1500);

    setTimeout(() => {
      setIsRecordingVoice(false);
      setIsProcessingAI(true);

      setTimeout(() => {
        const newVoiceTx = {
          id: 'tx-' + Date.now(),
          merchant: 'Aperitivo Amici',
          amount: -18.00,
          date: new Date().toISOString().split('T')[0],
          category: 'Ristoranti',
          source: 'Trascrizione Vocale AI',
          verified: true,
          icon: '🍹'
        };
        setTransactions([newVoiceTx, ...transactions]);
        setIsProcessingAI(false);
        setVoiceTranscript('');
      }, 1200);
    }, 3500);
  };

  const handleFileUploadSim = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result);
      setIsProcessingAI(true);

      setTimeout(() => {
        const newOcrTx = {
          id: 'tx-' + Date.now(),
          merchant: 'Carrefour Express',
          amount: -24.80,
          date: new Date().toISOString().split('T')[0],
          category: 'Spesa',
          source: 'Scansione Scontrino AI',
          verified: true,
          icon: '🧾'
        };
        setTransactions([newOcrTx, ...transactions]);
        setIsProcessingAI(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesCat = filterCategory === 'Tutti' || t.category === filterCategory;
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{
      backgroundColor: '#090d16',
      color: '#f8fafc',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
      margin: 0,
      position: 'relative',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      
      {/* POPUP NOTIFICA SMS */}
      {simulatedNotification && (
        <div style={{
          position: 'fixed',
          top: 'calc(12px + env(safe-area-inset-top))',
          left: '16px',
          right: '16px',
          backgroundColor: '#0f172a',
          border: '1px solid #10b981',
          borderRadius: '20px',
          padding: '16px',
          zIndex: 50,
          boxShadow: '0 20px 30px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#34d399' }}>
              📱 {simulatedNotification.bank} Listener
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Adesso</span>
          </div>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px', backgroundColor: '#020617', padding: '10px', borderRadius: '12px', fontStyle: 'italic' }}>
            "{simulatedNotification.text}"
          </p>
          <div style={{ backgroundColor: '#064e3b40', border: '1px solid #05966950', borderRadius: '12px', padding: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Estratto Automaticamente:</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{simulatedNotification.parsed.merchant}</div>
              <div style={{ fontSize: '11px', color: '#34d399' }}>{simulatedNotification.parsed.category}</div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: simulatedNotification.parsed.amount < 0 ? '#fff' : '#34d399' }}>
              {simulatedNotification.parsed.amount > 0 ? '+' : ''}{simulatedNotification.parsed.amount.toFixed(2)} €
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={confirmNotificationTransaction}
              style={{ flex: 1, backgroundColor: '#10b981', color: '#020617', fontWeight: 'bold', padding: '10px', borderRadius: '12px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
              ✓ Conferma & Registra
            </button>
            <button 
              onClick={() => setSimulatedNotification(null)}
              style={{ padding: '10px 14px', backgroundColor: '#1e293b', color: '#cbd5e1', borderRadius: '12px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
              Ignora
            </button>
          </div>
        </div>
      )}

      {/* HEADER iOS SAFE */}
      <header style={{
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        paddingBottom: '14px',
        paddingLeft: '16px',
        paddingRight: '16px',
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#090d16e6',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              FinAuto AI
              <span style={{ fontSize: '10px', backgroundColor: '#10b98120', color: '#34d399', padding: '2px 7px', borderRadius: '6px', border: '1px solid #10b98140' }}>Auto-Log</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Zero Inserimento Manuale</p>
          </div>
        </div>

        <button 
          onClick={() => setHideBalances(!hideBalances)} 
          style={{ padding: '8px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>
          {hideBalances ? '🔒' : '👁️'}
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ padding: '16px' }}>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* CARD SALDO */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', padding: '20px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patrimonio Totale</span>
                <span style={{ fontSize: '11px', backgroundColor: '#090d16', color: '#cbd5e1', padding: '3px 10px', borderRadius: '12px', border: '1px solid #334155' }}>Ottobre 2026</span>
              </div>

              <div style={{ fontSize: '34px', fontWeight: '800', color: '#fff', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                {hideBalances ? '•••••• €' : `${currentBalance.toFixed(2)} €`}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #334155', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Entrate</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#34d399' }}>
                    {hideBalances ? '•••' : `+${totalIncome.toFixed(0)} €`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Uscite</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f87171' }}>
                    {hideBalances ? '•••' : `-${totalExpenses.toFixed(0)} €`}
                  </div>
                </div>
              </div>
            </div>

            {/* STIMA PREDITTIVA */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1' }}>✨ Stima di Fine Mese</span>
                <span style={{ fontSize: '10px', color: '#34d399', backgroundColor: '#10b98120', padding: '3px 8px', borderRadius: '10px', border: '1px solid #10b98130' }}>Algoritmo Predittivo</span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                Saldo Previsto 31 Ott: <strong style={{ color: '#fff' }}>{hideBalances ? '•••' : `${projectEndBalance.toFixed(2)} €`}</strong>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                💡 In base alle tue spese ricorrenti, risparmierai circa <strong style={{ color: '#34d399' }}>320€</strong> questo mese.
              </p>
            </div>

            {/* SIMULATORE SMS BANCA */}
            <div style={{ background: 'linear-gradient(135deg, #064e3b30 0%, #1e293b 100%)', border: '1px solid #05966960', borderRadius: '20px', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#fff' }}>🔔 Simulatore Notifica Banca</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                Prova come l'app cattura gli SMS senza aprire il form manuale.
              </p>
              <button 
                onClick={handleSimulateBankSMS}
                style={{ width: '100%', backgroundColor: '#10b981', color: '#020617', fontWeight: 'bold', padding: '12px', borderRadius: '14px', fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                📱 Simula Arrivo SMS Bancario
              </button>
            </div>

            {/* LISTA TRANSAZIONI */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#f8fafc' }}>Ultimi Movimenti Auto-Rilevati</h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Cerca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', color: '#fff' }}
                />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', color: '#fff' }}>
                  <option value="Tutti">Tutti</option>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredTransactions.map(tx => (
                  <div key={tx.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '22px' }}>{tx.icon}</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{tx.merchant}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{tx.category} • {tx.source}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: tx.amount < 0 ? '#fff' : '#34d399' }}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} €
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{tx.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTO-IMPORT */}
        {activeTab === 'auto-import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>Hub Acquisizione Automatica</h2>
            
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0' }}>1. Registrazione Vocale AI</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>{voiceTranscript || 'Dici ad esempio: "Ho speso 18 euro per pizza con amici"'}</p>
              <button 
                onClick={handleVoiceInputSim}
                disabled={isRecordingVoice || isProcessingAI}
                style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', backgroundColor: isRecordingVoice ? '#ef4444' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>
                🎤 {isRecordingVoice ? 'In Ascolto...' : isProcessingAI ? 'Elaborazione AI...' : 'Parla Ora (Demo)'}
              </button>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 12px 0' }}>2. Lettore Scontrini OCR</h3>
              <input type="file" accept="image/*" onChange={handleFileUploadSim} id="receipt-upload" style={{ display: 'none' }} />
              <label htmlFor="receipt-upload" style={{ display: 'block', border: '2px dashed #475569', borderRadius: '14px', padding: '20px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>
                📸 Carica o Scatta Foto Scontrino
              </label>
              {receiptPreview && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={receiptPreview} alt="Receipt" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '12px', color: '#34d399' }}>Scontrino Aggiunto (-24.80€ Carrefour)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Salute Finanziaria</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff' }}>{calculateHealthScore()} / 100</div>
              </div>
              <div style={{ fontSize: '32px' }}>🏆</div>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '14px' }}>Budget Categorie</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {CATEGORIES.map(cat => (
                  <div key={cat.name} style={{ fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', fontWeight: '500' }}>{cat.name}</span>
                      <span style={{ color: '#94a3b8' }}>{cat.budget}€</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#090d16', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '45%', height: '100%', backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Privacy Locale</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.4' }}>Tutti i dati rimangono sul tuo dispositivo (LocalStorage).</p>
            <button 
              onClick={() => {
                if (window.confirm('Reset dei dati?')) {
                  localStorage.removeItem('fin_smart_transactions');
                  setTransactions(INITIAL_TRANSACTIONS);
                }
              }}
              style={{ width: '100%', backgroundColor: '#ef444420', color: '#f87171', border: '1px solid #ef444440', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              🗑️ Reset Dati Iniziali Demo
            </button>
          </div>
        )}

      </main>

      {/* NAVBAR MOBILE RIALZATA ANTI-SWIPE */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#090d16f5',
        borderTop: '1px solid #1e293b',
        paddingTop: '10px',
        paddingBottom: 'calc(22px + env(safe-area-inset-bottom))',
        backdropFilter: 'blur(16px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        zIndex: 40
      }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'overview' ? '#34d399' : '#64748b', fontSize: '10px', fontWeight: activeTab === 'overview' ? 'bold' : 'normal', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px' }}>🏠</span>
          Home
        </button>

        <button 
          onClick={() => setActiveTab('auto-import')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'auto-import' ? '#34d399' : '#64748b', fontSize: '10px', fontWeight: activeTab === 'auto-import' ? 'bold' : 'normal', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          Auto-Input
        </button>

        <button 
          onClick={() => setActiveTab('analytics')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'analytics' ? '#34d399' : '#64748b', fontSize: '10px', fontWeight: activeTab === 'analytics' ? 'bold' : 'normal', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          Analisi
        </button>

        <button 
          onClick={() => setActiveTab('settings')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'settings' ? '#34d399' : '#64748b', fontSize: '10px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <span style={{ fontSize: '18px' }}>⚙️</span>
          Opzioni
        </button>
      </nav>

    </div>
  );
}
