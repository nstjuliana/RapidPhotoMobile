/**
 * API Client Module
 *
 * Barrel export for all API-related functionality.
 * Provides a clean interface for importing API client, types, and endpoints.
 *
 * @module lib/api
 */

// Export the configured axios client
export { apiClient } from './client';

// Export all endpoint functions
export * from './endpoints';

// Export all types
export * from './types';

