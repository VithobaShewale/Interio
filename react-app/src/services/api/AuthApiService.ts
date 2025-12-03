/**
 * Authentication API Service
 * Handles user authentication and authorization
 */

import { apiService, ApiResponse } from './BaseApiService';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthApiService {
  private readonly endpoint = '/auth';

  async login(credentials: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.endpoint}/login`, credentials);
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    return response;
  }

  async register(userData: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.endpoint}/register`, userData);
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    apiService.setAuthToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<User>(`${this.endpoint}/me`);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.endpoint}/refresh`, { refreshToken });
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    return response;
  }

  initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiService.setAuthToken(token);
    }
  }
}

export const authApiService = new AuthApiService();
