/**
 * Photo Types
 * 
 * Type definitions for photo-related data structures.
 * Placeholder types for Phase 10, will be expanded in Phase 11
 * when implementing photo upload and gallery features.
 * 
 * @module lib/types/photo
 */

/**
 * Photo entity structure
 */
export interface Photo {
  id: string;
  filename: string;
  s3Key: string;
  uploadDate: string;
  tags: string[];
  status: 'pending' | 'uploading' | 'completed' | 'failed';
}

/**
 * Upload state for tracking upload progress
 */
export interface UploadState {
  fileId: string;
  photoId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}


