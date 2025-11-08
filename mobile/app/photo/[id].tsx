/**
 * Photo Detail Screen
 * 
 * Placeholder screen for individual photo detail view.
 * Will be implemented in Phase 11.
 * 
 * @module app/photo/[id]
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';

/**
 * Photo detail screen component
 */
export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Detail</Text>
      <Text style={styles.photoId}>Photo ID: {id}</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.description}>
        Photo details and actions will be available here.
      </Text>
      <Button
        title="Go Back"
        onPress={() => router.back()}
        variant="secondary"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  photoId: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  button: {
    minWidth: 200,
  },
});

