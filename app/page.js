'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Casa', 'Utenze', 'Spesa', 'Ristorazione', 'Trasporti',
  'Salute', 'Shopping', 'Intrattenimento', 'Viaggi', 'Abbonamenti', 'Risparmi', 'Entrate'
];

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTx, setEditingTx] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);

  // Caricamento transazioni da Supabase
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

  // Salvataggio modifiche e apprendimento della categoria
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTx) return;

    const { id, merchant, amount, category } = editingTx;

    // 1. Aggiorna la transazione nel database
    const { error: txError } = await supabase
      .from('transactions')
      .update({ merchant: merchant.trim(), amount: parseFloat(amount), category })
      .eq('id', id);

    if (txError) {
      alert('Errore aggiornamento: ' + txError.message);
      return;
    }

    // 2. Salva la preferenza dell'utente nella memoria della categoria
    await supabase
      .from('category_memory')
      .upsert({
        merchant_name: merchant.trim(),
        preferred_category: category,
        updated_at: new Date().toISOString()
      });

    setEditingTx(null);
    fetchTransactions();
  };

  const totalSpent = transactions
    .filter(t => t.category !== 'Entrate')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // Calcolo dinamico Health Score (0 - 100)
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (totalSpent / monthlyBudget) * 100)));

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Finanza Smart</h1>
          <p className="text-xs text-slate-400">Dashboard Live Supabase</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Health Score</span>
          <div className="text-lg font-black text-emerald-400">{healthScore}/100</div>
        </div>
      </header>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 gap-3 my-6">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400">Totale Speso</p>
          <p className="text-xl font-bold mt-1">€ {totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400">Safe-to-Spend</p>
          <p className="text-xl font-bold mt-1 text-emerald-400">
            € {Math.max(0, monthlyBudget - totalSpent).toFixed(2)}
          </p>
        </div>
      </section>

      {/* Movimenti */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Movimenti Recenti
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-4 text-center">Caricamento in corso...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nessuna transazione registrata.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setEditingTx(tx)}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800/60 transition"
              >
                <div>
                  <p className="font-semibold text-sm">{tx.merchant}</p>
                  <p className="text-xs text-slate-400">{tx.category} • {tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">€ {Number(tx.amount).toFixed(2)}</p>
                  <span className="text-[10px] text-indigo-400">Modifica</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Modifica Transazione */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 z-50">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="font-bold text-lg">Modifica Movimento</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Esercente / Negoziante</label>
                <input
                  type="text"
                  value={editingTx.merchant}
                  onChange={(e) => setEditingTx({ ...editingTx, merchant: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Importo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Categoria</label>
                <select
                  value={editingTx.category}
                  onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm mt-1"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
