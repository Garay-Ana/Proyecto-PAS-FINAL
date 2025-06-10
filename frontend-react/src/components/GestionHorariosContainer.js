import React, { useState, useEffect } from 'react';
import GestionHorariosCalendario from './GestionHorariosCalendario';

const USERS_API_URL = 'https://proyecto-pas-final.onrender.com/api/usuarios';
const REMOTE_EMPLOYEES_API_URL = 'https://proyecto-pas-final.onrender.com/api/empleados-remotos';
const HORARIOS_API_URL = 'https://proyecto-pas-final.onrender.com/api/horarios';

const GestionHorariosContainer = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, remotosRes, horariosRes] = await Promise.all([
          fetch(USERS_API_URL),
          fetch(REMOTE_EMPLOYEES_API_URL),
          fetch(HORARIOS_API_URL),
        ]);

        if (!usuariosRes.ok) throw new Error(`Error al cargar usuarios: ${usuariosRes.status}`);
        if (!remotosRes.ok) throw new Error(`Error al cargar empleados remotos: ${remotosRes.status}`);
        if (!horariosRes.ok) throw new Error(`Error al cargar horarios: ${horariosRes.status}`);

        const usuariosData = await usuariosRes.json();
        const remotosData = await remotosRes.json();
        const horariosData = await horariosRes.json();

        // Combinar usuarios normales y remotos
        const combinedUsuarios = [...usuariosData, ...remotosData];

        setUsuarios(combinedUsuarios);
        setHorarios(horariosData);
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
