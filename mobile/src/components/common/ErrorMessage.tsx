/**
 * Error Message Component
 * 
 * Reusable error message display component.
 * 
 * @module components/common/ErrorMessage
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Error message component
 */
export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  text: {
    color: '#FF3B30',
    fontSize: 14,
  },
});


