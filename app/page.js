"use client";
import React, { useState } from 'react';

export default function Home() {
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
      maxWidth: '480px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>📲 Finanza Smart</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '2px 0 0 0' }}>Dashboard Personale</p>
        </div>
        <span style={{ backgroundColor: '#22c55e20', color: '#4ade80', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
          ● Live
        </span>
      </header>

      {/* Card Saldo e Totali - Layout Corretto */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bilancio Mese</p>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '6px 0 16px 0', color: '#ffffff' }}>
          € {(totalIncome - totalExpense).toFixed(2)}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #475569', paddingTop: '14px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Entrate</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>+ € {totalIncome.toFixed(2)}</span>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Uscite</span>
            <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '16px' }}>- € {totalExpense.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Ripartizione Categorie */}
      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1' }}>Spese per Categoria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>🛒 Spesa</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px' }}>€ 42.80</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>☕ Ristorazione</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px' }}>€ 15.50</p>
          </div>
        </div>
      </section>

      {/* Stato Webhook */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>Webhook iOS SMS</span>
        <code style={{ color: '#38bdf8', backgroundColor: '#0f172a', padding: '3px 6px', borderRadius: '4px' }}>/api/webhook</code>
      </div>

      {/* Lista Transazioni */}
      <section>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1' }}>Ultime Transazioni</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map((t) => (
            <div key={t.id} style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', margin: 0, fontSize: '14px' }}>{t.merchant}</p>
                <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0 0' }}>{t.category} • {t.date}</p>
              </div>
              <span style={{
                fontWeight: 'bold',
                fontSize: '14px',
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
