/**
 * Skeleton Loader Component
 *
 * Provides animated skeleton loading placeholders for different content types.
 * Improves perceived performance by showing loading states.
 *
 * @module src/components/common/SkeletonLoader
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3;

/**
 * Props for SkeletonLoader component
 */
interface SkeletonLoaderProps {
  type: 'photo-grid' | 'photo-card' | 'photo-detail' | 'text' | 'rectangle';
  count?: number;
  width?: number;
  height?: number;
}

/**
 * Skeleton loader with pulsing animation
 */
export function SkeletonLoader({
  type,
  count = 1,
  width: customWidth,
  height: customHeight,
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'photo-grid':
        return (
          <View style={styles.grid}>
            {Array.from({ length: 9 }, (_, index) => (
              <View key={index} style={styles.gridItem}>
                <SkeletonItem style={[styles.photoCard, { width: CARD_SIZE, height: CARD_SIZE }]} />
                <View style={styles.cardMetadata}>
                  <SkeletonItem style={styles.metadataLine} />
                  <SkeletonItem style={[styles.metadataLine, { width: '60%' }]} />
                </View>
              </View>
            ))}
          </View>
        );

      case 'photo-card':
        return (
          <View style={styles.cardContainer}>
            <SkeletonItem style={[styles.photoCard, { width: CARD_SIZE, height: CARD_SIZE }]} />
            <View style={styles.cardMetadata}>
              <SkeletonItem style={styles.metadataLine} />
              <SkeletonItem style={[styles.metadataLine, { width: '60%' }]} />
            </View>
          </View>
        );

      case 'photo-detail':
        return (
          <View style={styles.detailContainer}>
            <SkeletonItem style={styles.detailImage} />
            <View style={styles.detailContent}>
              <SkeletonItem style={styles.detailTitle} />
              <SkeletonItem style={styles.detailLine} />
              <SkeletonItem style={[styles.detailLine, { width: '80%' }]} />
              <SkeletonItem style={[styles.detailLine, { width: '60%' }]} />
            </View>
          </View>
        );

      case 'text':
        return (
          <View style={styles.textContainer}>
            {Array.from({ length: count }, (_, index) => (
              <SkeletonItem
                key={index}
                style={[
                  styles.textLine,
                  index === count - 1 && { width: '60%' }, // Last line shorter
                ]}
              />
            ))}
          </View>
        );

      case 'rectangle':
        return (
          <SkeletonItem
            style={[
              styles.rectangle,
              {
                width: customWidth || 200,
                height: customHeight || 100,
              },
            ]}
          />
        );

      default:
        return <SkeletonItem style={styles.default} />;
    }
  };

  return renderSkeleton();
}

/**
 * Individual skeleton item with pulsing animation
 */
function SkeletonItem({ style }: { style: any }) {
  return (
    <View style={[styles.skeletonItem, style]} />
  );
}

const styles = StyleSheet.create({
  skeletonItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },

  // Photo grid skeleton
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    marginBottom: 8,
  },
  cardContainer: {
    width: CARD_SIZE,
    marginBottom: 8,
  },
  photoCard: {
    borderRadius: 8,
  },
  cardMetadata: {
    marginTop: 8,
    gap: 4,
  },
  metadataLine: {
    height: 10,
    width: '100%',
  },

  // Photo detail skeleton
  detailContainer: {
    flex: 1,
  },
  detailImage: {
    width: width,
    height: width,
    borderRadius: 0,
  },
  detailContent: {
    padding: 16,
    gap: 12,
  },
  detailTitle: {
    height: 24,
    width: '70%',
  },
  detailLine: {
    height: 16,
    width: '100%',
  },

  // Text skeleton
  textContainer: {
    gap: 8,
  },
  textLine: {
    height: 14,
    width: '100%',
  },

  // Rectangle skeleton
  rectangle: {
    borderRadius: 8,
  },

  // Default fallback
  default: {
    height: 20,
    width: 100,
  },
});
