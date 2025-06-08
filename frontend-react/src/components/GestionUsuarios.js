import React from 'react';

const GestionUsuarios = ({
  userForm,
  userFormMessage,
  userFormMessageType,
  handleUserFormChange,
  handleUserFormSubmit,
  captureLastUID,
  loading,
  errorMessages,
  usersData,
  openEditModal,
  deleteUser,
}) => {
  return (
    <div className="tab-content active" id="usuarios">
      <div className="data-section">
        <h2 className="section-title">👥 Registrar Nuevo Usuario</h2>

        {userFormMessage && (
          <div className={userFormMessageType === 'error' ? 'error-message' : 'success-message'}>
            {userFormMessage}
          </div>
        )}

        <div className="form-container">
          <form id="userForm" onSubmit={handleUserFormSubmit}>
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="uid">UID de la Tarjeta RFID *</label>
                  <input
                    type="text"
                    id="uid"
                    name="uid"
                    className="form-control"
                    value={userForm.uid}
                    onChange={handleUserFormChange}
                    required
                  />
                  <div className="uid-capture">
                    <button type="button" className="uid-capture-btn" onClick={captureLastUID}>
                      Capturar último UID escaneado
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="identificacion">Identificación *</label>
                  <input
                    type="text"
                    id="identificacion"
                    name="identificacion"
                    className="form-control"
                    value={userForm.identificacion}
                    onChange={handleUserFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="nombre_completo">Nombre Completo *</label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    className="form-control"
                    value={userForm.nombre_completo}
                    onChange={handleUserFormChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="correo">Correo Electrónico</label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    className="form-control"
                    value={userForm.correo}
                    onChange={handleUserFormChange}
                  />
                </div>
              </div>

              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    className="form-control"
                    value={userForm.telefono}
                    onChange={handleUserFormChange}
                  />
                </div>
              </div>

              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="rol">Rol *</label>
                  <select
                    id="rol"
                    name="rol"
                    className="form-control"
                    value={userForm.rol}
                    onChange={handleUserFormChange}
                    required
                  >
                    <option value="usuario">Usuario</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="btn btn-success">
                Guardar Usuario
              </button>
              <button
                type="reset"
                className="btn btn-secondary"
                onClick={() =>
                  setUserForm({ uid: '', identificacion: '', nombre_completo: '', correo: '', telefono: '', rol: 'usuario' })
                }
              >
                Limpiar Formulario
              </button>
            </div>
          </form>
        </div>

        <h2 className="section-title">📋 Lista de Usuarios Registrados</h2>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Cargando usuarios...</span>
          </div>
        )}

        {errorMessages && <div className="error-message">⚠️ {errorMessages}</div>}

        {!loading && !errorMessages && (
          <>
            {usersData.length === 0 ? (
              <div className="no-data">
                <p>👤 No hay usuarios registrados</p>
                <p>Agrega usuarios usando el formulario superior</p>
              </div>
            ) : (
              <div className="table-container">
                <table id="usersTable">
                  <thead>
                    <tr>
                      <th>UID</th>
                      <th>Identificación</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.map((user) => (
                      <tr key={user.uid}>
                        <td>
                          <span className="uid-code">{user.uid}</span>
                        </td>
                        <td>{user.identificacion}</td>
                        <td>{user.nombre_completo}</td>
                        <td>{user.correo || '-'}</td>
                        <td>{user.telefono || '-'}</td>
                        <td>
                          <button className="btn" onClick={() => openEditModal(user.uid)}>
                            Editar
                          </button>
                          <button className="btn btn-danger" onClick={() => deleteUser(user.uid)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;
