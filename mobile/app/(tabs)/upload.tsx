/**
 * Upload Screen
 * 
 * Placeholder screen for photo upload.
 * Will be implemented in Phase 11.
 * 
 * @module app/(tabs)/upload
 */

import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/common/Button';
import { useRouter } from 'expo-router';

/**
 * Upload screen component
 */
export default function UploadScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Photos</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.description}>
        Upload your photos here. Support for selecting and uploading multiple photos will be available soon.
      </Text>
      <Button
        title="Go to Gallery"
        onPress={() => router.push('/(tabs)/gallery')}
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

