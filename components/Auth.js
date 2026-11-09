'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setErrorMsg(result.error.message);
    } else if (isSignUp && !result.data.session) {
      setErrorMsg('Registrazione completata! Controlla la tua email per confermare l\'account.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 p-6 rounded-3xl space-y-5 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mx-auto text-xl shadow-lg shadow-emerald-500/10">
            ⚡
          </div>
          <h2 className="text-xl font-extrabold tracking-tight pt-2">FinAuto AI</h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Crea il tuo account personale' : 'Accedi al tuo spazio finanziario'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="tuamail@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 box-border"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 box-border"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
          >
            {loading ? 'Attendi...' : isSignUp ? 'Crea Account' : 'Accedi'}
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-center font-medium text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
            {errorMsg}
          </p>
        )}

        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>
      </div>
    </div>
  );
}
