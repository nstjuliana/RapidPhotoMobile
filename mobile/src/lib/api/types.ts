/**
 * API Type Definitions
 *
 * TypeScript type definitions for API requests and responses.
 * These types match the backend DTOs and web client types for consistency.
 *
 * @module lib/api/types
 */

// ===== AUTHENTICATION TYPES =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
  userId: string;
  email: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number; // seconds until access token expires
}

// ===== UPLOAD TYPES =====

export interface UploadRequestDto {
  filename: string;
  contentType: string;
  fileSize: number;
  tags?: string[];
}

export interface UploadResponseDto {
  photoId: string;
  presignedUrl: string;
  s3Key: string;
  expirationTime: number;
}

export interface UploadStatusDto {
  photoId: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  uploadDate: string;
  errorMessage?: string;
}

// ===== PHOTO TYPES =====

export interface PhotoDto {
  id: string;
  filename: string;
  s3Key: string;
  uploadDate: string; // ISO 8601 date string
  tags: string[];
  status: string;
  downloadUrl: string;
}

export interface ListPhotosParams {
  userId: string;
  page?: number;
  size?: number;
  sortBy?: string;
  tags?: string[];
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expirationTime: number;
}

export interface TagOperationRequest {
  tags: string[];
}

// ===== ERROR TYPES =====

export interface ApiError {
  message: string;
  statusCode?: number;
}

// ===== UTILITY TYPES =====

export type UploadProgressCallback = (progress: number) => void;

export type PhotoStatus = 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

