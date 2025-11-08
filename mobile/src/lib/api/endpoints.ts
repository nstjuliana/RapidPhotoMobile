/**
 * API Endpoints
 *
 * Functions for all API endpoints with proper typing and error handling.
 * Matches the web client endpoint structure for consistency.
 *
 * @module lib/api/endpoints
 */

import axios from 'axios';
import { apiClient } from './client';
import { API_BASE_URL } from '@/lib/config/environment';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UploadRequestDto,
  UploadResponseDto,
  UploadStatusDto,
  PhotoDto,
  ListPhotosParams,
  DownloadUrlResponse,
  TagOperationRequest,
  UploadProgressCallback,
} from './types';

// ===== AUTHENTICATION ENDPOINTS =====

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    email,
    password,
  });
  return response.data;
}

/**
 * Create new user account
 */
export async function signup(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/signup', {
    email,
    password,
  });
  return response.data;
}

/**
 * Validate authentication token
 */
export async function validateToken(token: string): Promise<ValidateTokenResponse> {
  const response = await apiClient.post<ValidateTokenResponse>('/api/auth/validate', {
    token,
  });
  return response.data;
}

/**
 * Logout and invalidate token
 */
export async function logout(token: string): Promise<void> {
  await apiClient.post('/api/auth/logout', {
    token,
  });
}

/**
 * Refresh access token using refresh token.
 *
 * Uses fetch directly (not axios) to avoid interceptor loops.
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
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

  return response.json();
}

// ===== UPLOAD ENDPOINTS =====

/**
 * Request presigned URL for photo upload
 */
export async function requestPresignedUrl(uploadRequest: UploadRequestDto): Promise<UploadResponseDto> {
  const response = await apiClient.post<UploadResponseDto>('/api/uploads', uploadRequest);
  return response.data;
}

/**
 * Report upload completion to backend
 */
export async function reportUploadComplete(photoId: string): Promise<void> {
  await apiClient.post(`/api/uploads/${photoId}/complete`);
}

/**
 * Get upload status for a photo
 */
export async function getUploadStatus(photoId: string): Promise<UploadStatusDto> {
  const response = await apiClient.get<UploadStatusDto>(`/api/uploads/${photoId}/status`);
  return response.data;
}

/**
 * Upload file directly to S3 using presigned URL with progress tracking
 */
export async function uploadToS3(
  file: any, // File or blob-like object
  presignedUrl: string,
  onProgress?: UploadProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    // Success handler
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed: ${xhr.status}`));
      }
    };

    // Error handler
    xhr.onerror = () => {
      reject(new Error('S3 upload failed: Network error'));
    };

    // Configure and send request
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

// ===== PHOTO ENDPOINTS =====

/**
 * List photos for a user with pagination and filtering
 */
export async function listPhotos(params: ListPhotosParams): Promise<PhotoDto[]> {
  const queryParams = new URLSearchParams({
    userId: params.userId,
    ...(params.page !== undefined && { page: params.page.toString() }),
    ...(params.size !== undefined && { size: params.size.toString() }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.tags && params.tags.length > 0 && { tags: params.tags.join(',') }),
  });

  const response = await apiClient.get<PhotoDto[]>(`/api/photos?${queryParams}`);
  return response.data;
}

/**
 * Get a single photo by ID
 */
export async function getPhoto(photoId: string): Promise<PhotoDto> {
  const response = await apiClient.get<PhotoDto>(`/api/photos/${photoId}`);
  return response.data;
}

/**
 * Get presigned download URL for a photo
 */
export async function getPhotoDownloadUrl(photoId: string): Promise<DownloadUrlResponse> {
  const response = await apiClient.get<DownloadUrlResponse>(`/api/photos/${photoId}/download`);
  return response.data;
}

/**
 * Add tags to a photo
 */
export async function addPhotoTags(photoId: string, tags: string[]): Promise<PhotoDto> {
  const response = await apiClient.post<PhotoDto>(`/api/photos/${photoId}/tags`, {
    tags,
  });
  return response.data;
}

/**
 * Remove tags from a photo
 */
export async function removePhotoTags(photoId: string, tags: string[]): Promise<PhotoDto> {
  const response = await apiClient.delete<PhotoDto>(`/api/photos/${photoId}/tags`, {
    data: { tags }, // DELETE request body
  });
  return response.data;
}

/**
 * Replace all tags on a photo
 */
export async function replacePhotoTags(photoId: string, tags: string[]): Promise<PhotoDto> {
  const response = await apiClient.put<PhotoDto>(`/api/photos/${photoId}/tags`, {
    tags,
  });
  return response.data;
}
