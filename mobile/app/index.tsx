/**
 * Index Redirect
 * 
 * Entry point that redirects to appropriate screen based on authentication.
 * 
 * @module app/index
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Index redirect component
 */
export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/gallery" />;
  }

  return <Redirect href="/(auth)/login" />;
}

