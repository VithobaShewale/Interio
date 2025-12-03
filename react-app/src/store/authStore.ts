/**
 * Auth Store
 * Manages authentication state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    // Actions
    setUser: (user) =>
      set((state) => {
        state.user = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
        state.error = null;
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    logout: () =>
      set((state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('user');
      }),
  }))
);
