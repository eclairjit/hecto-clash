type MessageHandler = (message: any) => void;
type StatusHandler = () => void;

interface WebSocketMessage {
  type: string;
  payload?: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionHandlers: StatusHandler[] = [];
  private disconnectionHandlers: StatusHandler[] = [];
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed with code: ${event.code}`);
          this.disconnectionHandlers.forEach(handler => handler());
          
          // Try to reconnect if not a normal closure
          if (event.code !== 1000 && event.code !== 1001) {
            this.tryReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            console.log('WebSocket message received:', message);
            
            if (this.messageHandlers.has(message.type)) {
              const handlers = this.messageHandlers.get(message.type) || [];
              handlers.forEach(handler => handler(message.payload));
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
      } catch (err) {
        console.error('Error creating WebSocket connection:', err);
        reject(err);
      }
    });
  }

  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${timeout}ms...`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection attempt failed:', err);
        });
      }, timeout);
    } else {
      console.error('Maximum reconnection attempts reached. Please refresh the page.');
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(type: string, payload?: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type };
      if (payload !== undefined) {
        message.payload = payload;
      }
      console.log('Sending WebSocket message:', message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected. Message not sent:', { type, payload });
    }
  }

  on(messageType: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)?.push(handler);
  }

  onConnect(handler: StatusHandler) {
    this.connectionHandlers.push(handler);
  }

  onDisconnect(handler: StatusHandler) {
    this.disconnectionHandlers.push(handler);
  }

  off(messageType: string, handler: MessageHandler) {
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Connect to the game-server WebSocket endpoint
const WS_URL = 'ws://localhost:3000/ws';

export const gameSocket = new WebSocketService(WS_URL);

export default gameSocket; 