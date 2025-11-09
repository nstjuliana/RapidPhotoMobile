/**
 * Query Key Factories
 * 
 * Centralized query key factories for TanStack Query.
 * Ensures consistent and type-safe query key generation.
 * 
 * @module lib/queries/keys
 */

/**
 * Photo query keys
 */
export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  list: (filters?: { tags?: string[]; searchQuery?: string }) =>
    [...photoKeys.lists(), filters] as const,
  details: () => [...photoKeys.all, 'detail'] as const,
  detail: (id: string) => [...photoKeys.details(), id] as const,
};

/**
 * Auth query keys
 */
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Tag query keys
 */
export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
};


