/**
 * Auth Container
 * Connects authentication state to components
 */

import React, { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store';
import { authApiService, LoginDto, RegisterDto } from '../services/api';
import { useUIStore } from '../store';

interface AuthContainerProps {
  children: (props: AuthContainerChildProps) => React.ReactNode;
}

export interface AuthContainerChildProps {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, error, setUser, setLoading, setError, logout: logoutStore } = useAuthStore();
  const { showNotification } = useUIStore();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        authApiService.initializeAuth();
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          const response = await authApiService.getCurrentUser();
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Auth initialization failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  const login = useCallback(
    async (credentials: LoginDto) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authApiService.login(credentials);
        setUser(response.data.user);
        showNotification('Logged in successfully', 'success');
      } catch (err: any) {
        const message = err.message || 'Login failed';
        setError(message);
        showNotification(message, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser, showNotification]
  );

  const register = useCallback(
    async (userData: RegisterDto) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authApiService.register(userData);
        setUser(response.data.user);
        showNotification('Account created successfully', 'success');
      } catch (err: any) {
        const message = err.message || 'Registration failed';
        setError(message);
        showNotification(message, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser, showNotification]
  );

  const logout = useCallback(async () => {
    try {
      await authApiService.logout();
      logoutStore();
      showNotification('Logged out successfully', 'success');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  }, [logoutStore, showNotification]);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      logoutStore();
      return;
    }

    try {
      const response = await authApiService.refreshToken(refreshToken);
      setUser(response.data.user);
    } catch (err: any) {
      console.error('Token refresh failed:', err);
      logoutStore();
    }
  }, [setUser, logoutStore]);

  return (
    <>
      {children({
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshAuth,
      })}
    </>
  );
};
