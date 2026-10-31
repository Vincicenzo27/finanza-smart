"use client";
import React, { useState } from 'react';

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState('Ottobre 2026');

  // Dati transazioni
  const [transactions, setTransactions] = useState([
    { id: 1, merchant: 'Bar / Caffè', amount: 15.50, category: 'Ristorazione', date: 'Oggi, 14:30', type: 'expense', icon: '☕' },
    { id: 2, merchant: 'Supermercato', amount: 42.80, category: 'Spesa', date: 'Ieri, 18:15', type: 'expense', icon: '🛒' },
    { id: 3, merchant: 'Stipendio', amount: 1850.00, category: 'Entrate', date: '28 Ott', type: 'income', icon: '💰' },
    { id: 4, merchant: 'Distributore Eni', amount: 50.00, category: 'Trasporti', date: '25 Ott', type: 'expense', icon: '⛽' },
    { id: 5, merchant: 'Abbonamento Netflix', amount: 12.99, category: 'Svago', date: '20 Ott', type: 'expense', icon: '🎬' },
  ]);

  // Calcoli finanziari
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Dati mock per grafico e categorie
  const categories = [
    { name: 'Spesa', amount: 42.80, color: '#3b82f6', icon: '🛒', percentage: 35 },
    { name: 'Trasporti', amount: 50.00, color: '#f59e0b', icon: '⛽', percentage: 41 },
    { name: 'Ristorazione', amount: 15.50, color: '#ec4899', icon: '☕', percentage: 13 },
    { name: 'Svago', amount: 12.99, color: '#8b5cf6', icon: '🎬', percentage: 11 },
  ];

  const chartData = [
    { day: 'Lun', amount: 12 },
    { day: 'Mar', amount: 45 },
    { day: 'Mer', amount: 20 },
    { day: 'Gio', amount: 50 },
    { day: 'Ven', amount: 15 },
    { day: 'Sab', amount: 30 },
    { day: 'Dom', amount: 5 },
  ];

  const maxChartValue = Math.max(...chartData.map(d => d.amount));

  return (
    <main style={{
      backgroundColor: '#0b0f19',
      color: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px 16px 40px 16px',
      maxWidth: '480px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>📲 Finanza Smart</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0 0' }}>Dashboard Personale</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#38bdf8'
        }}>
          <span style={{ height: '8px', width: '8px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
          <span>iOS Webhook</span>
        </div>
      </header>

      {/* Selettore Mese */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>{selectedMonth}</span>
        <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>›</button>
      </div>

      {/* Main Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid #334155',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' }}>
          Bilancio Totale
        </span>
        <h2 style={{ fontSize: '34px', fontWeight: 'bold', margin: '8px 0 20px 0', color: '#ffffff', letterSpacing: '-0.5px' }}>
          € {balance.toFixed(2)}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ color: '#4ade80', fontSize: '12px' }}>↙</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Entrate</span>
            </div>
            <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '17px' }}>+ € {totalIncome.toFixed(2)}</span>
          </div>
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ color: '#f87171', fontSize: '12px' }}>↗</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Uscite</span>
            </div>
            <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '17px' }}>- € {totalExpense.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Grafico Andamento Uscite */}
      <section style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1', margin: '0 0 16px 0' }}>Uscite Settimanali</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '0 4px' }}>
          {chartData.map((item, idx) => {
            const heightPercent = (item.amount / maxChartValue) * 100;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{
                  width: '12px',
                  height: `${heightPercent}%`,
                  backgroundColor: heightPercent > 70 ? '#f87171' : '#38bdf8',
                  borderRadius: '6px',
                  transition: 'height 0.3s ease'
                }} />
                <span style={{ fontSize: '11px', color: '#64748b' }}>{item.day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ripartizione Categorie */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#cbd5e1', margin: 0 }}>Spese per Categoria</h3>
          <span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer' }}>Vedi tutte</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map((cat, idx) => (
            <div key={idx} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>{cat.name}</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>€ {cat.amount.toFixed(2)}</span>
              </div>
              {/* Barra Progresso */}
              <div style={{ width: '100%', backgroundColor: '#0f172a', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${cat.percentage}%`, backgroundColor: cat.color, height: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lista Ultime Transazioni */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#cbd5e1', margin: 0 }}>Ultime Transazioni</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{transactions.length} movimenti</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map((t) => (
            <div key={t.id} style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {t.icon}
                </div>
                <div>
                  <p style={{ fontWeight: '600', margin: 0, fontSize: '14px', color: '#f8fafc' }}>{t.merchant}</p>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0 0' }}>{t.category} • {t.date}</p>
                </div>
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
