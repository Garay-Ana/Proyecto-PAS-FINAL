import React, { useState } from 'react';

function VistaEntrada({ usuario, onLogout }) {
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const registrarEntrada = async () => {
    setIsLoading(true);
    setMensaje('');
    try {
      const response = await fetch('https://proyecto-pas-final.onrender.com/api/registro-asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: usuario.id, tipo: 'remoto' })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMensaje('Error al registrar entrada: ' + errorData.error);
      } else {
        const data = await response.json();
        setMensaje('Entrada registrada correctamente. ID: ' + data.registroId);
      }
    } catch (error) {
      setMensaje('Error en la conexión: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 px-4 py-12">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Asymmetric container with glass effect */}
        <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row">
            {/* Left side - Profile */}
            <div className="w-full md:w-2/5 bg-gradient-to-b from-indigo-600 to-purple-700 p-8 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p className="text-white/80 text-sm mt-1">{usuario.correo}</p>
              
              <div className="mt-6 w-full">
                <div className="bg-white/10 rounded-lg p-4 mb-3">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Estado</p>
                  <p className="text-white font-medium">Trabajo remoto</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Última conexión</p>
                  <p className="text-white font-medium">Hoy, {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="w-full md:w-3/5 p-10 bg-white/90 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Registro de Asistencia</h3>
              <p className="text-gray-500 mb-8">Registra tu hora de entrada para el día de hoy</p>
              
              <button
                onClick={registrarEntrada}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-medium mb-6 transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
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
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Registrar Entrada
                  </div>
                )}
              </button>
              
              {mensaje && (
                <div className={`p-4 rounded-xl mb-6 flex items-start ${
                  mensaje.includes('correctamente') 
                    ? 'bg-emerald-50 text-emerald-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  <svg className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                    mensaje.includes('correctamente') ? 'text-emerald-500' : 'text-red-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {mensaje.includes('correctamente') ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    )}
                  </svg>
                  <div>
                    <p className="font-medium">{mensaje.includes('correctamente') ? 'Éxito' : 'Error'}</p>
                    <p className="text-sm">{mensaje}</p>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-sm transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VistaEntrada;