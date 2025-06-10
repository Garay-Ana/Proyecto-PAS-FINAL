import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import RemotoPage from './components/RemotoPage';
import Indexx from './components/Indexx';
import GerenteAuth from './components/GerenteAuth';
import GestionHorarios from './components/GestionHorarios';
import GestionUsuarios from './components/GestionUsuarios';

function App() {
  const [gerenteLoggedIn, setGerenteLoggedIn] = useState(false);

  const handleLoginSuccess = (data) => {
    // You can store token or user info here if needed
    setGerenteLoggedIn(true);
    // Redirigir a la página principal después del login
    window.location.href = '/';
  };

  if (!gerenteLoggedIn) {
    return <GerenteAuth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/remoto" element={<RemotoPage />} />
      <Route path="/indexx" element={<Indexx />} />
      <Route path="/gestion-horarios" element={<GestionHorarios usuarios={[]} />} />
      <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
    </Routes>
  );
}

export default App;
