/**
 * Authentication Hook
 *
 * Custom hook for managing authentication state and operations.
 * Provides login, signup, logout, and authentication status checking.
 * Integrates with backend JWT authentication APIs.
 *
 * @module lib/hooks/useAuth
 */

import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import { SecureStorage } from '@/services/storage/SecureStorage';
import { isValidTokenFormat, isTokenExpired } from '@/lib/utils/token';
import type { User } from '@/lib/types/auth';

/**
 * Authentication hook
 */
export function useAuth() {
  const router = useRouter();
  const { isAuthenticated, user, token, login: storeLogin, signup: storeSignup, logout: storeLogout } = useAuthStore();

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await storeLogin(email, password);
      // Navigate to gallery
      router.replace('/(tabs)/gallery');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Signup with email and password
   */
  const signup = async (email: string, password: string): Promise<void> => {
    try {
      await storeSignup(email, password);
      // Navigate to gallery
      router.replace('/(tabs)/gallery');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout and clear authentication
   */
  const logout = async (): Promise<void> => {
    await storeLogout();
    router.replace('/(auth)/login');
  };

  /**
   * Check if user is authenticated
   */
  const checkAuth = async (): Promise<boolean> => {
    const storedToken = await SecureStorage.getAccessToken();
    return storedToken !== null && isAuthenticated;
  };

  /**
   * Restore authentication state from secure storage
   */
  const restoreAuth = async (): Promise<boolean> => {
    try {
      const storedToken = await SecureStorage.getAccessToken();
      const storedUserId = await SecureStorage.getUserId();
      const storedEmail = await SecureStorage.getUserEmail();

      if (!storedToken || !storedUserId || !storedEmail || !isValidTokenFormat(storedToken) || isTokenExpired(storedToken)) {
        // Clear invalid tokens
        await SecureStorage.clearTokens();
        return false;
      }

      // Create user object
      const user: User = {
        id: storedUserId,
        email: storedEmail,
      };

      // Update store state
      useAuthStore.setState({
        isAuthenticated: true,
        user,
        token: storedToken,
      });

      return true;
    } catch (error) {
      console.error('Failed to restore authentication:', error);
      await SecureStorage.clearTokens();
      return false;
    }
  };

  return {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    checkAuth,
    restoreAuth,
  };
}

