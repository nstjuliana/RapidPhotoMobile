# Phase 6: Web Upload Feature

## Goal

Implement the complete photo upload feature for the web application. This includes file selection (drag-and-drop), presigned URL retrieval, direct S3 upload with progress tracking, upload queue management, and batch tagging. The upload must work asynchronously without blocking the UI.

## Deliverables

- File dropzone component with drag-and-drop support
- Upload queue management with Zustand store
- Presigned URL request flow
- Direct S3 upload with progress tracking
- Individual and batch upload progress indicators
- Batch tagging interface
- Upload status persistence across navigation
- Error handling and retry logic

## Prerequisites

- Phase 5 completed (web foundation, API client, auth)
- Backend upload endpoints working (Phase 3)
- Understanding of S3 presigned URLs and direct uploads

## Features

### 1. File Dropzone Component

**Goal:** Create drag-and-drop file selection component using react-dropzone.

**Steps:**
1. Install `react-dropzone` dependency
2. Create `components/features/upload/UploadDropzone.tsx`:
   - Uses `useDropzone()` hook
   - Accepts image files only (image/*)
   - Max files: 100, max file size: 10MB per file
   - Drag-and-drop and click-to-select support
   - Visual feedback during drag (isDragActive)
3. Display selected files in preview grid:
   - Thumbnail previews using `URL.createObjectURL()`
   - File names and sizes
   - Remove button for each file
4. Handle file validation errors:
   - Show error messages for invalid files
   - Reject files that exceed size limit
   - Reject non-image files
5. Clean up object URLs on unmount to prevent memory leaks

**Success Criteria:**
- File dropzone accepts drag-and-drop and click selection
- File validation works (type, size, count)
- Preview thumbnails display correctly
- Files can be removed before upload
- Memory leaks prevented (URL.revokeObjectURL)

---

### 2. Upload Queue Management

**Goal:** Implement Zustand store to manage upload queue and progress.

**Steps:**
1. Enhance `lib/stores/uploadStore.ts`:
   - State: `uploads` (Map<fileId, UploadState>)
   - UploadState: file, photoId, status, progress, error, presignedUrl
   - Actions:
     - `addFiles(files)` - Add files to queue
     - `removeUpload(fileId)` - Remove from queue
     - `updateProgress(fileId, progress)` - Update upload progress
     - `updateStatus(fileId, status)` - Update status (uploading, completed, failed)
     - `clearCompleted()` - Clear completed uploads
2. Create upload state types:
   - Status: 'pending', 'uploading', 'completed', 'failed'
   - UploadState interface with all fields
3. Persist upload queue to localStorage (optional):
   - Use Zustand persist middleware
   - Restore queue on page reload
4. Create selectors for filtered views:
   - `getPendingUploads()`, `getActiveUploads()`, `getCompletedUploads()`

**Success Criteria:**
- Upload queue managed in Zustand store
- Upload state tracked per file
- Queue persists across navigation (optional)
- Selectors provide filtered views
- Store updates trigger UI re-renders

---

### 3. Presigned URL Request Flow

**Goal:** Implement flow to request presigned URLs from backend before upload.

**Steps:**
1. Create `lib/hooks/usePhotoUpload.ts`:
   - `requestPresignedUrl(file, tags)` function
   - Calls `POST /api/uploads` with file metadata
   - Returns presigned URL and photoId
   - Uses TanStack Query mutation
2. Create upload mutation hook:
   - `useInitiateUpload()` mutation
   - Handles presigned URL request
   - Updates upload store with photoId and presignedUrl
   - Error handling for backend failures
3. Batch presigned URL requests:
   - Request URLs for all selected files
   - Handle rate limiting (if needed)
   - Update store as URLs are received
4. Store presigned URLs in upload store:
   - Associate URL with fileId
   - Track expiration time
   - Handle expired URLs (request new one)

**Success Criteria:**
- Presigned URLs requested from backend
- URLs stored in upload queue
- Batch requests work for multiple files
- Error handling covers backend failures
- Expired URLs handled gracefully

---

### 4. Direct S3 Upload with Progress

**Goal:** Implement direct upload to S3 using presigned URLs with progress tracking.

**Steps:**
1. Create `lib/utils/s3Upload.ts`:
   - `uploadToS3(file, presignedUrl, onProgress)` function
   - Uses XMLHttpRequest for progress tracking (fetch doesn't support progress)
   - Sets Content-Type header from file
   - Handles upload errors (network, S3 errors)
2. Integrate with upload hook:
   - After presigned URL received, start S3 upload
   - Update progress in upload store as upload progresses
   - Update status to 'uploading' → 'completed' or 'failed'
3. Handle upload completion:
   - Call backend `POST /api/uploads/{photoId}/complete` after S3 upload succeeds
   - Update upload status in store
   - Handle completion errors
4. Implement retry logic:
   - Retry failed uploads (max 3 attempts)
   - Exponential backoff between retries
   - Update status appropriately

**Success Criteria:**
- Files upload directly to S3 using presigned URLs
- Upload progress tracked and displayed
- Completion reported to backend
- Retry logic handles transient failures
- Error handling covers all failure scenarios

---

### 5. Upload Progress Indicators

**Goal:** Create UI components to display upload progress for individual files and batch.

**Steps:**
1. Create `components/features/upload/UploadProgress.tsx`:
   - Displays progress bar for single upload
   - Shows status badge (uploading, completed, failed)
   - Displays upload speed and ETA (optional)
   - Shows error message if failed
2. Create `components/features/upload/UploadQueue.tsx`:
   - Lists all uploads in queue
   - Shows individual progress for each file
   - Batch progress indicator (total progress percentage)
   - Count of completed/failed/uploading
3. Create `components/features/upload/UploadSummary.tsx`:
   - Shows summary when uploads complete
   - Success/failure counts
   - Action buttons (view gallery, upload more)
4. Integrate progress indicators into upload page:
   - Display queue during upload
   - Show summary after completion
   - Update in real-time as uploads progress

**Success Criteria:**
- Individual progress bars update in real-time
- Batch progress calculated correctly
- Status badges reflect current state
- Error messages displayed for failures
- UI remains responsive during uploads

---

### 6. Batch Tagging Interface

**Goal:** Allow users to apply tags to entire upload batch before upload starts.

**Steps:**
1. Create `components/features/upload/BatchTagInput.tsx`:
   - Tag input field with autocomplete (suggest existing tags)
   - Tag chips display (add/remove tags)
   - Tags applied to all files in batch
2. Integrate with upload flow:
   - Tags included in presigned URL request
   - Tags saved with photo metadata on backend
   - Tags visible in gallery after upload
3. Create tag management utilities:
   - `lib/utils/tags.ts` - tag validation, normalization
   - Tag suggestions from existing photos (query backend)
4. Update upload store:
   - Store batch tags
   - Apply tags to all uploads in queue
5. Display tags in upload preview:
   - Show tags on file preview cards
   - Allow editing tags before upload

**Success Criteria:**
- Batch tags can be added before upload
   - Tags validated and normalized
   - Tags included in upload requests
   - Tags visible in gallery after upload
   - Tag autocomplete suggests existing tags

---

### 7. Upload Page Integration

**Goal:** Integrate all upload components into complete upload page.

**Steps:**
1. Create `app/(dashboard)/upload/page.tsx`:
   - Combines dropzone, queue, progress, tag input
   - Layout: dropzone at top, queue below, tags sidebar
   - Start upload button triggers upload flow
2. Implement upload flow:
   - User selects files → files added to queue
   - User adds batch tags (optional)
   - User clicks "Start Upload"
   - Request presigned URLs for all files
   - Upload files to S3 with progress tracking
   - Report completion to backend
3. Handle navigation during upload:
   - Uploads continue in background
   - Queue persists across navigation
   - Progress visible from other pages (optional: notification)
4. Add upload controls:
   - Pause/resume uploads (optional)
   - Cancel uploads
   - Clear completed uploads
5. Error handling and user feedback:
   - Toast notifications for errors
   - Retry failed uploads button
   - Clear error messages

**Success Criteria:**
- Complete upload page functional
- Upload flow works end-to-end
- Progress tracked and displayed
- Background uploads work correctly
- Error handling provides clear feedback
- UI remains responsive during uploads

## Success Criteria (Phase Completion)

- ✅ File dropzone accepts drag-and-drop and file selection
- ✅ Upload queue managed with Zustand store
- ✅ Presigned URLs requested and stored
- ✅ Direct S3 uploads work with progress tracking
- ✅ Progress indicators update in real-time
- ✅ Batch tagging functional
- ✅ Upload page integrated and working
- ✅ Background uploads continue during navigation
- ✅ Error handling covers all scenarios

## Notes and Considerations

- **Progress Tracking:** Use XMLHttpRequest for upload progress (fetch API doesn't support progress events). Consider using libraries like `axios` with progress callbacks.
- **Concurrent Uploads:** Upload multiple files concurrently (up to 100). Use Promise.all() or limit concurrency to avoid overwhelming browser/S3.
- **Memory Management:** Revoke object URLs after use to prevent memory leaks. Clean up on component unmount.
- **Presigned URL Expiration:** URLs expire after 15-60 minutes. Handle expiration by requesting new URLs if upload takes too long.
- **Error Recovery:** Implement retry logic for transient failures. Allow users to manually retry failed uploads.
- **Background Uploads:** Uploads continue when user navigates away. Consider using service workers or keeping upload logic in a persistent store.
- **File Size Limits:** Enforce file size limits on frontend (validation) and backend (presigned URL policy). Show clear error messages.
- **Next Steps:** Phase 7 will implement the gallery and photo management features.

