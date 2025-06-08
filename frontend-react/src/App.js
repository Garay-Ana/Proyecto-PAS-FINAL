import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import RemotoPage from './components/RemotoPage';
import Indexx from './components/Indexx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/remoto" element={<RemotoPage />} />
      <Route path="/indexx" element={<Indexx />} />
    </Routes>
  );
}

export default App;
