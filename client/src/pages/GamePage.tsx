import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  
  const GAME_TIME = 120; // 2 minutes in seconds
  const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];
  
  // Initialize game state
  const [sequence, setSequence] = useState(() => {
    return Array(6).fill(0).map(() => Math.floor(Math.random() * 10).toString());
  });
  
  const [cursorPosition, setCursorPosition] = useState(0);
  const [timer, setTimer] = useState(GAME_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expression, setExpression] = useState(Array(11).fill(''));
  
  // Timer effect
  useEffect(() => {
    if (timer > 0 && !gameOver) {
      const timerId = setTimeout(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timerId);
    }
  }, [timer, gameOver]);
  
  // Move cursor left
  const moveCursorLeft = () => {
    if (cursorPosition > 0) {
      // Skip even positions (digits) and go directly to operator positions
      if (cursorPosition % 2 === 0 && cursorPosition > 1) {
        setCursorPosition(prev => prev - 2);
      } else if (cursorPosition === 1) {
        setCursorPosition(0);
      } else {
        setCursorPosition(prev => prev - 2);
      }
    }
  };
  
  // Move cursor right
  const moveCursorRight = () => {
    if (cursorPosition < 10) {
      // Skip digit positions and go directly to operator positions
      if (cursorPosition % 2 === 0 && cursorPosition < 10) {
        setCursorPosition(prev => prev + 1);
      } else if (cursorPosition === 9) {
        setCursorPosition(10);
      } else {
        setCursorPosition(prev => prev + 2);
      }
    }
  };
  
  // Place an operator at cursor position
  const placeOperator = (operator: string) => {
    // Only odd positions can have operators (between digits)
    if (cursorPosition % 2 === 1) {
      const newExpression = [...expression];
      newExpression[cursorPosition] = operator;
      setExpression(newExpression);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Evaluate the expression
  const evaluateExpression = () => {
    try {
      // Build the expression string
      let expressionStr = '';
      for (let i = 0; i < expression.length; i++) {
        if (i % 2 === 0) {
          // Even indices are digits from the sequence
          expressionStr += sequence[i / 2];
        } else {
          // Odd indices are operators placed by the player
          expressionStr += expression[i] || '';
        }
      }
      
      // Replace ^ with ** for JavaScript's exponentiation
      expressionStr = expressionStr.replace(/\^/g, '**');
      
      // Evaluate and check if equals 100
      const result = eval(expressionStr);
      return result === 100;
    } catch (error) {
      return false;
    }
  };
  
  // Handle submission
  const handleSubmit = () => {
    const result = evaluateExpression();
    setSuccess(result);
    setGameOver(true);
  };
  
  // Start a new game
  const startNewGame = () => {
    setSequence(Array(6).fill(0).map(() => Math.floor(Math.random() * 10).toString()));
    setCursorPosition(0);
    setTimer(GAME_TIME);
    setGameOver(false);
    setSuccess(false);
    setExpression(Array(11).fill(''));
  };
  
  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-400">HectoClash</h1>
          <div className="bg-gray-700 px-4 py-2 rounded-md">
            <span className={`font-mono text-xl ${timer < 30 ? 'text-red-500' : 'text-green-400'}`}>
              {formatTime(timer)}
            </span>
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-center text-lg mb-2 text-green-300">Make it 100!</p>
          
          {/* Sequence display */}
          <div className="relative flex justify-center items-center my-6">
            <div className="flex items-center space-x-2 text-5xl font-mono bg-gray-700 p-6 rounded-lg">
              {sequence.map((digit, index) => {
                const expressionIndex = index * 2;
                const operatorIndex = expressionIndex + 1;
                const showCursorBefore = cursorPosition === expressionIndex;
                const showCursorAfter = cursorPosition === operatorIndex && index < 5;
                
                return (
                  <React.Fragment key={index}>
                    <div className="relative">
                      {showCursorBefore && (
                        <div className="absolute h-12 w-1 bg-yellow-400 animate-pulse -left-3"></div>
                      )}
                      <span className="text-yellow-300 font-bold">{digit}</span>
                    </div>
                    
                    {index < 5 && (
                      <div className="relative w-8 text-center">
                        <span className="text-white">{expression[operatorIndex] || ' '}</span>
                        {showCursorAfter && (
                          <div className="absolute h-12 w-1 bg-yellow-400 animate-pulse left-4"></div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Arrow navigation */}
          <div className="flex justify-center space-x-8 my-4">
            <button 
              onClick={moveCursorLeft}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-3xl"
              disabled={gameOver}
            >
              ←
            </button>
            <button 
              onClick={moveCursorRight}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-3xl"
              disabled={gameOver}
            >
              →
            </button>
          </div>
          
          {/* Operators */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {OPERATORS.map((op, index) => (
              <button
                key={index}
                onClick={() => placeOperator(op)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-4 rounded-lg text-2xl"
                disabled={gameOver || cursorPosition % 2 === 0}
              >
                {op}
              </button>
            ))}
          </div>
          
          {/* Game rules */}
          <div className="bg-gray-700 p-3 rounded-lg mt-6 text-sm">
            <h3 className="font-bold text-yellow-300 mb-1">Game Rules:</h3>
            <p>Insert operators between the digits to make the expression equal to 100.</p>
            <p>Use left/right arrows to move cursor and place symbols between digits.</p>
          </div>
        </div>
        
        {/* Submit button */}
        {!gameOver ? (
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-xl"
          >
            Submit
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg text-center ${success ? 'bg-green-800' : 'bg-red-800'}`}>
              {success 
                ? "Success! You made it equal to 100!" 
                : "Not quite! Try again."}
            </div>
            <button
              onClick={startNewGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-xl"
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;