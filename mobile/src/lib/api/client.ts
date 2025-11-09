/**
 * API Client
 *
 * Axios instance with request/response interceptors for JWT authentication.
 * Handles proactive token refresh, 401 error handling, and request queuing.
 *
 * @module lib/api/client
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/config/environment';
import { STORAGE_KEYS } from '@/lib/config/constants';
import { SecureStorage } from '@/services/storage/SecureStorage';
import { isValidTokenFormat, shouldRefreshToken } from '@/lib/utils/token';
import { handleTokenRefresh } from '@/lib/utils/tokenRefresh';

// ===== AXIOS INSTANCE =====

/**
 * Axios instance configured for API communication
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// ===== UTILITY FUNCTIONS =====

/**
 * Check if endpoint is public (doesn't require authentication)
 */
function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.SIGNUP,
    API_ENDPOINTS.AUTH.REFRESH,
  ];

  return publicEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Get access token from secure storage
 */
async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStorage.getAccessToken();
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Validate and refresh token if needed
 */
async function validateAndRefreshToken(token: string): Promise<string | null> {
  if (!isValidTokenFormat(token)) {
    console.warn('Invalid token format');
    return null;
  }

  // Check if token needs refresh
  if (shouldRefreshToken(token)) {
    console.log('Token expiring soon, refreshing proactively');
    const newToken = await handleTokenRefresh(null);
    return newToken || token; // Return new token or original if refresh failed
  }

  return token;
}

// ===== REQUEST INTERCEPTOR =====

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Skip authentication for public endpoints
    if (config.url && isPublicEndpoint(config.url)) {
      return config;
    }

    try {
      // Get access token
      const token = await getAccessToken();
      if (!token) {
        console.warn('No access token available for authenticated request');
        return config; // Continue without token - let response interceptor handle 401
      }

      // Validate and potentially refresh token
      const validToken = await validateAndRefreshToken(token);
      if (validToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${validToken}`;
      }
    } catch (error) {
      console.error('Request interceptor error:', error);
      // Continue with request even if token operations fail
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Pass through successful responses
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest) {
      // Skip refresh for public endpoints
      if (originalRequest.url && isPublicEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      // Prevent infinite retry loops
      if ((originalRequest as any)._retry) {
        console.error('Token refresh retry failed');
        return Promise.reject(error);
      }

      // Mark request as retried
      (originalRequest as any)._retry = true;

      try {
        // Handle token refresh with request queuing
        await handleTokenRefresh(originalRequest);

        // Retry the original request with new token
        const token = await getAccessToken();
        if (token) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear tokens and let app handle logout
        try {
          await SecureStorage.clearTokens();
        } catch (clearError) {
          console.error('Failed to clear tokens:', clearError);
        }

        return Promise.reject(error);
      }
    }

    // Pass through other errors
    return Promise.reject(error);
  }
);

export default apiClient;

