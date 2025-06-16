import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import StatsContainer from './StatsContainer';
import Controls from './Controls';
import DataSection from './DataSection';

const API_URL = 'https://proyecto-pas-final.onrender.com/api/historial';
const API_REMOTO_URL = 'https://proyecto-pas-final.onrender.com/api/historial-entradas';

function Dashboard() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Estados para filtro de rango de fechas
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const navigate = useNavigate();

  function updateStats(data) {
    const totalEntries = data.length;
    const today = new Date().toDateString();
    const todayEntries = data.filter(entry => {
      const dateToCheck = entry.timestamp || entry.fecha_hora;
      return new Date(dateToCheck).toDateString() === today;
    }).length;

    const uniqueCards = [...new Set(data.filter(entry => entry.uid).map(entry => entry.uid))].length;
    const lastEntry = data.length > 0
      ? new Date(data[data.length - 1].timestamp || data[data.length - 1].fecha_hora).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
      : '--:--';

    return { totalEntries, todayEntries, uniqueCards, lastEntry };
  }

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const [resFisico, resRemoto] = await Promise.all([
        fetch(API_URL),
        fetch(API_REMOTO_URL)
      ]);

      if (!resFisico.ok || !resRemoto.ok) {
        throw new Error('Error al obtener los datos');
      }

      const dataFisico = await resFisico.json();
      const dataRemoto = await resRemoto.json();

      const mappedRemoto = dataRemoto.map(entry => ({
        uid: null,
        nombre: entry.nombre,
        apellido: entry.apellido,
        timestamp: entry.fecha_hora
      }));

      const combined = [...dataFisico, ...mappedRemoto];
      combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setData(combined);
      setIsOnline(true);
    } catch (err) {
      setError('No se pudieron cargar los datos: ' + err.message);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const reloadInterval = setInterval(loadData, 30000);
    const updateInterval = setInterval(() => {
      setData(d => [...d]);
    }, 60000);

    return () => {
      clearInterval(reloadInterval);
      clearInterval(updateInterval);
    };
  }, []);

  // Filtrar datos según rango de fechas
  const filteredData = data.filter(entry => {
    if (!filterStartDate && !filterEndDate) return true;
    const entryDate = new Date(entry.timestamp || entry.fecha_hora);
    if (filterStartDate && entryDate < new Date(filterStartDate)) return false;
    if (filterEndDate) {
      // Para incluir todo el día final, se añade 1 día menos 1 ms
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      if (entryDate > endDate) return false;
    }
    return true;
  });

  const stats = updateStats(filteredData);

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6 font-[Inter]">
      <div className="max-w-6xl mx-auto">
        <Header />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleGoHome}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition duration-300"
          >
            Regresar a Inicio
          </button>
        </div>

        {/* Controles para filtro de rango de fechas */}
        <div className="flex space-x-4 my-4">
          <div>
            <label htmlFor="startDate" className="block font-semibold mb-1">Fecha inicio:</label>
            <input
              type="date"
              id="startDate"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block font-semibold mb-1">Fecha fin:</label>
            <input
              type="date"
              id="endDate"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-1 rounded"
            >
              Limpiar filtro
            </button>
          </div>
        </div>

        <div className="my-8">
          <StatsContainer
            totalEntries={stats.totalEntries}
            todayEntries={stats.todayEntries}
            uniqueCards={stats.uniqueCards}
            lastEntry={stats.lastEntry}
          />
        </div>

        <div className="mb-6">
          <Controls
            isOnline={isOnline}
            statusMessage={error}
            onRefresh={loadData}
          />
        </div>

        <div className="mb-10">
          <DataSection
            data={filteredData}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
