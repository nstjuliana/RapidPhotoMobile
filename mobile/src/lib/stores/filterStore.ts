/**
 * Filter Store
 *
 * Zustand store for managing photo filtering state including tags and search.
 * Provides centralized state management for gallery filtering across the app.
 *
 * @module src/lib/stores/filterStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  // Tag filters
  selectedTags: Set<string>;

  // Search query
  searchQuery: string;

  // Filter mode (AND/OR for multiple tags)
  tagFilterMode: 'AND' | 'OR';

  // UI state
  isFilterBarVisible: boolean;

  // Actions
  addTagFilter: (tag: string) => void;
  removeTagFilter: (tag: string) => void;
  toggleTagFilter: (tag: string) => void;
  clearTagFilters: () => void;
  setTagFilters: (tags: string[]) => void;

  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;

  setTagFilterMode: (mode: 'AND' | 'OR') => void;

  toggleFilterBar: () => void;
  showFilterBar: () => void;
  hideFilterBar: () => void;

  clearAllFilters: () => void;
}

/**
 * Filter store with persistence for filter state
 */
export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedTags: new Set(),
      searchQuery: '',
      tagFilterMode: 'OR',
      isFilterBarVisible: false,

      // Tag filter actions
      addTagFilter: (tag: string) => {
        set((state) => {
          const newTags = new Set(state.selectedTags);
          newTags.add(tag);
          return { selectedTags: newTags };
        });
      },

      removeTagFilter: (tag: string) => {
        set((state) => {
          const newTags = new Set(state.selectedTags);
          newTags.delete(tag);
          return { selectedTags: newTags };
        });
      },

      toggleTagFilter: (tag: string) => {
        set((state) => {
          const newTags = new Set(state.selectedTags);
          if (newTags.has(tag)) {
            newTags.delete(tag);
          } else {
            newTags.add(tag);
          }
          return { selectedTags: newTags };
        });
      },

      clearTagFilters: () => {
        set({ selectedTags: new Set() });
      },

      setTagFilters: (tags: string[]) => {
        set({ selectedTags: new Set(tags) });
      },

      // Search actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      clearSearchQuery: () => {
        set({ searchQuery: '' });
      },

      // Filter mode actions
      setTagFilterMode: (mode: 'AND' | 'OR') => {
        set({ tagFilterMode: mode });
      },

      // UI actions
      toggleFilterBar: () => {
        set((state) => ({ isFilterBarVisible: !state.isFilterBarVisible }));
      },

      showFilterBar: () => {
        set({ isFilterBarVisible: true });
      },

      hideFilterBar: () => {
        set({ isFilterBarVisible: false });
      },

      // Clear all filters
      clearAllFilters: () => {
        set({
          selectedTags: new Set(),
          searchQuery: '',
          tagFilterMode: 'OR',
        });
      },
    }),
    {
      name: 'photo-filters',
    // Custom serialization for Set
    serialize: (state: FilterState) => JSON.stringify({
      ...state,
      selectedTags: Array.from(state.selectedTags),
    }),
    deserialize: (str: string) => {
      const parsed = JSON.parse(str);
      return {
        ...parsed,
        selectedTags: new Set(parsed.selectedTags || []),
      } as FilterState;
    },
      // Only persist certain fields
      partialize: (state) => ({
        selectedTags: state.selectedTags,
        searchQuery: state.searchQuery,
        tagFilterMode: state.tagFilterMode,
        // Don't persist UI state like isFilterBarVisible
      }),
    }
  )
);

// Computed getters (using selectors for performance)
export const useFilterSelectors = () => {
  const store = useFilterStore();

  return {
    hasActiveFilters: store.selectedTags.size > 0 || store.searchQuery.trim().length > 0,
    activeFilterCount: store.selectedTags.size + (store.searchQuery.trim().length > 0 ? 1 : 0),
    selectedTagsArray: Array.from(store.selectedTags),
    hasTagFilters: store.selectedTags.size > 0,
    hasSearchQuery: store.searchQuery.trim().length > 0,
  };
};
