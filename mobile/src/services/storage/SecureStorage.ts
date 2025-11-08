/**
 * Secure Storage Service
 * 
 * Service for securely storing authentication tokens using expo-secure-store.
 * Provides methods for storing, retrieving, and clearing access and refresh tokens.
 * 
 * @module services/storage/SecureStorage
 */

import * as SecureStore from 'expo-secure-store';

/**
 * Keys for secure storage
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
} as const;

/**
 * Secure storage service for token management
 */
export class SecureStorage {
  /**
   * Store access token securely
   */
  static async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Failed to store access token:', error);
      throw new Error('Failed to store access token');
    }
  }

  /**
   * Retrieve access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Store refresh token securely
   */
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Retrieve refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Store user ID securely
   */
  static async setUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Failed to store user ID:', error);
      throw new Error('Failed to store user ID');
    }
  }

  /**
   * Retrieve user ID
   */
  static async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Failed to retrieve user ID:', error);
      return null;
    }
  }

  /**
   * Store user email securely
   */
  static async setUserEmail(email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, email);
    } catch (error) {
      console.error('Failed to store user email:', error);
      throw new Error('Failed to store user email');
    }
  }

  /**
   * Retrieve user email
   */
  static async getUserEmail(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Failed to retrieve user email:', error);
      return null;
    }
  }

  /**
   * Clear all stored tokens and user data
   */
  static async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      // Don't throw - clearing tokens should be best-effort
    }
  }
}

