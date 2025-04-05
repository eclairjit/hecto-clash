import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gameService from '../services/game';
import { RootState } from '../redux/store';
import { current } from '@reduxjs/toolkit';

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

const  currentUser = useSelector((state: RootState) => state.user.currentUser); // Get user from Redux
  useEffect(() => {
    const createRoom = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Ensure we're connected to the WebSocket before proceeding
        // try {
        //   await gameService.connectToWebSocket();
        // } catch (wsError) {
        //   console.error('Failed to connect to WebSocket server:', wsError);
        //   throw new Error('Cannot connect to game server. Please make sure the server is running.');
        // }

        
        
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
  
  // Show room created state
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
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Room Created!
          </h2>
          <p style={{ color: 'var(--text-light)' }}>
            Share the room code with your opponent to start the game.
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem'
          }}>Room Information</h3>
          
          <div style={{ 
            backgroundColor: 'var(--bg-light)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-light)', 
                  marginBottom: '0.25rem'
                }}>Room Code:</p>
                <p style={{ 
                  fontSize: '1.875rem', 
                  fontFamily: 'monospace', 
                  fontWeight: 'bold', 
                  letterSpacing: '0.05em'
                }}>{roomInfo?.id}</p>
              </div>
              <button
                onClick={handleCopyRoomId}
                style={{ 
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  backgroundColor: 'transparent',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem'
            }}>Players ({roomInfo?.guest ? '2' : '1'}/2):</h4>
            <ul style={{ 
              backgroundColor: 'var(--bg-light)', 
              borderRadius: '0.5rem', 
              border: '1px solid #e5e7eb'
            }}>
              <li style={{ 
                padding: '0.75rem', 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'white', 
                  borderRadius: '9999px', 
                  width: '2rem', 
                  height: '2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '0.75rem'
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>{userName} <span style={{ color: 'var(--text-light)' }}>(You)</span></span>
              </li>
              
              {roomInfo?.guest ? (
                <li style={{ 
                  padding: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  <div style={{ 
                    backgroundColor: 'var(--secondary)', 
                    color: 'white', 
                    borderRadius: '9999px', 
                    width: '2rem', 
                    height: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '0.75rem'
                  }}>
                    G
                  </div>
                  <span>Guest</span>
                </li>
              ) : (
                <li style={{ 
                  padding: '0.75rem', 
                  color: 'var(--text-light)', 
                  fontStyle: 'italic', 
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '9999px', 
                    width: '2rem', 
                    height: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '0.75rem'
                  }}>
                    ?
                  </div>
                  Waiting for opponent...
                </li>
              )}
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleStartGame}
              style={{ 
                backgroundColor: 'var(--primary)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                flex: '1',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Enter Waiting Room
            </button>
            <button
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
        </div>
        
        <div style={{ 
          backgroundColor: '#ebf5ff', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          border: '1px solid #bfdbfe'
        }}>
          <h3 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>How it works:</h3>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text)', 
            marginBottom: '0.5rem'
          }}>
            1. Share the room code with your opponent.
          </p>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text)', 
            marginBottom: '0.5rem'
          }}>
            2. Enter the waiting room and wait for your opponent to join.
          </p>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text)'
          }}>
            3. Once your opponent joins, the game will start automatically.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreateRoomPage;
