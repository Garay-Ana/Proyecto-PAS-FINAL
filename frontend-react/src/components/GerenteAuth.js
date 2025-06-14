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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const { nombre_completo, identificacion, correo, telefono, password } = form;

    if (isRegister && (!nombre_completo || !identificacion || !password)) {
      setMessage('Por favor complete los campos obligatorios (*)');
      setMessageType('error');
      return;
    }

    if (!isRegister && (!identificacion || !password)) {
      setMessage('Por favor complete los campos obligatorios (*)');
      setMessageType('error');
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 px-6 font-[Inter]">
      <div className="bg-white rounded-3xl shadow-2xl p-14 w-full max-w-2xl transition-all duration-300">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          {isRegister ? 'Registro de Gerente' : 'Inicio de Sesión Gerente'}
        </h1>

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-lg ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre Completo *"
              value={form.nombre_completo}
              onChange={handleChange}
              className="w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          )}
          <input
            type="text"
            name="identificacion"
            placeholder="Identificación *"
            value={form.identificacion}
            onChange={handleChange}
            className="w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {isRegister && (
            <>
              <input
                type="email"
                name="correo"
                placeholder="Correo Electrónico"
                value={form.correo}
                onChange={handleChange}
                className="w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </>
          )}
          <input
            type="password"
            name="password"
            placeholder="Contraseña *"
            value={form.password}
            onChange={handleChange}
            className="w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="w-full py-4 text-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition duration-200"
          >
            {isRegister ? 'Registrar' : 'Iniciar Sesión'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMessage('');
            setMessageType('');
            setIsRegister(!isRegister);
          }}
          className="mt-6 block text-lg text-purple-700 hover:underline text-center"
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
};

export default GerenteAuth;
