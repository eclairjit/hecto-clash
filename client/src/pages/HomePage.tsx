import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--bg-light)'
    }}>
      {/* Navbar */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>HECTOCLASH</h1>
          <button
            onClick={() => navigate('/login')}
            className="btn"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Login
          </button>
        </div>
      </header>
      
      {/* Hero Section */}
      <main style={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '48rem', 
          padding: '0 1rem'
        }}>
          <h1 style={{ 
            fontSize: '3.75rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem'
          }}>
            <span className="gradient-text">HECTOCLASH</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '2rem', 
            color: 'var(--text)',
            lineHeight: '1.75'
          }}>
            Battle your way to coding glory! Solve mathematical challenges faster than your opponent in this
            head-to-head mathematical challenge arena.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.375rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get Started
          </button>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem 0', 
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          padding: '0 1rem', 
          textAlign: 'center', 
          color: 'var(--text-light)', 
          fontSize: '0.875rem'
        }}>
          <p>© 2023 HectoClash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 