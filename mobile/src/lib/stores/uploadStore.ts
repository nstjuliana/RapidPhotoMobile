/**
 * Upload Store
 * 
 * Zustand store for managing photo upload queue and progress.
 * Tracks upload state, progress, and selected photos.
 * Placeholder implementation for Phase 10.
 * 
 * @module lib/stores/uploadStore
 */

import { create } from 'zustand';
import type { UploadState } from '@/lib/types/photo';

interface UploadStoreState {
  uploads: Map<string, UploadState>;
  selectedPhotoIds: Set<string>;
  addUpload: (fileId: string, upload: UploadState) => void;
  removeUpload: (fileId: string) => void;
  updateUploadProgress: (fileId: string, progress: number) => void;
  updateUploadStatus: (fileId: string, status: UploadState['status'], error?: string) => void;
  selectPhoto: (photoId: string) => void;
  deselectPhoto: (photoId: string) => void;
  clearSelection: () => void;
  clearCompleted: () => void;
}

/**
 * Upload store for managing upload queue and selection
 */
export const useUploadStore = create<UploadStoreState>((set) => ({
  uploads: new Map(),
  selectedPhotoIds: new Set(),
  
  addUpload: (fileId: string, upload: UploadState) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.set(fileId, upload);
      return { uploads: newUploads };
    });
  },
  
  removeUpload: (fileId: string) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.delete(fileId);
      return { uploads: newUploads };
    });
  },
  
  updateUploadProgress: (fileId: string, progress: number) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(fileId);
      if (upload) {
        newUploads.set(fileId, { ...upload, progress });
      }
      return { uploads: newUploads };
    });
  },
  
  updateUploadStatus: (fileId: string, status: UploadState['status'], error?: string) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(fileId);
      if (upload) {
        newUploads.set(fileId, { ...upload, status, error });
      }
      return { uploads: newUploads };
    });
  },
  
  selectPhoto: (photoId: string) => {
    set((state) => {
      const newSelected = new Set(state.selectedPhotoIds);
      newSelected.add(photoId);
      return { selectedPhotoIds: newSelected };
    });
  },
  
  deselectPhoto: (photoId: string) => {
    set((state) => {
      const newSelected = new Set(state.selectedPhotoIds);
      newSelected.delete(photoId);
      return { selectedPhotoIds: newSelected };
    });
  },
  
  clearSelection: () => {
    set({ selectedPhotoIds: new Set() });
  },
  
  clearCompleted: () => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      Array.from(newUploads.entries()).forEach(([fileId, upload]) => {
        if (upload.status === 'completed') {
          newUploads.delete(fileId);
        }
      });
      return { uploads: newUploads };
    });
  },
}));


