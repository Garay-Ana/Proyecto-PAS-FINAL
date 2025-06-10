import React, { useState, useEffect } from 'react';
import GestionHorariosCalendario from './GestionHorariosCalendario';

const USERS_API_URL = 'https://proyecto-pas-final.onrender.com/api/usuarios';
const REMOTE_EMPLOYEES_API_URL = 'https://proyecto-pas-final.onrender.com/api/empleados-remotos';
const HORARIOS_API_BASE_URL = 'https://proyecto-pas-final.onrender.com/api/horarios';

const GestionHorariosContainer = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, remotosRes] = await Promise.all([
          fetch(USERS_API_URL),
          fetch(REMOTE_EMPLOYEES_API_URL),
        ]);

        if (!usuariosRes.ok) throw new Error(`Error al cargar usuarios: ${usuariosRes.status}`);
        if (!remotosRes.ok) throw new Error(`Error al cargar empleados remotos: ${remotosRes.status}`);

        const usuariosData = await usuariosRes.json();
        const remotosData = await remotosRes.json();

        // Combinar usuarios normales y remotos
        const combinedUsuarios = [...usuariosData, ...remotosData];

        setUsuarios(combinedUsuarios);

        // Obtener horarios para el primer usuario si existe
        if (combinedUsuarios.length > 0) {
          const empleadoId = combinedUsuarios[0].id || combinedUsuarios[0].uid;
          const horariosRes = await fetch(`${HORARIOS_API_BASE_URL}/${empleadoId}`);
          if (!horariosRes.ok) throw new Error(`Error al cargar horarios: ${horariosRes.status}`);
          const horariosData = await horariosRes.json();
          setHorarios(horariosData);
        } else {
          setHorarios([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

  return <GestionHorariosCalendario usuarios={usuarios} horarios={horarios} />;
};

export default GestionHorariosContainer;
