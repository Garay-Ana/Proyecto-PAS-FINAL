import React from 'react';
import { Link } from 'react-router-dom';

function HomePage({ onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col items-center px-6 py-12 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl opacity-40"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-100 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="relative z-10 w-full max-w-7xl">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Panel de Control Gerencial</h1>
            <p className="text-gray-500">Gestión integral del personal</p>
          </div>
          <button
            onClick={onLogout}
            className="mt-4 md:mt-0 flex items-center bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Cerrar Sesión
          </button>
        </div>

        {/* Contenedor de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tarjeta Físico */}
          <Link 
            to="/indexx" 
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:-translate-y-1"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src="fisico.jpg"
                alt="Físico"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">Control Presencial</h2>
                <p className="text-white/90 text-sm">Registro de asistencia física</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Tiempo real
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Activo</span>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:shadow-md transition-all">
                Acceder al módulo
              </button>
            </div>
          </Link>

          {/* Tarjeta Historial */}
          <Link 
            to="/dashboard" 
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:-translate-y-1"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src="historial.png"
                alt="Historial"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">Historial Completo</h2>
                <p className="text-white/90 text-sm">Registros históricos de asistencia</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Datos históricos
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Analítica</span>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2.5 rounded-lg font-medium hover:shadow-md transition-all">
                Ver reportes
              </button>
            </div>
          </Link>

          {/* Tarjeta Horario */}
          <Link 
            to="/control-horarios" 
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:-translate-y-1"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src="horario.jpg"
                alt="Horario"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">Gestión de Horarios</h2>
                <p className="text-white/90 text-sm">Configuración de jornadas laborales</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  Configuración
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Flexible</span>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:shadow-md transition-all">
                Administrar
              </button>
            </div>
          </Link>
        </div>

        {/* Sección adicional */}
        <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-5">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Asistencias hoy</p>
                  <p className="text-2xl font-bold text-gray-800">124</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-5">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registros totales</p>
                  <p className="text-2xl font-bold text-gray-800">3,842</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-5">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Puntualidad</p>
                  <p className="text-2xl font-bold text-gray-800">92%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;