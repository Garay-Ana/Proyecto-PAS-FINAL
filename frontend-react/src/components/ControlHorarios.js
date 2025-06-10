import React, { useState, useEffect } from 'react';

const API_URL = 'https://proyecto-pas-final.onrender.com/api/control-horarios';

const ControlHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    empleado_id: '',
    fecha: '',
    hora_entrada: '',
    hora_salida: '',
  });

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al cargar horarios');
      const data = await res.json();
      setHorarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calcularDuracion = (entrada, salida) => {
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutos < 0) minutos += 24 * 60; // Ajuste para cruces de medianoche
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const duracion = calcularDuracion(form.hora_entrada, form.hora_salida);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duracion }),
      });
      if (!res.ok) throw new Error('Error al registrar horario');
      setForm({ empleado_id: '', fecha: '', hora_entrada: '', hora_salida: '' });
      fetchHorarios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="control-horarios-container" style={{ padding: '1rem' }}>
      <h2>Control Horario</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading ? (
        <p>Cargando horarios...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Hora entrada</th>
              <th>Hora salida</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{h.nombre_completo}</td>
                <td>{new Date(h.fecha).toLocaleDateString('es-ES')}</td>
                <td>{h.hora_entrada}</td>
                <td>{h.hora_salida}</td>
                <td>{h.duracion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Registrar Horas</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
        <input
          type="text"
          name="empleado_id"
          placeholder="ID Empleado"
          value={form.empleado_id}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="hora_entrada"
          value={form.hora_entrada}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="hora_salida"
          value={form.hora_salida}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px' }}>
          Añadir fichaje
        </button>
      </form>
    </div>
  );
};

export default ControlHorarios;
