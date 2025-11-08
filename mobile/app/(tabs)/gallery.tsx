/**
 * Gallery Screen
 * 
 * Placeholder screen for photo gallery.
 * Will be implemented in Phase 11.
 * 
 * @module app/(tabs)/gallery
 */

import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/common/Button';
import { useRouter } from 'expo-router';

/**
 * Gallery screen component
 */
export default function GalleryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Gallery</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.description}>
        Your photo gallery will appear here once you start uploading photos.
      </Text>
      <Button
        title="Go to Upload"
        onPress={() => router.push('/(tabs)/upload')}
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

