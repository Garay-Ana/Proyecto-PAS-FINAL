import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSelector = () => {
  const navigate = useNavigate();

  const opciones = [
    {
      titulo: 'Gerente',
      imagen: '/gerente.jpg',
      fondo: '#f59e0b', // Amarillo profesional
      ruta: '/gerente-login',
      descripcion: 'Acceso para gerentes y administradores del sistema'
    },
    {
      titulo: 'Remoto',
      imagen: '/remoto.jpg',
      fondo: '#3b82f6', // Azul corporativo
      ruta: '/remoto',
      descripcion: 'Acceso para empleados que trabajan de forma remota'
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '2rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Sección del logo mejorada */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        position: 'relative',
        padding: '1.5rem 0'
      }}>
        {/* Efecto de contenedor sutil para el logo */}
        <div style={{
          display: 'inline-block',
          padding: '1.5rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '1rem',
          transition: 'all 0.3s ease',
          ':hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)'
          }
        }}>
          <img
            src="/logo.jpg"
            alt="PHG Soluciones Contables"
            style={{ 
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        
        {/* Texto con efecto de gradiente */}
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0.5rem 0',
          background: 'linear-gradient(45deg, #1e293b, #3b82f6)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          PHG Soluciones
        </h1>
        <p style={{ 
          color: '#64748b',
          fontSize: '1.1rem',
          marginTop: '0.5rem',
          fontWeight: '500'
        }}>
          Plataforma de Gestión Empresarial
        </p>
      </div>

      {/* Resto del componente (se mantiene igual que en la versión anterior) */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {opciones.map((opcion) => (
          <div
            key={opcion.titulo}
            style={{
              width: '320px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
              }
            }}
            onClick={() => navigate(opcion.ruta)}
          >
            <div style={{ 
              height: '180px',
              backgroundColor: opcion.fondo,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={opcion.imagen}
                alt={opcion.titulo}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  opacity: '0.9',
                  transition: 'transform 0.3s ease',
                  ':hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.75rem', 
                color: '#1e293b',
                fontWeight: '600'
              }}>
                Acceso {opcion.titulo}
              </h2>
              <p style={{ 
                color: '#64748b', 
                marginBottom: '1.5rem',
                fontSize: '0.95rem'
              }}>
                {opcion.descripcion}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(opcion.ruta);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: opcion.fondo,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: `${opcion.fondo}dd`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Ingresar
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer style={{
        marginTop: '3rem',
        color: '#64748b',
        fontSize: '0.9rem',
        textAlign: 'center',
        padding: '1rem'
      }}>
        © {new Date().getFullYear()} PHG Soluciones Contables. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LoginSelector;