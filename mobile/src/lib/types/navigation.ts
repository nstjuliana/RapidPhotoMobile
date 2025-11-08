/**
 * Navigation Types
 * 
 * Type definitions for Expo Router navigation.
 * Provides type safety for route parameters and navigation.
 * 
 * @module lib/types/navigation
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root stack navigation parameters
 */
export type RootStackParamList = {
  '(auth)': NavigatorScreenParams<AuthStackParamList>;
  '(tabs)': NavigatorScreenParams<TabParamList>;
  'photo/[id]': { id: string };
};

/**
 * Auth stack navigation parameters
 */
export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
};

/**
 * Tab navigation parameters
 */
export type TabParamList = {
  gallery: undefined;
  upload: undefined;
};

