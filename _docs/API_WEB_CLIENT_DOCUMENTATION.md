# Web API Client Documentation

This document provides comprehensive documentation of the web application's API client implementation. The mobile application should implement a matching API client to ensure consistency across platforms.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration](#configuration)
3. [Authentication & Token Management](#authentication--token-management)
4. [API Client Setup](#api-client-setup)
5. [API Endpoints](#api-endpoints)
6. [Type Definitions](#type-definitions)
7. [Error Handling](#error-handling)
8. [Usage Patterns](#usage-patterns)

---

## Architecture Overview

The web API client is built on **Axios** with the following key features:

- **Base URL Configuration**: Configurable via environment variable
- **Request Interceptor**: Automatically adds Authorization headers and proactively refreshes tokens
- **Response Interceptor**: Handles 401 errors with automatic token refresh and request retry
- **Concurrent Request Handling**: Queues requests during token refresh to prevent race conditions
- **Token Management**: JWT token parsing, expiration checking, and automatic refresh

### Key Files

- `lib/api/client.ts` - Axios instance with interceptors
- `lib/api/endpoints.ts` - All API endpoint functions
- `lib/api/types.ts` - TypeScript type definitions
- `lib/utils/token.ts` - JWT token utilities
- `lib/utils/tokenRefresh.ts` - Token refresh logic
- `lib/utils/constants.ts` - Constants (endpoints, storage keys)

---

## Configuration

### Environment Variables

```typescript
// Base API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Storage Keys

The following localStorage keys are used for token management:

```typescript
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  TOKEN_EXPIRATION: 'token_expiration',
  INTENDED_DESTINATION: 'intended_destination',
};
```

---

## Authentication & Token Management

### Token Structure

The API uses JWT tokens with the following structure:
- **Access Token**: Short-lived (typically 15 minutes), used for API requests
- **Refresh Token**: Long-lived, used to obtain new access tokens

### Token Storage

Tokens are stored in `localStorage` with the following keys:
- `access_token`: Current access token
- `refresh_token`: Refresh token for obtaining new access tokens
- `token_expiration`: Timestamp when access token expires

### Token Refresh Strategy

The client implements a **proactive and reactive** token refresh strategy:

1. **Proactive Refresh** (Request Interceptor):
   - Checks if token expires within 60 seconds
   - Automatically refreshes token before making request
   - Prevents failed requests due to expired tokens

2. **Reactive Refresh** (Response Interceptor):
   - Handles 401 Unauthorized responses
   - Automatically refreshes token and retries failed request
   - Queues concurrent requests during refresh to prevent race conditions

### Token Utilities

#### `decodeJwt(token: string): JwtPayload | null`
Decodes JWT token without signature verification (client-side only).

#### `getTokenExpiration(token: string): Date | null`
Extracts expiration date from JWT token.

#### `isTokenExpired(token: string): boolean`
Checks if token is expired (with 5-second buffer for clock skew).

#### `shouldRefreshToken(token: string): boolean`
Returns `true` if token expires within 60 seconds.

#### `isValidTokenFormat(token: string): boolean`
Validates JWT token format (3 parts separated by dots).

---

## API Client Setup

### Axios Instance Configuration

```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL, // From environment variable
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Public Endpoints

The following endpoints don't require authentication:
- `/api/auth/login`
- `/api/auth/signup`
- `/api/auth/refresh`

### Request Interceptor

The request interceptor:
1. Skips auth for public endpoints
2. Gets access token from localStorage
3. Validates token format
4. Proactively refreshes token if expiring within 60 seconds
5. Adds `Authorization: Bearer <token>` header

### Response Interceptor

The response interceptor:
1. Handles successful responses normally
2. On 401 Unauthorized:
   - Skips refresh for public endpoints
   - Prevents infinite retry loops with `_retry` flag
   - Queues concurrent requests during refresh
   - Refreshes token and retries original request
   - Clears tokens and redirects to login if refresh fails

---

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/login`

Login with email and password.

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
  userId: string;
  email: string;
}
```

**Usage:**
```typescript
const response = await login(email, password);
// Store tokens in localStorage
```

---

#### `POST /api/auth/signup`

Create new user account.

**Request:**
```typescript
interface SignupRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
}
```

**Usage:**
```typescript
const response = await signup(email, password);
// Store tokens in localStorage
```

---

#### `POST /api/auth/validate`

Validate an authentication token.

**Request:**
```typescript
interface ValidateTokenRequest {
  token: string;
}
```

**Response:**
```typescript
interface ValidateTokenResponse {
  valid: boolean;
  userId: string | null;
}
```

**Usage:**
```typescript
const response = await validateToken(token);
```

---

#### `POST /api/auth/logout`

Invalidate authentication token.

**Request:**
```typescript
interface ValidateTokenRequest {
  token: string;
}
```

**Response:** `void`

**Usage:**
```typescript
await logout(token);
// Clear tokens from localStorage
```

---

#### `POST /api/auth/refresh`

Refresh access token using refresh token.

**Important:** This endpoint uses `fetch` directly (not `apiClient`) to avoid triggering interceptors and infinite loops.

**Request:**
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**Response:**
```typescript
interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number; // seconds until access token expires
}
```

**Usage:**
```typescript
// This is called internally by tokenRefresh utility
const response = await refreshToken(refreshToken);
// Update access token in localStorage
```

---

### Upload Endpoints

#### `POST /api/uploads`

Request presigned URL for photo upload.

**Request:**
```typescript
interface UploadRequestDto {
  filename: string;
  contentType: string;
  fileSize: number;
  tags?: string[];
}
```

**Response:**
```typescript
interface UploadResponseDto {
  photoId: string;
  presignedUrl: string;
  s3Key: string;
  expirationTime: number;
}
```

**Usage:**
```typescript
const response = await requestPresignedUrl({
  filename: 'photo.jpg',
  contentType: 'image/jpeg',
  fileSize: 1024000,
  tags: ['vacation', 'beach'],
});

// Upload file directly to S3 using presignedUrl
await uploadToS3(file, response.presignedUrl, onProgress);
```

---

#### `POST /api/uploads/:photoId/complete`

Report upload completion to backend.

**Request:** None (photoId in URL path)

**Response:** `void`

**Usage:**
```typescript
await reportUploadComplete(photoId);
```

---

#### `GET /api/uploads/:photoId/status`

Get upload status for a photo.

**Request:** None (photoId in URL path)

**Response:**
```typescript
interface UploadStatusDto {
  photoId: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  uploadDate: string;
  errorMessage?: string;
}
```

**Usage:**
```typescript
const status = await getUploadStatus(photoId);
```

---

### Photo Endpoints

#### `GET /api/photos`

List photos for a user with pagination and filtering.

**Query Parameters:**
- `userId` (required): User ID
- `page` (optional, default: 0): Page number (0-indexed)
- `size` (optional, default: 20): Page size
- `sortBy` (optional): Sort field
- `tags` (optional): Comma-separated list of tags to filter by

**Request:**
```typescript
interface ListPhotosParams {
  userId: string;
  page?: number;
  size?: number;
  sortBy?: string;
  tags?: string[]; // Converted to comma-separated string
}
```

**Response:**
```typescript
PhotoDto[] // Array of photo objects
```

**Usage:**
```typescript
const photos = await listPhotos({
  userId: 'user-123',
  page: 0,
  size: 20,
  sortBy: 'uploadDate',
  tags: ['vacation', 'beach'],
});
```

---

#### `GET /api/photos/:photoId`

Get a single photo by ID.

**Request:** None (photoId in URL path)

**Response:**
```typescript
interface PhotoDto {
  id: string;
  filename: string;
  s3Key: string;
  uploadDate: string; // ISO 8601 date string
  tags: string[];
  status: string;
  downloadUrl: string;
}
```

**Usage:**
```typescript
const photo = await getPhoto(photoId);
```

---

#### `GET /api/photos/:photoId/download`

Get presigned download URL for a photo.

**Request:** None (photoId in URL path)

**Response:**
```typescript
interface DownloadUrlResponse {
  downloadUrl: string;
  expirationTime: number;
}
```

**Usage:**
```typescript
const response = await getPhotoDownloadUrl(photoId);
// Use response.downloadUrl to download the photo
```

---

#### `POST /api/photos/:photoId/tags`

Add tags to a photo.

**Request:**
```typescript
{
  tags: string[];
}
```

**Response:**
```typescript
PhotoDto // Updated photo object
```

**Usage:**
```typescript
const updatedPhoto = await addPhotoTags(photoId, ['new-tag', 'another-tag']);
```

---

#### `DELETE /api/photos/:photoId/tags`

Remove tags from a photo.

**Request Body:**
```typescript
{
  tags: string[];
}
```

**Response:**
```typescript
PhotoDto // Updated photo object
```

**Usage:**
```typescript
const updatedPhoto = await removePhotoTags(photoId, ['tag-to-remove']);
```

---

#### `PUT /api/photos/:photoId/tags`

Replace all tags on a photo.

**Request:**
```typescript
{
  tags: string[];
}
```

**Response:**
```typescript
PhotoDto // Updated photo object
```

**Usage:**
```typescript
const updatedPhoto = await replacePhotoTags(photoId, ['tag1', 'tag2', 'tag3']);
```

---

## Type Definitions

### Authentication Types

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  userId: string;
  email: string;
}

interface SignupRequest {
  email: string;
  password: string;
}

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  valid: boolean;
  userId: string | null;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number; // seconds
}

interface User {
  id: string;
  email: string;
}
```

### Upload Types

```typescript
interface UploadRequestDto {
  filename: string;
  contentType: string;
  fileSize: number;
  tags?: string[];
}

interface UploadResponseDto {
  photoId: string;
  presignedUrl: string;
  s3Key: string;
  expirationTime: number;
}

interface UploadStatusDto {
  photoId: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  uploadDate: string;
  errorMessage?: string;
}
```

### Photo Types

```typescript
interface PhotoDto {
  id: string;
  filename: string;
  s3Key: string;
  uploadDate: string; // ISO 8601 date string
  tags: string[];
  status: string;
  downloadUrl: string;
}

interface ListPhotosParams {
  userId: string;
  page?: number;
  size?: number;
  sortBy?: string;
  tags?: string[];
}

interface DownloadUrlResponse {
  downloadUrl: string;
  expirationTime: number;
}

interface TagOperationRequest {
  tags: string[];
}
```

### Error Types

```typescript
interface ApiError {
  message: string;
  statusCode?: number;
}
```

---

## Error Handling

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or token expired
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Handling Flow

1. **401 Unauthorized**:
   - Response interceptor catches 401
   - Attempts token refresh
   - Retries original request with new token
   - If refresh fails, clears tokens and redirects to login

2. **Other Errors**:
   - Rejected promise with error details
   - Error object contains `message` and optional `statusCode`

### Error Example

```typescript
try {
  const photos = await listPhotos({ userId: 'user-123' });
} catch (error) {
  if (error.response?.status === 401) {
    // Handled automatically by interceptor
  } else {
    console.error('API Error:', error.message);
  }
}
```

---

## Usage Patterns

### Authentication Flow

```typescript
// 1. Login
const loginResponse = await login(email, password);

// 2. Store tokens
localStorage.setItem('access_token', loginResponse.accessToken);
localStorage.setItem('refresh_token', loginResponse.refreshToken);
localStorage.setItem('user_id', loginResponse.userId);

// 3. Make authenticated requests (token added automatically)
const photos = await listPhotos({ userId: loginResponse.userId });

// 4. Logout
await logout(accessToken);
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### Upload Flow

```typescript
// 1. Request presigned URL
const uploadResponse = await requestPresignedUrl({
  filename: file.name,
  contentType: file.type,
  fileSize: file.size,
  tags: ['vacation'],
});

// 2. Upload directly to S3
await uploadToS3(file, uploadResponse.presignedUrl, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// 3. Report completion
await reportUploadComplete(uploadResponse.photoId);
```

### Photo Management Flow

```typescript
// 1. List photos
const photos = await listPhotos({
  userId: 'user-123',
  page: 0,
  size: 20,
  tags: ['vacation'],
});

// 2. Get single photo
const photo = await getPhoto(photoId);

// 3. Add tags
const updatedPhoto = await addPhotoTags(photoId, ['new-tag']);

// 4. Get download URL
const downloadResponse = await getPhotoDownloadUrl(photoId);
// Use downloadResponse.downloadUrl to download
```

### Token Refresh Flow

```typescript
// Token refresh is handled automatically by interceptors
// Manual refresh (if needed):
const newToken = await refreshAccessToken();
if (newToken) {
  localStorage.setItem('access_token', newToken);
}
```

---

## Implementation Checklist for Mobile

To match the web API client, the mobile implementation should:

- [ ] Use Axios (or equivalent HTTP client) with interceptors
- [ ] Implement request interceptor for automatic token injection
- [ ] Implement response interceptor for 401 handling and token refresh
- [ ] Implement concurrent request queuing during token refresh
- [ ] Implement proactive token refresh (refresh if expiring within 60 seconds)
- [ ] Store tokens in secure storage (AsyncStorage/Keychain)
- [ ] Implement all API endpoint functions with matching signatures
- [ ] Use matching TypeScript/TypeScript-like type definitions
- [ ] Implement JWT token parsing utilities
- [ ] Handle token expiration with 5-second buffer for clock skew
- [ ] Implement error handling for all HTTP status codes
- [ ] Use same base URL configuration pattern
- [ ] Match request/response payload structures exactly

---

## Notes

1. **Token Refresh**: The refresh endpoint uses `fetch` directly (not `apiClient`) to avoid infinite loops in interceptors.

2. **Concurrent Requests**: During token refresh, all pending requests are queued and retried with the new token to prevent race conditions.

3. **Public Endpoints**: Login, signup, and refresh endpoints don't require authentication and skip token injection.

4. **S3 Upload**: File uploads go directly to S3 using presigned URLs. The backend only generates the presigned URL and tracks completion.

5. **Error Handling**: 401 errors trigger automatic token refresh and request retry. Other errors are passed through normally.

6. **Token Format Validation**: All tokens are validated for proper JWT format before use.

---

## Constants Reference

```typescript
// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  TOKEN_EXPIRATION: 'token_expiration',
  INTENDED_DESTINATION: 'intended_destination',
};

// API Endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    VALIDATE: '/api/auth/validate',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
};

// Defaults
const DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_UPLOAD_COUNT: 100,
};
```

---

This documentation should serve as a complete reference for implementing a matching API client in the mobile application.

