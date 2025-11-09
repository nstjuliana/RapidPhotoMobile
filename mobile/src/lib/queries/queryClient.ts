/**
 * TanStack Query Configuration
 * 
 * QueryClient configuration for server state management.
 * Provides default options for queries and mutations.
 * 
 * @module lib/queries/queryClient
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query client configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});


