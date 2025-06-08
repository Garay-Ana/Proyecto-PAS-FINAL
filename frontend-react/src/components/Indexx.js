import React, { useState, useEffect } from 'react';
import './indexx.css';

const API_URL = 'http://localhost:3000/api/historial';
const USERS_API_URL = 'http://localhost:3000/api/usuarios';
const ACCESS_API_URL = 'http://localhost:3000/api/accesos';

const Indexx = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [historialData, setHistorialData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [accessRecords, setAccessRecords] = useState([]);
  const [lastScannedUID, setLastScannedUID] = useState('');
  const [status, setStatus] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [userForm, setUserForm] = useState({
    uid: '',
    identificacion: '',
    nombre: '',
    correo: '',
    telefono: '',
  });
  const [userFormMessage, setUserFormMessage] = useState('');
  const [userFormMessageType, setUserFormMessageType] = useState(''); // 'error' or 'success'
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    uid: '',
    identificacion: '',
    nombre: '',
    correo: '',
    telefono: '',
  });
  const [loading, setLoading] = useState({
    historial: false,
    users: false,
    accesos: false,
  });
  const [errorMessages, setErrorMessages] = useState({
    historial: '',
    users: '',
    accesos: '',
  });

  // Formateo de fecha y tiempo transcurrido
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffDays}d ${diffHours % 24}h`;
  };

  // Actualizar estadísticas
  const updateStats = (data) => {
    // Esta función puede actualizar estados si se desea mostrar estadísticas
  };

  // Cargar datos iniciales
  const loadData = async () => {
    setLoading((prev) => ({ ...prev, historial: true }));
    setErrorMessages((prev) => ({ ...prev, historial: '' }));
    try {
      const [historialRes, usersRes] = await Promise.all([
        fetch(API_URL),
        fetch(USERS_API_URL),
      ]);
      if (!historialRes.ok) throw new Error(`Error del servidor: ${historialRes.status}`);
      if (!usersRes.ok) throw new Error(`Error del servidor: ${usersRes.status}`);

      const historial = await historialRes.json();
      const users = await usersRes.json();

      setHistorialData(historial);
      setUsersData(users);

      if (historial.length > 0) {
        setLastScannedUID(historial[historial.length - 1].uid);
      }

      updateStats(historial);
      setStatus(true);
      setStatusMessage('');
    } catch (error) {
      setStatus(false);
      setStatusMessage('Error de conexión');
      setErrorMessages((prev) => ({ ...prev, historial: `No se pudieron cargar los datos: ${error.message}` }));
    } finally {
      setLoading((prev) => ({ ...prev, historial: false }));
    }
  };

  const loadUsers = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    setErrorMessages((prev) => ({ ...prev, users: '' }));
    try {
      const res = await fetch(USERS_API_URL);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      setUsersData(data);
      setStatus(true);
      setStatusMessage('');
    } catch (error) {
      setStatus(false);
      setStatusMessage('Error de conexión');
      setErrorMessages((prev) => ({ ...prev, users: `No se pudieron cargar los usuarios: ${error.message}` }));
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const loadAccessRecords = async () => {
    setLoading((prev) => ({ ...prev, accesos: true }));
    setErrorMessages((prev) => ({ ...prev, accesos: '' }));
    try {
      const res = await fetch(ACCESS_API_URL);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      setAccessRecords(data);
      setStatus(true);
      setStatusMessage('');
    } catch (error) {
      setStatus(false);
      setStatusMessage('Error de conexión');
      setErrorMessages((prev) => ({ ...prev, accesos: `No se pudieron cargar los registros: ${error.message}` }));
    } finally {
      setLoading((prev) => ({ ...prev, accesos: false }));
    }
  };

  // Manejo de pestañas
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'usuarios') {
      loadUsers();
    } else if (tab === 'registros') {
      loadAccessRecords();
    }
  };

  // Manejo formulario usuario nuevo
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    const { uid, identificacion, nombre, correo, telefono } = userForm;
    if (!uid || !identificacion || !nombre) {
      setUserFormMessage('Por favor complete los campos obligatorios (*)');
      setUserFormMessageType('error');
      return;
    }
    try {
      const res = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, identificacion, nombre, correo, telefono }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar usuario');
      }
      const newUser = await res.json();
      setUsersData((prev) => [...prev, newUser]);
      setUserFormMessage('Usuario registrado correctamente');
      setUserFormMessageType('success');
      setUserForm({ uid: '', identificacion: '', nombre: '', correo: '', telefono: '' });
    } catch (error) {
      setUserFormMessage(`Error al guardar usuario: ${error.message}`);
      setUserFormMessageType('error');
    }
  };

  // Manejo modal edición usuario
  const openEditModal = (uid) => {
    const user = usersData.find((u) => u.uid === uid);
    if (!user) return;
    setEditUserForm({
      uid: user.uid,
      identificacion: user.identificacion,
      nombre: user.nombre,
      correo: user.correo || '',
      telefono: user.telefono || '',
    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const handleEditUserFormChange = (e) => {
    const { name, value } = e.target;
    setEditUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditUserFormSubmit = async (e) => {
    e.preventDefault();
    const { uid, identificacion, nombre, correo, telefono } = editUserForm;
    if (!identificacion || !nombre) {
      // Show error message (could add state for edit form messages)
      return;
    }
    try {
      const res = await fetch(`${USERS_API_URL}/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificacion, nombre, correo, telefono }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }
      // Actualizar usuarios localmente
      setUsersData((prev) =>
        prev.map((user) => (user.uid === uid ? { ...user, identificacion, nombre, correo, telefono } : user))
      );
      closeEditModal();
    } catch (error) {
      // Show error message
    }
  };

  // Eliminar usuario
  const deleteUser = async (uid) => {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) return;
    try {
      const res = await fetch(`${USERS_API_URL}/${uid}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }
      setUsersData((prev) => prev.filter((user) => user.uid !== uid));
    } catch (error) {
      // Show error message
    }
  };

  // Capturar último UID escaneado
  const captureLastUID = () => {
    if (lastScannedUID) {
      setUserForm((prev) => ({ ...prev, uid: lastScannedUID }));
    }
  };

  useEffect(() => {
    loadData();
    const intervalLoad = setInterval(loadData, 30000);
    return () => clearInterval(intervalLoad);
  }, []);

  useEffect(() => {
    const intervalUpdateTimes = setInterval(() => {
      // Forcing re-render to update time ago
      setHistorialData((prev) => [...prev]);
      setAccessRecords((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(intervalUpdateTimes);
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>🔐 Control de Acceso RFID</h1>
        <p>Sistema de monitoreo y gestión de usuarios</p>
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabClick('dashboard')}
        >
          Dashboard
        </div>
        <div
          className={`tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => handleTabClick('usuarios')}
        >
          Gestión de Usuarios
        </div>
        <div
          className={`tab ${activeTab === 'registros' ? 'active' : ''}`}
          onClick={() => handleTabClick('registros')}
        >
          Registros de Acceso
        </div>
      </div>

      {/* Pestaña Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="tab-content active" id="dashboard">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number" id="totalEntries">{historialData.length}</div>
              <div className="stat-label">Total de Entradas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" id="todayEntries">
                {historialData.filter(entry => {
                  const today = new Date().toDateString();
                  return new Date(entry.timestamp).toDateString() === today;
                }).length}
              </div>
              <div className="stat-label">Entradas Hoy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" id="uniqueCards">
                {[...new Set(historialData.map(entry => entry.uid))].length}
              </div>
              <div className="stat-label">Tarjetas Únicas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" id="lastEntry">
                {historialData.length > 0
                  ? new Date(historialData[historialData.length - 1].timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--'}
              </div>
              <div className="stat-label">Última Entrada</div>
            </div>
          </div>

          <div className="controls">
            <div className="status-indicator">
              <div className={`status-dot ${status ? '' : 'offline'}`} id="statusDot"></div>
              <span id="statusText">{status ? 'Conectado' : statusMessage}</span>
            </div>
            <button className="btn" onClick={loadData}>
              <span>🔄</span> Actualizar Datos
            </button>
          </div>

          <div className="data-section">
            <h2 className="section-title">📊 Últimos Registros</h2>

            {loading.historial && (
              <div className="loading">
                <div className="spinner"></div>
                <span>Cargando datos...</span>
              </div>
            )}

            {errorMessages.historial && (
              <div className="error-message">⚠️ {errorMessages.historial}</div>
            )}

            {!loading.historial && !errorMessages.historial && (
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
                              ? `${user.nombre} (${user.identificacion})`
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
        </div>
      )}

      {/* Pestaña Gestión de Usuarios */}
      {activeTab === 'usuarios' && (
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
                      <label htmlFor="nombre">Nombre Completo *</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        className="form-control"
                        value={userForm.nombre}
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
                </div>

                <div className="actions">
                  <button type="submit" className="btn btn-success">
                    Guardar Usuario
                  </button>
                  <button
                    type="reset"
                    className="btn btn-secondary"
                    onClick={() =>
                      setUserForm({ uid: '', identificacion: '', nombre: '', correo: '', telefono: '' })
                    }
                  >
                    Limpiar Formulario
                  </button>
                </div>
              </form>
            </div>

            <h2 className="section-title">📋 Lista de Usuarios Registrados</h2>

            {loading.users && (
              <div className="loading">
                <div className="spinner"></div>
                <span>Cargando usuarios...</span>
              </div>
            )}

            {errorMessages.users && <div className="error-message">⚠️ {errorMessages.users}</div>}

            {!loading.users && !errorMessages.users && (
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
                            <td>{user.nombre}</td>
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
      )}

      {/* Pestaña Registros de Acceso */}
      {activeTab === 'registros' && (
        <div className="tab-content active" id="registros">
          <div className="data-section">
            <h2 className="section-title">📝 Historial Completo de Accesos</h2>

            <div className="controls">
              <div className="status-indicator">
                <div className={`status-dot ${status ? '' : 'offline'}`} id="statusDotRegistros"></div>
                <span id="statusTextRegistros">{status ? 'Conectado' : statusMessage}</span>
              </div>
              <button className="btn" onClick={loadAccessRecords}>
                <span>🔄</span> Actualizar Registros
              </button>
            </div>

            {loading.accesos && (
              <div className="loading">
                <div className="spinner"></div>
                <span>Cargando registros...</span>
              </div>
            )}

            {errorMessages.accesos && <div className="error-message">⚠️ {errorMessages.accesos}</div>}

            {!loading.accesos && !errorMessages.accesos && (
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
        </div>
      )}

      {/* Modal para editar usuario */}
      {editModalVisible && (
        <div
          id="editModal"
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>✏️ Editar Usuario</h2>
            <form id="editUserForm" onSubmit={handleEditUserFormSubmit}>
              <input type="hidden" name="uid" value={editUserForm.uid} />
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="editIdentificacion">Identificación *</label>
                    <input
                      type="text"
                      id="editIdentificacion"
                      name="identificacion"
                      className="form-control"
                      value={editUserForm.identificacion}
                      onChange={handleEditUserFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="editNombre">Nombre Completo *</label>
                    <input
                      type="text"
                      id="editNombre"
                      name="nombre"
                      className="form-control"
                      value={editUserForm.nombre}
                      onChange={handleEditUserFormChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="editCorreo">Correo Electrónico</label>
                    <input
                      type="email"
                      id="editCorreo"
                      name="correo"
                      className="form-control"
                      value={editUserForm.correo}
                      onChange={handleEditUserFormChange}
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="editTelefono">Teléfono</label>
                    <input
                      type="tel"
                      id="editTelefono"
                      name="telefono"
                      className="form-control"
                      value={editUserForm.telefono}
                      onChange={handleEditUserFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-success">
                  Guardar Cambios
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Indexx;
