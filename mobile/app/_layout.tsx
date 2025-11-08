/**
 * Root Layout
 * 
 * Root layout component for Expo Router with providers and navigation guard.
 * Wraps the entire app with QueryClientProvider and handles authentication routing.
 * 
 * @module app/_layout
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queries/queryClient';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSegments, useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Root layout component
 */
export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { restoreAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Restore authentication state on mount
    const initializeAuth = async () => {
      try {
        await restoreAuth();
      } catch (error) {
        console.error('Failed to restore auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [restoreAuth]);

  useEffect(() => {
    if (isCheckingAuth) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to gallery if authenticated and on auth screen
      router.replace('/(tabs)/gallery');
    }
  }, [isAuthenticated, segments, isCheckingAuth, router]);

  if (isCheckingAuth) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'default',
          freezeOnBlur: false,
          lazy: false,
        }}
      >
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'default',
            freezeOnBlur: false,
            lazy: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'default',
            freezeOnBlur: false,
            lazy: false,
          }}
        />
        <Stack.Screen
          name="photo/[id]"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'default',
            freezeOnBlur: false,
            lazy: false,
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

