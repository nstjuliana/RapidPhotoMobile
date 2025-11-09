/**
 * Image Picker Component
 *
 * Provides camera and gallery access with multi-select support.
 * Displays selected images in preview grid with removal capability.
 *
 * @module src/components/upload/ImagePicker
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button } from '@/components/common/Button';
import { PermissionService } from '@/services/permissions/PermissionService';

const { width } = Dimensions.get('window');
const PREVIEW_SIZE = (width - 48) / 3; // 3 columns with padding

/**
 * Selected image information
 */
export interface SelectedImage {
  id: string;
  uri: string;
  filename: string;
  width: number;
  height: number;
  fileSize: number;
}

/**
 * Props for ImagePicker component
 */
interface ImagePickerProps {
  selectedImages: SelectedImage[];
  onImagesSelected: (images: SelectedImage[]) => void;
  maxSelection?: number;
  onPermissionError?: (message: string) => void;
}

/**
 * ImagePicker component for selecting photos from camera or gallery
 */
export function ImagePicker({
  selectedImages,
  onImagesSelected,
  maxSelection = 100,
  onPermissionError,
}: ImagePickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check and request permissions
   */
  const checkPermissions = async (): Promise<boolean> => {
    const hasPermissions = await PermissionService.hasAllPhotoPermissions();
    if (!hasPermissions) {
      const permissions = await PermissionService.requestAllPhotoPermissions();
      const hasCamera = permissions.camera.granted;
      const hasMediaLibrary = permissions.mediaLibrary.granted;

      if (!hasCamera || !hasMediaLibrary) {
        const errorMessage = !hasCamera && !hasMediaLibrary
          ? 'Camera and gallery permissions are required'
          : !hasCamera
            ? 'Camera permission is required'
            : 'Gallery permission is required';

        onPermissionError?.(errorMessage);
        return false;
      }
    }
    return true;
  };

  /**
   * Compress and optimize image
   */
  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 2048 } }], // Max width, maintain aspect ratio
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Image optimization failed:', error);
      return uri; // Return original if optimization fails
    }
  };

  /**
   * Get file info including size
   */
  const getFileInfo = async (uri: string): Promise<{ size: number; filename: string }> => {
    try {
      // Try to get actual file info from the URI
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return {
        size: blob.size || 1024000, // Use actual size or estimate 1MB
        filename: `photo_${Date.now()}.jpg`,
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      // Return estimated size if we can't get actual size
      return {
        size: 1024000, // Estimate 1MB
        filename: `photo_${Date.now()}.jpg`,
      };
    }
  };

  /**
   * Convert image picker result to SelectedImage
   */
  const processImageResult = async (result: ExpoImagePicker.ImagePickerResult): Promise<SelectedImage[]> => {
    if (result.canceled || !result.assets) return [];

    const processedImages: SelectedImage[] = [];

    for (const asset of result.assets) {
      try {
        const optimizedUri = await optimizeImage(asset.uri);
        const fileInfo = await getFileInfo(optimizedUri);

        const selectedImage: SelectedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          uri: optimizedUri,
          filename: fileInfo.filename,
          width: asset.width,
          height: asset.height,
          fileSize: fileInfo.size,
        };

        processedImages.push(selectedImage);
      } catch (error) {
        console.error('Failed to process image:', error);
        // Continue with next image
      }
    }

    return processedImages;
  };

  /**
   * Open camera to take photo
   */
  const openCamera = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ExpoImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
        aspect: undefined,
        exif: false,
      });

      const newImages = await processImageResult(result);
      const combinedImages = [...selectedImages, ...newImages].slice(0, maxSelection);
      onImagesSelected(combinedImages);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open gallery to select photos
   */
  const openGallery = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const remainingSlots = maxSelection - selectedImages.length;
      if (remainingSlots <= 0) {
        Alert.alert('Selection Full', `You can select up to ${maxSelection} photos`);
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        allowsEditing: false,
        aspect: undefined,
        exif: false,
      });

      const newImages = await processImageResult(result);
      const combinedImages = [...selectedImages, ...newImages].slice(0, maxSelection);
      onImagesSelected(combinedImages);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove selected image
   */
  const removeImage = (imageId: string) => {
    const updatedImages = selectedImages.filter(img => img.id !== imageId);
    onImagesSelected(updatedImages);
  };

  /**
   * Clear all selected images
   */
  const clearAllImages = () => {
    Alert.alert(
      'Clear All Photos',
      'Are you sure you want to remove all selected photos?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => onImagesSelected([]) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Button
          title="Take Photo"
          onPress={openCamera}
          variant="outline"
          disabled={isLoading || selectedImages.length >= maxSelection}
          style={styles.button}
        />
        <Button
          title="Select from Gallery"
          onPress={openGallery}
          variant="outline"
          disabled={isLoading || selectedImages.length >= maxSelection}
          style={styles.button}
        />
      </View>

      {/* Selection Info */}
      {selectedImages.length > 0 && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedImages.length} of {maxSelection} photos selected
          </Text>
          <TouchableOpacity onPress={clearAllImages}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview Grid */}
      {selectedImages.length > 0 && (
        <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {selectedImages.map((image) => (
              <View key={image.id} style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(image.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.imageInfo} numberOfLines={1}>
                  {(image.fileSize / 1024 / 1024).toFixed(1)}MB
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Empty State */}
      {selectedImages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No photos selected
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Tap "Take Photo" or "Select from Gallery" to get started
          </Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  previewContainer: {
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
  },
  imageInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
