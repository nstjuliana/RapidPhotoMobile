/**
 * Empty State Component
 *
 * Displays appropriate empty states for different scenarios.
 * Provides clear messaging and call-to-action buttons.
 *
 * @module src/components/common/EmptyState
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Button } from './Button';

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  type: 'photos' | 'uploads' | 'search' | 'downloads' | 'generic';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

/**
 * Empty state component for various scenarios
 */
export function EmptyState({
  type,
  title,
  message,
  actionText,
  onAction,
  showAction = true,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'photos':
        return {
          title: title || 'No photos yet',
          message: message || 'Upload some photos to get started with your gallery',
          actionText: actionText || 'Upload Photos',
        };

      case 'uploads':
        return {
          title: title || 'No uploads in progress',
          message: message || 'Your completed uploads will appear here',
          actionText: actionText || 'Start Upload',
        };

      case 'search':
        return {
          title: title || 'No results found',
          message: message || 'Try adjusting your search terms or filters',
          actionText: actionText || 'Clear Filters',
        };

      case 'downloads':
        return {
          title: title || 'No downloads yet',
          message: message || 'Your downloaded photos will appear here',
          actionText: actionText || 'Browse Gallery',
        };

      case 'generic':
      default:
        return {
          title: title || 'Nothing to show',
          message: message || 'There\'s nothing here at the moment',
          actionText: actionText || 'Refresh',
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon placeholder - could be replaced with actual icons */}
        <View style={styles.icon}>
          <Text style={styles.iconText}>
            {type === 'photos' && '📷'}
            {type === 'uploads' && '⬆️'}
            {type === 'search' && '🔍'}
            {type === 'downloads' && '💾'}
            {type === 'generic' && '📄'}
          </Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.message}>{content.message}</Text>

        {showAction && onAction && (
          <Button
            title={content.actionText}
            onPress={onAction}
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 160,
  },
});
