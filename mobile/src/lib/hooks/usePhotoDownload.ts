/**
 * Photo Download Hook
 *
 * Custom hook for managing photo downloads with progress tracking.
 * Supports single and batch downloads with real-time progress updates.
 *
 * @module src/lib/hooks/usePhotoDownload
 */

import { useState, useCallback } from 'react';
import {
  DownloadService,
  type DownloadTask,
  type DownloadResult,
  type DownloadProgress,
} from '@/services/download/DownloadService';
import type { PhotoDto } from '@/lib/api/types';

/**
 * Download hook return type
 */
interface UsePhotoDownloadReturn {
  downloadPhoto: (photo: PhotoDto) => Promise<DownloadResult>;
  downloadPhotos: (photos: PhotoDto[]) => Promise<DownloadResult[]>;
  isDownloading: boolean;
  progress: Record<string, number>;
  currentDownloads: DownloadTask[];
  error: string | null;
  cancelDownloads: () => void;
  clearError: () => void;
}

/**
 * Configuration for download hook
 */
interface DownloadConfig {
  concurrency?: number;
  onProgress?: (progress: DownloadProgress) => void;
  onTaskComplete?: (result: DownloadResult) => void;
}

/**
 * Custom hook for photo download management
 */
export function usePhotoDownload(config: DownloadConfig = {}): UsePhotoDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentDownloads, setCurrentDownloads] = useState<DownloadTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle download progress updates
   */
  const handleProgress = useCallback((downloadProgress: DownloadProgress) => {
    setProgress(prev => ({
      ...prev,
      [downloadProgress.photoId]: downloadProgress.progress,
    }));

    // Call external progress callback if provided
    config.onProgress?.(downloadProgress);
  }, [config.onProgress]);

  /**
   * Handle task completion
   */
  const handleTaskComplete = useCallback((result: DownloadResult) => {
    // Remove from current downloads
    setCurrentDownloads(prev =>
      prev.filter(task => task.photoId !== result.task.photoId)
    );

    // Call external completion callback if provided
    config.onTaskComplete?.(result);
  }, [config.onTaskComplete]);

  /**
   * Download a single photo
   */
  const downloadPhoto = useCallback(async (photo: PhotoDto): Promise<DownloadResult> => {
    setIsDownloading(true);
    setError(null);

    // Add to current downloads
    const task: DownloadTask = {
      photoId: photo.id,
      filename: photo.filename,
    };
    setCurrentDownloads(prev => [...prev, task]);

    try {
      const result = await DownloadService.downloadPhoto(
        photo.id,
        photo.filename,
        handleProgress
      );

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);

      return {
        task,
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsDownloading(false);
      setCurrentDownloads(prev =>
        prev.filter(t => t.photoId !== photo.id)
      );
    }
  }, [handleProgress]);

  /**
   * Download multiple photos
   */
  const downloadPhotos = useCallback(async (photos: PhotoDto[]): Promise<DownloadResult[]> => {
    if (photos.length === 0) return [];

    setIsDownloading(true);
    setError(null);
    setProgress({});

    // Create download tasks
    const tasks: DownloadTask[] = photos.map(photo => ({
      photoId: photo.id,
      filename: photo.filename,
    }));

    // Add all to current downloads
    setCurrentDownloads(tasks);

    try {
      const results = await DownloadService.downloadPhotos(
        tasks,
        handleProgress,
        handleTaskComplete,
        config.concurrency || 3
      );

      // Check for errors
      const failedResults = results.filter(r => !r.success);
      if (failedResults.length > 0) {
        const errorCount = failedResults.length;
        setError(`${errorCount} download${errorCount !== 1 ? 's' : ''} failed`);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch download failed';
      setError(errorMessage);

      // Return failed results for all tasks
      return tasks.map(task => ({
        task,
        success: false,
        error: errorMessage,
      }));
    } finally {
      setIsDownloading(false);
      setCurrentDownloads([]);
      // Keep progress for a bit to show final state
      setTimeout(() => setProgress({}), 3000);
    }
  }, [handleProgress, handleTaskComplete, config.concurrency]);

  /**
   * Cancel current downloads
   */
  const cancelDownloads = useCallback(() => {
    // Note: DownloadService doesn't currently support cancellation
    // This would need to be implemented in the service
    setIsDownloading(false);
    setCurrentDownloads([]);
    setProgress({});
    setError('Downloads cancelled');
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    downloadPhoto,
    downloadPhotos,
    isDownloading,
    progress,
    currentDownloads,
    error,
    cancelDownloads,
    clearError,
  };
}
