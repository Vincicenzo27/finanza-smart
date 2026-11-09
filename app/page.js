'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Spesa': return '🛒';
    case 'Ristorazione': return '🍕';
    case 'Trasporti': return '🚗';
    case 'Shopping': return '🛍️';
    case 'Utenze': return '💡';
    case 'Salute': return '💊';
    case 'Uscite': return '🍻';
    case 'Abbonamenti': return '🔄';
    case 'Entrate': return '💰';
    default: return '💳';
  }
};

const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('connected');
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [payday, setPayday] = useState(6);

  // Form Manual Inserimento Movimento
  const [manualType, setManualType] = useState('uscita');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualCategory, setManualCategory] = useState('Spesa');
  const [manualDate, setManualDate] = useState(formatDateStr(new Date()));
  const [savingManual, setSavingManual] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Popup Modifica Movimento
  const [editingTx, setEditingTx] = useState(null);
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Spesa');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('realtime-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setDbStatus('loading');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      setDbStatus('error');
    } else {
      setTransactions(data || []);
      setDbStatus('connected');
    }
    setLoading(false);
  };

  const handleAddManualTransaction = async (e) => {
    e.preventDefault();
    if (!manualAmount || !manualMerchant) return;

    setSavingManual(true);
    setManualSuccessMsg('');

    const finalCategory = manualType === 'entrata' ? 'Entrate' : manualCategory;

    const newTx = {
      merchant: manualMerchant,
      amount: parseFloat(manualAmount),
      category: finalCategory,
      date: manualDate || formatDateStr(new Date()),
      source: 'Manuale App',
      verified: true
    };

    const { error } = await supabase.from('transactions').insert([newTx]);

    setSavingManual(false);

    if (!error) {
      setManualSuccessMsg('✅ Movimento registrato!');
      setManualAmount('');
      setManualMerchant('');
      setTimeout(() => {
        setManualSuccessMsg('');
        setActiveTab('home');
      }, 1000);
    } else {
      alert(`Errore: ${error.message}`);
    }
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setEditMerchant(tx.merchant || tx.merchant_name || tx.description || '');
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category || 'Spesa');
  };

  const handleSaveTransaction = async () => {
    if (!editingTx) return;
    setSavingEdit(true);

    const updatedAmount = parseFloat(editAmount);
    const updatedMerchant = editMerchant.trim();

    const { error: txError } = await supabase
      .from('transactions')
      .update({
        merchant: updatedMerchant,
        amount: updatedAmount,
        category: editCategory,
        verified: true
      })
      .eq('id', editingTx.id);

    if (!txError && updatedMerchant) {
      await supabase
        .from('category_memory')
        .upsert(
          { merchant_name: updatedMerchant, preferred_category: editCategory },
          { onConflict: 'merchant_name' }
        );
    }

    setSavingEdit(false);
    setEditingTx(null);
  };

  const handleDeleteTransaction = async () => {
    if (!editingTx) return;
    setSavingEdit(true);
    await supabase.from('transactions').delete().eq('id', editingTx.id);
    setSavingEdit(false);
    setEditingTx(null);
  };

  // CALCOLO DEL CICLO STIPENDIALE PERSONALIZZATO
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  let cycleStart, cycleEnd;
  if (currentDay >= payday) {
    cycleStart = new Date(currentYear, currentMonth, payday);
    cycleEnd = new Date(currentYear, currentMonth + 1, payday - 1);
  } else {
    cycleStart = new Date(currentYear, currentMonth - 1, payday);
    cycleEnd = new Date(currentYear, currentMonth, payday - 1);
  }

  const strCycleStart = formatDateStr(cycleStart);
  const strCycleEnd = formatDateStr(cycleEnd);

  const totalCycleDays = Math.round((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
  const currentCycleDay = Math.round((now - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
  const remainingCycleDays = Math.max(1, totalCycleDays - currentCycleDay + 1);

  const totalEntrate = transactions
    .filter(t => t.category === 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalUscite = transactions
    .filter(t => t.category !== 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const patrimonioTotale = totalEntrate - totalUscite;

  const cycleTransactions = transactions.filter(t => t.date >= strCycleStart && t.date <= strCycleEnd);
  
  const cycleEntrate = cycleTransactions
    .filter(t => t.category === 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const cycleUscite = cycleTransactions
    .filter(t => t.category !== 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const safeToSpend = Math.max(0, monthlyBudget - cycleUscite);

  const dailyAverageSpend = currentCycleDay > 0 ? cycleUscite / currentCycleDay : 0;
  const projectedTotalSpend = cycleUscite + (dailyAverageSpend * (totalCycleDays - currentCycleDay));
  const dailyBudgetAllowance = safeToSpend / remainingCycleDays;

  let paceStatus = { 
    label: 'In linea', 
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50', 
    msg: `Puoi spendere massimo ${dailyBudgetAllowance.toFixed(2)} €/giorno.` 
  };
  
  if (projectedTotalSpend > monthlyBudget) {
    paceStatus = { 
      label: 'Ritmo Elevato', 
      color: 'text-rose-400 bg-rose-950/60 border-rose-900/50', 
      msg: `Attento! A questo ritmo sformerai il budget di ${(projectedTotalSpend - monthlyBudget).toFixed(0)} €.` 
    };
  } else if (cycleUscite === 0) {
    paceStatus = { 
      label: 'Ottimo', 
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50', 
      msg: 'Nessuna spesa registrata in questo ciclo.' 
    };
  }

  // HEALTH SCORE CALCULATION & METRICS FOR ANALYSIS
  const rawHealthScore = Math.max(0, Math.min(100, Math.round(100 - (cycleUscite / (monthlyBudget || 1)) * 100)));
  const healthScore = isNaN(rawHealthScore) ? 100 : rawHealthScore;

  let healthStatusLabel = 'Eccellente';
  let healthColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
  if (healthScore < 40) {
    healthStatusLabel = 'Critico';
    healthColor = 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  } else if (healthScore < 70) {
    healthStatusLabel = 'Moderato';
    healthColor = 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  }

  const savingsRate = cycleEntrate > 0 
    ? Math.max(0, Math.round(((cycleEntrate - cycleUscite) / cycleEntrate) * 100)) 
    : 0;

  const filteredTransactions = transactions.filter(t => {
    const merchantName = (t.merchant || t.merchant_name || t.description || '').toString();
    const matchesSearch = merchantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Tutti' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categoriesMap = {};
  cycleTransactions.filter(t => t.category !== 'Entrate').forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + Number(t.amount);
  });

  // Top Spesa per categoria
  let topCategory = 'Nessuna';
  let topCategoryAmount = 0;
  Object.entries(categoriesMap).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  const startLabel = cycleStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  const endLabel = cycleEnd.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-[#070b12] text-white font-sans pb-28 max-w-md mx-auto relative border-x border-slate-900/40 overflow-x-hidden">
      
      {/* Header Top */}
      <header className="p-4 flex justify-between items-center pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white">FinAuto AI</h1>
              <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                Auto-Log
              </span>
            </div>
            <p className="text-xs text-slate-400">Tracciamento Finanziario Smart</p>
          </div>
        </div>

        {dbStatus === 'connected' && (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Database Connesso Live"></div>
        )}
        {dbStatus === 'loading' && (
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="Sincronizzazione..."></div>
        )}
        {dbStatus === 'error' && (
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" title="Errore Connessione"></div>
        )}
      </header>

      <main className="px-4 space-y-4 mt-2">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <>
            <section className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-5 rounded-3xl border border-slate-800/80 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Patrimonio Totale</span>
                <span className="text-xs bg-slate-800/80 border border-slate-700/50 text-emerald-400 px-3 py-1 rounded-full font-medium">
                  Ciclo: {startLabel} - {endLabel}
                </span>
              </div>

              <div className="text-3xl font-black tracking-tight text-white my-3">
                {patrimonioTotale.toFixed(2)} €
              </div>

              <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Entrate Ciclo</span>
                  <span className="font-bold text-emerald-400">+{cycleEntrate.toFixed(2)} €</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Uscite Ciclo</span>
                  <span className="font-bold text-rose-400">-{cycleUscite.toFixed(2)} €</span>
                </div>
              </div>
            </section>

            <section className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <span className="text-amber-400">✨</span> Stima di Fine Ciclo
                </div>
                <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${paceStatus.color}`}>
                  {paceStatus.label}
                </span>
              </div>
              
              <div className="flex justify-between items-baseline mt-2">
                <p className="text-xs text-slate-400 font-medium">Safe-to-Spend Rimanente:</p>
                <p className="text-lg font-black text-emerald-400">{safeToSpend.toFixed(2)} €</p>
              </div>

              <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/60 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Giorno del ciclo: <strong className="text-white">{currentCycleDay}/{totalCycleDays}</strong></span>
                  <span>Giorni rimasti: <strong className="text-white">{remainingCycleDays}</strong></span>
                </div>
                <p className="text-slate-300 pt-1 border-t border-slate-800/80">
                  💡 {paceStatus.msg}
                </p>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-300 tracking-wide">
                Ultimi Movimenti
              </h3>

              <div className="flex gap-2 w-full min-w-0">
                <input
                  type="text"
                  placeholder="Cerca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-[15px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 box-border"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-28 shrink-0 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2.5 text-[14px] text-slate-300 focus:outline-none box-border"
                >
                  <option value="Tutti">Tutti</option>
                  <option value="Spesa">Spesa</option>
                  <option value="Ristorazione">Ristorazione</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Trasporti">Trasporti</option>
                  <option value="Utenze">Utenze</option>
                  <option value="Salute">Salute</option>
                  <option value="Uscite">Uscite</option>
                  <option value="Abbonamenti">Abbonamenti</option>
                  <option value="Entrate">Entrate</option>
                </select>
              </div>

              {loading ? (
                <p className="text-xs text-slate-500 text-center py-6">Caricamento transazioni...</p>
              ) : filteredTransactions.length === 0 ? (
                <div className="bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-800/40">
                  <p className="text-xs text-slate-400">Nessun movimento registrato.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => {
                    const mName = tx.merchant || tx.merchant_name || 'Spesa';
                    return (
                      <div
                        key={tx.id}
                        onClick={() => openEditModal(tx)}
                        className="bg-slate-900/80 hover:bg-slate-800/60 transition cursor-pointer p-3.5 rounded-2xl border border-slate-800/80 flex justify-between items-center active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-lg shadow-inner">
                            {getCategoryIcon(tx.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-100">{mName}</p>
                              {tx.verified && (
                                <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {tx.category || 'Generale'} • {tx.source || 'iPhone'} • {tx.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${tx.category === 'Entrate' ? 'text-emerald-400' : 'text-slate-100'}`}>
                            {tx.category === 'Entrate' ? '+' : '-'}{Number(tx.amount).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* TAB 2: INSERISCI MANUALE */}
        {activeTab === 'inserisci' && (
          <div className="space-y-4">
            <section className="bg-[#0f172a] p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl box-border">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                ➕ Nuovo Movimento
              </h2>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setManualType('uscita')}
                  className={`py-2.5 rounded-xl font-extrabold text-xs transition ${
                    manualType === 'uscita'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔴 Uscita (Spesa)
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('entrata')}
                  className={`py-2.5 rounded-xl font-extrabold text-xs transition ${
                    manualType === 'entrata'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Entrata (Incasso)
                </button>
              </div>

              <form onSubmit={handleAddManualTransaction} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Importo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full box-border min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[16px] font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    {manualType === 'uscita' ? 'Negozio / Esercente' : 'Fonte / Causale'}
                  </label>
                  <input
                    type="text"
                    placeholder={manualType === 'uscita' ? 'Es. Esselunga, Bar Milano...' : 'Es. Stipendio, Rimborso, Bonifico...'}
                    required
                    value={manualMerchant}
                    onChange={(e) => setManualMerchant(e.target.value)}
                    className="w-full box-border min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[16px] text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {manualType === 'uscita' && (
                  <div>
                    <label className="text-xs text-slate-400 font-semibold block mb-1">Categoria</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full box-border min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[16px] text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Spesa">🛒 Spesa</option>
                      <option value="Ristorazione">🍕 Ristorazione</option>
                      <option value="Trasporti">🚗 Trasporti</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Utenze">💡 Utenze</option>
                      <option value="Salute">💊 Salute</option>
                      <option value="Uscite">🍻 Uscite</option>
                      <option value="Abbonamenti">🔄 Abbonamenti</option>
                      <option value="Altro">💳 Altro</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Data</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    style={{ WebkitAppearance: 'none' }}
                    className="w-full box-border min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[15px] text-slate-200 focus:outline-none focus:border-emerald-500 block text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingManual}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95 mt-4"
                >
                  {savingManual ? 'Registrazione in corso...' : '💾 Registra Movimento'}
                </button>

                {manualSuccessMsg && (
                  <p className="text-xs text-center text-emerald-400 font-bold mt-2 animate-pulse">
                    {manualSuccessMsg}
                  </p>
                )}
              </form>
            </section>
          </div>
        )}

        {/* TAB 3: ANALISI (NUOVA INTERFACCIA COMPLETA) */}
        {activeTab === 'analisi' && (
          <div className="space-y-4">
            
            {/* Card Health Score & Progress Bar */}
            <section className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Health Score Ciclo</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-black text-white">{healthScore}</p>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${healthColor}`}>
                  {healthStatusLabel}
                </span>
              </div>

              {/* Progress Bar Health */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    healthScore > 70 ? 'bg-emerald-500' : healthScore > 40 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Calcolato in base al rapporto tra uscite correnti ({cycleUscite.toFixed(0)} €) e budget impostato ({monthlyBudget} €).
              </p>
            </section>

            {/* KPI Grid Metrics */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">🔥 Spesa Media/Giorno</span>
                <p className="text-lg font-black text-rose-400">{dailyAverageSpend.toFixed(2)} €</p>
                <span className="text-[10px] text-slate-500 block">Basato su {currentCycleDay} giorni</span>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">🌱 Tasso di Risparmio</span>
                <p className="text-lg font-black text-emerald-400">{savingsRate}%</p>
                <span className="text-[10px] text-slate-500 block">Delle entrate del ciclo</span>
              </div>
            </section>

            {/* Visual Bar Breakdown Categorie */}
            <section className="bg-[#0f172a] p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-200">Spese per Categoria</h3>
                <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                  Totale: {cycleUscite.toFixed(2)} €
                </span>
              </div>

              {Object.keys(categoriesMap).length === 0 ? (
                <div className="bg-slate-950/50 p-6 rounded-2xl text-center border border-slate-900">
                  <p className="text-xs text-slate-500">Nessuna spesa registrata in questo ciclo.</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {Object.entries(categoriesMap)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount]) => {
                      const percentage = cycleUscite > 0 ? Math.round((amount / cycleUscite) * 100) : 0;
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                              <span>{getCategoryIcon(cat)}</span> {cat}
                            </span>
                            <div className="text-right">
                              <span className="font-extrabold text-white">{amount.toFixed(2)} €</span>
                              <span className="text-[10px] text-slate-400 ml-1">({percentage}%)</span>
                            </div>
                          </div>
                          
                          {/* Visual Bar */}
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* Smart Summary Insight */}
            <section className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                💡 AI Financial Insight
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {topCategory !== 'Nessuna' ? (
                  <>
                    La tua voce di spesa principale in questo ciclo è <strong className="text-emerald-400">{topCategory}</strong> ({topCategoryAmount.toFixed(2)} €). {projectedTotalSpend > monthlyBudget ? 'Ridurre questa voce ti aiuterebbe a rientrare nel budget.' : 'Ottimo lavoro nel mantenere sotto controllo le uscite!'}
                  </>
                ) : (
                  'Registra la tua prima spesa per sbloccare i suggerimenti personalizzati sull\'andamento finanziario.'
                )}
              </p>
            </section>

          </div>
        )}

        {/* TAB 4: OPZIONI */}
        {activeTab === 'opzioni' && (
          <div className="space-y-4">
            <section className="bg-[#0f172a] p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-200">Impostazioni Ciclo & Budget</h3>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Giorno Inizio Ciclo (Stipendio)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={payday}
                  onChange={(e) => setPayday(Math.max(1, Math.min(31, Number(e.target.value))))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[16px] font-bold text-emerald-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Imposta il giorno in cui accrediti lo stipendio (es. 6).</p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Budget Mensile (€)</label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[16px] font-bold text-emerald-400 focus:outline-none"
                />
              </div>
            </section>

            <section className="bg-[#0f172a] p-5 rounded-3xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-200">Stato Sistema</h3>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Database Backend:</span>
                <span className="text-emerald-400 font-bold">Supabase Connesso</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Apple Pay Webhook:</span>
                <span className="text-emerald-400 font-bold">Attivo</span>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* MODAL POPUP DI MODIFICA MOVIMENTO */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-[100]">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-black text-base text-white">Modifica Movimento</h3>
                <p className="text-[11px] text-slate-400">Modifica dettagli e aggiorna memoria AI</p>
              </div>
              <button 
                onClick={() => setEditingTx(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Esercente / Nome</label>
                <input
                  type="text"
                  value={editMerchant}
                  onChange={(e) => setEditMerchant(e.target.value)}
                  className="w-full box-border bg-slate-950 border border-slate-800 rounded-xl p-3 text-[16px] text-white font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Importo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full box-border bg-slate-950 border border-slate-800 rounded-xl p-3 text-[16px] font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Categoria</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full box-border bg-slate-950 border border-slate-800 rounded-xl p-3 text-[16px] text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Spesa">🛒 Spesa</option>
                  <option value="Ristorazione">🍕 Ristorazione</option>
                  <option value="Trasporti">🚗 Trasporti</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Utenze">💡 Utenze</option>
                  <option value="Salute">💊 Salute</option>
                  <option value="Uscite">🍻 Uscite</option>
                  <option value="Abbonamenti">🔄 Abbonamenti</option>
                  <option value="Entrate">💰 Entrate</option>
                  <option value="Altro">💳 Altro</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDeleteTransaction}
                disabled={savingEdit}
                className="flex-1 bg-rose-950/60 border border-rose-900/60 hover:bg-rose-900/60 text-rose-300 text-xs font-bold py-3 rounded-2xl transition"
              >
                Elimina
              </button>
              <button
                onClick={handleSaveTransaction}
                disabled={savingEdit}
                className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition"
              >
                {savingEdit ? 'Salvataggio...' : 'Salva e Ricorda'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/80 px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('inserisci')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'inserisci' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <span className="text-lg">➕</span>
          <span className="text-[10px] font-bold">Inserisci</span>
        </button>
        <button 
          onClick={() => setActiveTab('analisi')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'analisi' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <span className="text-lg">📊</span>
          <span className="text-[10px] font-bold">Analisi</span>
        </button>
        <button 
          onClick={() => setActiveTab('opzioni')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'opzioni' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[10px] font-bold">Opzioni</span>
        </button>
      </nav>
    </div>
  );
}
