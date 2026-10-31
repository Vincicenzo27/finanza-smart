"use client";
import React, { useState } from 'react';

export default function Home() {
  // Dati di esempio statici per visualizzare subito l'interfaccia
  const [transactions, setTransactions] = useState([
    { id: 1, merchant: 'Bar / Caffè', amount: 15.50, category: 'Ristorazione', date: 'Oggi, 14:30', type: 'expense' },
    { id: 2, merchant: 'Supermercato', amount: 42.80, category: 'Spesa', date: 'Ieri, 18:15', type: 'expense' },
    { id: 3, merchant: 'Stipendio', amount: 1850.00, category: 'Entrate', date: '28 Ott', type: 'income' },
    { id: 4, merchant: 'Distributore Eni', amount: 50.00, category: 'Trasporti', date: '25 Ott', type: 'expense' },
  ]);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <main style={{
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>📊 Finanza Smart</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Dashboard Personale</p>
        </div>
        <span style={{ backgroundColor: '#22c55e20', color: '#4ade80', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
          ● Live
        </span>
      </header>

      {/* Card Saldo e Totali */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bilancio Mese</p>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 16px 0', color: '#fff' }}>
          € {(totalIncome - totalExpense).toFixed(2)}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1px 1px', gap: '12px', borderTop: '1px solid #475569', paddingTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Entrate</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>+ € {totalIncome.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Uscite</span>
            <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '16px' }}>- € {totalExpense.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sezione Webhook Status */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>Webhook iOS Automazione</span>
        <code style={{ color: '#38bdf8', backgroundColor: '#0f172a', padding: '4px 8px', borderRadius: '6px' }}>/api/webhook</code>
      </div>

      {/* Lista Transazioni */}
      <section>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#cbd5e1' }}>Ultime Transazioni</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transactions.map((t) => (
            <div key={t.id} style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', margin: 0, fontSize: '15px' }}>{t.merchant}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0 0' }}>{t.category} • {t.date}</p>
              </div>
              <span style={{
                fontWeight: 'bold',
                fontSize: '15px',
                color: t.type === 'income' ? '#4ade80' : '#f87171'
              }}>
                {t.type === 'income' ? '+' : '-'} € {t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
