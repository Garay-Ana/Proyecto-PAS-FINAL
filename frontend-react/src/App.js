import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import RemotoPage from './components/RemotoPage';
import Indexx from './components/Indexx';
import GerenteAuth from './components/GerenteAuth';
import GestionHorariosContainer from './components/GestionHorariosContainer';
import GestionUsuarios from './components/GestionUsuarios';
import LoginSelector from './components/LoginSelector';
import PrivateRoute from './components/PrivateRoute';

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
    localStorage.setItem('token', token);
    setGerenteLoggedIn(true);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setGerenteLoggedIn(false);
    navigate('/login-selector');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginSelector />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <HomePage onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route path="/gerente-login" element={<GerenteAuth onLoginSuccess={handleLoginSuccess} />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/remoto" element={<RemotoPage />} />
      <Route
        path="/indexx"
        element={
          <PrivateRoute>
            <Indexx />
          </PrivateRoute>
        }
      />
      <Route
        path="/gestion-horarios"
        element={
          <PrivateRoute>
            <GestionHorariosContainer />
          </PrivateRoute>
        }
      />
      <Route
        path="/gestion-usuarios"
        element={
          <PrivateRoute>
            <GestionUsuarios />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
