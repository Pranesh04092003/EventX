import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL for the backend
// Use IP address for React Native apps (localhost doesn't work on physical devices)
const API_BASE_URL = 'http://192.168.1.124:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  isAdmin: boolean;
  registeredEvents: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${this.baseUrl}${endpoint}`;
      console.log('Making API request to:', url);
      console.log('Request options:', { ...options, headers });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      console.error('Request URL:', `${this.baseUrl}${endpoint}`);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    name: string;
    email: string;
    phone: string;
    college: string;
    department: string;
    password: string;
    isAdmin?: boolean;
  }): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      await this.setAuthToken(response.data.token);
    }

    return response.data!;
  }

  async login(credentials: {
    email: string;
    password: string;
    isAdmin?: boolean;
  }): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      await this.setAuthToken(response.data.token);
    }

    return response.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest<User>('/auth/me');
    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      await this.removeAuthToken();
    }
  }

  // Health check
  async healthCheck(): Promise<{ message: string; timestamp: string }> {
    const response = await this.makeRequest<{ message: string; timestamp: string }>('/health');
    return response.data!;
  }

  // Test connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to:', this.baseUrl);
      const response = await fetch(`${this.baseUrl}/health`);
      console.log('Test response status:', response.status);
      const data = await response.json();
      console.log('Test response data:', data);
      return response.ok;
    } catch (error: any) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type { ApiResponse, AuthResponse, User };

