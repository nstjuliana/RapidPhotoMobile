/**
 * Gallery Screen
 *
 * Complete photo gallery with infinite scroll, pull-to-refresh, and responsive grid.
 * Displays uploaded photos with navigation to detail view and upload screen.
 *
 * @module app/(tabs)/gallery
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { PhotoGrid } from '@/components/photo/PhotoGrid';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { useInfinitePhotos } from '@/lib/queries/photoQueries';
import type { PhotoDto } from '@/lib/api/types';

/**
 * Gallery screen component
 */
export default function GalleryScreen() {
  const router = useRouter();
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Infinite query for photos
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    error,
  } = useInfinitePhotos({
    pageSize: 20, // Load 20 photos at a time
  });

  // Flatten infinite query data
  const photos = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  /**
   * Handle photo press - navigate to detail or toggle selection
   */
  const handlePhotoPress = useCallback((photo: PhotoDto) => {
    if (selectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedPhotoIds);
      if (newSelected.has(photo.id)) {
        newSelected.delete(photo.id);
      } else {
        newSelected.add(photo.id);
      }
      setSelectedPhotoIds(newSelected);
    } else {
      // Navigate to detail view
      router.push(`/photo/${photo.id}`);
    }
  }, [selectionMode, selectedPhotoIds, router]);

  /**
   * Handle photo long press - enter/exit selection mode
   */
  const handlePhotoLongPress = useCallback((photo: PhotoDto) => {
    if (!selectionMode) {
      // Enter selection mode and select the photo
      setSelectionMode(true);
      setSelectedPhotoIds(new Set([photo.id]));
    }
  }, [selectionMode]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  /**
   * Handle infinite scroll - load next page
   */
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * Toggle selection mode
   */
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode);
    setSelectedPhotoIds(new Set());
  }, [selectionMode]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedPhotoIds(new Set());
  }, []);

  /**
   * Select all visible photos
   */
  const selectAll = useCallback(() => {
    setSelectedPhotoIds(new Set(photos.map(p => p.id)));
  }, [photos]);

  /**
   * Handle batch actions (placeholder for future implementation)
   */
  const handleBatchAction = useCallback(() => {
    if (selectedPhotoIds.size === 0) return;

    Alert.alert(
      'Batch Actions',
      `Selected ${selectedPhotoIds.size} photo${selectedPhotoIds.size !== 1 ? 's' : ''}`,
      [
        { text: 'Download', onPress: () => Alert.alert('Download', 'Batch download coming soon!') },
        { text: 'Add Tags', onPress: () => Alert.alert('Tags', 'Batch tagging coming soon!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [selectedPhotoIds]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Photo Gallery</Text>

          {/* Action Buttons */}
          <View style={styles.headerActions}>
            {selectionMode ? (
              <>
                <TouchableOpacity onPress={clearSelection}>
                  <Text style={styles.actionText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={selectAll}>
                  <Text style={styles.actionText}>Select All</Text>
                </TouchableOpacity>
                {selectedPhotoIds.size > 0 && (
                  <TouchableOpacity onPress={handleBatchAction}>
                    <Text style={[styles.actionText, { color: '#007AFF' }]}>
                      Actions ({selectedPhotoIds.size})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity onPress={toggleSelectionMode}>
                <Text style={styles.actionText}>Select</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Selection Mode Toggle */}
        {selectionMode && (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              {selectedPhotoIds.size} selected
            </Text>
            <TouchableOpacity onPress={toggleSelectionMode}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Photo Grid */}
      <View style={styles.gridContainer}>
        {isLoading && photos.length === 0 ? (
          <SkeletonLoader type="photo-grid" />
        ) : (
          <PhotoGrid
            photos={photos}
            onPhotoPress={handlePhotoPress}
            onPhotoLongPress={handlePhotoLongPress}
            selectedPhotoIds={selectedPhotoIds}
            selectionMode={selectionMode}
            loading={isFetchingNextPage}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              !isLoading ? (
                <EmptyState
                  type="photos"
                  onAction={() => router.push('/(tabs)/upload')}
                />
              ) : undefined
            }
          />
        )}
      </View>

      {/* Upload Button */}
      {!selectionMode && (
        <View style={styles.uploadButtonContainer}>
          <Button
            title="Upload Photos"
            onPress={() => router.push('/(tabs)/upload')}
            style={styles.uploadButton}
          />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load photos. Pull down to retry.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  selectionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  gridContainer: {
    flex: 1,
  },
  uploadButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
});


