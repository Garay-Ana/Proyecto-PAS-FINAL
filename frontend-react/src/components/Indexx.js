import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://proyecto-pas-final.onrender.com/api/historial';
const USERS_API_URL = 'https://proyecto-pas-final.onrender.com/api/usuarios';
const TIME_API_URL = 'https://proyecto-pas-final.onrender.com/api/tiempos';

const Indexx = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [historialData, setHistorialData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [lastScannedUID, setLastScannedUID] = useState('');
  const [activeTab, setActiveTab] = useState('usuarios');
  
  // Estados de carga y errores
  const [loading, setLoading] = useState({
    historial: false,
    users: false,
    tiempos: false,
    edit: false,
    delete: false,
    register: false
  });
  
  const [errorMessages, setErrorMessages] = useState({
    historial: '',
    users: '',
    tiempos: '',
    edit: '',
    delete: '',
    register: ''
  });

  // Estados para formularios
  const [userForm, setUserForm] = useState({
    uid: '',
    identificacion: '',
    nombre_completo: '',
    correo: '',
    telefono: '',
    rol: 'usuario',
  });
  
  const [userFormMessage, setUserFormMessage] = useState({ text: '', type: '' });
  
  // Estados para edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    uid: '',
    identificacion: '',
    nombre_completo: '',
    correo: '',
    telefono: '',
    rol: 'usuario',
  });
  const [editMessage, setEditMessage] = useState({ text: '', type: '' });

  // Estados para confirmación de eliminación
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Funciones de formato
  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '-') return '-';
    try {
      const timePart = timeString.includes('T') 
        ? timeString.split('T')[1] 
        : timeString;
      return timePart.substring(0, 5);
    } catch {
      return '-';
    }
  };

  const formatDuration = (duration) => {
    if (!duration || duration === '-') return '-';
    try {
      // Asumimos que la duración viene en formato HH:MM:SS o similar
      return duration.split(':').slice(0, 2).join(':');
    } catch {
      return duration;
    }
  };

  // Funciones para cargar datos
  const loadData = async () => {
    try {
      setLoading(prev => ({ ...prev, historial: true }));
      setErrorMessages(prev => ({ ...prev, historial: '' }));
      
      const [historialRes, usersRes] = await Promise.all([
        fetch(API_URL),
        fetch(USERS_API_URL),
      ]);
      
      if (!historialRes.ok) throw new Error(`Error al cargar historial: ${historialRes.status}`);
      if (!usersRes.ok) throw new Error(`Error al cargar usuarios: ${usersRes.status}`);

      const [historial, users] = await Promise.all([
        historialRes.json(),
        usersRes.json()
      ]);

      setHistorialData(historial);
      setUsersData(users);

      if (historial.length > 0) {
        setLastScannedUID(historial[historial.length - 1].uid);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorMessages(prev => ({ ...prev, historial: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, historial: false }));
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setErrorMessages(prev => ({ ...prev, users: '' }));
      
      const res = await fetch(USERS_API_URL);
      if (!res.ok) throw new Error(`Error al cargar usuarios: ${res.status}`);
      
      const data = await res.json();
      setUsersData(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setErrorMessages(prev => ({ ...prev, users: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const loadTimeRecords = async () => {
    try {
      setLoading(prev => ({ ...prev, tiempos: true }));
      setErrorMessages(prev => ({ ...prev, tiempos: '' }));
      
      const res = await fetch(TIME_API_URL);
      if (!res.ok) throw new Error(`Error al cargar tiempos: ${res.status}`);
      
      const data = await res.json();
      setTimeRecords(data);
    } catch (error) {
      console.error('Error al cargar tiempos:', error);
      setErrorMessages(prev => ({ ...prev, tiempos: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, tiempos: false }));
    }
  };

  // Manejadores de pestañas
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'usuarios') loadUsers();
    else if (tab === 'tiempos') loadTimeRecords();
  };

  // Manejadores de formulario de usuario
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    const { uid, identificacion, nombre_completo, correo, telefono, rol } = userForm;
    
    if (!uid || !identificacion || !nombre_completo || !rol) {
      setUserFormMessage({ text: 'Por favor complete los campos obligatorios (*)', type: 'error' });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, register: true }));
      
      const res = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ uid, identificacion, nombre_completo, correo, telefono, rol }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      const newUser = await res.json();
      setUsersData(prev => [...prev, newUser]);
      setUserFormMessage({ text: 'Usuario registrado correctamente', type: 'success' });
      setUserForm({ uid: '', identificacion: '', nombre_completo: '', correo: '', telefono: '', rol: 'usuario' });
      
      setTimeout(() => {
        setUserFormMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setUserFormMessage({ text: `Error al registrar usuario: ${error.message}`, type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, register: false }));
    }
  };

  // Manejadores de edición
  const openEditModal = (user) => {
    setEditUserForm({
      uid: user.uid,
      identificacion: user.identificacion,
      nombre_completo: user.nombre_completo,
      correo: user.correo || '',
      telefono: user.telefono || '',
      rol: user.rol || 'usuario',
    });
    setEditModalVisible(true);
    setEditMessage({ text: '', type: '' });
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const handleEditUserFormChange = (e) => {
    const { name, value } = e.target;
    setEditUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditUserFormSubmit = async (e) => {
    e.preventDefault();
    const { uid, identificacion, nombre_completo, correo, telefono, rol } = editUserForm;
    
    if (!identificacion || !nombre_completo || !rol) {
      setEditMessage({ text: 'Complete todos los campos obligatorios', type: 'error' });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, edit: true }));
      
      const res = await fetch(`${USERS_API_URL}/${uid}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ identificacion, nombre_completo, correo, telefono, rol }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }

      const updatedUser = await res.json();
      setUsersData(prev => prev.map(user => 
        user.uid === uid ? updatedUser : user
      ));

      setEditMessage({ text: 'Usuario actualizado correctamente', type: 'success' });
      
      setTimeout(() => {
        closeEditModal();
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setEditMessage({ text: error.message || 'Error al actualizar usuario', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  // Manejadores para eliminación
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const res = await fetch(`${USERS_API_URL}/${userToDelete.uid}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }
      
      setUsersData(prev => prev.filter(user => user.uid !== userToDelete.uid));
      closeDeleteModal();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(`Error al eliminar usuario: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Manejadores para capturar UID
  const captureLastUID = () => {
    if (lastScannedUID) {
      setUserForm(prev => ({ ...prev, uid: lastScannedUID }));
    }
  };

  // Efectos
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Renderizado
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-6 shadow-md relative">
        <button 
          onClick={() => navigate('/home')}
          className="absolute left-6 top-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver
        </button>
        
        <div className="text-center md:text-left md:ml-20">
          <h1 className="text-2xl md:text-3xl font-bold">Control de Acceso RFID</h1>
          <p className="text-white/90 mt-1">Sistema de monitoreo y gestión de usuarios</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-6 bg-white">
        <button
          className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'usuarios' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => handleTabClick('usuarios')}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Gestión de Usuarios
          </div>
        </button>
        
        <button
          className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'tiempos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => handleTabClick('tiempos')}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Control de Acceso
          </div>
        </button>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8">
        {activeTab === 'usuarios' && (
          <div className="space-y-8">
            {/* User Registration Form */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Registrar Nuevo Usuario
                </h2>
              </div>
              
              <div className="p-6">
                {userFormMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg ${userFormMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {userFormMessage.text}
                  </div>
                )}

                <form onSubmit={handleUserFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UID de la Tarjeta RFID *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="uid"
                          value={userForm.uid}
                          onChange={handleUserFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                          readOnly
                        />
                        <button 
                          type="button" 
                          onClick={captureLastUID}
                          className="whitespace-nowrap px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          Capturar UID
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Identificación *</label>
                      <input
                        type="text"
                        name="identificacion"
                        value={userForm.identificacion}
                        onChange={handleUserFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre_completo"
                        value={userForm.nombre_completo}
                        onChange={handleUserFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        name="correo"
                        value={userForm.correo}
                        onChange={handleUserFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={userForm.telefono}
                        onChange={handleUserFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                      <select
                        name="rol"
                        value={userForm.rol}
                        onChange={handleUserFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="usuario">Usuario</option>
                        <option value="gerente">Gerente</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="reset"
                      onClick={() => setUserForm({ uid: '', identificacion: '', nombre_completo: '', correo: '', telefono: '', rol: 'usuario' })}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      disabled={loading.register}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-70"
                    >
                      {loading.register ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registrando...
                        </span>
                      ) : 'Guardar Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Lista de Usuarios Registrados
                </h2>
              </div>

              <div className="p-6">
                {loading.users ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : errorMessages.users ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    {errorMessages.users}
                  </div>
                ) : usersData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <p className="mt-2">No hay usuarios registrados</p>
                    <p className="text-sm">Agrega usuarios usando el formulario superior</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificación</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersData.map((user) => (
                          <tr key={user.uid}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-900">{user.uid}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.identificacion}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{user.nombre_completo}</div>
                              <div className="text-xs text-gray-500">{user.correo || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${user.rol === 'gerente' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                {user.rol === 'gerente' ? 'Gerente' : 'Usuario'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tiempos' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Control de Tiempos de Acceso
              </h2>
              <button
                onClick={loadTimeRecords}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Actualizar
              </button>
            </div>

            <div className="p-6">
              {loading.tiempos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : errorMessages.tiempos ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {errorMessages.tiempos}
                </div>
              ) : timeRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="mt-2">No hay registros de tiempo</p>
                  <p className="text-sm">Los tiempos de permanencia aparecerán aquí</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Entrada</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Salida</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeRecords.slice().reverse().map((record, index) => {
                        const user = usersData.find(u => u.uid === record.uid);
                        const userName = user 
                          ? `${user.nombre_completo} (${user.identificacion})` 
                          : `Usuario no registrado (${record.uid})`;
                        
                        return (
                          <tr key={record.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{userName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(record.entrada)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(record.entrada)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.salida === '-' ? '-' : formatTime(record.salida)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDuration(record.duración || record.duracion || record.duration || '-')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Editar Usuario</h3>
              <button 
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              {editMessage.text && (
                <div className={`mb-4 p-3 rounded-lg ${editMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {editMessage.text}
                </div>
              )}

              <form onSubmit={handleEditUserFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
                  <input
                    type="text"
                    value={editUserForm.uid}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identificación *</label>
                  <input
                    type="text"
                    name="identificacion"
                    value={editUserForm.identificacion}
                    onChange={handleEditUserFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={editUserForm.nombre_completo}
                    onChange={handleEditUserFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editUserForm.correo}
                    onChange={handleEditUserFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editUserForm.telefono}
                    onChange={handleEditUserFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                  <select
                    name="rol"
                    value={editUserForm.rol}
                    onChange={handleEditUserFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="usuario">Usuario</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading.edit}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-70"
                  >
                    {loading.edit ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    ) : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Confirmar Eliminación</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">¿Está seguro que desea eliminar al usuario <span className="font-semibold">{userToDelete?.nombre_completo}</span> (ID: {userToDelete?.identificacion})?</p>
              <p className="text-sm text-red-600 mb-6">Esta acción no se puede deshacer.</p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={loading.delete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-70"
                >
                  {loading.delete ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </span>
                  ) : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Indexx;