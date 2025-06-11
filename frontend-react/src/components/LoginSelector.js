import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSelector = () => {
  const navigate = useNavigate();

  const opciones = [
    {
      titulo: 'Gerente',
      imagen: '/gerente.jpg', // Asegúrate de tener esta imagen en tu carpeta /public
      fondo: '#fbbf24', // amarillo
      ruta: '/gerente-login',
    },
    {
      titulo: 'Remoto',
      imagen: '/remoto.jpg', // Asegúrate de tener esta imagen en tu carpeta /public
      fondo: '#3b82f6', // azul
      ruta: '/remoto',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fefefe',
        padding: '2rem',
      }}
    >
      <img
        src="/logo.jpg" // Asegúrate de tener este logo en /public
        alt="PHG Soluciones Contables"
        style={{ width: '200px', marginBottom: '1.5rem' }}
      />

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1f2937' }}>
        Acceso a Plataformas
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {opciones.map((opcion) => (
          <div
            key={opcion.titulo}
            style={{
              width: '300px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'white',
            }}
          >
            <img
              src={opcion.imagen}
              alt={opcion.titulo}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>
               Acceso {opcion.titulo}
              </h2>
              <button
                onClick={() => navigate(opcion.ruta)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: opcion.fondo,
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Ingresar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginSelector;
