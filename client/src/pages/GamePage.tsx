import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gameService, { Room } from '../services/game';
import authService from '../services/auth';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

interface GameState {
  roomId: string;
  creator:string;
  guest:string;
  puzzle: string;
  status: 'ready'|'waiting' | 'playing' | 'finished';
  winner: string | null;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="timer-container">
      {formatTime(timeLeft)}
    </div>
  );
};

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId = '' } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState>({
    roomId,
    creator: '',
    guest: '',
    puzzle: '',
    status: 'waiting',
    winner: null
  });
  const [solution, setSolution] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is logged in and connect to the room
  useEffect(() => {
   
    
    // Initialize game and connect to the room
    const initGame = async () => {
      try {
        // Connect to WebSocket
        await gameService.connectToWebSocket();
        
        // Get room details
        const room = await gameService.getRoom(roomId);
        
        // Set initial game state
        setGameState({
          roomId,
          creator: room.creator,
          guest: room.guest,
          puzzle: room.puzzle || '',
          status: room.status,
          winner: room.winner || null
        });
        
        // Set up listeners for game events
        gameService.onRoomUpdate((updatedRoom) => {
          setGameState(prev => ({
            ...prev,
            creator: updatedRoom.creator,
            guest: updatedRoom.guest,
            status: updatedRoom.status,
            winner: updatedRoom.winner || null,
            puzzle: updatedRoom.puzzle || prev.puzzle
          }));
        });
        
        gameService.onGameStart((data) => {
          setGameState(prev => ({
            ...prev,
            status: 'playing',
            puzzle: data.puzzle
          }));
          
          // Start timer
          setTimeLeft(data.timeLimit || 180);
        });
        
        gameService.onGameEnd((data) => {
          setGameState(prev => ({
            ...prev,
            status: 'finished',
            winner: data.winner
          }));
        });
      } catch (error) {
        console.error('Failed to initialize game', error);
        setError('Failed to connect to game. Please try again.');
      }
    };
    
    initGame();
    
    // Simulating an opponent joining after 5 seconds
    if (gameState.creator !== '' && gameState.guest === '') {
      const opponentTimer = setTimeout(() => {
        setGameState(prev => {
          if (prev.creator !== '' && prev.guest === '') {
            return {
              ...prev,
              status: 'playing',
              puzzle: '923754' // Sample puzzle
            };
          }
          return prev;
        });
      }, 5000);
      
      return () => clearTimeout(opponentTimer);
    }
    
    // Clean up
    return () => {
      gameService.leaveRoom(roomId);
      // gameService.cleanUp();
    };
  }, [roomId, navigate]);
  
  // Start timer when game is in progress
  useEffect(() => {
    if (gameState.status === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Game over due to time
            setGameState(prev => ({
              ...prev,
              status: 'finished',
              winner: 'opponent' // Time ran out for the player
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState.status]);
  
  const handleSolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!solution.trim()) {
      setError('Solution cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Submit solution
      const correct = await gameService.submitSolution(roomId, solution);
      
      if (correct) {
        // Update game state to show player as winner
        setGameState(prev => ({
          ...prev,
          status: 'finished',
          winner: 'player'
        }));
      } else {
        setError('Incorrect solution. Try again!');
      }
    } catch (error) {
      setError('Failed to submit solution. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderGameContent = () => {
    if (gameState.status === 'waiting') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold mb-4">Waiting for opponent...</h2>
          <div className="animate-pulse bg-blue-50 p-6 rounded-lg max-w-md text-center border border-blue-200">
            <p className="mb-2">Room Code: <span className="font-mono font-bold">{gameState.roomId}</span></p>
            <p className="text-gray-600">Share this code with your opponent to start the game.</p>
          </div>
        </div>
      );
    }
    
    if (gameState.status === 'finished') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-bold mb-6">
            {gameState.winner === 'player' 
              ? 'Victory! 🏆' 
              : 'Defeat... 😢'}
          </h2>
          <div className={`p-6 rounded-lg max-w-md text-center ${
            gameState.winner === 'player' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className="mb-4">
              {gameState.winner === 'player'
                ? 'Congratulations! You solved the puzzle correctly and won the match!'
                : 'Your opponent solved the puzzle first. Better luck next time!'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Problem panel */}
        <div className="problem-panel">
          <h3 className="text-xl font-bold mb-4">Problem</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="mb-2">Using the 6 digits below:</p>
            <div className="text-4xl font-mono font-bold tracking-widest mb-4 text-center">
              {gameState.puzzle.split('').join(' ')}
            </div>
            <p className="text-gray-700">
              Create an expression that equals exactly 100 using all digits and the operations +, -, *, /, and ().
              Each digit must be used exactly once, and you can't combine digits (like using "12" instead of "1" and "2").
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p>Example: 1+2*3-4+5*6</p>
            </div>
          </div>
        </div>
        
        {/* Solution panel */}
        <div className="solution-panel">
          <h3 className="text-xl font-bold mb-4">Your Solution</h3>
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-grow">
              <input
                type="text"
                value={solution}
                onChange={handleSolutionChange}
                className="w-full p-4 text-lg font-mono border rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your solution..."
                autoFocus
              />
              
              {error && (
                <div className="mt-2 text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold mb-2">Allowed Operations:</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-white p-2 rounded text-center font-bold border">+</div>
                  <div className="bg-white p-2 rounded text-center font-bold border">-</div>
                  <div className="bg-white p-2 rounded text-center font-bold border">*</div>
                  <div className="bg-white p-2 rounded text-center font-bold border">/</div>
                  <div className="bg-white p-2 rounded text-center font-bold border">()</div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full btn btn-primary"
            >
              {isSubmitting ? 'Checking...' : 'Submit Solution'}
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with timer */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold gradient-text">HECTOCLASH</h1>
            <div className="text-sm text-gray-600">Room: <span className="font-mono">{gameState.roomId}</span></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              {gameState.creator}   
            </div>
            {gameState.status === 'playing' && (
              <Timer timeLeft={timeLeft} totalTime={180} />
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to leave this game?')) {
                  navigate('/dashboard');
                }
              }}
              className="btn btn-secondary-outline text-sm"
            >
              Leave Game
            </button>
          </div>
        </div>
      </header>
      
      {/* Main game area */}
      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto h-full py-6">
          {renderGameContent()}
        </div>
      </main>
    </div>
  );
};

export default GamePage; 