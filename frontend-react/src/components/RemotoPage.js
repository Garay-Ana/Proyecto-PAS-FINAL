import React, { useState } from 'react';
import VistaEntrada from './VistaEntrada';

function RemotoPage() {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contraseña: '',
    telefono: '',
    fechaNacimiento: '',
    email: '',
    passwordLogin: ''
  });
  const [usuario, setUsuario] = useState(null);
  const [errorLogin, setErrorLogin] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://proyecto-pas-final.onrender.com/api/empleados-remotos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          contraseña: formData.contraseña,
          telefono: formData.telefono,
          fecha_nacimiento: formData.fechaNacimiento
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert('Error al registrar: ' + errorData.error);
      } else {
        const data = await response.json();
        alert('Empleado remoto registrado correctamente: ' + JSON.stringify(data));
        setFormData({
          nombre: '',
          apellido: '',
          correo: '',
          contraseña: '',
          telefono: '',
          fechaNacimiento: '',
          email: '',
          passwordLogin: ''
        });
      }
    } catch (error) {
      alert('Error en la conexión: ' + error.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    try {
      const response = await fetch('https://proyecto-pas-final.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo: formData.email,
          contraseña: formData.passwordLogin
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setErrorLogin(errorData.error || 'Error en login');
      } else {
        const data = await response.json();
        setUsuario(data.usuario);
      }
    } catch (error) {
      setErrorLogin('Error en la conexión: ' + error.message);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contraseña: '',
      telefono: '',
      fechaNacimiento: '',
      email: '',
      passwordLogin: ''
    });
    setIsRegister(true);
  };

  if (usuario) {
    return <VistaEntrada usuario={usuario} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 px-4 py-12">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Form container with asymmetric design */}
        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row">
            {/* Left side - Branding/Image */}
            <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 flex flex-col justify-center">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">RemoteWork</h1>
                <p className="text-lg opacity-90 mb-6">Conecta con tu equipo desde cualquier lugar</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Acceso 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Seguridad garantizada</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Interfaz intuitiva</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="w-full md:w-3/5 p-10 bg-white/90 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  {isRegister ? 'Registro' : 'Iniciar Sesión'}
                </h2>
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {isRegister ? '¿Ya tienes cuenta?' : '¿Necesitas cuenta?'}
                </button>
              </div>

              {isRegister ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Nombre', name: 'nombre', type: 'text' },
                      { label: 'Apellido', name: 'apellido', type: 'text' },
                      { label: 'Correo electrónico', name: 'correo', type: 'email' },
                      { label: 'Teléfono', name: 'telefono', type: 'tel' },
                      { label: 'Contraseña', name: 'contraseña', type: 'password', colSpan: 'md:col-span-2' },
                      { label: 'Fecha de Nacimiento', name: 'fechaNacimiento', type: 'date', colSpan: 'md:col-span-2' }
                    ].map(({ label, name, type = 'text', colSpan = '' }) => (
                      <div key={name} className={`${colSpan}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <div className="relative">
                          <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          {type === 'password' && (
                            <div className="absolute right-3 top-3 text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Crear cuenta
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <div className="absolute right-3 top-3 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                      <div className="relative">
                        <input
                          type="password"
                          name="passwordLogin"
                          value={formData.passwordLogin}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <div className="absolute right-3 top-3 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {errorLogin && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {errorLogin}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Recuérdame
                        </label>
                      </div>
                      
                      <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Iniciar sesión
                  </button>
                  
                  
                  
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemotoPage;