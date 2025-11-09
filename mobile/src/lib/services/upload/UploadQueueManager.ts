/**
 * Upload Queue Manager
 *
 * Manages concurrent photo uploads with controlled parallelism.
 * Supports up to 100 photos with configurable concurrent upload limits.
 * Implements three-phase upload process with progress tracking.
 *
 * @module src/lib/services/upload/UploadQueueManager
 */

import { requestPresignedUrl, uploadToS3, reportUploadComplete } from '@/lib/api/endpoints';
import type { UploadRequestDto } from '@/lib/api/types';
import type { SelectedImage } from '@/components/upload/ImagePicker';

/**
 * Upload task representing a single photo upload
 */
export interface UploadTask {
  id: string;
  image: SelectedImage;
  tags: string[];
  onProgress?: (progress: number) => void;
}

/**
 * Upload result for a completed task
 */
export interface UploadResult {
  taskId: string;
  success: boolean;
  photoId?: string;
  error?: string;
}

/**
 * Queue manager configuration
 */
export interface QueueManagerConfig {
  maxConcurrent: number;
  batchSize: number;
}

/**
 * Upload Queue Manager
 *
 * Implements controlled concurrency for photo uploads:
 * - Phase 1: Batch presigned URL requests
 * - Phase 2: Controlled concurrent S3 uploads (maxConcurrent limit)
 * - Phase 3: Completion reporting
 */
export class UploadQueueManager {
  private config: QueueManagerConfig;
  private queue: UploadTask[] = [];
  private activeUploads = 0;
  private completedTasks = new Map<string, UploadResult>();
  private isProcessing = false;

  constructor(config: Partial<QueueManagerConfig> = {}) {
    this.config = {
      maxConcurrent: 6, // Optimal for mobile networks
      batchSize: 10, // Request URLs in batches
      ...config,
    };
  }

  /**
   * Add tasks to the upload queue
   */
  async addTasks(tasks: UploadTask[]): Promise<UploadResult[]> {
    this.queue.push(...tasks);

    if (!this.isProcessing) {
      this.isProcessing = true;
      await this.processQueue();
    }

    // Wait for all tasks to complete
    return this.waitForAllTasks(tasks.map(t => t.id));
  }

  /**
   * Process the upload queue with controlled concurrency
   */
  private async processQueue(): Promise<void> {
    // Phase 1: Request presigned URLs in batches
    const urlResults = await this.requestPresignedUrlsInBatches();

    // Phase 2: Upload files with controlled concurrency
    const uploadPromises = urlResults
      .filter(result => result.success)
      .map(result => this.executeUpload(result.task, result.presignedUrl!, result.photoId!));

    // Process uploads with concurrency control
    await this.processUploadsWithConcurrency(uploadPromises);

    // Phase 3: Report completions
    await this.reportCompletions();
  }

  /**
   * Request presigned URLs in batches to reduce API calls
   */
  private async requestPresignedUrlsInBatches(): Promise<Array<{
    task: UploadTask;
    success: boolean;
    presignedUrl?: string;
    photoId?: string;
    error?: string;
  }>> {
    const results: Array<{
      task: UploadTask;
      success: boolean;
      presignedUrl?: string;
      photoId?: string;
      error?: string;
    }> = [];

    // Process queue in batches
    for (let i = 0; i < this.queue.length; i += this.config.batchSize) {
      const batch = this.queue.slice(i, i + this.config.batchSize);
      const batchPromises = batch.map(task => this.requestPresignedUrl(task));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Request presigned URL for a single task
   */
  private async requestPresignedUrl(task: UploadTask): Promise<{
    task: UploadTask;
    success: boolean;
    presignedUrl?: string;
    photoId?: string;
    error?: string;
  }> {
    try {
      const uploadRequest: UploadRequestDto = {
        filename: task.image.filename,
        contentType: 'image/jpeg', // Assume JPEG after optimization
        fileSize: task.image.fileSize,
        tags: task.tags,
      };

      const response = await requestPresignedUrl(uploadRequest);

      return {
        task,
        success: true,
        presignedUrl: response.presignedUrl || '',
        photoId: response.photoId,
      };
    } catch (error: any) {
      console.error(`Failed to get presigned URL for ${task.image.filename}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get upload URL';
      return {
        task,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Process uploads with controlled concurrency
   */
  private async processUploadsWithConcurrency(uploadPromises: Promise<UploadResult>[]): Promise<void> {
    const semaphore = new Semaphore(this.config.maxConcurrent);

    const controlledUploads = uploadPromises.map(async (uploadPromise) => {
      await semaphore.acquire();
      try {
        return await uploadPromise;
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(controlledUploads);
  }

  /**
   * Execute upload for a single task
   */
  private async executeUpload(task: UploadTask, presignedUrl: string, photoId: string): Promise<UploadResult> {
    try {
      await uploadToS3(
        task.image.uri,
        presignedUrl,
        task.onProgress
      );

      // Report completion to backend
      await this.reportCompletion(photoId);

      const result: UploadResult = {
        taskId: task.id,
        success: true,
        photoId,
      };

      this.completedTasks.set(task.id, result);
      return result;

    } catch (error) {
      console.error(`Upload failed for ${task.image.filename}:`, error);

      const result: UploadResult = {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };

      this.completedTasks.set(task.id, result);
      return result;
    }
  }

  /**
   * Report upload completion to backend
   */
  private async reportCompletion(photoId: string): Promise<void> {
    try {
      await reportUploadComplete(photoId);
    } catch (error: any) {
      console.error(`Failed to report completion for photo ${photoId}:`, error);
      console.error('Completion error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Report all completions in batch
   */
  private async reportCompletions(): Promise<void> {
    // Additional batch completion reporting could be implemented here
    // For now, individual reporting is handled in executeUpload
  }

  /**
   * Wait for all tasks to complete
   */
  private async waitForAllTasks(taskIds: string[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    // Wait for all tasks to complete
    while (results.length < taskIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));

      for (const taskId of taskIds) {
        if (!results.find(r => r.taskId === taskId)) {
          const result = this.completedTasks.get(taskId);
          if (result) {
            results.push(result);
          }
        }
      }
    }

    return results;
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      active: this.activeUploads,
      completed: this.completedTasks.size,
      total: this.queue.length + this.activeUploads + this.completedTasks.size,
    };
  }

  /**
   * Cancel all pending uploads
   */
  cancelAll() {
    this.queue = [];
    this.isProcessing = false;
  }
}

/**
 * Semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}
