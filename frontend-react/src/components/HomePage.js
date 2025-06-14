import React from 'react';
import { Link } from 'react-router-dom';

function HomePage({ onLogout }) {
  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col items-center justify-center px-6 py-10">
      {/* Encabezado */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Panel Principal</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md shadow transition duration-200"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Contenedor de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Tarjeta Físico */}
        <Link to="/indexx" className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
          <img
            src="fisico.jpg"
            alt="Físico"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Físico</h2>
            <p className="text-sm text-gray-600 mb-4">Control de asistencia presencial.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition">
              Ingresar
            </button>
          </div>
        </Link>

        {/* Tarjeta Historial */}
        <Link to="/dashboard" className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
          <img
            src="historial.png"
            alt="Historial"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Historial</h2>
            <p className="text-sm text-gray-600 mb-4">Registros de asistencias anteriores.</p>
            <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-md font-medium transition">
              Ver Historial
            </button>
          </div>
        </Link>

        {/* Tarjeta Horario */}
        <Link to="/control-horarios" className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
          <img
            src="horario.jpg"
            alt="Horario"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Horario</h2>
            <p className="text-sm text-gray-600 mb-4">Gestión de horarios de entrada y salida.</p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition">
              Administrar
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
