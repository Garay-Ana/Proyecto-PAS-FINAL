import React from 'react';
import { formatDate, getTimeAgo } from '../utils';

const RegistrosAcceso = ({ accessRecords, usersData, loading, errorMessages, loadAccessRecords, status, statusMessage }) => {
  return (
    <div className="tab-content active" id="registros">
      <div className="data-section">
        <h2 className="section-title">📝 Historial Completo de Accesos</h2>
      </div>

      <div className="controls">
        <div className={`status-dot ${status ? '' : 'offline'}`} id="statusDotRegistros"></div>
        <span id="statusTextRegistros">{status ? 'Conectado' : statusMessage}</span>
      </div>
      <button className="btn" onClick={loadAccessRecords}>
        <span>🔄</span> Actualizar Registros
      </button>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Cargando registros...</span>
        </div>
      )}

      {errorMessages && <div className="error-message">⚠️ {errorMessages}</div>}

      {!loading && !errorMessages && (
        <>
          {accessRecords.length === 0 ? (
            <div className="no-data">
              <p>📭 No hay registros de acceso</p>
              <p>Los registros aparecerán aquí cuando se detecten tarjetas RFID</p>
            </div>
          ) : (
            <div className="table-container">
              <table id="recordsTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>UID</th>
                    <th>Usuario</th>
                    <th>Fecha y Hora</th>
                    <th>Tiempo Transcurrido</th>
                  </tr>
                </thead>
                <tbody>
                  {[...accessRecords]
                    .slice()
                    .reverse()
                    .map((entry, index) => {
                      const user = usersData.find((u) => u.uid === entry.uid);
                      const userName = user
                        ? `${user.nombre} (${user.identificacion})`
                        : 'Usuario no registrado';
                      return (
                        <tr key={entry.id}>
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

export default RegistrosAcceso;
