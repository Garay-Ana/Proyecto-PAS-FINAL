import React from 'react';

function Controls({ isOnline, statusMessage, onRefresh }) {
  return (
    <div className="controls">
      <div className="status-indicator">
        <div className={`status-dot ${isOnline ? '' : 'offline'}`} />
        <span>{isOnline ? 'Conectado' : statusMessage || 'Sin conexión'}</span>
      </div>
      <button className="refresh-btn" onClick={onRefresh}>
        <span>🔄</span>
        Actualizar Datos
      </button>
    </div>
  );
}

export default Controls;
