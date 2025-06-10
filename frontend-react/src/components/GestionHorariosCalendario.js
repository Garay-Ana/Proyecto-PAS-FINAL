import React, { useState, useEffect } from 'react';
import './GestionHorariosCalendario.css';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Función para obtener las fechas de la semana actual (lunes a domingo)
const getCurrentWeekDates = () => {
  const current = new Date();
  const first = current.getDate() - current.getDay() + 1; // lunes
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(current.setDate(first + i));
    dates.push(new Date(d));
  }
  return dates;
};

// Formatear hora para mostrar en bloques
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  return `${hour}:${minute}`;
};

const GestionHorariosCalendario = ({ usuarios, horarios }) => {
  const [weekDates, setWeekDates] = useState(getCurrentWeekDates());

  // Mapear horarios por usuario y día para acceso rápido
  const horariosMap = {};
  horarios.forEach((h) => {
    if (!horariosMap[h.empleado_id]) horariosMap[h.empleado_id] = {};
    horariosMap[h.empleado_id][h.dia.toLowerCase()] = h;
  });

  return (
    <div className="gestion-horarios-calendario">
      <h2>Calendario de Horarios</h2>
      <table className="calendario-table">
        <thead>
          <tr>
            <th>Equipo</th>
            {weekDates.map((date, idx) => (
              <th key={idx}>
                {daysOfWeek[idx]}<br />
                {date.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.uid}>
              <td className="usuario-nombre">
                {usuario.nombre_completo}<br />
                <span className="usuario-rol">{usuario.rol || 'Empleado'}</span>
              </td>
              {daysOfWeek.map((day, idx) => {
                const diaLower = day.toLowerCase();
                const horario = horariosMap[usuario.uid]?.[diaLower];
                return (
                  <td key={idx} className="celda-horario">
                    {horario ? (
                      <div className={`bloque-horario ${horario.tipo || 'oficina'}`}>
                        <div className="turno-nombre">{horario.turno || 'Oficinas'}</div>
                        <div className="horario-horas">
                          {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                        </div>
                      </div>
                    ) : (
                      <div className="bloque-descanso">Día de descanso</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionHorariosCalendario;
