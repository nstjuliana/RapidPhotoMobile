/**
 * Photo Thumbnail Component
 *
 * Optimized image component for photo thumbnails with lazy loading and caching.
 * Displays photo preview with consistent aspect ratio and loading states.
 *
 * @module src/components/photo/PhotoThumbnail
 */

import React, { useState, memo } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import type { PhotoDto } from '@/lib/api/types';

const { width } = Dimensions.get('window');
const GAP = 8;
const NUM_COLUMNS = 3;
const TOTAL_GAPS = (NUM_COLUMNS - 1) * GAP;
const THUMBNAIL_SIZE = (width - TOTAL_GAPS) / NUM_COLUMNS; // 3 columns with gaps

/**
 * Props for PhotoThumbnail component
 */
interface PhotoThumbnailProps {
  photo: PhotoDto;
  size?: number;
  borderRadius?: number;
  showLoadingIndicator?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

/**
 * PhotoThumbnail component for displaying photo thumbnails
 */
export const PhotoThumbnail = memo<PhotoThumbnailProps>(({
  photo,
  size = THUMBNAIL_SIZE,
  borderRadius = 8,
  showLoadingIndicator = true,
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  // Use downloadUrl from backend as the primary source
  const thumbnailUri = photo.thumbnailUrl || photo.imageUrl || photo.downloadUrl || `https://via.placeholder.com/200x200?text=${encodeURIComponent(photo.filename)}`;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius }]}>
      <Image
        source={{ uri: thumbnailUri }}
        style={[styles.image, { borderRadius }]}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />

      {/* Loading Indicator */}
      {loading && showLoadingIndicator && (
        <View style={[styles.loadingOverlay, { borderRadius }]}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={[styles.errorOverlay, { borderRadius }]}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorText}>!</Text>
          </View>
        </View>
      )}
    </View>
  );
});

PhotoThumbnail.displayName = 'PhotoThumbnail';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#F44336',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
