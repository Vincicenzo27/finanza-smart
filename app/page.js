import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, BellRing, Smartphone, UploadCloud, 
  Mic, Camera, Sparkles, PieChart as PieChartIcon, ShieldCheck, Check, 
  X, Plus, RefreshCw, Eye, EyeOff, AlertTriangle, ArrowUpRight, ArrowDownRight,
  ChevronRight, Calendar, Tag, CreditCard, Sliders, Zap, Award, Search, Trash2
} from 'lucide-react';

// --- INITIAL DUMMY DATA ---
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
  // --- STATES ---
  const [activeTab, setActiveTab] = useState('overview'); // overview, auto-import, analytics, settings
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fin_smart_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [hideBalances, setHideBalances] = useState(false);
  const [simulatedNotification, setSimulatedNotification] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [recentNotificationLog, setRecentNotificationLog] = useState([]);
  const [filterCategory, setFilterCategory] = useState('Tutti');
  const [searchQuery, setSearchQuery] = useState('');

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('fin_smart_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculations
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
  const currentBalance = totalIncome - totalExpenses;
  const projectEndBalance = currentBalance - 340; // Simulated upcoming fixed bills

  // Financial Health Score Calculation (0-100)
  const calculateHealthScore = () => {
    let score = 78;
    if (totalExpenses > totalIncome * 0.8) score -= 15;
    if (totalIncome > 2000) score += 10;
    return Math.min(Math.max(score, 0), 100);
  };

  // --- AUTOMATED SMS SIMULATOR HANDLER ---
  const handleSimulateBankSMS = () => {
    const randomTemplate = MOCK_SMS_TEMPLATES[Math.floor(Math.random() * MOCK_SMS_TEMPLATES.length)];
    
    // Auto parsing simulation logic
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

  // --- VOICE SIMULATION ---
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

  // --- OCR FILE UPLOAD SIMULATION ---
  const handleFileUploadSim = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result);
      setIsProcessingAI(true);

      setTimeout(() => {
        // AI Simulated extraction
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

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesCat = filterCategory === 'Tutti' || t.category === filterCategory;
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 max-w-md mx-auto relative shadow-2xl border-x border-slate-800">
      
      {/* SIMULATED INCOMING PUSH NOTIFICATION POPUP */}
      {simulatedNotification && (
        <div className="fixed top-3 left-3 right-3 max-w-md mx-auto bg-slate-900 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl z-50 animate-bounce-short backdrop-blur-md bg-opacity-95">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Smartphone className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                {simulatedNotification.bank} Listener
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Adesso</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 italic">
            "{simulatedNotification.text}"
          </p>
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Estratto Automaticamente:</div>
              <div className="text-sm font-bold text-slate-100">{simulatedNotification.parsed.merchant}</div>
              <div className="text-xs text-emerald-400">{simulatedNotification.parsed.category}</div>
            </div>
            <div className="text-right">
              <div className={`text-base font-extrabold ${simulatedNotification.parsed.amount < 0 ? 'text-slate-100' : 'text-emerald-400'}`}>
                {simulatedNotification.parsed.amount > 0 ? '+' : ''}{simulatedNotification.parsed.amount.toFixed(2)} €
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={confirmNotificationTransaction}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
              <Check className="w-4 h-4" /> Conferma & Registra
            </button>
            <button 
              onClick={() => setSimulatedNotification(null)}
              className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs">
              Ignora
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="p-4 pt-6 border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-30 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              FinAuto AI
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30">Auto-Log</span>
            </h1>
            <p className="text-[11px] text-slate-400">Zero Inserimento Manuale</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setHideBalances(!hideBalances)} 
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition-all">
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">Locale</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT BASED ON ACTIVE TAB */}
      <main className="p-4 space-y-5">

        {/* TAB 1: OVERVIEW & INTELLIGENCE */}
        {activeTab === 'overview' && (
          <>
            {/* MAIN BALANCE CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 border border-slate-800 shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Wallet className="w-32 h-32 text-emerald-400" />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-slate-400">Patrimonio Totale</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  Ottobre 2026
                </span>
              </div>

              <div className="text-3xl font-extrabold text-white tracking-tight mb-4">
                {hideBalances ? '•••••• €' : `${currentBalance.toFixed(2)} €`}
              </div>

              {/* INCOME / EXPENSE SUMMARY */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Entrate</div>
                    <div className="text-sm font-semibold text-emerald-400">
                      {hideBalances ? '•••' : `+${totalIncome.toFixed(0)} €`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Uscite</div>
                    <div className="text-sm font-semibold text-rose-400">
                      {hideBalances ? '•••' : `-${totalExpenses.toFixed(0)} €`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PREDICTIVE CASH FLOW & RUNWAY WIDGET */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Stima di Fine Mese</h3>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Algoritmo Predittivo
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Saldo Previsto al 31 Ott:</span>
                  <span className="font-bold text-slate-200">{hideBalances ? '•••' : `${projectEndBalance.toFixed(2)} €`}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[68%]" />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  💡 In base alle tue spese ricorrenti, risparmierai circa <strong className="text-emerald-400">320€</strong> questo mese.
                </p>
              </div>
            </div>

            {/* QUICK AUTOMATION TRIGGER HERO */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Simulatore Notifica Banca
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Prova come l'app cattura gli SMS delle banche senza aprire il form manuale.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSimulateBankSMS}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
                <Smartphone className="w-4 h-4" /> Simula Arrivo SMS Bancario
              </button>
            </div>

            {/* RECENT TRANSACTIONS HEADER & LIST */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Ultimi Movimenti Auto-Rilevati</h3>
                <span className="text-xs text-slate-400">{filteredTransactions.length} transazioni</span>
              </div>

              {/* SEARCH & FILTER */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Cerca esercente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-300 focus:outline-none">
                  <option value="Tutti">Tutte le Categorie</option>
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* TRANSACTIONS CARDS */}
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-500">Nessuna transazione trovata</p>
                  </div>
                ) : (
                  filteredTransactions.map(tx => (
                    <div 
                      key={tx.id} 
                      className="p-3 bg-slate-900 border border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-lg shadow-inner">
                          {tx.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{tx.merchant}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {tx.category}
                            </span>
                            <span className="text-[10px] text-slate-500">{tx.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-bold ${tx.amount < 0 ? 'text-slate-200' : 'text-emerald-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} €
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{tx.date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: AUTOMATED INPUT HUB (Voice, Receipt OCR, CSV) */}
        {activeTab === 'auto-import' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Hub di Acquisizione Automatica</h2>
              <p className="text-xs text-slate-400">Registra spese senza digitare nulla a mano</p>
            </div>

            {/* 1. VOICE INPUT SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">1. Registrazione Vocale AI</h3>
                  <p className="text-[10px] text-slate-400">Parla naturale, l'AI estrarrà cifra e categoria</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center space-y-2">
                <p className="text-xs text-slate-300 italic min-h-[24px]">
                  {voiceTranscript || 'Tieni premuto e dici ad esempio: "Ho speso 18 euro per pizza con amici"'}
                </p>
                
                <button 
                  onClick={handleVoiceInputSim}
                  disabled={isRecordingVoice || isProcessingAI}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isRecordingVoice 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  }`}>
                  <Mic className="w-4 h-4" />
                  {isRecordingVoice ? 'In Ascolto...' : isProcessingAI ? 'Elaborazione AI in corso...' : 'Parla Ora (Demo)'}
                </button>
              </div>
            </div>

            {/* 2. OCR SCANNER SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">2. Lettore Scontrini OCR</h3>
                  <p className="text-[10px] text-slate-400">Scatta una foto o carica una ricevuta</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-xl p-4 text-center transition-all bg-slate-950/50">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUploadSim}
                  id="receipt-upload"
                  className="hidden" 
                />
                <label htmlFor="receipt-upload" className="cursor-pointer space-y-2 block">
                  <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
                  <span className="text-xs text-slate-300 font-medium block">Carica o Scatta Foto Scontrino</span>
                  <span className="text-[10px] text-slate-500 block">Estrapolazione automatica totale e negozio</span>
                </label>
              </div>

              {receiptPreview && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img src={receiptPreview} alt="Receipt" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                  <div className="text-xs">
                    <div className="text-emerald-400 font-bold">Scontrino Riconosciuto!</div>
                    <div className="text-slate-400 text-[10px]">Aggiunto Carrefour Express (-24.80€)</div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. BANK STATEMENT CSV IMPORT */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">3. Importa Estratto Conto CSV / PDF</h3>
                  <p className="text-[10px] text-slate-400">Compatibile con UniCredit, Intesa, Revolut, N26</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsProcessingAI(true);
                  setTimeout(() => {
                    const csvMockTx = [
                      { id: 'tx-csv1', merchant: 'Lidl Supermercato', amount: -54.20, date: '2026-10-24', category: 'Spesa', source: 'Import CSV', verified: true, icon: '🛒' },
                      { id: 'tx-csv2', merchant: 'ENI Station', amount: -40.00, date: '2026-10-23', category: 'Trasporti', source: 'Import CSV', verified: true, icon: '⛽' }
                    ];
                    setTransactions([...csvMockTx, ...transactions]);
                    setIsProcessingAI(false);
                  }, 1500);
                }}
                disabled={isProcessingAI}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessingAI ? 'animate-spin text-indigo-400' : ''}`} />
                {isProcessingAI ? 'Parsing file in corso...' : 'Simula Importazione CSV Estratto Conto'}
              </button>
            </div>

            {/* LOG OF CAPTURED SMS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-300">Log Ultimi SMS/Notifiche Rilevate</h3>
              {recentNotificationLog.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">Nessun SMS simulato di recente.</p>
              ) : (
                <ul className="space-y-1.5">
                  {recentNotificationLog.map((log, i) => (
                    <li key={i} className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/50">
                      {log}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INTELLIGENCE & RECURRING SUBSCRIPTIONS */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {/* FINANCIAL HEALTH SCORE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Punteggio Salute Finanziaria</div>
                <div className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
                  {calculateHealthScore()} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  Stabilizzazione spese ottima
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-lg bg-emerald-500/10">
                <Award className="w-8 h-8" />
              </div>
            </div>

            {/* SUBSCRIPTION & HIDDEN COST RADAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Radar Abbonamenti & Spese Nascoste
                  </h3>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Rilevate Variazioni
                </span>
              </div>

              <div className="space-y-2">
                {RECURRING_SUBSCRIPTIONS.map((sub, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{sub.name}</div>
                      <div className="text-[10px] text-slate-400">{sub.frequency}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-200">{sub.amount.toFixed(2)} €</div>
                      <div className={`text-[10px] font-semibold ${sub.type === 'warning' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {sub.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BUDGET BY CATEGORY PROGRESS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Budget per Categoria
              </h3>

              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const spent = Math.abs(
                    transactions
                      .filter(t => t.category === cat.name && t.amount < 0)
                      .reduce((acc, t) => acc + t.amount, 0)
                  );
                  const percentage = Math.min(Math.round((spent / cat.budget) * 100), 100);

                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cat.name}</span>
                        <span className="text-slate-400">{spent.toFixed(0)}€ / {cat.budget}€</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: cat.color 
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & LOCAL STORAGE */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200">Privacy & Dati Locali</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                I tuoi dati bancari non lasciano mai questo dispositivo. Tutto è salvato in locale nel browser via <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">LocalStorage</code>.
              </p>
              
              <button 
                onClick={() => {
                  if (window.confirm('Vuoi davvero ripristinare i dati iniziali?')) {
                    localStorage.removeItem('fin_smart_transactions');
                    setTransactions(INITIAL_TRANSACTIONS);
                  }
                }}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Reset Dati Iniziali Demo
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-200">Piattaforme Supportate per Notification Listener</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">🟢 UniCredit Mobile</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">🟢 Intesa Sanpaolo</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">🟢 Revolut App</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">🟢 N26 Smart Alert</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">🟢 PayPal App</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">🟢 Apple Pay Push</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION BAR FOR MOBILE THUMB USAGE */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 border-t border-slate-800/80 p-2 backdrop-blur-md z-40">
        <div className="grid grid-cols-4 gap-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
              activeTab === 'overview' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <Wallet className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('auto-import')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
              activeTab === 'auto-import' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <Zap className="w-5 h-5" />
            <span className="text-[10px]">Auto-Input</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">Analisi</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
              activeTab === 'settings' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <Sliders className="w-5 h-5" />
            <span className="text-[10px]">Impostazioni</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
