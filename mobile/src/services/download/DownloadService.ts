/**
 * Download Service
 *
 * Handles downloading photos from cloud storage to device.
 * Supports single and batch downloads with progress tracking.
 * Manages file storage permissions and directory creation.
 *
 * @module src/services/download/DownloadService
 */

import * as FileSystem from 'expo-file-system';
import { getPhotoDownloadUrl } from '@/lib/api/endpoints';
import { PermissionService } from '@/services/permissions/PermissionService';

export interface DownloadTask {
  photoId: string;
  filename: string;
  url?: string;
}

export interface DownloadResult {
  task: DownloadTask;
  success: boolean;
  localUri?: string;
  error?: string;
}

export interface DownloadProgress {
  photoId: string;
  progress: number; // 0-100
  bytesWritten: number;
  totalBytes: number;
}

/**
 * Download service for managing photo downloads
 */
export class DownloadService {
  private static readonly DOWNLOAD_DIR = `${FileSystem.documentDirectory || ''}downloads/`;

  /**
   * Ensure download directory exists
   */
  private static async ensureDownloadDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.DOWNLOAD_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.DOWNLOAD_DIR, {
          intermediates: true,
        });
      }
    } catch (error) {
      console.error('Failed to create download directory:', error);
      throw new Error('Unable to create download directory');
    }
  }

  /**
   * Check storage permissions
   */
  private static async checkPermissions(): Promise<boolean> {
    // For downloads, we mainly need access to document directory
    // which should be available. Additional permissions might be needed
    // for saving to external storage on Android.
    try {
      // On Android, we might need to request permissions for external storage
      // but for now, we'll use the document directory which is always accessible
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Download a single photo
   */
  static async downloadPhoto(
    photoId: string,
    filename: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        return {
          task: { photoId, filename },
          success: false,
          error: 'Storage permission denied',
        };
      }

      // Ensure download directory exists
      await this.ensureDownloadDirectory();

      // Get download URL from backend
      const downloadUrlResponse = await getPhotoDownloadUrl(photoId);
      const downloadUrl = downloadUrlResponse.downloadUrl;

      // Generate local file path
      const localUri = `${this.DOWNLOAD_DIR}${filename}`;

      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        return {
          task: { photoId, filename },
          success: true,
          localUri,
        };
      }

      // Download file with progress tracking
      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        localUri,
        {
          // sessionType: FileSystem.FileSystemSessionType.BACKGROUND, // Commented out due to API changes
        }
      );

      // Track progress if callback provided
      if (onProgress) {
        // For progress tracking, we would need to use XMLHttpRequest directly
        // FileSystem.downloadAsync doesn't provide progress callbacks
        // This is a simplified implementation
        onProgress({
          photoId,
          progress: 100,
          bytesWritten: downloadResult.headers['content-length']
            ? parseInt(downloadResult.headers['content-length'])
            : 0,
          totalBytes: downloadResult.headers['content-length']
            ? parseInt(downloadResult.headers['content-length'])
            : 0,
        });
      }

      return {
        task: { photoId, filename, url: downloadUrl },
        success: true,
        localUri,
      };

    } catch (error) {
      console.error(`Download failed for ${filename}:`, error);
      return {
        task: { photoId, filename },
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  /**
   * Download multiple photos with controlled concurrency
   */
  static async downloadPhotos(
    tasks: DownloadTask[],
    onProgress?: (progress: DownloadProgress) => void,
    onTaskComplete?: (result: DownloadResult) => void,
    concurrency: number = 3
  ): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];
    const semaphore = new Semaphore(concurrency);

    // Process downloads with controlled concurrency
    const downloadPromises = tasks.map(async (task) => {
      await semaphore.acquire();

      try {
        const result = await this.downloadPhoto(
          task.photoId,
          task.filename,
          onProgress
        );

        if (onTaskComplete) {
          onTaskComplete(result);
        }

        return result;
      } finally {
        semaphore.release();
      }
    });

    // Wait for all downloads to complete
    const completedResults = await Promise.all(downloadPromises);
    results.push(...completedResults);

    return results;
  }

  /**
   * Get list of downloaded files
   */
  static async getDownloadedFiles(): Promise<FileSystem.FileInfo[]> {
    try {
      await this.ensureDownloadDirectory();
      const files = await FileSystem.readDirectoryAsync(this.DOWNLOAD_DIR);

      const fileInfos: FileSystem.FileInfo[] = [];
      for (const filename of files) {
        const fileUri = `${this.DOWNLOAD_DIR}${filename}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          fileInfos.push(fileInfo);
        }
      }

      return fileInfos.sort((a, b) => {
        return new Date(b.modificationTime || 0).getTime() -
               new Date(a.modificationTime || 0).getTime();
      });
    } catch (error) {
      console.error('Failed to get downloaded files:', error);
      return [];
    }
  }

  /**
   * Delete a downloaded file
   */
  static async deleteDownloadedFile(filename: string): Promise<boolean> {
    try {
      const fileUri = `${this.DOWNLOAD_DIR}${filename}`;
      await FileSystem.deleteAsync(fileUri);
      return true;
    } catch (error) {
      console.error(`Failed to delete ${filename}:`, error);
      return false;
    }
  }

  /**
   * Get download directory info
   */
  static async getDownloadDirectoryInfo() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.DOWNLOAD_DIR);
      return {
        exists: dirInfo.exists,
        uri: this.DOWNLOAD_DIR,
        size: await this.getDirectorySize(),
      };
    } catch (error) {
      console.error('Failed to get download directory info:', error);
      return {
        exists: false,
        uri: this.DOWNLOAD_DIR,
        size: 0,
      };
    }
  }

  /**
   * Get total size of download directory
   */
  private static async getDirectorySize(): Promise<number> {
    try {
      const files = await this.getDownloadedFiles();
      return files.reduce((total, file) => total + (file.size || 0), 0);
    } catch (error) {
      console.error('Failed to calculate directory size:', error);
      return 0;
    }
  }

  /**
   * Clear all downloaded files
   */
  static async clearDownloads(): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(this.DOWNLOAD_DIR, { idempotent: true });
      await this.ensureDownloadDirectory(); // Recreate empty directory
      return true;
    } catch (error) {
      console.error('Failed to clear downloads:', error);
      return false;
    }
  }
}

/**
 * Semaphore for controlling download concurrency
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
