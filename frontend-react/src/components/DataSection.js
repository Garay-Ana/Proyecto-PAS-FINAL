import React from 'react';
import { formatDate } from '../utils';

function DataSection({ data, isLoading, error }) {
  if (isLoading) {
    return <p>Cargando datos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!data || data.length === 0) {
    return <p>No hay datos para mostrar.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Apellido</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>UID</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fecha y Hora</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.nombre || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.apellido || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.uid || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {formatDate(entry.timestamp || entry.fecha_hora)} <br />
              <small style={{ color: 'gray' }}>{entry.timestamp || entry.fecha_hora}</small>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataSection;
