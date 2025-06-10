import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Seleccione una opción
        </h1>
        <div className="flex flex-col gap-4">
          <Link to="/remoto">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              Remoto
            </button>
          </Link>
          <Link to="/indexx">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              Físico
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition">
              Historial
            </button>
          </Link>
          <Link to="/gestion-horarios">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition">
              Horario
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
