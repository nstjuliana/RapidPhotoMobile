/**
 * Auth Layout
 * 
 * Stack layout for authentication screens (login, signup).
 * 
 * @module app/(auth)/_layout
 */

import { Stack } from 'expo-router';

/**
 * Auth stack layout
 */
export default function AuthLayout() {
  return (
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
        name="login"
        options={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'default',
          freezeOnBlur: false,
          lazy: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'default',
          freezeOnBlur: false,
          lazy: false,
        }}
      />
    </Stack>
  );
}

