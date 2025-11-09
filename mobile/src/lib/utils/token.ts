/**
 * JWT Token Utilities
 *
 * Utility functions for JWT token parsing, validation, and expiration checking.
 * These functions work with JWT tokens without requiring signature verification
 * (client-side only - server handles signature validation).
 *
 * @module lib/utils/token
 */

import { DEFAULTS } from '@/lib/config/constants';

/**
 * JWT payload structure (decoded)
 */
interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  [key: string]: any;
}

/**
 * Decodes JWT token without signature verification.
 *
 * @param token - JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    if (!isValidTokenFormat(token)) {
      return null;
    }

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Extracts expiration date from JWT token.
 *
 * @param token - JWT token string
 * @returns Expiration date or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return null;
  }

  return new Date(payload.exp * 1000); // Convert Unix timestamp to Date
}

/**
 * Checks if a JWT token is expired.
 *
 * Includes a buffer for clock skew to prevent false negatives.
 *
 * @param token - JWT token string
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true; // Invalid token is considered expired
  }

  const now = new Date();
  const bufferMs = DEFAULTS.TOKEN_CLOCK_SKEW_BUFFER * 1000; // Convert to milliseconds

  return now.getTime() + bufferMs >= expiration.getTime();
}

/**
 * Checks if token should be refreshed proactively.
 *
 * Returns true if token expires within the refresh threshold.
 *
 * @param token - JWT token string
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true; // Invalid token should be refreshed
  }

  const now = new Date();
  const thresholdMs = DEFAULTS.TOKEN_REFRESH_THRESHOLD * 1000; // Convert to milliseconds

  return now.getTime() + thresholdMs >= expiration.getTime();
}

/**
 * Validates JWT token format.
 *
 * Checks for proper JWT structure: header.payload.signature
 *
 * @param token - Token string to validate
 * @returns true if token has valid JWT format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

