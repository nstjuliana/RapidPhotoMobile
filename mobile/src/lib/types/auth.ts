/**
 * Authentication Types
 * 
 * Type definitions for authentication-related data structures.
 * Used for mock authentication in Phase 10, will be expanded
 * for real JWT authentication in Phase 11.
 * 
 * @module lib/types/auth
 */

/**
 * User information structure
 */
export interface User {
  id: string;
  email: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Authentication response (mock)
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

