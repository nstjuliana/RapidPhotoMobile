/**
 * Upload Screen
 *
 * Complete photo upload interface with image picker, tag input, and progress tracking.
 * Supports up to 100 concurrent uploads with controlled parallelism.
 *
 * @module app/(tabs)/upload
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/common/Button';
import { ImagePicker, type SelectedImage } from '@/components/upload/ImagePicker';
import { usePhotoUpload } from '@/lib/hooks/usePhotoUpload';
import { useUploadStore } from '@/lib/stores/uploadStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { photoKeys } from '@/lib/queries/keys';

/**
 * Upload screen component
 */
export default function UploadScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [tags, setTags] = useState('');
  const [hasStartedUpload, setHasStartedUpload] = useState(false);

  const { uploads } = useUploadStore();
  const { user } = useAuthStore();
  const { upload, isUploading, progress, error, cancelUpload } = usePhotoUpload({
    maxConcurrent: 6, // Optimal for mobile
  });

  // Reset upload state when upload process completes or is cancelled
  useEffect(() => {
    if (!isUploading && hasStartedUpload) {
      // Upload process has finished, reset the screen state
      setHasStartedUpload(false);
    }
  }, [isUploading, hasStartedUpload]);

  /**
   * Handle image selection
   */
  const handleImagesSelected = useCallback((images: SelectedImage[]) => {
    setSelectedImages(images);
  }, []);

  /**
   * Handle upload initiation
   */
  const handleUpload = useCallback(async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Photos', 'Please select some photos to upload.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to upload photos.');
      return;
    }

    setHasStartedUpload(true);

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const results = await upload(selectedImages, tagArray);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        // Invalidate gallery queries to refresh the photo list
        queryClient.invalidateQueries({ queryKey: photoKeys.all });

        Alert.alert(
          'Upload Complete',
          `${successCount} photos uploaded successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}.`,
          [
            {
              text: 'View Gallery',
              onPress: () => router.push('/(tabs)/gallery'),
            },
            {
              text: 'Upload More',
              onPress: () => {
                // Reset all upload state
                setSelectedImages([]);
                setTags('');
                setHasStartedUpload(false);
                // Clear upload store state
                queryClient.invalidateQueries({ queryKey: ['uploads'] });
              },
            },
          ]
        );
      } else {
        // If all uploads failed, reset the upload state to allow retry
        setHasStartedUpload(false);
        Alert.alert('Upload Failed', 'All uploads failed. Please try again.');
      }
    } catch (err) {
      Alert.alert('Upload Error', 'An unexpected error occurred during upload.');
    }
  }, [selectedImages, tags, upload, router, queryClient, user]);

  /**
   * Handle cancel upload
   */
  const handleCancelUpload = useCallback(() => {
    Alert.alert(
      'Cancel Upload',
      'Are you sure you want to cancel the current upload?',
      [
        { text: 'Continue Upload', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: cancelUpload
        },
      ]
    );
  }, [cancelUpload]);

  /**
   * Calculate overall progress
   */
  const getOverallProgress = () => {
    if (selectedImages.length === 0) return 0;

    const totalProgress = selectedImages.reduce((sum, image) => {
      return sum + (progress[image.id] || 0);
    }, 0);

    return Math.round(totalProgress / selectedImages.length);
  };

  /**
   * Get upload status summary
   */
  const getUploadSummary = () => {
    const total = selectedImages.length;
    const completed = Object.values(uploads).filter(u => u.status === 'completed').length;
    const failed = Object.values(uploads).filter(u => u.status === 'failed').length;
    const uploading = Object.values(uploads).filter(u => u.status === 'uploading').length;

    return { total, completed, failed, uploading };
  };

  const summary = getUploadSummary();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upload Photos</Text>
            <Text style={styles.subtitle}>
              Select photos from your camera or gallery and upload them with tags
            </Text>
          </View>

          {/* Image Picker */}
          {!hasStartedUpload && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Photos</Text>
              <ImagePicker
                selectedImages={selectedImages}
                onImagesSelected={handleImagesSelected}
                maxSelection={100}
                onPermissionError={(message) => {
                  Alert.alert('Permission Required', message);
                }}
              />
            </View>
          )}

          {/* Tag Input */}
          {selectedImages.length > 0 && !hasStartedUpload && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Tags (Optional)</Text>
              <Text style={styles.sectionDescription}>
                Enter tags separated by commas (e.g., vacation, beach, family)
              </Text>
              <TextInput
                style={styles.tagInput}
                value={tags}
                onChangeText={setTags}
                placeholder="Enter tags..."
                placeholderTextColor="#999"
                returnKeyType="done"
              />
            </View>
          )}

          {/* Upload Progress */}
          {hasStartedUpload && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upload Progress</Text>

              {/* Overall Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    Overall Progress: {getOverallProgress()}%
                  </Text>
                  <Text style={styles.progressText}>
                    {summary.completed}/{summary.total} completed
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getOverallProgress()}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Status Summary */}
              <View style={styles.statusSummary}>
                <Text style={styles.statusText}>
                  Uploading: {summary.uploading}
                </Text>
                <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                  Completed: {summary.completed}
                </Text>
                {summary.failed > 0 && (
                  <Text style={[styles.statusText, { color: '#F44336' }]}>
                    Failed: {summary.failed}
                  </Text>
                )}
              </View>

              {/* Error Display */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {!hasStartedUpload ? (
              <>
                <Button
                  title={`Upload ${selectedImages.length} Photo${selectedImages.length !== 1 ? 's' : ''}`}
                  onPress={handleUpload}
                  disabled={selectedImages.length === 0 || isUploading}
                  style={styles.uploadButton}
                />
                <Button
                  title="View Gallery"
                  onPress={() => router.push('/(tabs)/gallery')}
                  variant="outline"
                  style={styles.galleryButton}
                />
              </>
            ) : (
              <>
                {isUploading && (
                  <Button
                    title="Cancel Upload"
                    onPress={handleCancelUpload}
                    variant="outline"
                    style={styles.cancelButton}
                  />
                )}
                <Button
                  title="View Gallery"
                  onPress={() => router.push('/(tabs)/gallery')}
                  variant="outline"
                  style={styles.galleryButton}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    borderColor: '#007AFF',
  },
  cancelButton: {
    borderColor: '#F44336',
  },
});


