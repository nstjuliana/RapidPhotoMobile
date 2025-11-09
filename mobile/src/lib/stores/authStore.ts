/**
 * Authentication Store
 *
 * Zustand store for managing authentication state.
 * Handles user authentication, token management, and user information.
 * Integrates with backend JWT authentication APIs.
 *
 * @module lib/stores/authStore
 */

import { create } from 'zustand';
import { SecureStorage } from '@/services/storage/SecureStorage';
import type { User } from '@/lib/types/auth';

// Import API functions dynamically to avoid circular dependency
let login: any, signup: any, logout: any;

const loadApiEndpoints = async () => {
  if (!login) {
    const endpoints = await import('@/lib/api/endpoints');
    login = endpoints.login;
    signup = endpoints.signup;
    logout = endpoints.logout;
  }
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

/**
 * Authentication store for managing auth state
 */
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  
  login: async (email: string, password: string) => {
    await loadApiEndpoints();
    const response = await login(email, password);

    // Store tokens securely
    await SecureStorage.setAccessToken(response.accessToken);
    await SecureStorage.setRefreshToken(response.refreshToken);
    await SecureStorage.setUserId(response.userId);
    await SecureStorage.setUserEmail(response.email);

    // Update store state
    const user: User = {
      id: response.userId,
      email: response.email,
    };

    set({
      isAuthenticated: true,
      user,
      token: response.accessToken,
    });
  },
  
  signup: async (email: string, password: string) => {
    await loadApiEndpoints();
    const response = await signup(email, password);

    // Store tokens securely
    await SecureStorage.setAccessToken(response.accessToken);
    await SecureStorage.setRefreshToken(response.refreshToken);
    await SecureStorage.setUserId(response.userId);
    await SecureStorage.setUserEmail(response.email);

    // Update store state
    const user: User = {
      id: response.userId,
      email: response.email,
    };

    set({
      isAuthenticated: true,
      user,
      token: response.accessToken,
    });
  },
  
  logout: async () => {
    try {
      // Get current token for backend logout
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        await loadApiEndpoints();
        await logout(currentToken);
      }
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with local logout even if backend call fails
    }

    // Clear tokens from secure storage
    await SecureStorage.clearTokens();

    // Reset state
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },
  
  setUser: (user: User) => {
    set({ user });
  },
  
  setToken: async (token: string) => {
    await SecureStorage.setAccessToken(token);
    set({ token, isAuthenticated: true });
  },
}));

