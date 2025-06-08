import React from 'react';

const AsignacionTarjetas = ({
  assignForm,
  assignMessage,
  assignMessageType,
  handleAssignFormChange,
  handleAssignSubmit,
  loading,
}) => {
  return (
    <div className="tab-content active" id="asignacion">
      <div className="data-section">
        <h2 className="section-title">🎫 Asignar Tarjeta a Usuario</h2>

        {assignMessage && (
          <div className={assignMessageType === 'error' ? 'error-message' : 'success-message'}>
            {assignMessage}
          </div>
        )}

        <form id="assignForm" onSubmit={handleAssignSubmit}>
          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="gerenteUid">UID Gerente *</label>
                <input
                  type="text"
                  id="gerenteUid"
                  name="gerenteUid"
                  className="form-control"
                  value={assignForm.gerenteUid}
                  onChange={handleAssignFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-col">
              <div className="form-group">
                <label htmlFor="usuarioUid">UID Usuario *</label>
                <input
                  type="text"
                  id="usuarioUid"
                  name="usuarioUid"
                  className="form-control"
                  value={assignForm.usuarioUid}
                  onChange={handleAssignFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-col">
              <div className="form-group">
                <label htmlFor="tarjetaId">ID Tarjeta *</label>
                <input
                  type="text"
                  id="tarjetaId"
                  name="tarjetaId"
                  className="form-control"
                  value={assignForm.tarjetaId}
                  onChange={handleAssignFormChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Asignando...' : 'Asignar Tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsignacionTarjetas;
