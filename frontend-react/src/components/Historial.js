import React from 'react';

const Historial = ({ historialData, usersData, loading, errorMessages, formatDate, getTimeAgo }) => {
  return (
    <div className="data-section">
      <h2 className="section-title">📊 Últimos Registros</h2>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Cargando datos...</span>
        </div>
      )}

      {errorMessages && (
        <div className="error-message">⚠️ {errorMessages}</div>
      )}

      {!loading && !errorMessages && (
        <>
          {historialData.length === 0 ? (
            <div className="no-data">
              <p>📭 No hay datos disponibles</p>
              <p>Las entradas aparecerán aquí cuando se detecten tarjetas RFID</p>
            </div>
          ) : (
            <div className="table-container">
              <table id="dataTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>UID de Tarjeta</th>
                    <th>Usuario</th>
                    <th>Fecha y Hora</th>
                    <th>Tiempo Transcurrido</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historialData]
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((entry, index) => {
                      const user = usersData.find((u) => u.uid === entry.uid);
                      const userName = user
                        ? `${user.nombre_completo} (${user.identificacion})`
                        : 'Usuario no registrado';
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <span className="uid-code">{entry.uid}</span>
                          </td>
                          <td>{userName}</td>
                          <td className="timestamp">{formatDate(entry.timestamp)}</td>
                          <td>{getTimeAgo(entry.timestamp)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Historial;
