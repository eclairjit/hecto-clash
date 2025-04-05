import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleCreateRoom = () => {
    navigate('/create-room');
  };
  
  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  // Render null or a loading indicator while checking auth state or if currentUser is null
  if (!currentUser) {
    return null; // Or a loading spinner
  }

  return (
    <div style={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <main style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '2rem 1rem',
        width: '100%'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)'
          }}>Welcome, {currentUser?.username || 'Player'}!</h2> 
          <p style={{ color: 'var(--text-secondary)' }}>Choose an option below to start playing</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {/* Create Game Card */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px var(--shadow-color)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px var(--shadow-color)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px var(--shadow-color)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)', 
              marginBottom: '0.75rem' 
            }}>Create Match</h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '1.5rem' 
            }}>
              Create your own HectoClash battle room and invite an opponent to join you in this mathematical showdown.
            </p>
            <button 
              onClick={handleCreateRoom}
              style={{ 
                backgroundColor: 'var(--primary)',
                color: 'white',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Create New Room
            </button>
          </div>
          
          {/* Join Game Card */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px var(--shadow-color)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px var(--shadow-color)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px var(--shadow-color)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)', 
              marginBottom: '0.75rem' 
            }}>Join Match</h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '1.5rem' 
            }}>
              Enter a room code to join an existing battle. Test your skills against another player who's ready to take you on.
            </p>
            <button 
              onClick={handleJoinRoom}
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'white',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Join Existing Room
            </button>
          </div>
        </div>
        
        {/* Stats Section */}
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)', 
            marginBottom: '1rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid var(--border-color)'
          }}>Your HectoClash Stats</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px var(--shadow-color)', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: 'var(--text-primary)' 
              }}>0</p>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.875rem' 
              }}>Matches</p>
            </div>
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px var(--shadow-color)', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: 'var(--text-primary)' 
              }}>0</p>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.875rem' 
              }}>Wins</p>
            </div>
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px var(--shadow-color)', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: 'var(--text-primary)' 
              }}>0%</p>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.875rem' 
              }}>Win Rate</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
