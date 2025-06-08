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
      const response = await fetch('http://localhost:3000/api/empleados-remotos', {
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
      const response = await fetch('http://localhost:3000/api/login', {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          {isRegister ? 'Registro de Empleado Remoto' : 'Iniciar Sesión'}
        </h2>

        {isRegister ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {[{ label: 'Nombre', name: 'nombre' },
              { label: 'Apellido', name: 'apellido' },
              { label: 'Correo', name: 'correo', type: 'email' },
              { label: 'Contraseña', name: 'contraseña', type: 'password' },
              { label: 'Teléfono', name: 'telefono', type: 'tel' },
              { label: 'Fecha de Nacimiento', name: 'fechaNacimiento', type: 'date' }
            ].map(({ label, name, type = 'text' }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Registrar
            </button>
            <p className="text-center text-sm mt-4">
              ¿Tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-indigo-600 hover:underline"
              >
                Iniciar sesión
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña:</label>
              <input
                type="password"
                name="passwordLogin"
                value={formData.passwordLogin}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errorLogin && <p className="text-red-500 text-sm">{errorLogin}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Iniciar Sesión
            </button>
            <p className="text-center text-sm mt-4">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-indigo-600 hover:underline"
              >
                Registrarse
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default RemotoPage;
