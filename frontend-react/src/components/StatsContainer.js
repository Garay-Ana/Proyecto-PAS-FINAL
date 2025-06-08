import React from 'react';

function StatCard({ number, label }) {
  return (
    <div className="stat-card">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatsContainer({ totalEntries, todayEntries, uniqueCards, lastEntry }) {
  return (
    <div className="stats-container">
      <StatCard number={totalEntries} label="Total de Entradas" />
      <StatCard number={todayEntries} label="Entradas Hoy" />
      <StatCard number={uniqueCards} label="Tarjetas Únicas" />
      <StatCard number={lastEntry} label="Última Entrada" />
    </div>
  );
}

export default StatsContainer;
