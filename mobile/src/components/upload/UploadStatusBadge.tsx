/**
 * Upload Status Badge Component
 *
 * Displays status badges for upload states with appropriate colors and icons.
 *
 * @module src/components/upload/UploadStatusBadge
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

/**
 * Props for UploadStatusBadge component
 */
interface UploadStatusBadgeProps {
  status: UploadStatus;
  size?: 'small' | 'medium' | 'large';
}

/**
 * UploadStatusBadge component for displaying upload status
 */
export function UploadStatusBadge({
  status,
  size = 'medium',
}: UploadStatusBadgeProps) {
  const config = getStatusConfig(status, size);

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.textColor, fontSize: config.fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
}

/**
 * Get configuration for status badge
 */
function getStatusConfig(status: UploadStatus, size: 'small' | 'medium' | 'large') {
  const sizeConfig = {
    small: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
    medium: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4 },
    large: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 6 },
  };

  const currentSize = sizeConfig[size];

  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        backgroundColor: '#FFF3E0', // Light orange
        textColor: '#E65100', // Dark orange
        ...currentSize,
      };
    case 'uploading':
      return {
        label: 'Uploading',
        backgroundColor: '#E3F2FD', // Light blue
        textColor: '#1565C0', // Dark blue
        ...currentSize,
      };
    case 'completed':
      return {
        label: 'Completed',
        backgroundColor: '#E8F5E8', // Light green
        textColor: '#2E7D32', // Dark green
        ...currentSize,
      };
    case 'failed':
      return {
        label: 'Failed',
        backgroundColor: '#FFEBEE', // Light red
        textColor: '#C62828', // Dark red
        ...currentSize,
      };
    default:
      return {
        label: 'Unknown',
        backgroundColor: '#F5F5F5', // Light gray
        textColor: '#616161', // Dark gray
        ...currentSize,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
