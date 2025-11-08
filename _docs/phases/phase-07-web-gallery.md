# Phase 7: Web Gallery & Management

## Goal

Implement the photo gallery view, photo detail page, tag filtering, search functionality, multi-select operations, and batch download. This phase completes the core web application functionality for viewing and managing uploaded photos.

## Deliverables

- Photo grid/gallery component with infinite scroll
- Photo detail view with full metadata
- Tag filtering and search functionality
- Multi-select mode for batch operations
- Batch download feature (ZIP generation)
- Post-upload tagging interface
- Photo management (view, filter, tag, download)

## Prerequisites

- Phase 6 completed (upload feature working)
- Photos uploaded and stored in backend
- Backend query endpoints working (Phase 4)

## Features

### 1. Photo Grid Gallery Component

**Goal:** Create responsive photo grid that displays uploaded photos with infinite scroll.

**Steps:**
1. Create `components/features/photo/PhotoGrid.tsx`:
   - Responsive grid layout (CSS Grid or Masonry)
   - Photo thumbnails with lazy loading
   - Click handler to navigate to detail view
   - Infinite scroll using Intersection Observer
2. Create `components/features/photo/PhotoCard.tsx`:
   - Displays photo thumbnail
   - Overlay with upload date and tags
   - Selection checkbox (for multi-select mode)
   - Loading skeleton while image loads
3. Implement photo fetching:
   - Use TanStack Query `useInfiniteQuery` for pagination
   - Query key: `photoKeys.list(filters)`
   - Load more photos on scroll
4. Handle empty states:
   - Empty gallery message
   - "Upload photos" call-to-action
5. Optimize image loading:
   - Use Next.js Image component for optimization
   - Lazy load images below fold
   - Generate thumbnail URLs from S3 keys

**Success Criteria:**
- Photo grid displays photos in responsive layout
- Infinite scroll loads more photos automatically
- Images lazy load for performance
- Empty state displayed when no photos
- Grid adapts to different screen sizes

---

### 2. Photo Detail View

**Goal:** Create detailed view for individual photos with full metadata and actions.

**Steps:**
1. Create `app/(dashboard)/photos/[id]/page.tsx`:
   - Dynamic route for photo detail
   - Fetches photo by ID using TanStack Query
   - Displays full-size photo
2. Create `components/features/photo/PhotoDetailView.tsx`:
   - Large photo display (full width or centered)
   - Metadata panel: filename, upload date, file size, tags
   - Action buttons: Edit Tags, Download, Delete (if implemented)
   - Previous/Next navigation arrows
3. Implement tag editing:
   - Inline tag editor
   - Add/remove tags
   - Save changes via API
   - Optimistic updates with TanStack Query
4. Handle loading and error states:
   - Loading skeleton while fetching
   - 404 page if photo not found
   - Error message on fetch failure
5. Add navigation:
   - Back button to gallery
   - Previous/Next photo navigation
   - Maintains filter context when returning to gallery

**Success Criteria:**
- Photo detail page displays full photo and metadata
- Tag editing works inline
- Navigation between photos works
- Loading and error states handled
- Context preserved when navigating back

---

### 3. Tag Filtering

**Goal:** Implement tag-based filtering for the photo gallery.

**Steps:**
1. Create `components/features/photo/FilterBar.tsx`:
   - Tag filter dropdown/multi-select
   - Shows all available tags (fetched from backend)
   - Selected tags displayed as chips
   - Clear filters button
2. Integrate with photo queries:
   - Update query key when filters change
   - Pass tags parameter to API
   - Refetch photos when filters applied
3. Update upload store or create filter store:
   - Store selected tags in Zustand
   - Persist filters in URL query params (optional)
   - Sync filters with URL for shareable links
4. Display active filters:
   - Show selected tags as removable chips
   - Filter count indicator
   - Clear all filters action
5. Handle filter combinations:
   - Multiple tags (AND logic: photos with all tags)
   - Empty results message
   - Reset to show all photos

**Success Criteria:**
- Tag filtering works correctly
- Multiple tags supported (AND logic)
- Filters persist in URL (optional)
- Active filters displayed clearly
- Empty results handled gracefully

---

### 4. Search Functionality

**Goal:** Implement search to find photos by filename, tags, or metadata.

**Steps:**
1. Create `components/features/photo/SearchBar.tsx`:
   - Search input field
   - Debounced search (wait for user to stop typing)
   - Search suggestions (optional)
   - Clear search button
2. Integrate with backend:
   - Create search query hook
   - Call search API endpoint (or use filter endpoint with search param)
   - Update query key with search term
3. Display search results:
   - Show search term in results header
   - Highlight matching text (optional)
   - "No results" message when nothing found
4. Combine search with filters:
   - Search works with tag filters
   - Both applied simultaneously
   - Clear both search and filters
5. Search history (optional):
   - Store recent searches
   - Quick access to recent searches

**Success Criteria:**
- Search finds photos by filename and tags
- Debounced search reduces API calls
- Search combines with tag filters
- Results displayed correctly
- Empty results handled

---

### 5. Multi-Select Mode

**Goal:** Enable selecting multiple photos for batch operations.

