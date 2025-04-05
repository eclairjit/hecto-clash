import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <main style={{ 
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
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
          }} className="gradient-text">
            HECTOCLASH
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '2rem', 
            color: 'var(--text-primary)',
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
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px var(--shadow-color)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px var(--shadow-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px var(--shadow-color)';
            }}
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 