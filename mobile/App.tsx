/**
 * RapidPhotoUpload Mobile App
 * 
 * Main application entry point for the mobile application.
 * This is a hello world screen that will be replaced with proper navigation
 * and screens in subsequent phases.
 * 
 * @module App
 */

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from './src/lib/config/environment';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RapidPhotoUpload</Text>
      <Text style={styles.subtitle}>Mobile Application</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>API Endpoint:</Text>
        <Text style={styles.infoValue}>{API_BASE_URL}</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'monospace',
  },
});
