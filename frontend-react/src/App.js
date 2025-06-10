import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import RemotoPage from './components/RemotoPage';
import Indexx from './components/Indexx';
import GerenteAuth from './components/GerenteAuth';
import GestionHorariosContainer from './components/GestionHorariosContainer';
import GestionUsuarios from './components/GestionUsuarios';

function App() {
  const [gerenteLoggedIn, setGerenteLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setGerenteLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (data, token) => {
    setGerenteLoggedIn(true);
    localStorage.setItem('token', token);
    navigate('/');
  };

  if (!gerenteLoggedIn) {
    return <GerenteAuth onLoginSuccess={handleLoginSuccess} />;
  }

  const handleLogout = () => {
    setGerenteLoggedIn(false);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onLogout={handleLogout} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/remoto" element={<RemotoPage />} />
      <Route path="/indexx" element={<Indexx />} />
      <Route path="/gestion-horarios" element={<GestionHorariosContainer />} />
      <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
    </Routes>
  );
}

export default App;
