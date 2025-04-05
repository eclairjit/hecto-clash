import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gameService from '../services/game';
import { RootState } from '../redux/store';
import { current } from '@reduxjs/toolkit';
import ThemeToggle from '../components/ThemeToggle';

interface RoomInfo {
  id: string;
  creator: number | null;
  guest: number | null;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  createdAt?: string;
}

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  useEffect(() => {
    const createRoom = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        if (!currentUser?.id) {
          throw new Error('User not authenticated');
        }

        const roomId = await gameService.createRoom(currentUser.id);

        setRoomInfo({
          id: roomId,
          creator: currentUser.id,
          guest: null,
          createdAt: new Date().toISOString(),
          status: 'waiting'
        });
      } catch (error) {
        console.error('Failed to create room:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to create a game room. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    createRoom();
    
    // Clean up WebSocket listeners when unmounting
    return () => {
      if (roomInfo) {
        gameService.leaveRoom(roomInfo.id);
      }
    };
  }, []);
  
  // Listen for room updates from WebSocket
  useEffect(() => {
    if (!roomInfo) return;
    
    const handleRoomUpdate = (updatedRoom: any) => {
      if (updatedRoom.id === roomInfo.id) {
        setRoomInfo(updatedRoom);
        
        // If the game has started, navigate to the game page
        if (updatedRoom.status === 'playing') {
          navigate(`/game/${updatedRoom.id}`);
        }
      }
    };
    
    gameService.onRoomUpdate(handleRoomUpdate);
    
    return () => {
      gameService.offRoomUpdate(handleRoomUpdate);
    };
  }, [roomInfo, navigate]);
  
  const handleCopyRoomId = () => {
    if (roomInfo) {
      navigator.clipboard.writeText(roomInfo.id)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          setError('Failed to copy room ID');
        });
    }
  };
  
  const handleStartGame = () => {
    if (roomInfo) {
      navigate(`/game/${roomInfo.id}`);
    }
  };
  
  const handleRetry = () => {
    setIsLoading(true);
    setError('');
    window.location.reload();
  };
  
  // Get the current user
  const userName = currentUser?.username || currentUser?.email?.split('@')[0] || 'You';
  
  if (isLoading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px var(--shadow-color)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          minWidth: '300px',
        }}>
          <div style={{ marginBottom: '1rem' }}>Creating your room...</div>
          <div style={{
            width: '2rem',
            height: '2rem',
            margin: '0 auto',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px var(--shadow-color)',
          textAlign: 'center',
          minWidth: '300px',
        }}>
          <div style={{
            color: 'var(--error-text)',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
          <button
            onClick={handleRetry}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px var(--shadow-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '2.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px var(--shadow-color)',
        width: '100%',
        maxWidth: '500px',
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
        }} className="gradient-text">
          Room Created!
        </h2>

        <div style={{
          backgroundColor: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
        }}>
          <p style={{ 
            color: 'var(--info-text)', 
            margin: 0,
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Share this room code with your friends:
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <code style={{
              flex: 1,
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: 'var(--info-number)',
              backgroundColor: 'var(--bg-primary)',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
              letterSpacing: '0.1em',
              border: '1px solid var(--info-border)',
            }}>
              {roomInfo?.id}
            </code>
            <button
              onClick={handleCopyRoomId}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: copied ? 'var(--info-text)' : 'var(--bg-primary)',
                color: copied ? 'white' : 'var(--text-primary)',
                border: `1px solid ${copied ? 'var(--info-text)' : 'var(--border-color)'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                minWidth: '120px',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  e.currentTarget.style.borderColor = 'var(--hover-border)';
                }
              }}
              onMouseOut={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="6" y="6" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3.5 10V3C3.5 2.44772 3.94772 2 4.5 2H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>
          <p style={{
            color: 'var(--info-text)',
            margin: 0,
            fontSize: '0.9rem',
          }}>
            Waiting for opponent to join...
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
        }}>
          <button
            onClick={handleStartGame}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px var(--shadow-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Game
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--hover-border)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
