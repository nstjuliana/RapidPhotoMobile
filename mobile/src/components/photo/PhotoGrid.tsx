/**
 * Photo Grid Component
 *
 * Displays a responsive grid of photo cards with infinite scroll support.
 * Handles loading states, empty states, and selection mode.
 *
 * @module src/components/photo/PhotoGrid
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { PhotoCard } from './PhotoCard';
import type { PhotoDto } from '@/lib/api/types';

/**
 * Props for PhotoGrid component
 */
interface PhotoGridProps {
  photos: PhotoDto[];
  onPhotoPress?: (photo: PhotoDto) => void;
  onPhotoLongPress?: (photo: PhotoDto) => void;
  selectedPhotoIds?: Set<string>;
  selectionMode?: boolean;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  numColumns?: number;
}

/**
 * PhotoGrid component for displaying photos in a responsive grid
 */
export const PhotoGrid = memo<PhotoGridProps>(({
  photos,
  onPhotoPress,
  onPhotoLongPress,
  selectedPhotoIds = new Set(),
  selectionMode = false,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.1,
  ListEmptyComponent,
  ListFooterComponent,
  numColumns = 3,
}) => {
  const renderItem: ListRenderItem<PhotoDto> = useCallback(({ item }) => (
    <PhotoCard
      photo={item}
      onPress={onPhotoPress}
      onLongPress={onPhotoLongPress}
      isSelected={selectedPhotoIds.has(item.id)}
      selectionMode={selectionMode}
      showMetadata={!selectionMode}
    />
  ), [onPhotoPress, onPhotoLongPress, selectedPhotoIds, selectionMode]);

  const keyExtractor = useCallback((item: PhotoDto) => item.id, []);

  const getItemLayout = useCallback((data: ArrayLike<PhotoDto> | null | undefined, index: number) => {
    const itemWidth = (Dimensions.get('window').width - 48) / numColumns;
    const itemHeight = itemWidth + 40; // Thumbnail + metadata
    return {
      length: itemHeight,
      offset: itemHeight * Math.floor(index / numColumns),
      index,
    };
  }, [numColumns]);

  // Default empty component
  const DefaultEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No photos yet</Text>
      <Text style={styles.emptySubtitle}>
        Upload some photos to get started
      </Text>
    </View>
  );

  // Default footer component (loading indicator)
  const DefaultFooterComponent = () => {
    if (!loading || photos.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more photos...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={20}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            title="Pull to refresh"
            titleColor="#666"
          />
        ) : undefined
      }
      ListEmptyComponent={ListEmptyComponent || <DefaultEmptyComponent />}
      ListFooterComponent={ListFooterComponent || <DefaultFooterComponent />}
    />
  );
});

PhotoGrid.displayName = 'PhotoGrid';

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

// Import Dimensions at the top level
import { Dimensions } from 'react-native';
