/**
 * Token Refresh Logic
 *
 * Handles JWT token refresh with concurrent request queuing to prevent race conditions.
 * Uses fetch directly (not axios) to avoid interceptor loops.
 *
 * @module lib/utils/tokenRefresh
 */

import { API_BASE_URL } from '@/lib/config/environment';
import { STORAGE_KEYS } from '@/lib/config/constants';
import { SecureStorage } from '@/services/storage/SecureStorage';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Queued request structure for retrying after token refresh
 */
interface QueuedRequest {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: any;
}

/**
 * Request queue to handle concurrent requests during token refresh
 */
class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isRefreshing = false;

  /**
   * Add request to queue
   */
  enqueue(request: QueuedRequest): void {
    this.queue.push(request);
  }

  /**
   * Process all queued requests
   */
  processQueue(error: any = null): void {
    this.queue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.queue = [];
  }

  /**
   * Check if token refresh is in progress
   */
  get isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set refresh state
   */
  setRefreshing(state: boolean): void {
    this.isRefreshing = state;
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }
}

// Global request queue instance
const requestQueue = new RequestQueue();

/**
 * Refresh access token using refresh token.
 *
 * Uses fetch directly to avoid axios interceptors and potential loops.
 * Updates stored tokens if refresh succeeds.
 *
 * @returns Promise<string | null> - New access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    // Get refresh token from secure storage
    const refreshToken = await SecureStorage.getRefreshToken();
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data: { accessToken: string; expiresIn: number } = await response.json();

    // Store new access token
    await SecureStorage.setAccessToken(data.accessToken);

    // Update auth store state with new token
    await useAuthStore.getState().setToken(data.accessToken);

    // Calculate and store expiration time
    const expirationTime = Date.now() + (data.expiresIn * 1000);
    // Note: SecureStorage doesn't have setTokenExpiration, so we'll skip this for now

    return data.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);

    // Clear tokens on refresh failure
    await SecureStorage.clearTokens();

    return null;
  }
}

/**
 * Handle token refresh with request queuing.
 *
 * Prevents multiple concurrent refresh attempts and queues requests
 * until refresh completes.
 *
 * @param originalRequest - The axios request config that triggered refresh
 * @returns Promise that resolves when refresh is complete
 */
export function handleTokenRefresh(originalRequest: any): Promise<void> {
  return new Promise((resolve, reject) => {
    // Queue this request
    requestQueue.enqueue({ resolve, reject, config: originalRequest });

    // If already refreshing, just wait
    if (requestQueue.isRefreshingToken) {
      return;
    }

    // Start refresh process
    requestQueue.setRefreshing(true);

    refreshAccessToken()
      .then((newToken) => {
        if (newToken) {
          // Refresh succeeded - resolve all queued requests
          requestQueue.processQueue();
        } else {
          // Refresh failed - reject all queued requests
          requestQueue.processQueue(new Error('Token refresh failed'));
        }
      })
      .catch((error) => {
        // Refresh error - reject all queued requests
        requestQueue.processQueue(error);
      })
      .finally(() => {
        requestQueue.setRefreshing(false);
      });
  });
}