**Steps:**
1. Enhance upload store or create selection store:
   - State: `selectedPhotoIds` (Set<string>)
   - Actions: `selectPhoto(id)`, `deselectPhoto(id)`, `selectAll()`, `clearSelection()`
   - Toggle select mode on/off
2. Update PhotoCard component:
   - Show checkbox when in select mode
   - Highlight selected photos
   - Toggle selection on click
3. Create selection toolbar:
   - Appears when photos selected
   - Shows selection count
   - Batch actions: Tag, Download, Delete (if implemented)
   - Clear selection button
4. Implement select all:
   - "Select all" checkbox in gallery header
   - Selects all visible photos (or all photos matching filters)
   - Updates selection count
5. Persist selection:
   - Selection persists during navigation (optional)
   - Clear selection on page refresh or explicit clear

**Success Criteria:**
- Multi-select mode toggles on/off
- Photos can be selected/deselected
- Selection toolbar appears with actions
- Select all works correctly
- Selection state managed properly

---

### 6. Batch Download

**Goal:** Implement downloading multiple photos as a ZIP file.

**Steps:**
1. Create download API integration:
   - `useBatchDownload()` hook
   - Calls backend endpoint with photo IDs
   - Backend generates ZIP and returns download URL
2. Create download service:
   - `lib/utils/download.ts`
   - Handles single photo download (presigned URL)
   - Handles batch download (ZIP URL)
   - Triggers browser download
3. Implement batch download flow:
   - User selects photos
   - Clicks "Download" in selection toolbar
   - Shows loading state while ZIP generated
   - Downloads ZIP file when ready
4. Handle download progress:
   - Progress indicator for ZIP generation
   - Download started notification
   - Error handling if download fails
5. Optimize for large batches:
   - Show estimated time
   - Allow cancellation (optional)
   - Handle timeouts gracefully

**Success Criteria:**
- Batch download generates ZIP file
- Download triggers browser download
- Progress shown during ZIP generation
- Error handling covers failures
- Works for large photo batches

---

### 7. Post-Upload Tagging

**Goal:** Allow users to add/edit tags for photos after upload.

**Steps:**
1. Create tag management hooks:
   - `useAddTags(photoId, tags)` mutation
   - `useRemoveTags(photoId, tags)` mutation
   - `useUpdatePhotoTags(photoId, tags)` mutation
2. Create `components/features/photo/TagEditor.tsx`:
   - Tag input with autocomplete
   - Display existing tags as chips
   - Add/remove tags
   - Save changes button
3. Integrate tag editor:
   - In photo detail view (inline editing)
   - In selection toolbar (batch tagging)
   - In photo card overlay (quick add, optional)
4. Implement batch tagging:
   - Select multiple photos
   - Open tag editor
   - Add tags to all selected photos
   - Show progress for batch operation
5. Optimistic updates:
   - Update UI immediately
   - Revert on error
   - Show success/error notifications

**Success Criteria:**
- Tags can be added to individual photos
- Tags can be added to multiple photos (batch)
- Tag autocomplete suggests existing tags
- Optimistic updates provide instant feedback
- Error handling reverts failed changes

---

### 8. Gallery Page Integration

**Goal:** Integrate all gallery components into complete gallery page.

**Steps:**
1. Create `app/(dashboard)/gallery/page.tsx`:
   - Combines filter bar, search bar, photo grid
   - Selection toolbar when in select mode
   - Layout: filters at top, grid below
2. Implement page state management:
   - Filter state in Zustand or URL params
   - Search state in component or URL params
   - Selection state in Zustand store
3. Handle URL synchronization:
   - Filters and search in URL query params
   - Shareable gallery URLs
   - Browser back/forward works correctly
4. Add empty states:
   - No photos message with upload CTA
   - No search results message
   - No filtered results message
5. Performance optimization:
   - Virtual scrolling for large galleries (optional)
   - Image optimization with Next.js Image
   - Debounced search and filters

**Success Criteria:**
- Complete gallery page functional
- All features integrated seamlessly
- URL synchronization works
- Empty states handled
- Performance optimized for large galleries

## Success Criteria (Phase Completion)

- ✅ Photo grid displays photos with infinite scroll
- ✅ Photo detail view shows full metadata
- ✅ Tag filtering works correctly
- ✅ Search functionality finds photos
- ✅ Multi-select mode enables batch operations
- ✅ Batch download generates ZIP files
- ✅ Post-upload tagging works
- ✅ Gallery page fully integrated
- ✅ All features work together seamlessly

## Notes and Considerations

- **Infinite Scroll:** Use Intersection Observer API for efficient infinite scroll. Load next page when user scrolls near bottom.
- **Image Optimization:** Use Next.js Image component for automatic optimization. Consider generating thumbnails on backend for faster loading.
- **Filter Persistence:** Store filters in URL query params for shareable links and browser history support.
- **Batch Operations:** Limit batch operation size to prevent timeouts. Show progress for large batches.
- **Tag Autocomplete:** Fetch existing tags from backend for autocomplete suggestions. Cache tags for performance.
- **Optimistic Updates:** Update UI immediately for better UX. Revert on error with clear error messages.
- **Performance:** Virtual scrolling or pagination for very large galleries. Lazy load images below fold.
- **Next Steps:** Phase 8 will enhance authentication with full JWT implementation.

