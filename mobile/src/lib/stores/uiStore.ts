/**
 * UI Store
 * 
 * Zustand store for managing UI state such as select mode,
 * filters, and other UI-related state.
 * 
 * @module lib/stores/uiStore
 */

import { create } from 'zustand';

interface UIStoreState {
  isSelectMode: boolean;
  filters: {
    tags: string[];
    searchQuery: string;
  };
  toggleSelectMode: () => void;
  setSelectMode: (enabled: boolean) => void;
  setFilters: (filters: { tags?: string[]; searchQuery?: string }) => void;
  clearFilters: () => void;
}

/**
 * UI store for managing UI state
 */
export const useUIStore = create<UIStoreState>((set) => ({
  isSelectMode: false,
  filters: {
    tags: [],
    searchQuery: '',
  },
  
  toggleSelectMode: () => {
    set((state) => ({ isSelectMode: !state.isSelectMode }));
  },
  
  setSelectMode: (enabled: boolean) => {
    set({ isSelectMode: enabled });
  },
  
  setFilters: (filters: { tags?: string[]; searchQuery?: string }) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },
  
  clearFilters: () => {
    set({
      filters: {
        tags: [],
        searchQuery: '',
      },
    });
  },
}));

