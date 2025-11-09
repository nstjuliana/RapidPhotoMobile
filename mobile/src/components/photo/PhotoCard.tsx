/**
 * Photo Card Component
 *
 * Displays a photo card in the gallery grid with thumbnail, metadata, and actions.
 * Supports selection mode for batch operations.
 *
 * @module src/components/photo/PhotoCard
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PhotoThumbnail } from './PhotoThumbnail';
import type { PhotoDto } from '@/lib/api/types';

const { width } = Dimensions.get('window');
const GAP = 8;
const NUM_COLUMNS = 3;
const TOTAL_GAPS = (NUM_COLUMNS - 1) * GAP;
const CARD_SIZE = (width - TOTAL_GAPS) / NUM_COLUMNS; // 3 columns with gaps

/**
 * Props for PhotoCard component
 */
interface PhotoCardProps {
  photo: PhotoDto;
  onPress?: (photo: PhotoDto) => void;
  onLongPress?: (photo: PhotoDto) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  showMetadata?: boolean;
  maxTagsToShow?: number;
}

/**
 * PhotoCard component for displaying photos in gallery grid
 */
export const PhotoCard = memo<PhotoCardProps>(({
  photo,
  onPress,
  onLongPress,
  isSelected = false,
  selectionMode = false,
  showMetadata = true,
  maxTagsToShow = 2,
}) => {
  const handlePress = useCallback(() => {
    onPress?.(photo);
  }, [onPress, photo]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(photo);
  }, [onLongPress, photo]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const displayTags = photo.tags.slice(0, maxTagsToShow);
  const remainingTags = photo.tags.length - maxTagsToShow;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <PhotoThumbnail
        photo={photo}
        size={CARD_SIZE}
        borderRadius={selectionMode ? 4 : 8}
      />

      {/* Selection Indicator */}
      {selectionMode && (
        <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}

      {/* Metadata Overlay */}
      {showMetadata && !selectionMode && (
        <View style={styles.metadata}>
          {/* Upload Date */}
          <Text style={styles.dateText}>
            {formatDate(photo.uploadDate)}
          </Text>

          {/* Tags */}
          {displayTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {displayTags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </View>
              ))}
              {remainingTags > 0 && (
                <View style={styles.tagChip}>
                  <Text style={styles.tagText}>
                    +{remainingTags}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

PhotoCard.displayName = 'PhotoCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    marginRight: GAP,
    marginBottom: 0,
    position: 'relative',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metadata: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dateText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    maxWidth: 60,
  },
  tagText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '500',
  },
});
