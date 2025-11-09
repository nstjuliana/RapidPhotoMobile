/**
 * Upload Progress Component
 *
 * Displays progress for individual photo uploads with visual progress bars.
 * Shows filename, status, and progress percentage.
 *
 * @module src/components/upload/UploadProgress
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { UploadStatusBadge } from './UploadStatusBadge';

type UploadState = {
  fileId: string;
  photoId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
};

/**
 * Props for UploadProgress component
 */
interface UploadProgressProps {
  upload: UploadState;
  progress?: number; // Override progress if provided externally
  imageUri?: string; // Optional thumbnail
  filename?: string;
  showThumbnail?: boolean;
}

/**
 * UploadProgress component for displaying individual upload progress
 */
export function UploadProgress({
  upload,
  progress,
  imageUri,
  filename,
  showThumbnail = true,
}: UploadProgressProps) {
  const displayProgress = progress ?? upload.progress;

  return (
    <View style={styles.container}>
      {/* Thumbnail and Info */}
      <View style={styles.content}>
        {showThumbnail && imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}

        <View style={styles.info}>
          <Text style={styles.filename} numberOfLines={1}>
            {filename || `Upload ${upload.fileId.slice(-8)}`}
          </Text>

          <View style={styles.statusRow}>
            <UploadStatusBadge status={upload.status} />
            {upload.status === 'uploading' && (
              <Text style={styles.progressText}>
                {displayProgress}%
              </Text>
            )}
          </View>

          {upload.error && (
            <Text style={styles.errorText} numberOfLines={2}>
              {upload.error}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${displayProgress}%`,
                backgroundColor: getProgressColor(upload.status),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Get progress bar color based on upload status
 */
function getProgressColor(status: UploadState['status']): string {
  switch (status) {
    case 'completed':
      return '#4CAF50'; // Green
    case 'failed':
      return '#F44336'; // Red
    case 'uploading':
      return '#007AFF'; // Blue
    case 'pending':
    default:
      return '#FF9800'; // Orange
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
  },
  filename: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
