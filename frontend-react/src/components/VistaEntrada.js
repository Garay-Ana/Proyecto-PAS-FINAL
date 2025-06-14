import React, { useState } from 'react';

function VistaEntrada({ usuario, onLogout }) {
  const [mensaje, setMensaje] = useState('');

  const registrarEntrada = async () => {
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
        setMensaje('✅ Entrada registrada correctamente. ID: ' + data.registroId);
      }
    } catch (error) {
      setMensaje('❌ Error en la conexión: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2">
          Bienvenido, {usuario.nombre} {usuario.apellido}
        </h2>
        <p className="text-gray-600 mb-6">Correo: {usuario.correo}</p>

        <button
          onClick={registrarEntrada}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors mb-4"
        >
          Registrar Entrada
        </button>

        {mensaje && (
          <div
            className={`p-3 rounded-lg text-sm font-medium mb-4 ${
              mensaje.includes('correctamente')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {mensaje}
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default VistaEntrada;
