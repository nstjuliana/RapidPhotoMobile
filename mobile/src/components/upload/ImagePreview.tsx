/**
 * Image Preview Component
 *
 * Displays a grid of selected images with metadata and removal capability.
 * Optimized for performance with large numbers of images.
 *
 * @module src/components/upload/ImagePreview
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { SelectedImage } from './ImagePicker';

const { width } = Dimensions.get('window');
const PREVIEW_SIZE = (width - 48) / 3; // 3 columns with padding

/**
 * Props for ImagePreview component
 */
interface ImagePreviewProps {
  images: SelectedImage[];
  onRemoveImage: (imageId: string) => void;
  onClearAll?: () => void;
  maxImages?: number;
}

/**
 * ImagePreview component for displaying selected images in a grid
 */
export function ImagePreview({
  images,
  onRemoveImage,
  onClearAll,
  maxImages = 100,
}: ImagePreviewProps) {
  if (images.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No photos selected</Text>
        <Text style={styles.emptyStateSubtext}>
          Use the buttons above to add photos
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with count and clear option */}
      <View style={styles.header}>
        <Text style={styles.countText}>
          {images.length} of {maxImages} photos selected
        </Text>
        {onClearAll && (
          <TouchableOpacity onPress={onClearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Grid */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {images.map((image) => (
            <View key={image.id} style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemoveImage(image.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Image metadata */}
              <View style={styles.metadata}>
                <Text style={styles.filename} numberOfLines={1}>
                  {image.filename}
                </Text>
                <Text style={styles.fileSize}>
                  {(image.fileSize / 1024 / 1024).toFixed(1)}MB
                </Text>
                <Text style={styles.dimensions}>
                  {image.width}×{image.height}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    width: PREVIEW_SIZE,
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  metadata: {
    marginTop: 4,
    paddingHorizontal: 2,
  },
  filename: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  dimensions: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
