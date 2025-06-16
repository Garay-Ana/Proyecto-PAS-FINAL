import React, { useState, useEffect } from 'react';
import './indexx.css';

const API_URL = 'https://proyecto-pas-final.onrender.com/api/historial';
const USERS_API_URL = 'https://proyecto-pas-final.onrender.com/api/usuarios';
const ACCESS_API_URL = 'https://proyecto-pas-final.onrender.com/api/accesos';
const TIME_API_URL = 'https://proyecto-pas-final.onrender.com/api/tiempos';

const Indexx = () => {
  const [historialData, setHistorialData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [accessRecords, setAccessRecords] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [lastScannedUID, setLastScannedUID] = useState('');
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState({
    historial: false,
    users: false,
    accesos: false,
    tiempos: false,
    asignacion: false,
  });
  const [errorMessages, setErrorMessages] = useState({
    historial: '',
    users: '',
    accesos: '',
    tiempos: '',
    asignacion: '',
  });
  const [userForm, setUserForm] = useState({
    uid: '',
    identificacion: '',
    nombre_completo: '',
    correo: '',
    telefono: '',
    rol: 'usuario',
  });
  const [userFormMessage, setUserFormMessage] = useState('');
  const [userFormMessageType, setUserFormMessageType] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    uid: '',
    identificacion: '',
    nombre_completo: '',
    correo: '',
    telefono: '',
    rol: 'usuario',
  });
  const [assignForm, setAssignForm] = useState({
    gerenteUid: '',
    usuarioUid: '',
    tarjetaId: '',
  });
  const [assignMessage, setAssignMessage] = useState('');
  const [assignMessageType, setAssignMessageType] = useState('');

  // Función para formatear la fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      // Si la fecha ya está en formato local (contiene /), devolverla tal cual
      if (fecha.includes('/')) return fecha;
      
      // Para fechas en formato ISO (YYYY-MM-DD)
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Para fechas en formato ISO con tiempo (YYYY-MM-DDTHH:MM:SS)
      if (fecha.includes('T')) {
        const dateObj = new Date(fecha);
        return dateObj.toLocaleDateString('es-ES');
      }
      
      // Para otros formatos, devolver la fecha original
      return fecha;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return fecha;
    }
  };

  // Función para formatear la hora
  const formatHora = (hora) => {
    if (!hora) return '-';
    try {
      // Si ya es solo la hora (HH:MM:SS o HH:MM)
      if (hora.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return hora.length > 5 ? hora.substring(0, 5) : hora;
      }
      
      // Si viene en formato ISO con fecha (YYYY-MM-DDTHH:MM:SS)
      if (hora.includes('T')) {
        return hora.split('T')[1].substring(0, 5);
      }
      
      // Para otros formatos, devolver la hora original
      return hora;
    } catch (error) {
      console.error('Error al formatear hora:', error);
      return hora;
    }
  };

  // Format date and time ago
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

  // Load data functions
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      setErrorMessages((prev) => ({ ...prev, accesos: `No se pudieron cargar los registros: ${error.message}` }));
    } finally {
      setLoading((prev) => ({ ...prev, accesos: false }));
    }
  };

  const loadTimeRecords = async () => {
    setLoading((prev) => ({ ...prev, tiempos: true }));
    setErrorMessages((prev) => ({ ...prev, tiempos: '' }));
    try {
      const res = await fetch(TIME_API_URL);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      setTimeRecords(data);
    } catch (error) {
      setErrorMessages((prev) => ({ ...prev, tiempos: `No se pudieron cargar los tiempos: ${error.message}` }));
    } finally {
      setLoading((prev) => ({ ...prev, tiempos: false }));
    }
  };

  // Process time entry (entrada/salida)
  const processTimeEntry = async (uid, timestamp) => {
    try {
      const res = await fetch(`${TIME_API_URL}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, timestamp }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al procesar entrada/salida');
      }
      const result = await res.json();
      // Refresh time records after processing
      loadTimeRecords();
      return result;
    } catch (error) {
      console.error('Error al procesar entrada/salida:', error);
      return null;
    }
  };

  // Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'usuarios') {
      loadUsers();
    } else if (tab === 'registros') {
      loadAccessRecords();
    } else if (tab === 'tiempos') {
      loadTimeRecords();
    }
  };

  // User form handlers
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    const { uid, identificacion, nombre_completo, correo, telefono, rol } = userForm;
    if (!uid || !identificacion || !nombre_completo || !rol) {
      setUserFormMessage('Por favor complete los campos obligatorios (*)');
      setUserFormMessageType('error');
      return;
    }
    try {
      const res = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, identificacion, nombre_completo, correo, telefono, rol }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar usuario');
      }
      const newUser = await res.json();
      setUsersData((prev) => [...prev, newUser]);
      setUserFormMessage('Usuario registrado correctamente');
      setUserFormMessageType('success');
      setUserForm({ uid: '', identificacion: '', nombre_completo: '', correo: '', telefono: '', rol: 'usuario' });
    } catch (error) {
      setUserFormMessage(`Error al guardar usuario: ${error.message}`);
      setUserFormMessageType('error');
    }
  };

  // Edit modal handlers
  const openEditModal = (uid) => {
    const user = usersData.find((u) => u.uid === uid);
    if (!user) return;
    setEditUserForm({
      uid: user.uid,
      identificacion: user.identificacion,
      nombre_completo: user.nombre_completo,
      correo: user.correo || '',
      telefono: user.telefono || '',
      rol: user.rol || 'usuario',
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
    const { uid, identificacion, nombre_completo, correo, telefono, rol } = editUserForm;
    if (!identificacion || !nombre_completo || !rol) {
      return;
    }
    try {
      const res = await fetch(`${USERS_API_URL}/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificacion, nombre_completo, correo, telefono, rol }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }
      setUsersData((prev) =>
        prev.map((user) => (user.uid === uid ? { ...user, identificacion, nombre_completo, correo, telefono, rol } : user))
      );
      closeEditModal();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  // Delete user
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
      console.error('Error al eliminar usuario:', error);
    }
  };

  // Capture last scanned UID
  const captureLastUID = () => {
    if (lastScannedUID) {
      setUserForm((prev) => ({ ...prev, uid: lastScannedUID }));
    }
  };

  // Assign card form handlers
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const { gerenteUid, usuarioUid, tarjetaId } = assignForm;
    if (!gerenteUid || !usuarioUid || !tarjetaId) {
      setAssignMessage('Por favor complete todos los campos');
      setAssignMessageType('error');
      return;
    }
    setLoading((prev) => ({ ...prev, asignacion: true }));
    setAssignMessage('');
    try {
      const res = await fetch('https://pruepas.onrender.com/api/asignar-tarjeta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gerenteUid, usuarioUid, tarjetaId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al asignar tarjeta');
      }
      setAssignMessage('Tarjeta asignada correctamente');
      setAssignMessageType('success');
      setAssignForm({ gerenteUid: '', usuarioUid: '', tarjetaId: '' });
    } catch (error) {
      setAssignMessage(`Error al asignar tarjeta: ${error.message}`);
      setAssignMessageType('error');
    } finally {
      setLoading((prev) => ({ ...prev, asignacion: false }));
    }
  };

  useEffect(() => {
    loadData();
    const intervalLoad = setInterval(loadData, 30000);
    return () => clearInterval(intervalLoad);
  }, []);

  useEffect(() => {
    const intervalUpdateTimes = setInterval(() => {
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
          className={`tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => handleTabClick('usuarios')}
        >
          Gestión de Usuarios
        </div>
        
        <div
          className={`tab ${activeTab === 'tiempos' ? 'active' : ''}`}
          onClick={() => handleTabClick('tiempos')}
        >
          Control de Acceso
        </div>
      </div>

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
                        readOnly
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
      )}

     

      {activeTab === 'tiempos' && (
        <div className="tab-content active" id="tiempos">
          <div className="data-section">
            <h2 className="section-title">⏱️ Control de Tiempos de Acceso</h2>

            <div className="controls">
              <div className="status-indicator">
                <div className={`status-dot ${true ? '' : 'offline'}`} id="statusDotTiempos"></div>
                <span id="statusTextTiempos">{true ? 'Conectado' : ''}</span>
              </div>
              <button className="btn" onClick={loadTimeRecords}>
                <span>🔄</span> Actualizar Tiempos
              </button>
            </div>

            <div className="table-container">
              {loading.tiempos && (
                <div id="loadingTimes" className="loading">
                  <div className="spinner"></div>
                  <span>Cargando tiempos...</span>
                </div>
              )}

              {errorMessages.tiempos && <div className="error-message">⚠️ {errorMessages.tiempos}</div>}

              {!loading.tiempos && !errorMessages.tiempos && (
                <>
                  {timeRecords.length === 0 ? (
                    <div className="no-data">
                      <p>⏰ No hay registros de tiempo</p>
                      <p>Los tiempos de permanencia aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table id="timesTable">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Hora Entrada</th>
                            <th>Hora Salida</th>
                            <th>Tiempo Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeRecords
  .slice()
  .reverse()
  .map((record, index) => {
    const user = usersData.find((u) => u.uid === record.uid);
    const userName = user
      ? `${user.nombre_completo} (${user.identificacion})`
      : `Usuario no registrado (${record.uid})`;

    // Función para formatear fecha
    const formatDate = (isoString) => {
      if (!isoString || isoString === '-') return '-';
      try {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES');
      } catch {
        return '-';
      }
    };

    // Función para formatear hora
    const formatTime = (isoString) => {
      if (!isoString || isoString === '-') return '-';
      try {
        const timePart = isoString.split('T')[1] || '';
        return timePart.substring(0, 5);
      } catch {
        return '-';
      }
    };

    // MOSTRAR DURACIÓN CORRECTAMENTE
    const mostrarDuracion = () => {
      // Primero intentamos con 'duración' (con tilde)
      if (record.duración !== undefined && record.duración !== null) {
        return record.duración;
      }
      // Luego con 'duracion' (sin tilde)
      else if (record.duracion !== undefined && record.duracion !== null) {
        return record.duracion;
      }
      // Finalmente con cualquier otra variante
      else if (record.duration !== undefined && record.duration !== null) {
        return record.duration;
      }
      return '-';
    };

    return (
      <tr key={record.id || index}>
        <td>{index + 1}</td>
        <td>{userName}</td>
        <td>{formatDate(record.entrada)}</td>
        <td>{formatTime(record.entrada)}</td>
        <td>{record.salida === '-' ? '-' : formatTime(record.salida)}</td>
        <td>{mostrarDuracion()}</td> {/* Llamamos a la función aquí */}
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
        </div>
      )}
    </div>
  );
};

export default Indexx;