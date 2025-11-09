/**
 * Photo Detail Screen
 *
 * Displays full-size photo with metadata, editable tags, and action buttons.
 * Supports navigation back to gallery and photo download functionality.
 *
 * @module app/photo/[id]
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { usePhoto, useAddPhotoTags, useRemovePhotoTags, useDeletePhoto } from '@/lib/queries/photoQueries';
import type { PhotoDto } from '@/lib/api/types';

const { width, height } = Dimensions.get('window');

/**
 * Photo detail screen component
 */
export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Fetch photo data
  const { data: photo, isLoading, error, refetch } = usePhoto(id);

  // Tag mutations
  const addTagsMutation = useAddPhotoTags();
  const removeTagsMutation = useRemovePhotoTags();
  const deletePhotoMutation = useDeletePhoto();

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Format file size
   */
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  /**
   * Format upload date
   */
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }, []);

  /**
   * Handle tag editing start
   */
  const handleEditTags = useCallback(() => {
    setIsEditingTags(true);
    setTagInput(photo?.tags.join(', ') || '');
  }, [photo]);

  /**
   * Handle tag editing cancel
   */
  const handleCancelEditTags = useCallback(() => {
    setIsEditingTags(false);
    setTagInput('');
  }, []);

  /**
   * Handle tag editing save
   */
  const handleSaveTags = useCallback(async () => {
    if (!photo) return;

    const newTags = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      await addTagsMutation.mutateAsync({
        photoId: photo.id,
        tags: newTags,
      });

      setIsEditingTags(false);
      setTagInput('');

      Alert.alert('Success', 'Tags updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update tags. Please try again.');
    }
  }, [photo, tagInput, addTagsMutation]);

  /**
   * Handle tag removal
   */
  const handleRemoveTag = useCallback(async (tagToRemove: string) => {
    if (!photo) return;

    Alert.alert(
      'Remove Tag',
      `Remove "${tagToRemove}" from this photo?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTagsMutation.mutateAsync({
                photoId: photo.id,
                tags: [tagToRemove],
              });
              Alert.alert('Success', 'Tag removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove tag. Please try again.');
            }
          },
        },
      ]
    );
  }, [photo, removeTagsMutation]);

  /**
   * Handle download
   */
  const handleDownload = useCallback(() => {
    Alert.alert('Download', 'Download functionality coming soon!');
  }, []);

  /**
   * Handle share
   */
  const handleShare = useCallback(() => {
    Alert.alert('Share', 'Share functionality coming soon!');
  }, []);

  /**
   * Handle photo deletion
   */
  const handleDelete = useCallback(() => {
    if (!photo) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhotoMutation.mutateAsync(photo.id);
              Alert.alert('Success', 'Photo deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            }
          },
        },
      ]
    );
  }, [photo, deletePhotoMutation, router]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading photo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Photo Not Found</Text>
          <Text style={styles.errorText}>
            The photo you're looking for doesn't exist or has been deleted.
          </Text>
          <Button
            title="Go Back"
            onPress={handleBack}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Photo Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Full-size Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: photo.imageUrl || photo.downloadUrl || photo.thumbnailUrl || 'https://via.placeholder.com/400x400?text=No+Image' 
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Metadata Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Filename</Text>
              <Text style={styles.metadataValue}>{photo.filename}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Upload Date</Text>
              <Text style={styles.metadataValue}>{formatDate(photo.uploadDate)}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>File Size</Text>
              <Text style={styles.metadataValue}>{formatFileSize(photo.fileSize || 0)}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Dimensions</Text>
              <Text style={styles.metadataValue}>
                {photo.width} × {photo.height}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tags</Text>
            {!isEditingTags && (
              <TouchableOpacity onPress={handleEditTags}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingTags ? (
            <View style={styles.tagEditor}>
              <Text style={styles.tagInputLabel}>
                Enter tags separated by commas:
              </Text>
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="vacation, beach, family..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
              <View style={styles.tagEditorActions}>
                <Button
                  title="Cancel"
                  onPress={handleCancelEditTags}
                  variant="outline"
                  style={styles.tagCancelButton}
                />
                <Button
                  title="Save Tags"
                  onPress={handleSaveTags}
                  loading={addTagsMutation.isPending}
                  disabled={addTagsMutation.isPending}
                  style={styles.tagSaveButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              {photo.tags.length > 0 ? (
                photo.tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tagChip}
                    onLongPress={() => handleRemoveTag(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <Text style={styles.tagRemoveText}>×</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTagsText}>No tags added yet</Text>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Download"
            onPress={handleDownload}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {/* Delete Button */}
        <View style={styles.deleteSection}>
          <Button
            title="Delete Photo"
            onPress={handleDelete}
            loading={deletePhotoMutation.isPending}
            disabled={deletePhotoMutation.isPending}
            variant="outline"
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 60,
  },
  imageContainer: {
    width: width,
    height: width, // Square aspect ratio
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  editButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  metadataGrid: {
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  tagEditor: {
    gap: 12,
  },
  tagInputLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  tagEditorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tagCancelButton: {
    flex: 1,
    borderColor: '#666',
  },
  tagSaveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
  },
  tagRemoveText: {
    fontSize: 16,
    color: '#1565c0',
    fontWeight: 'bold',
  },
  noTagsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderColor: '#007AFF',
  },
  deleteSection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
});