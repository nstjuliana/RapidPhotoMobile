/**
 * API Constants
 *
 * Centralized constants for API configuration, storage keys, and defaults.
 * Matches the web client constants structure for consistency.
 *
 * @module lib/config/constants
 */

/**
 * Storage keys for secure token and user data storage
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  TOKEN_EXPIRATION: 'token_expiration',
  INTENDED_DESTINATION: 'intended_destination',
} as const;

/**
 * API endpoint paths organized by feature
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    VALIDATE: '/api/auth/validate',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  UPLOADS: {
    REQUEST_URL: '/api/uploads',
    STATUS: (photoId: string) => `/api/uploads/${photoId}/status`,
    COMPLETE: (photoId: string) => `/api/uploads/${photoId}/complete`,
  },
  PHOTOS: {
    LIST: '/api/photos',
    DETAIL: (photoId: string) => `/api/photos/${photoId}`,
    DOWNLOAD_URL: (photoId: string) => `/api/photos/${photoId}/download`,
    TAGS: (photoId: string) => `/api/photos/${photoId}/tags`,
  },
} as const;

/**
 * Default values for API requests and application behavior
 */
export const DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_UPLOAD_COUNT: 100,
  TOKEN_REFRESH_THRESHOLD: 60, // seconds before expiration to refresh
  TOKEN_CLOCK_SKEW_BUFFER: 5, // seconds buffer for clock skew
} as const;

