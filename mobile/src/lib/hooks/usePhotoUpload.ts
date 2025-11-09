/**
 * Photo Upload Hook
 *
 * Custom hook for managing photo uploads with progress tracking and concurrency control.
 * Handles the complete upload flow from image selection to backend completion reporting.
 *
 * @module src/lib/hooks/usePhotoUpload
 */

import { useState, useCallback } from 'react';
import { useUploadStore } from '@/lib/stores/uploadStore';
import { UploadQueueManager, type UploadTask, type UploadResult } from '@/lib/services/upload/UploadQueueManager';
import type { SelectedImage } from '@/components/upload/ImagePicker';

/**
 * Upload hook return type
 */
interface UsePhotoUploadReturn {
  upload: (images: SelectedImage[], tags?: string[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: Record<string, number>;
  error: string | null;
  cancelUpload: () => void;
  retryFailed: () => void;
}

/**
 * Configuration for upload hook
 */
interface UploadConfig {
  maxConcurrent?: number;
  batchSize?: number;
}

/**
 * Custom hook for photo upload management
 */
export function usePhotoUpload(config: UploadConfig = {}): UsePhotoUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const {
    addUpload,
    updateUploadProgress,
    updateUploadStatus,
    clearCompleted,
  } = useUploadStore();

  // Create queue manager instance
  const [queueManager] = useState(() => new UploadQueueManager(config));

  /**
   * Upload images with optional tags
   */
  const upload = useCallback(async (
    images: SelectedImage[],
    tags: string[] = []
  ): Promise<UploadResult[]> => {
    if (images.length === 0) {
      return [];
    }

    setIsUploading(true);
    setError(null);
    setProgress({});

    try {
      // Create upload tasks
      const tasks: UploadTask[] = images.map(image => ({
        id: image.id,
        image,
        tags,
        onProgress: (progressValue: number) => {
          setProgress(prev => ({
            ...prev,
            [image.id]: progressValue,
          }));
          updateUploadProgress(image.id, progressValue);
        },
      }));

      // Add to upload store
      tasks.forEach(task => {
        addUpload(task.id, {
          fileId: task.id,
          photoId: undefined,
          status: 'pending',
          progress: 0,
        });
      });

      // Start uploads
      const results = await queueManager.addTasks(tasks);

      // Update store with final status
      results.forEach(result => {
        updateUploadStatus(
          result.taskId,
          result.success ? 'completed' : 'failed',
          result.error
        );
      });

      return results;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(`Upload failed: ${errorMessage}. Make sure the backend server is running.`);
      console.error('Upload error:', err);

      // Mark all uploads as failed
      images.forEach(image => {
        updateUploadStatus(image.id, 'failed', errorMessage);
      });

      return images.map(image => ({
        taskId: image.id,
        success: false,
        error: errorMessage,
      }));
    } finally {
      setIsUploading(false);
    }
  }, [queueManager, addUpload, updateUploadProgress, updateUploadStatus]);

  /**
   * Cancel current upload
   */
  const cancelUpload = useCallback(() => {
    queueManager.cancelAll();
    setIsUploading(false);
    setError('Upload cancelled');
  }, [queueManager]);

  /**
   * Retry failed uploads
   */
  const retryFailed = useCallback(() => {
    // This would need to be implemented to retry only failed uploads
    // For now, clear completed and let user restart upload
    clearCompleted();
    setError(null);
  }, [clearCompleted]);

  return {
    upload,
    isUploading,
    progress,
    error,
    cancelUpload,
    retryFailed,
  };
}
