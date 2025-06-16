import React, { useState } from 'react';

const GerenteAuth = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: '',
    identificacion: '',
    correo: '',
    telefono: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    const { nombre_completo, identificacion, correo, telefono, password } = form;

    if (isRegister && (!nombre_completo || !identificacion || !password)) {
      setMessage('Por favor complete los campos obligatorios (*)');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (!isRegister && (!identificacion || !password)) {
      setMessage('Por favor complete los campos obligatorios (*)');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const url = isRegister
      ? 'https://proyecto-pas-final.onrender.com/api/gerentes/register'
      : 'https://proyecto-pas-final.onrender.com/api/gerentes/login';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister
          ? { nombre_completo, identificacion, correo, telefono, password }
          : { identificacion, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Error en la operación');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      if (isRegister) {
        setMessage('Registro exitoso. Por favor inicie sesión.');
        setMessageType('success');
        setIsRegister(false);
        setForm({ nombre_completo: '', identificacion: '', correo: '', telefono: '', password: '' });
      } else {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.gerente, data.token);
      }
    } catch (error) {
      setMessage('Error de conexión');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 px-6 font-[Inter] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl opacity-40"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 md:p-14 transition-all duration-300 border border-white/20">
          {/* Logo/Header */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
            {isRegister ? 'Registro Gerencial' : 'Acceso Gerencial'}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {isRegister ? 'Complete sus datos para registrarse' : 'Ingrese sus credenciales para continuar'}
          </p>

          {message && (
            <div className={`p-4 mb-6 rounded-xl flex items-start ${
              messageType === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-100' 
                : 'bg-green-50 text-green-700 border border-green-100'
            }`}>
              <svg className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                messageType === 'error' ? 'text-red-500' : 'text-green-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {messageType === 'error' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                )}
              </svg>
              <div>
                <p className="font-medium">{messageType === 'error' ? 'Error' : 'Éxito'}</p>
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="relative">
                <input
                  type="text"
                  name="nombre_completo"
                  placeholder="Nombre Completo *"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
            )}
            
            <div className="relative">
              <input
                type="text"
                name="identificacion"
                placeholder="Identificación *"
                value={form.identificacion}
                onChange={handleChange}
                className="w-full px-5 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <div className="absolute right-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
            
            {isRegister && (
              <>
                <div className="relative">
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo Electrónico"
                    value={form.correo}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                </div>
              </>
            )}
            
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Contraseña *"
                value={form.password}
                onChange={handleChange}
                className="w-full px-5 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <div className="absolute right-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {isRegister ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                      Registrar Cuenta
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                      </svg>
                      Iniciar Sesión
                    </>
                  )}
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setMessageType('');
                setIsRegister(!isRegister);
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline transition-colors"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenteAuth;