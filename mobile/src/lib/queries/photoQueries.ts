/**
 * Photo Query Hooks
 *
 * TanStack Query hooks for photo data management.
 * Includes hooks for listing photos, individual photo details, and mutations.
 *
 * @module src/lib/queries/photoQueries
 */

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  listPhotos,
  getPhoto,
  addPhotoTags,
  removePhotoTags,
  replacePhotoTags,
  getPhotoDownloadUrl,
} from '@/lib/api/endpoints';
import { photoKeys } from './keys';
import type { PhotoDto, ListPhotosParams } from '@/lib/api/types';

/**
 * Hook for fetching paginated photo list with infinite scroll support
 */
export function useInfinitePhotos(params?: {
  pageSize?: number;
  tags?: string[];
  searchQuery?: string;
}) {
  const { user } = useAuthStore();

  return useInfiniteQuery({
    queryKey: photoKeys.list({
      tags: params?.tags,
      searchQuery: params?.searchQuery,
    }),
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const queryParams: ListPhotosParams = {
        userId: user.id,
        page: pageParam,
        size: params?.pageSize || 20,
        sortBy: 'uploadDate',
        tags: params?.tags,
        // searchQuery: params?.searchQuery, // Add to API if needed
      };

      return listPhotos(queryParams);
    },
    getNextPageParam: (lastPage, pages) => {
      // If we got a full page, there might be more
      const pageSize = params?.pageSize || 20;
      return lastPage.length === pageSize ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for gallery
  });
}

/**
 * Hook for fetching a single photo by ID
 */
export function usePhoto(photoId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: photoKeys.detail(photoId),
    queryFn: () => getPhoto(photoId),
    enabled: enabled && !!photoId,
    staleTime: 5 * 60 * 1000, // 5 minutes for detail view
  });
}

/**
 * Hook for fetching photos with pagination (non-infinite)
 */
export function usePhotos(params?: {
  page?: number;
  pageSize?: number;
  tags?: string[];
  searchQuery?: string;
}) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...photoKeys.list({
      tags: params?.tags,
      searchQuery: params?.searchQuery,
    }), 'paginated', params?.page || 0],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const queryParams: ListPhotosParams = {
        userId: user.id,
        page: params?.page || 0,
        size: params?.pageSize || 20,
        sortBy: 'uploadDate',
        tags: params?.tags,
      };

      return listPhotos(queryParams);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for adding tags to a photo
 */
export function useAddPhotoTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, tags }: { photoId: string; tags: string[] }) =>
      addPhotoTags(photoId, tags),
    onSuccess: (updatedPhoto) => {
      // Update the photo detail cache
      queryClient.setQueryData(
        photoKeys.detail(updatedPhoto.id),
        updatedPhoto
      );

      // Invalidate photo lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
    },
  });
}

/**
 * Hook for removing tags from a photo
 */
export function useRemovePhotoTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, tags }: { photoId: string; tags: string[] }) =>
      removePhotoTags(photoId, tags),
    onSuccess: (updatedPhoto) => {
      // Update the photo detail cache
      queryClient.setQueryData(
        photoKeys.detail(updatedPhoto.id),
        updatedPhoto
      );

      // Invalidate photo lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
    },
  });
}

/**
 * Hook for replacing all tags on a photo
 */
export function useReplacePhotoTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, tags }: { photoId: string; tags: string[] }) =>
      replacePhotoTags(photoId, tags),
    onSuccess: (updatedPhoto) => {
      // Update the photo detail cache
      queryClient.setQueryData(
        photoKeys.detail(updatedPhoto.id),
        updatedPhoto
      );

      // Invalidate photo lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
    },
  });
}

/**
 * Hook for getting photo download URL
 */
export function usePhotoDownloadUrl(photoId: string) {
  return useQuery({
    queryKey: [...photoKeys.detail(photoId), 'downloadUrl'],
    queryFn: () => getPhotoDownloadUrl(photoId),
    enabled: !!photoId,
    staleTime: 30 * 1000, // 30 seconds - download URLs are short-lived
  });
}

/**
 * Hook for available tags (for tag suggestions)
 */
export function useAvailableTags() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['tags', 'available'],
    queryFn: async () => {
      // TODO: Implement API endpoint for available tags
      // For now, return mock data or extract from photos
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const photos = await listPhotos({
        userId: user.id,
        page: 0,
        size: 1000, // Get many photos to extract tags
      });

      const tagSet = new Set<string>();
      photos.forEach(photo => {
        photo.tags.forEach(tag => tagSet.add(tag));
      });

      return Array.from(tagSet).sort();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - tags don't change often
  });
}

/**
 * Optimistic update helper for photo mutations
 */
export function useOptimisticPhotoUpdate() {
  const queryClient = useQueryClient();

  const updatePhotoOptimistically = (
    photoId: string,
    updateFn: (currentPhoto: PhotoDto) => PhotoDto
  ) => {
    // Cancel any outgoing refetches
    queryClient.cancelQueries({ queryKey: photoKeys.detail(photoId) });

    // Snapshot the previous value
    const previousPhoto = queryClient.getQueryData<PhotoDto>(
      photoKeys.detail(photoId)
    );

    // Optimistically update to the new value
    if (previousPhoto) {
      queryClient.setQueryData(
        photoKeys.detail(photoId),
        updateFn(previousPhoto)
      );
    }

    // Return a rollback function
    return () => {
      queryClient.setQueryData(photoKeys.detail(photoId), previousPhoto);
    };
  };

  return { updatePhotoOptimistically };
}
