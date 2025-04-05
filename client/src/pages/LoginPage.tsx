import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import OAuth from '../components/OAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-light)' }}>
      {/* Navbar */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 
            className="gradient-text"
            style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            HECTOCLASH
          </h1>
        </div>
      </header>
      
      {/* Login Section */}
      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', 
          maxWidth: '28rem', 
          width: '100%',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Login to HectoClash</h2>
          
          <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem' }}>
            Sign in with Google to start playing HectoClash and challenge your opponents!
          </p>
          
          {error && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.5)', 
              color: 'var(--secondary)',
              padding: '0.75rem 1rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1.5rem' 
            }}>
              {error}
            </div>
          )}
          
          <OAuth />
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ backgroundColor: 'white', padding: '1.5rem 0', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem' }}>
          <p>© 2023 HectoClash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
