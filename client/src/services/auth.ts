import axios from 'axios';

// Define API URL based on environment
const API_URL =  'http://localhost:3030/api';

interface User {
  id: string;
  email: string;
  username: string;
}

class AuthService {
  constructor() {
  }

  logout(): void {
    // Clear user data
    // Remove from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  }

  getCurrentUser(): User | null {
    return null;
  }

  isAuthenticated(): boolean {
    return false;
  }

  getToken(): string | null {
    return null;
  }
}

export const authService = new AuthService();
export default authService;
