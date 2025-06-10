import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSelector = () => {
  const navigate = useNavigate();

  const handleGerenteClick = () => {
    navigate('/gerente-login');
  };

  const handleRemotoClick = () => {
    navigate('/remoto');
  };

  return (
    <div className="login-selector-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
      <button
        onClick={handleGerenteClick}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          cursor: 'pointer',
          borderRadius: '8px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
        }}
      >
        Gerente
      </button>
      <button
        onClick={handleRemotoClick}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          cursor: 'pointer',
          borderRadius: '8px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
        }}
      >
        Remoto
      </button>
    </div>
  );
};

export default LoginSelector;
