'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');

  const monthlyBudget = 1500;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  // Calcoli finanziari
  const entrate = transactions
    .filter(t => t.category === 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const uscite = transactions
    .filter(t => t.category !== 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const patrimonioTotale = 2168.02 + entrate - uscite;
  const safeToSpend = Math.max(0, monthlyBudget - uscite);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Tutti' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-white font-sans pb-28 max-w-md mx-auto relative border-x border-slate-900/40">
      
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
            <p className="text-xs text-slate-400">Zero Inserimento Manuale</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          👁️
        </button>
      </header>

      <main className="px-4 space-y-4 mt-2">
        
        {/* Card Patrimonio Totale */}
        <section className="bg-gradient-to-b from-[#111827] to-[#0f172a] p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Patrimonio Totale</span>
            <span className="text-xs bg-slate-800/80 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-medium">
              Novembre 2026
            </span>
          </div>

          <div className="text-3xl font-black tracking-tight text-white my-3">
            {patrimonioTotale.toFixed(2)} €
          </div>

          <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Entrate</span>
              <span className="font-bold text-emerald-400">+{entrate.toFixed(0)} €</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Uscite</span>
              <span className="font-bold text-rose-400">-{uscite.toFixed(0)} €</span>
            </div>
          </div>
        </section>

        {/* Card Stima di Fine Mese */}
        <section className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <span className="text-amber-400">✨</span> Stima di Fine Mese
            </div>
            <span className="text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full">
              Algoritmo Predittivo
            </span>
          </div>
          
          <p className="text-sm font-semibold text-slate-200 mt-1">
            Safe-to-Spend Rimanente: <span className="text-emerald-400 font-bold">{safeToSpend.toFixed(2)} €</span>
          </p>

          <div className="mt-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40 flex items-start gap-2">
            <span>💡</span>
            <span>In base alle tue spese attuali, il budget rimanente stimato viaggia a ritmo regolare.</span>
          </div>
        </section>

        {/* Card Simulatore Notifica Banca */}
        <section className="bg-[#0f172a] p-4 rounded-3xl border border-slate-800/80 space-y-3">
          <div>
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              🔔 Webhook Live Supabase
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tutti i movimenti inviati dall'iPhone vengono salvati automaticamente nel database.
            </p>
          </div>

          <button 
            onClick={fetchTransactions}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition text-slate-950 font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
          >
            🔄 Aggiorna Dati Live
          </button>
        </section>

        {/* Ultimi Movimenti */}
        <section className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-300 tracking-wide">
            Ultimi Movimenti Auto-Rilevati
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="Tutti">Tutti</option>
              <option value="Spesa">Spesa</option>
              <option value="Ristorazione">Ristorazione</option>
              <option value="Shopping">Shopping</option>
              <option value="Trasporti">Trasporti</option>
            </select>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Caricamento transazioni...</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-800/40">
              <p className="text-xs text-slate-400">Nessun movimento trovato</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-sm">
                      🛒
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-100">{tx.merchant}</p>
                      <p className="text-[11px] text-slate-400">
                        {tx.category} • {tx.source || 'iPhone'} • {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold text-sm ${tx.category === 'Entrate' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {tx.category === 'Entrate' ? '+' : '-'}{Number(tx.amount).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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
          onClick={() => setActiveTab('auto-input')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'auto-input' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <span className="text-lg">⚡</span>
          <span className="text-[10px] font-bold">Auto-Input</span>
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
