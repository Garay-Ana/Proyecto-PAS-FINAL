import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ControlHorarios.css';

const API_URL = 'https://proyecto-pas-final.onrender.com/api/control-horarios';
const USERS_API_URL = 'https://proyecto-pas-final.onrender.com/api/usuarios';
const REMOTE_EMPLOYEES_API_URL = 'https://proyecto-pas-final.onrender.com/api/empleados-remotos';

const ControlHorarios = () => {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    empleado_id: '',
    tipo_empleado: 'usuario',
    fecha: '',
    hora_entrada: '',
    hora_salida: '',
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!form.empleado_id && empleados.length > 0) {
      const firstEmp = empleados[0];
      setForm((prev) => ({
        ...prev,
        empleado_id: firstEmp.id || firstEmp.uid || '',
        tipo_empleado: firstEmp.tipo_empleado || 'usuario',
      }));
    }
  }, [empleados, form.empleado_id]);

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al cargar horarios');
      const data = await res.json();

      const dataConNombres = data.map((horario) => {
        const empleado = empleados.find(
          (emp) =>
            (emp.id === horario.empleado_id || emp.uid === horario.empleado_id || emp.id === horario.empleado_remoto_id) &&
            emp.tipo_empleado === horario.tipo_empleado
        );
        return {
          ...horario,
          nombre_completo: horario.nombre_empleado || (empleado
            ? empleado.nombre_completo || empleado.nombre || empleado.nombre_usuario || ''
            : ''),
        };
      });

      setHorarios(dataConNombres);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const [usuariosRes, remotosRes] = await Promise.all([
        fetch(USERS_API_URL),
        fetch(REMOTE_EMPLOYEES_API_URL),
      ]);
      if (!usuariosRes.ok) throw new Error('Error al cargar usuarios');
      if (!remotosRes.ok) throw new Error('Error al cargar empleados remotos');
      const usuariosData = await usuariosRes.json();
      const remotosData = await remotosRes.json();
      const usuariosConTipo = usuariosData.map((u) => ({ ...u, tipo_empleado: 'usuario' }));
      const remotosConTipo = remotosData.map((r) => ({ ...r, tipo_empleado: 'remoto' }));
      const combinedEmpleados = [...usuariosConTipo, ...remotosConTipo];
      setEmpleados(combinedEmpleados);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHorarios();
    fetchEmpleados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'empleado_id') {
      const [id, tipo] = value.split('::');
      console.log('handleChange empleado_id:', id, 'tipo_empleado:', tipo);
      setForm((prev) => ({ ...prev, empleado_id: id, tipo_empleado: tipo }));
    } else if (name === 'searchId') {
      setSearchId(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calcularDuracion = (entrada, salida) => {
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutos < 0) minutos += 24 * 60;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.empleado_id) {
      setError('Debe seleccionar un empleado válido antes de guardar.');
      return;
    }
    if (!form.fecha || !form.hora_entrada || !form.hora_salida) {
      setError('Debe completar fecha, hora de entrada y hora de salida.');
      return;
    }
    const duracion = calcularDuracion(form.hora_entrada, form.hora_salida);

    const formatHora = (hora) => {
      if (hora.length === 5) {
        return hora + ':00';
      }
      return hora;
    };

    const hora_entrada_formateada = formatHora(form.hora_entrada);
    const hora_salida_formateada = formatHora(form.hora_salida);

    try {
      let payload = {
        tipo_empleado: form.tipo_empleado,
        fecha: form.fecha ? new Date(form.fecha).toISOString().split('T')[0] : '',
        hora_entrada: hora_entrada_formateada,
        hora_salida: hora_salida_formateada,
        duracion: duracion,
      };
      if (form.tipo_empleado === 'remoto') {
        payload.empleado_remoto_id = Number(form.empleado_id);
      } else {
        payload.empleado_id = Number(form.empleado_id);
      }
      console.log('Payload final a enviar:', payload);
      let res;
      if (editId) {
        res = await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error('Error al guardar horario');
      setForm({ empleado_id: '', tipo_empleado: 'usuario', fecha: '', hora_entrada: '', hora_salida: '' });
      setSearchId('');
      setEditId(null);
      setShowForm(false);
      fetchHorarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (horario) => {
    setForm({
      empleado_id: horario.empleado_id,
      tipo_empleado: horario.tipo_empleado || 'usuario',
      fecha: horario.fecha,
      hora_entrada: horario.hora_entrada,
      hora_salida: horario.hora_salida,
    });
    setSearchId('');
    setEditId(horario.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar horario');
      fetchHorarios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="control-horarios-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Volver a Home
      </button>
      <h2>Control Horario</h2>
      {error && <p className="error-message">Error: {error}</p>}
      {loading ? (
        <p>Cargando horarios...</p>
      ) : (
        <>
          <button 
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm({ empleado_id: '', tipo_empleado: 'usuario', fecha: '', hora_entrada: '', hora_salida: '' });
            }} 
            className="btn-registrar-horario"
          >
            Registrar Horario
          </button>
          
          {showForm && (
            <div className="form-container">
              <h3>{editId ? 'Editar Horario' : 'Registrar Horas'}</h3>
              <form onSubmit={handleSubmit} className="control-horarios-form">
                <input
                  type="text"
                  name="searchId"
                  placeholder="Buscar empleado por ID"
                  value={searchId}
                  onChange={handleChange}
                  className="search-id-input"
                />
                <select
                  name="empleado_id"
                  value={`${form.empleado_id}::${form.tipo_empleado}`}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Seleccione un empleado</option>
                  {empleados
                    .filter((emp) => {
                      if (!searchId) return true;
                      const idEmp = emp.id || emp.uid || '';
                      return idEmp && idEmp.toString().toLowerCase().includes(searchId.toLowerCase());
                    })
                    .map((emp) => (
                      <option key={emp.id || emp.uid} value={`${emp.id || emp.uid}::${emp.tipo_empleado}`}>
                        {emp.nombre_completo || emp.nombre || emp.nombre_usuario}
                      </option>
                    ))}
                </select>
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
                <div className="form-buttons">
                  <button type="submit" className="control-horarios-submit">
                    {editId ? 'Guardar cambios' : 'Añadir fichaje'}
                  </button>
                  <button
                    type="button"
                    className="control-horarios-cancel"
                    onClick={() => {
                      setForm({ empleado_id: '', tipo_empleado: 'usuario', fecha: '', hora_entrada: '', hora_salida: '' });
                      setEditId(null);
                      setError('');
                      setSearchId('');
                      setShowForm(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Hora entrada</th>
                <th>Hora salida</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((h) => (
                <tr key={h.id}>
                  <td>{h.nombre_completo}</td>
                  <td>{(() => {
                    if (!h.fecha) return '';
                    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                    let year, month, day;
                    if (typeof h.fecha === 'string') {
                      const fechaStr = h.fecha.includes('T') ? h.fecha.split('T')[0] : h.fecha;
                      [year, month, day] = fechaStr.split('-');
                    } else if (h.fecha instanceof Date) {
                      year = h.fecha.getFullYear();
                      month = (h.fecha.getMonth() + 1).toString().padStart(2, '0');
                      day = h.fecha.getDate().toString().padStart(2, '0');
                    } else {
                      return '';
                    }
                    if (!year || !month || !day) return '';
                    const fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
                    const diaSemana = diasSemana[fechaObj.getDay()];
                    return `${diaSemana}, ${day}/${month}/${year}`;
                  })()}</td>
                  <td>{h.hora_entrada}</td>
                  <td>{h.hora_salida}</td>
                  <td>{h.duracion}</td>
                  <td>
                    <button onClick={() => handleEdit(h)} className="btn-edit">Editar</button>
                    <button onClick={() => handleDelete(h.id)} className="btn-delete">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ControlHorarios;