import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import authService from '../services/auth';
import { signOutSuccess } from '../redux/user/userSlice';
import { RootState } from '../redux/store'; // Assuming you have RootState defined

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user); // Get user from Redux
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/'); // Or '/login' if that's your login route
    }
  }, [currentUser, navigate]);

  const handleCreateRoom = () => {
    navigate('/create-room');
  };
  
  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  const handleLogout = () => {
    authService.logout(); // Clear local storage etc.
    dispatch(signOutSuccess()); // Clear Redux state
    navigate('/'); // Navigate to home/login page
  };

  // Render null or a loading indicator while checking auth state or if currentUser is null
  if (!currentUser) {
    return null; // Or a loading spinner
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-light)' 
    }}>
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
          <h1 className="gradient-text" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>HECTOCLASH</h1>
          <div>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--secondary)',
                border: '1px solid var(--secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '2rem 1rem' 
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'var(--text)'
            // Use optional chaining in case currentUser is briefly null or lacks name
          }}>Welcome, {currentUser?.username || 'Player'}!</h2> 
          <p style={{ color: 'var(--text-light)' }}>Choose an option below to start playing</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {/* Create Game Card */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: 'var(--text)', 
              marginBottom: '0.75rem' 
            }}>Create Match</h3>
            <p style={{ 
              color: 'var(--text-light)', 
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
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: 'var(--text)', 
              marginBottom: '0.75rem' 
            }}>Join Match</h3>
            <p style={{ 
              color: 'var(--text-light)', 
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
            color: 'var(--text)', 
            marginBottom: '1rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid #e5e7eb' 
          }}>Your HectoClash Stats</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: 'var(--text)' 
              }}>0</p>
              <p style={{ 
                color: 'var(--text-light)', 
                fontSize: '0.875rem' 
              }}>Matches</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: 'var(--text)' 
              }}>0</p>
              <p style={{ 
                color: 'var(--text-light)', 
                fontSize: '0.875rem' 
              }}>Wins</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: 'var(--text)' 
              }}>0%</p>
              <p style={{ 
                color: 'var(--text-light)', 
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
