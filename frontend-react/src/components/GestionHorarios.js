import React, { useState, useEffect } from 'react';

const GestionHorarios = ({ usuarios }) => {
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({
    id: null,
    dia: '',
    hora_inicio: '',
    hora_fin: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedUsuario) {
      fetch(`/api/horarios/${selectedUsuario}`)
        .then((res) => res.json())
        .then((data) => setHorarios(data))
        .catch(() => setMessage('Error al cargar horarios'));
    } else {
      setHorarios([]);
    }
  }, [selectedUsuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectUsuario = (e) => {
    setSelectedUsuario(e.target.value);
    setForm({ id: null, dia: '', hora_inicio: '', hora_fin: '' });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUsuario) {
      setMessage('Seleccione un usuario');
      return;
    }
    const payload = {
      empleado_id: selectedUsuario,
      tipo_empleado: 'usuario', // o 'gerente' si aplica
      dia: form.dia,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
    };
    try {
      let res;
      if (form.id) {
        res = await fetch(`/api/horarios/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/horarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error('Error en la respuesta');
      setMessage('Horario guardado correctamente');
      setForm({ id: null, dia: '', hora_inicio: '', hora_fin: '' });
      // Recargar horarios
      const horariosRes = await fetch(`/api/horarios/${selectedUsuario}`);
      const horariosData = await horariosRes.json();
      setHorarios(horariosData);
    } catch {
      setMessage('Error al guardar horario');
    }
  };

  const handleEdit = (horario) => {
    setForm({
      id: horario.id,
      dia: horario.dia,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
    });
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este horario?')) return;
    try {
      const res = await fetch(`/api/horarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error en la respuesta');
      setMessage('Horario eliminado');
      // Recargar horarios
      const horariosRes = await fetch(`/api/horarios/${selectedUsuario}`);
      const horariosData = await horariosRes.json();
      setHorarios(horariosData);
    } catch {
      setMessage('Error al eliminar horario');
    }
  };

  return (
    <div className="gestion-horarios">
      <h2>Gestión de Horarios</h2>
      <div>
        <label>Seleccione Usuario:</label>
        <select value={selectedUsuario} onChange={handleSelectUsuario}>
          <option value="">-- Seleccione --</option>
          {usuarios.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.nombre_completo}
            </option>
          ))}
        </select>
      </div>

      {selectedUsuario && (
        <>
          <form onSubmit={handleSubmit} className="horario-form">
            <div>
              <label>Día:</label>
              <input
                type="text"
                name="dia"
                value={form.dia}
                onChange={handleChange}
                placeholder="Ej: Lunes"
                required
              />
            </div>
            <div>
              <label>Hora Inicio:</label>
              <input
                type="time"
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Hora Fin:</label>
              <input
                type="time"
                name="hora_fin"
                value={form.hora_fin}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit">{form.id ? 'Actualizar' : 'Agregar'} Horario</button>
          </form>

          {message && <p className="message">{message}</p>}

          <h3>Horarios asignados</h3>
          {horarios.length === 0 ? (
            <p>No hay horarios asignados para este usuario.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h) => (
                  <tr key={h.id}>
                    <td>{h.dia}</td>
                    <td>{h.hora_inicio}</td>
                    <td>{h.hora_fin}</td>
                    <td>
                      <button onClick={() => handleEdit(h)}>Editar</button>
                      <button onClick={() => handleDelete(h.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default GestionHorarios;
