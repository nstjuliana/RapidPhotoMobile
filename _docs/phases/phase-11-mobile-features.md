# Phase 11: Mobile Features

## Goal

Implement core mobile application features including photo upload with progress tracking, photo gallery view, tag management, and download functionality. This phase mirrors the web application functionality in a mobile-native interface.

## Deliverables

- Image picker integration (expo-image-picker)
- Photo upload flow with progress tracking
- Photo gallery view with infinite scroll
- Tag filtering and management
- Photo detail view
- Download functionality
- Mobile-optimized UI components

## Prerequisites

- Phase 10 completed (mobile foundation, auth, navigation)
- Backend API fully functional
- Understanding of React Native components and APIs

## Features

### 1. Image Picker Integration

**Goal:** Implement image selection using expo-image-picker with camera and gallery access.

**Steps:**
1. Install `expo-image-picker`:
   - Native image picker for iOS and Android
   - Camera and media library access
2. Request permissions:
   - `src/lib/services/permissions/PermissionService.ts`
   - Request camera and media library permissions
   - Handle permission denials gracefully
3. Create image picker component:
   - `src/components/upload/ImagePicker.tsx`
   - Button to open picker
   - Supports single or multiple selection
   - Returns selected images
4. Handle image selection:
   - Display selected images in preview
   - Show image metadata (size, dimensions)
   - Allow removing selected images
   - Limit selection to 100 images
5. Test image picker:
   - Camera access works
   - Gallery access works
   - Multiple selection works
   - Permissions handled correctly

**Success Criteria:**
- Image picker opens camera and gallery
- Multiple images can be selected
- Permissions requested and handled
- Selected images displayed in preview
- Works on iOS and Android

---

### 2. Photo Upload Flow

**Goal:** Implement complete upload flow with presigned URLs and progress tracking.

**Steps:**
1. Create upload hook:
   - `src/lib/hooks/usePhotoUpload.ts`
   - Request presigned URLs from backend
   - Upload images directly to S3
   - Track upload progress
2. Implement S3 upload:
   - Use axios with progress tracking
   - Upload to presigned URL
   - Update progress in upload store
   - Handle upload errors
3. Create upload screen:
   - `src/screens/upload/UploadScreen.tsx`
   - Image picker integration
   - Selected images preview
   - Upload button
   - Progress indicators
4. Add batch tagging:
   - Tag input field
   - Apply tags to all selected images
   - Tags included in upload request
5. Handle upload completion:
   - Report completion to backend
   - Update upload status
   - Navigate to gallery on success
   - Show error messages on failure

**Success Criteria:**
- Images upload to S3 using presigned URLs
- Upload progress tracked and displayed
- Batch tagging works
- Upload completion reported to backend
- Error handling covers failures

---

### 3. Upload Progress Tracking

**Goal:** Display upload progress for individual images and batch.

**Steps:**
1. Enhance upload store:
   - Track progress per image
   - Store upload status (pending, uploading, completed, failed)
   - Calculate batch progress percentage
2. Create progress components:
   - `src/components/upload/UploadProgress.tsx` - Individual progress bar
   - `src/components/upload/UploadQueue.tsx` - List of uploads with progress
   - Progress bars update in real-time
3. Display upload status:
   - Status badges (uploading, completed, failed)
   - Progress percentage
   - Upload speed (optional)
4. Handle background uploads:
   - Uploads continue when navigating away
   - Progress visible from other screens (notification or badge)
   - Queue persists across navigation
5. Add upload controls:
   - Cancel upload button
   - Retry failed uploads
   - Clear completed uploads

**Success Criteria:**
- Individual progress bars update in real-time
- Batch progress calculated correctly
- Status badges reflect current state
- Background uploads work
- Upload controls functional

---

### 4. Photo Gallery View

**Goal:** Create photo gallery with infinite scroll and responsive grid.

**Steps:**
1. Create gallery screen:
   - `src/screens/gallery/GalleryScreen.tsx`
   - Fetches photos using TanStack Query
   - Infinite scroll with FlatList
2. Create photo grid component:
   - `src/components/photo/PhotoGrid.tsx`
   - Responsive grid layout (2-3 columns)
   - Photo thumbnails with lazy loading
3. Implement infinite scroll:
   - Use `onEndReached` in FlatList
   - Load more photos when scrolling
   - Show loading indicator at bottom
4. Add photo cards:
   - `src/components/photo/PhotoCard.tsx`
   - Thumbnail image
   - Upload date and tags overlay
   - Tap to navigate to detail
5. Handle empty states:
   - Empty gallery message
   - "Upload photos" call-to-action
   - Loading skeletons

**Success Criteria:**
- Gallery displays photos in grid
- Infinite scroll loads more photos
- Images lazy load for performance
- Empty states handled
- Navigation to detail works

