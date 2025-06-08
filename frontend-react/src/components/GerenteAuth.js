import React, { useState } from 'react';

const GERENTE_API_URL = 'https://proyecto-pas-final.onrender.com/api/gerentes';

const GerenteAuth = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    identificacion: '',
    nombre_completo: '',
    correo: '',
    telefono: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (isRegister) {
      // Registration
      const { identificacion, nombre_completo, password } = form;
      if (!identificacion || !nombre_completo || !password) {
        setMessage('Por favor complete los campos obligatorios (*)');
        setMessageType('error');
        return;
      }
      try {
        const res = await fetch(`${GERENTE_API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al registrar gerente');
        }
        setMessage('Registro exitoso. Por favor inicie sesión.');
        setMessageType('success');
        setIsRegister(false);
        setForm({
          identificacion: '',
          nombre_completo: '',
          correo: '',
          telefono: '',
          password: '',
        });
      } catch (error) {
        setMessage(`Error al registrar gerente: ${error.message}`);
        setMessageType('error');
      }
    } else {
      // Login
      const { identificacion, password } = form;
      if (!identificacion || !password) {
        setMessage('Por favor complete los campos obligatorios (*)');
        setMessageType('error');
        return;
      }
      try {
        const res = await fetch(`${GERENTE_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identificacion, password }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al iniciar sesión');
        }
        const data = await res.json();
        // Assuming the response contains a token or user info
        onLoginSuccess(data);
      } catch (error) {
        setMessage(`Error al iniciar sesión: ${error.message}`);
        setMessageType('error');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          {isRegister ? 'Registro de Gerente' : 'Inicio de Sesión Gerente'}
        </h1>

        {message && (
          <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="identificacion"
            placeholder="Identificación *"
            value={form.identificacion}
            onChange={handleChange}
            className="form-control"
            required
          />
          {isRegister && (
            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre Completo *"
              value={form.nombre_completo}
              onChange={handleChange}
              className="form-control"
              required
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Contraseña *"
            value={form.password}
            onChange={handleChange}
            className="form-control"
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
                className="form-control"
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
                className="form-control"
              />
            </>
          )}
          <button type="submit" className="btn btn-primary">
            {isRegister ? 'Registrar' : 'Iniciar Sesión'}
          </button>
        </form>

        <button
          className="mt-4 text-blue-600 hover:underline"
          onClick={() => {
            setMessage('');
            setMessageType('');
            setIsRegister(!isRegister);
          }}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
};

export default GerenteAuth;
