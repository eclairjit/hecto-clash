import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import ThemeToggle from './ThemeToggle';
import { signOutSuccess } from '../redux/user/userSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(signOutSuccess());
    navigate('/');
  };

  return (
    <header style={{
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px var(--shadow-color)',
    }}>
      <h1 
        className="gradient-text"
        style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => navigate(currentUser ? '/dashboard' : '/')}
      >
        HECTOCLASH
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />
        
        {currentUser && (
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--hover-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar; 