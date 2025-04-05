import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px var(--shadow-color)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
        }} className="gradient-text">
          Welcome to Hecto Clash
        </h2>

        {error && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error-text)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <OAuth />
      </div>
    </div>
  );
};

export default LoginPage;
