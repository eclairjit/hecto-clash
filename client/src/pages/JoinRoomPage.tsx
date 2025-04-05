import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../services/game';
import authService from '../services/auth';

const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is logged in
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
  }, [navigate]);
  
  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };
  
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Ensure we're connected to the WebSocket before proceeding
      try {
        await gameService.connectToWebSocket();
      } catch (wsError) {
        console.error('Failed to connect to WebSocket server:', wsError);
        throw new Error('Cannot connect to game server. Please make sure the server is running.');
      }
      
      // Join the room
      await gameService.joinRoom(roomId);
      
      // Navigate to the game page
      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to join the game room. Please check the room code and try again.');
      }
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          padding: '1rem'
        }}>
          <h1 className="gradient-text" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>HECTOCLASH</h1>
        </div>
      </header>
      
      <main style={{ 
        maxWidth: '32rem', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem' 
          }}>
            Join a Game
          </h2>
          
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '0.75rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleJoinRoom}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="roomId" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Room Code
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={handleRoomIdChange}
                placeholder="Enter room code"
                autoComplete="off"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  flex: '1',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <div style={{ 
                      animation: 'spin 1s linear infinite',
                      height: '1rem', 
                      width: '1rem', 
                      borderRadius: '9999px',
                      borderTop: '2px solid white',
                      borderRight: '2px solid transparent',
                      borderBottom: '2px solid white',
                      borderLeft: '2px solid transparent',
                      marginRight: '0.5rem'
                    }}></div>
                    <style>{`
                      @keyframes spin {
                        to { transform: rotate(360deg); }
                      }
                    `}</style>
                    Joining...
                  </div>
                ) : 'Join Game'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  border: '1px solid var(--secondary)',
                  color: 'var(--secondary)',
                  backgroundColor: 'transparent', 
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div style={{ 
          backgroundColor: '#ebf5ff', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          border: '1px solid #bfdbfe',
          marginTop: '1.5rem'
        }}>
          <h3 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Don't have a code?</h3>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text)', 
            marginBottom: '0.75rem'
          }}>
            Ask your friend to create a room and share the code with you.
          </p>
          <button
            onClick={() => navigate('/create-room')}
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Create a Room Instead
          </button>
        </div>
      </main>
    </div>
  );
};

export default JoinRoomPage; 