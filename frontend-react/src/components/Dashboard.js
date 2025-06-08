import React, { useState, useEffect } from 'react';
import Header from './Header';
import StatsContainer from './StatsContainer';
import Controls from './Controls';
import DataSection from './DataSection';

const API_URL = 'https://pruepas.onrender.com/api/historial';
const API_REMOTO_URL = 'http://localhost:3000/api/historial-entradas';

function Dashboard() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffDays}d ${diffHours % 24}h`;
  }

  function updateStats(data) {
    const totalEntries = data.length;
    const today = new Date().toDateString();
    const todayEntries = data.filter(entry => {
      const dateToCheck = entry.timestamp || entry.fecha_hora;
      return new Date(dateToCheck).toDateString() === today;
    }).length;

    const uniqueCards = [...new Set(data.filter(entry => entry.uid).map(entry => entry.uid))].length;
    const lastEntry = data.length > 0 ?
      new Date(data[data.length - 1].timestamp || data[data.length - 1].fecha_hora).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }) : '--:--';

    return { totalEntries, todayEntries, uniqueCards, lastEntry };
  }

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const [responseFisico, responseRemoto] = await Promise.all([
        fetch(API_URL),
        fetch(API_REMOTO_URL)
      ]);
      if (!responseFisico.ok) {
        throw new Error(`Error del servidor físico: ${responseFisico.status}`);
      }
      if (!responseRemoto.ok) {
        throw new Error(`Error del servidor remoto: ${responseRemoto.status}`);
      }
      const jsonDataFisico = await responseFisico.json();
      const jsonDataRemoto = await responseRemoto.json();

      // Mapear datos remotos para que tengan las mismas propiedades que los físicos para facilitar el render
      const mappedRemoto = jsonDataRemoto.map(entry => ({
        uid: null,
        nombre: entry.nombre,
        apellido: entry.apellido,
        timestamp: entry.fecha_hora
      }));

      const combinedData = [...jsonDataFisico, ...mappedRemoto];
      // Ordenar por fecha descendente
      combinedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setData(combinedData);
      setIsOnline(true);
    } catch (err) {
      setError(`No se pudieron cargar los datos: ${err.message}`);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const intervalLoad = setInterval(loadData, 30000);
    const intervalUpdate = setInterval(() => {
      setData(currentData => [...currentData]);
    }, 60000);
    return () => {
      clearInterval(intervalLoad);
      clearInterval(intervalUpdate);
    };
  }, []);

  const stats = updateStats(data);

  return (
    <div className="container">
      <Header />
      <StatsContainer
        totalEntries={stats.totalEntries}
        todayEntries={stats.todayEntries}
        uniqueCards={stats.uniqueCards}
        lastEntry={stats.lastEntry}
      />
      <Controls
        isOnline={isOnline}
        statusMessage={error}
        onRefresh={loadData}
      />
      <DataSection
        data={data}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export default Dashboard;
