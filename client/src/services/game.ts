import { api } from '../utils/api';
import gameSocket from './websocket';
import authService from './auth';
import { useSelector, UseSelector } from 'react-redux';
// Define API URL for core-server
const CORE_API_URL = 'http://localhost:3030/api';
const GAME_API_URL = 'http://localhost:8080/api';

export interface Room {
  id: string;
  creator: string;
  guest: string;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  createdAt: string;
  puzzle?: string;
  winner?: string;
  solution?: string;
  startedAt?: string;
  endedAt?: string;
}

interface SolveResponse {
  solutions: string[];
  error?: string;
}

interface SolutionResult {
  correct: boolean;
  message?: string;
}

// Game service to handle all room and game operations
class GameService {
  private socket: WebSocket | null = null;
  private roomUpdateListeners: ((room: Room) => void)[] = [];

  // Connect to WebSocket server
  async connectToWebSocket(): Promise<void> {
    try {
      if (!gameSocket.isConnected()) {
        await gameSocket.connect();
        console.log('Connected to WebSocket server');
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket server', error);
      throw error;
    }
  }

  // Create a new game room
  async createRoom(id:number): Promise<string> {
    try {
      const response = await api.post('/rooms/',{"id":id});

      return response.data.roomId;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Join an existing room
  async joinRoom(roomId: string): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('You must be logged in to join a room');
    }

    try {
      await api.post(`/rooms/${roomId}/join`, {
        userId: user.id
      });
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  // Leave the current room
  async leaveRoom(roomId: string): Promise<void> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) return;

    this.socket.send(JSON.stringify({
      type: 'leave_room',
      roomId,
      userId: user.id
    }));
  }

  // Start a game in a room
  async startGame(roomId: string): Promise<Room> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await api.post<{ success: boolean, puzzle: string }>(`${GAME_API_URL}/game/start`, {
        roomId,
        userId: user.id
      });

      if (!response.data.success) {
        throw new Error('Failed to start game');
      }

      const updateResponse = await api.post<{ success: boolean, data: Room }>(`${CORE_API_URL}/room/${roomId}/start`, {
        userId: user.id,
        puzzle: response.data.puzzle
      });

      if (!updateResponse.data.success) {
        throw new Error('Failed to update room');
      }

      gameSocket.send('game_start', {
        roomId,
        puzzle: response.data.puzzle,
        timeLimit: 180 // 3 minutes
      });

      return updateResponse.data.data;
    } catch (error) {
      console.error('Failed to start game', error);
      throw error;
    }
  }

  // Submit a solution to the puzzle
  async submitSolution(roomId: string, solution: string): Promise<SolutionResult> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to game server');
    }

    return new Promise((resolve, reject) => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          reject(new Error('You must be logged in to submit a solution'));
          return;
        }

        // Set up a one-time listener for the solution result
        const messageHandler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'solution_result' && data.roomId === roomId) {
              // Remove the listener once we get our result
              if (this.socket) {
                this.socket.removeEventListener('message', messageHandler);
              }

              resolve({
                correct: data.correct,
                message: data.message
              });
            }
          } catch (error) {
            console.error('Error parsing solution result:', error);
          }
        };

        if (this.socket) {
          this.socket.addEventListener('message', messageHandler);

          // Send the solution
          this.socket.send(JSON.stringify({
            type: 'submit_solution',
            roomId,
            userId: user.id,
            solution
          }));

          // Set a timeout in case we don't get a response
          setTimeout(() => {
            if (this.socket) {
              this.socket.removeEventListener('message', messageHandler);
            }
            reject(new Error('Timeout waiting for solution result'));
          }, 10000);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get room details
  async getRoom(roomId: string): Promise<Room> {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data.room;
    } catch (error) {
      console.error('Error getting room details:', error);
      throw error;
    }
  }

  // Listen for room updates
  onRoomUpdate(listener: (room: Room) => void): void {
    this.roomUpdateListeners.push(listener);
  }

  // Listen for game start
  onGameStart(callback: (data: { puzzle: string, timeLimit: number }) => void): void {
    gameSocket.on('game_start', callback);
  }

  // Listen for game end
  onGameEnd(callback: (data: { winner: string, winnerName: string, solution: string }) => void): void {
    gameSocket.on('game_end', callback);
  }

  // Remove room update listener
  offRoomUpdate(listener: (room: Room) => void): void {
    this.roomUpdateListeners = this.roomUpdateListeners.filter(l => l !== listener);
  }

  // Notify all listeners of a room update
  private notifyRoomUpdateListeners(room: Room): void {
    for (const listener of this.roomUpdateListeners) {
      listener(room);
    }
  }

  // Close WebSocket connection
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

const gameService = new GameService();

export default gameService;
