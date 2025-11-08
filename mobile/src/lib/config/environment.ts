/**
 * Environment Configuration
 * 
 * Centralized configuration for API endpoints and environment-specific settings.
 * This file will be expanded in future phases to support multiple environments
 * (development, staging, production) and additional configuration values.
 * 
 * @module lib/config
 */

/**
 * Base URL for the backend API.
 * 
 * Currently configured for local development network access.
 * In future phases, this will be moved to environment variables.
 */
export const API_BASE_URL = 'http://10.10.0.45:8080';

/**
 * API endpoint paths.
 * These will be used when building the API client in future phases.
 */
export const API_ENDPOINTS = {
  HEALTH: '/actuator/health',
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  PHOTOS: {
    LIST: '/api/photos',
    DETAIL: (id: string) => `/api/photos/${id}`,
    DOWNLOAD: (id: string) => `/api/photos/${id}/download`,
  },
  UPLOADS: {
    INITIATE: '/api/uploads',
    STATUS: (id: string) => `/api/uploads/${id}/status`,
    COMPLETE: (id: string) => `/api/uploads/${id}/complete`,
    FAIL: (id: string) => `/api/uploads/${id}/fail`,
  },
  TAGS: {
    ADD: (photoId: string) => `/api/photos/${photoId}/tags`,
    REMOVE: (photoId: string) => `/api/photos/${photoId}/tags`,
  },
} as const;

