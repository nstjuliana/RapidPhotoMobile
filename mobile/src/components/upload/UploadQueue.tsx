/**
 * Upload Queue Component
 *
 * Displays a scrollable list of all uploads with their progress and status.
 * Shows overall queue statistics and individual upload details.
 *
 * @module src/components/upload/UploadQueue
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useUploadStore } from '@/lib/stores/uploadStore';
import { UploadProgress } from './UploadProgress';

type UploadState = {
  fileId: string;
  photoId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
};

/**
 * Props for UploadQueue component
 */
interface UploadQueueProps {
  maxHeight?: number;
  showThumbnails?: boolean;
}

/**
 * UploadQueue component for displaying all uploads in progress
 */
export function UploadQueue({
  maxHeight = 400,
  showThumbnails = true,
}: UploadQueueProps) {
  const { uploads } = useUploadStore();

  // Convert uploads map to array and sort by status and time
  const uploadArray = Array.from(uploads.values()).sort((a, b) => {
    // Sort by status priority: uploading > pending > completed > failed
    const statusPriority = { uploading: 0, pending: 1, completed: 2, failed: 3 };
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Within same status, sort by progress (descending for uploading)
    if (a.status === 'uploading') {
      return b.progress - a.progress;
    }

    // Default: sort by fileId (maintains insertion order)
    return a.fileId.localeCompare(b.fileId);
  });

  const getQueueStats = () => {
    const total = uploadArray.length;
    const uploading = uploadArray.filter(u => u.status === 'uploading').length;
    const completed = uploadArray.filter(u => u.status === 'completed').length;
    const failed = uploadArray.filter(u => u.status === 'failed').length;
    const pending = uploadArray.filter(u => u.status === 'pending').length;

    return { total, uploading, completed, failed, pending };
  };

  const stats = getQueueStats();

  if (uploadArray.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No uploads in progress</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Queue Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Upload Queue</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            Total: {stats.total}
          </Text>
          {stats.uploading > 0 && (
            <Text style={[styles.statText, { color: '#007AFF' }]}>
              Uploading: {stats.uploading}
            </Text>
          )}
          {stats.completed > 0 && (
            <Text style={[styles.statText, { color: '#4CAF50' }]}>
              Completed: {stats.completed}
            </Text>
          )}
          {stats.failed > 0 && (
            <Text style={[styles.statText, { color: '#F44336' }]}>
              Failed: {stats.failed}
            </Text>
          )}
          {stats.pending > 0 && (
            <Text style={[styles.statText, { color: '#FF9800' }]}>
              Pending: {stats.pending}
            </Text>
          )}
        </View>
      </View>

      {/* Upload List */}
      <ScrollView
        style={[styles.scrollView, { maxHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {uploadArray.map((upload) => (
          <UploadProgress
            key={upload.fileId}
            upload={upload}
            showThumbnail={showThumbnails}
            filename={`Upload ${upload.fileId.slice(-8)}`}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    maxHeight: 400,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});
