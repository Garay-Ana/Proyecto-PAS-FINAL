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
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    empleado_id: '',
    tipo_empleado: 'usuario',
    fecha: '',
    hora_entrada: '',
    hora_salida: '',
  });
  const [editId, setEditId] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchEmpleados();
        await fetchHorarios();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Establecer primer empleado por defecto
  useEffect(() => {
    if (!form.empleado_id && empleados.length > 0) {
      const firstEmp = empleados[0];
      setForm(prev => ({
        ...prev,
        empleado_id: firstEmp.id || firstEmp.uid || '',
        tipo_empleado: firstEmp.tipo_empleado || 'usuario',
      }));
    }
  }, [empleados, form.empleado_id]);

  // Obtener horarios
  const fetchHorarios = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al cargar horarios');
      const data = await res.json();

      const dataConNombres = data.map(horario => {
        const empleado = empleados.find(emp => 
          (emp.id === horario.empleado_id || emp.uid === horario.empleado_id || emp.id === horario.empleado_remoto_id) &&
          emp.tipo_empleado === horario.tipo_empleado
        );
        
        return {
          ...horario,
          nombre_completo: horario.nombre_empleado || 
            (empleado ? empleado.nombre_completo || empleado.nombre || empleado.nombre_usuario || '' : '')
        };
      });

      setHorarios(dataConNombres);
    } catch (err) {
      setError(err.message);
    }
  };

  // Obtener empleados
  const fetchEmpleados = async () => {
    try {
      const [usuariosRes, remotosRes] = await Promise.all([
        fetch(USERS_API_URL),
        fetch(REMOTE_EMPLOYEES_API_URL),
      ]);
      if (!usuariosRes.ok || !remotosRes.ok) throw new Error('Error al cargar empleados');
      
      const usuariosData = await usuariosRes.json();
      const remotosData = await remotosRes.json();
      
      const combined = [
        ...usuariosData.map(u => ({ ...u, tipo_empleado: 'usuario' })),
        ...remotosData.map(r => ({ ...r, tipo_empleado: 'remoto' }))
      ];
      
      setEmpleados(combined);
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'empleado_id') {
      const [id, tipo] = value.split('::');
      setForm(prev => ({ ...prev, empleado_id: id, tipo_empleado: tipo }));
    } else if (name === 'searchTerm') {
      setSearchTerm(value);
    } else if (name === 'filterDate') {
      setFilterDate(value);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Calcular duración entre horas
  const calcularDuracion = (entrada, salida) => {
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    
    let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutos < 0) minutos += 24 * 60;
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let fecha;
    
    try {
      if (typeof fechaStr === 'string') {
        const [year, month, day] = fechaStr.includes('T') 
          ? fechaStr.split('T')[0].split('-')
          : fechaStr.split('-');
        fecha = new Date(year, month - 1, day);
      } else if (fechaStr instanceof Date) {
        fecha = fechaStr;
      } else {
        return '';
      }
      
      const diaSemana = diasSemana[fecha.getDay()];
      return `${diaSemana}, ${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
    } catch (e) {
      console.error('Error formateando fecha:', e);
      return '';
    }
  };

  // Función para formatear la hora a HH:MM:SS
  const formatHora = (hora) => {
    if (!hora) return '00:00:00';
    // Si ya tiene segundos, devolver tal cual
    if (hora.split(':').length === 3) return hora;
    // Si solo tiene horas y minutos, agregar segundos
    if (hora.split(':').length === 2) return `${hora}:00`;
    // Si solo tiene horas (caso improbable)
    if (hora.split(':').length === 1) return `${hora}:00:00`;
    return hora;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!form.empleado_id) {
      setError('Seleccione un empleado válido');
      return;
    }
    if (!form.fecha || !form.hora_entrada || !form.hora_salida) {
      setError('Complete todos los campos obligatorios');
      return;
    }

    try {
      const duracion = calcularDuracion(form.hora_entrada, form.hora_salida);
      
      const payload = {
        tipo_empleado: form.tipo_empleado,
        fecha: new Date(form.fecha).toISOString().split('T')[0],
        hora_entrada: formatHora(form.hora_entrada),
        hora_salida: formatHora(form.hora_salida),
        duracion,
        ...(form.tipo_empleado === 'remoto' 
          ? { empleado_remoto_id: Number(form.empleado_id) }
          : { empleado_id: Number(form.empleado_id) })
      };

      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || (editId ? 'Error al actualizar' : 'Error al crear'));
      }

      resetForm();
      await fetchHorarios();
    } catch (err) {
      setError(err.message);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setForm({
      empleado_id: empleados.length > 0 ? empleados[0].id || empleados[0].uid || '' : '',
      tipo_empleado: 'usuario',
      fecha: '',
      hora_entrada: '',
      hora_salida: '',
    });
    setEditId(null);
    setSearchTerm('');
    setError('');
    setShowForm(false);
  };

  // Editar horario
  const handleEdit = (horario) => {
    setForm({
      empleado_id: horario.empleado_id || horario.empleado_remoto_id || '',
      tipo_empleado: horario.tipo_empleado || 'usuario',
      fecha: horario.fecha.split('T')[0], // Asegurarse de que solo tomamos la parte de la fecha
      hora_entrada: horario.hora_entrada,
      hora_salida: horario.hora_salida,
    });
    setEditId(horario.id);
    setShowForm(true);
  };

  // Eliminar horario
  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirmar eliminación?')) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchHorarios();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtrar horarios
  const filteredHorarios = horarios.filter(horario => {
    const matchesSearch = searchTerm === '' || 
      horario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (horario.empleado_id && horario.empleado_id.toString().includes(searchTerm)) ||
      (horario.empleado_remoto_id && horario.empleado_remoto_id.toString().includes(searchTerm));
    
    const matchesDate = filterDate === '' || 
      (horario.fecha && horario.fecha.includes(filterDate));
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="control-horarios-container">
      <div className="header-section">
        <button className="back-button" onClick={() => navigate('/home')}>
          ← Volver
        </button>
        <h2>Control de Horarios</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="controls-section">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-filter"
          />
          <button 
            onClick={() => setShowForm(true)}
            className="add-button"
          >
            + Nuevo Horario
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editId ? 'Editar Horario' : 'Nuevo Horario'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Empleado:</label>
                <select
                  name="empleado_id"
                  value={`${form.empleado_id}::${form.tipo_empleado}`}
                  onChange={handleChange}
                  required
                >
                  {empleados.map(emp => (
                    <option 
                      key={`${emp.id || emp.uid}-${emp.tipo_empleado}`} 
                      value={`${emp.id || emp.uid}::${emp.tipo_empleado}`}
                    >
                      {emp.nombre_completo || emp.nombre || emp.nombre_usuario}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha:</label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hora Entrada:</label>
                  <input
                    type="time"
                    name="hora_entrada"
                    value={form.hora_entrada}
                    onChange={handleChange}
                    required
                    step="1" // Permite segundos en algunos navegadores
                  />
                </div>

                <div className="form-group">
                  <label>Hora Salida:</label>
                  <input
                    type="time"
                    name="hora_salida"
                    value={form.hora_salida}
                    onChange={handleChange}
                    required
                    step="1" // Permite segundos en algunos navegadores
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editId ? 'Guardar Cambios' : 'Registrar'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">Cargando...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredHorarios.length > 0 ? (
                filteredHorarios.map(horario => (
                  <tr key={horario.id}>
                    <td>{horario.nombre_completo}</td>
                    <td>{formatFecha(horario.fecha)}</td>
                    <td>{horario.hora_entrada}</td>
                    <td>{horario.hora_salida}</td>
                    <td>{horario.duracion}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleEdit(horario)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(horario.id)}
                        className="delete-button"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No se encontraron horarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ControlHorarios;