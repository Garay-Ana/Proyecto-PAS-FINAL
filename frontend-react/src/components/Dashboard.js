import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import StatsContainer from './StatsContainer';
import Controls from './Controls';

const API_REMOTO_URL = 'https://proyecto-pas-final.onrender.com/api/historial-entradas';

function Dashboard() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  const navigate = useNavigate();

  // Función para formatear fecha y hora completa en UTC
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  };

  // Función para formatear solo la hora en UTC
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--:--';
      
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formateando hora:', error);
      return '--:--';
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalEntries = data.length;
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = data.filter(entry => {
      const entryDate = new Date(entry.fecha_hora).toISOString().split('T')[0];
      return entryDate === today;
    }).length;
    
    const lastEntry = data.length > 0 
      ? formatTime(data[0].fecha_hora)
      : '--:--';

    return { totalEntries, todayEntries, lastEntry };
  }, [data]);

  // Función para cargar datos
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(API_REMOTO_URL);
      
      if (!response.ok) throw new Error('Error al obtener datos remotos');
      
      const remoteData = await response.json();
      
      // Ordenar por fecha más reciente primero
      remoteData.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
      
      setData(remoteData);
      setIsOnline(true);
    } catch (err) {
      setError(`Error al cargar datos: ${err.message}`);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para carga inicial y actualización periódica
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar datos según parámetros
  const filteredData = useMemo(() => {
    return data.filter(entry => {
      const entryDate = new Date(entry.fecha_hora).toISOString().split('T')[0];
      
      // Filtrado por fechas
      if (filterStartDate && entryDate < filterStartDate) return false;
      if (filterEndDate && entryDate > filterEndDate) return false;
      
      // Filtrado por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          entry.nombre.toLowerCase().includes(searchLower) ||
          entry.apellido.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [data, filterStartDate, filterEndDate, searchTerm]);

  // Configuración de paginación
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Navegar a inicio
  const handleGoHome = () => navigate('/home');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado y navegación */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Control de Acceso</h1>
            <p className="text-gray-600">Sistema de monitoreo en tiempo real</p>
          </div>
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Volver al Inicio</span>
          </button>
        </div>

        {/* Panel de filtros */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtrar Registros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha inicio:
              </label>
              <input
                type="date"
                id="startDate"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha fin:
              </label>
              <input
                type="date"
                id="endDate"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1.5">
                Buscar:
              </label>
              <input
                type="text"
                id="search"
                placeholder="Nombre o apellido"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredData.length} registros encontrados
            </span>
            <button
              onClick={handleClearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <StatsContainer
            totalEntries={stats.totalEntries}
            todayEntries={stats.todayEntries}
            lastEntry={stats.lastEntry}
          />
        </div>

        {/* Controles de estado */}
        <div className="mb-6">
          <Controls
            isOnline={isOnline}
            statusMessage={error}
            onRefresh={loadData}
            isLoading={isLoading}
          />
        </div>

        {/* Tabla de registros */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-t-lg flex items-center border-b border-red-100">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-14 w-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-3 text-lg font-medium">No se encontraron registros</p>
              <p className="text-sm mt-1">Ajusta los filtros de búsqueda o intenta recargar los datos</p>
              <button 
                onClick={loadData}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center mx-auto gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Recargar datos
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apellido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntries.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.apellido}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDateTime(entry.fecha_hora)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredData.length > entriesPerPage && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Mostrando {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, filteredData.length)} de {filteredData.length} registros
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;