---

### 5. Photo Detail View

**Goal:** Create detailed view for individual photos with metadata and actions.

**Steps:**
1. Create detail screen:
   - `src/screens/photos/PhotoDetailScreen.tsx`
   - Fetches photo by ID
   - Displays full-size photo
2. Display photo metadata:
   - Full-size image (scrollable if large)
   - Filename, upload date, file size
   - Tags display and editing
3. Add action buttons:
   - Edit tags button
   - Download button
   - Share button (optional)
4. Implement tag editing:
   - Inline tag editor
   - Add/remove tags
   - Save changes via API
   - Optimistic updates
5. Add navigation:
   - Back button to gallery
   - Swipe to previous/next (optional)
   - Maintains filter context

**Success Criteria:**
- Detail screen displays full photo
- Metadata displayed correctly
- Tag editing works
- Download functionality works
- Navigation works correctly

---

### 6. Tag Filtering and Management

**Goal:** Implement tag-based filtering and tag management for photos.

**Steps:**
1. Create filter component:
   - `src/components/photo/FilterBar.tsx`
   - Tag selector (multi-select)
   - Shows available tags
   - Selected tags displayed as chips
2. Integrate with gallery:
   - Update query when filters change
   - Pass tags to API
   - Refetch photos with filters
3. Implement tag management:
   - Add tags to photos
   - Remove tags from photos
   - Batch tag operations
4. Create tag editor:
   - `src/components/photo/TagEditor.tsx`
   - Tag input with suggestions
   - Display existing tags
   - Add/remove tags
5. Handle filter state:
   - Store filters in Zustand
   - Persist filters (optional)
   - Clear filters button

**Success Criteria:**
- Tag filtering works correctly
- Multiple tags supported
- Tag management works
- Filter state managed properly
- UI updates when filters change

---

### 7. Download Functionality

**Goal:** Implement photo download for individual and batch operations.

**Steps:**
1. Create download service:
   - `src/lib/services/download/DownloadService.ts`
   - Download single photo (presigned URL)
   - Handle download progress
2. Implement single photo download:
   - Get presigned download URL
   - Download image to device
   - Save to device storage
   - Request storage permissions
3. Implement batch download:
   - Select multiple photos
   - Request download URLs
   - Download all photos
   - Show batch progress
4. Handle download permissions:
   - Request storage permissions (Android)
   - Handle permission denials
5. Add download UI:
   - Download button in detail screen
   - Batch download in selection mode
   - Download progress indicator
   - Success/error notifications

**Success Criteria:**
- Single photo download works
- Batch download works
- Permissions handled correctly
- Progress shown during download
- Downloads save to device

---

### 8. Mobile-Optimized UI

**Goal:** Create mobile-native UI components and interactions.

**Steps:**
1. Create reusable components:
   - Buttons, cards, inputs using React Native components
   - Consistent styling with StyleSheet
   - Platform-specific styles (iOS/Android)
2. Implement touch interactions:
   - Tap gestures for navigation
   - Long press for context menus (optional)
   - Swipe gestures (optional)
3. Add loading states:
   - ActivityIndicator for loading
   - Skeleton screens for data loading
   - Pull-to-refresh for gallery
4. Handle safe areas:
   - Use SafeAreaView for iOS notches
   - Handle Android navigation bar
   - Responsive layouts
5. Optimize performance:
   - Image optimization and caching
   - Lazy loading for lists
   - Memoization for expensive renders

**Success Criteria:**
- UI components mobile-native
- Touch interactions work correctly
- Loading states displayed
- Safe areas handled
- Performance optimized

## Success Criteria (Phase Completion)

- ✅ Image picker works with camera and gallery
- ✅ Photo upload flow functional with progress
- ✅ Gallery displays photos with infinite scroll
- ✅ Photo detail view shows full metadata
- ✅ Tag filtering and management works
- ✅ Download functionality works
- ✅ Mobile UI optimized and responsive
- ✅ All features work on iOS and Android

## Notes and Considerations

- **Image Picker:** Use `expo-image-picker` for cross-platform image selection. Handle permissions on both platforms.
- **Upload Progress:** Use axios `onUploadProgress` for progress tracking. Update UI in real-time.
- **Gallery Performance:** Use `FlatList` for efficient rendering. Implement `getItemLayout` if possible. Use `removeClippedSubviews` for performance.
- **Image Optimization:** Consider resizing images before upload to reduce upload time and storage. Use `expo-image-manipulator`.
- **Platform Differences:** Handle iOS and Android differences (permissions, storage, UI patterns).
- **Offline Support:** Consider offline queue for uploads (optional, advanced feature).
- **Next Steps:** Phase 12 will add polish, error handling, and optimizations across web and mobile.

