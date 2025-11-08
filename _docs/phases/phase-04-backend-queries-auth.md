# Phase 4: Backend Queries & Mock Auth

## Goal

Implement query handlers for retrieving photos (list, detail, filter), tag management functionality, download URL generation, and a simple mock authentication system. This phase completes the core backend API functionality needed for the web frontend.

## Deliverables

- Photo query handlers (list, get by ID, filter by tags)
- Tag management commands and queries
- Download URL generation service
- Mock authentication endpoint
- User management (basic)
- CORS configuration for web client
- Complete query vertical slices

## Prerequisites

- Phase 3 completed (upload flow working)
- Photos can be uploaded and stored
- Database schema includes users table

## Features

### 1. Photo List Query Handler

**Goal:** Implement query handler to retrieve list of photos for a user.

**Steps:**
1. Create `ListPhotosQuery` in `slices/photo/ListPhotosQuery.java`:
   - Fields: userId (UserId), page (int), size (int), sortBy (String)
   - Pagination support
2. Create `ListPhotosQueryHandler` in `slices/photo/ListPhotosQueryHandler.java`:
   - Dependencies: PhotoRepository
   - Returns Flux<PhotoDto> (reactive stream)
   - Implements pagination using repository
   - Converts Photo domain objects to PhotoDto
3. Create `PhotoDto` in `slices/photo/PhotoDto.java` with: id, filename, s3Key, uploadDate, tags, status, downloadUrl (presigned)
4. Create `PhotoController` in `slices/photo/PhotoController.java` with REST endpoint `GET /api/photos`:
   - Accepts query parameters: page, size, sortBy
   - Returns paginated list of photos
   - Uses reactive types (Mono<Page<PhotoDto>>)

**Success Criteria:**
- Photo list query returns paginated results
- Results sorted by upload date (newest first) by default
- Pagination works correctly
- Reactive stream handles large result sets efficiently

---

### 2. Photo Detail Query Handler

**Goal:** Implement query to retrieve single photo by ID with full metadata.

**Steps:**
1. Create `GetPhotoQuery` in `slices/photo/GetPhotoQuery.java` with photoId parameter
2. Create `GetPhotoQueryHandler` in `slices/photo/GetPhotoQueryHandler.java`:
   - Finds photo by ID using PhotoRepository
   - Returns Mono<PhotoDto>
   - Handles photo not found (returns Mono.empty() or error)
3. Create `PhotoDetailDto` in `slices/photo/PhotoDetailDto.java` extending PhotoDto with additional fields:
   - fileSize, contentType, uploadJobId (if applicable)
4. Add REST endpoint `GET /api/photos/{photoId}` to `PhotoController`:
   - Returns single photo with full details
   - Returns 404 if photo not found
   - Includes presigned download URL

**Success Criteria:**
- Photo detail query returns complete photo information
- Not found cases handled correctly (404 response)
- Download URL included in response
- Query handler uses reactive types

---

### 3. Photo Filtering by Tags

**Goal:** Implement tag-based filtering for photo queries.

**Steps:**
1. Enhance `ListPhotosQuery` with optional `tags` parameter (Set<String>)
2. Update `PhotoRepository` interface with `findByUserIdAndTags()` method
3. Implement repository method in `PhotoJpaAdapter`:
   - Uses JPA query with tag filtering
   - Supports filtering by multiple tags (AND or OR logic - choose one)
4. Update `ListPhotosQueryHandler` to use tag filtering when tags provided
5. Update REST endpoint to accept `tags` query parameter (comma-separated)

**Success Criteria:**
- Photos can be filtered by tags
- Multiple tags supported (AND logic: photos must have all tags)
- Filtering works with pagination
- Empty results handled gracefully

---

### 4. Tag Management Commands

**Goal:** Implement commands to add and remove tags from photos.

**Steps:**
1. Create `TagPhotoCommand` in `slices/tag/TagPhotoCommand.java`:
   - Fields: photoId, tags (Set<String>), operation (ADD or REMOVE)
2. Create `TagPhotoCommandHandler` in `slices/tag/TagPhotoCommandHandler.java`:
   - Loads photo by ID
   - Calls domain method `addTag()` or `removeTag()`
   - Saves updated photo
   - Returns Mono<Void> or Mono<PhotoDto>
3. Create `UntagPhotoCommand` for removing tags (or use operation enum)
4. Create REST endpoints:
   - `POST /api/photos/{photoId}/tags` - Add tags
   - `DELETE /api/photos/{photoId}/tags` - Remove tags
   - Request body: `{ "tags": ["tag1", "tag2"] }`
5. Support batch tagging: `POST /api/photos/tags` with multiple photoIds

**Success Criteria:**
- Tags can be added to photos
- Tags can be removed from photos
- Batch tagging works for multiple photos
- Domain validation prevents invalid tags (empty, too long, etc.)

---

### 5. Download URL Generation

**Goal:** Implement service to generate presigned download URLs for photos.

**Steps:**
1. Enhance `S3StorageService` with `generatePresignedDownloadUrl()`:
   - Parameters: s3Key, expirationMinutes (default 60)
   - Uses AWS SDK for GET presigned URLs
   - Returns Mono<String>
2. Update `PhotoDto` to include downloadUrl field
3. Update query handlers to include download URLs in responses:
   - Generate download URL when converting Photo to PhotoDto
   - Cache URLs briefly if needed (optional optimization)
4. Create dedicated endpoint `GET /api/photos/{photoId}/download`:
   - Returns presigned download URL
   - URL expires after configured time
5. Handle S3 errors gracefully (object not found, access denied)

**Success Criteria:**
- Download URLs generated successfully
- URLs expire after configured time
- URLs included in photo list and detail responses
- Dedicated download endpoint works
- Error handling covers S3 failures

---

### 6. Mock Authentication System

**Goal:** Implement simple mock authentication for development (replaced with JWT in Phase 8).

**Steps:**
1. Create `MockAuthService`:
   - Simple in-memory user store or database users table
   - `authenticate(email, password)` returns mock token
   - `validateToken(token)` returns userId
   - Tokens are simple UUIDs or JWT-like strings (not real JWT)
2. Create `LoginCommand` in `slices/auth/LoginCommand.java` and `LoginCommandHandler` in `slices/auth/LoginCommandHandler.java`:
   - Accepts email/password
   - Validates credentials (mock validation for now)
   - Returns token and user info
3. Create `AuthController` in `slices/auth/AuthController.java`:
   - `POST /api/auth/login` - Returns mock token
   - `POST /api/auth/validate` - Validates token, returns userId
   - `POST /api/auth/logout` - No-op for now
4. Create simple user creation (for testing):
   - `POST /api/auth/signup` - Creates user, returns token
5. Add basic user entity persistence (if not already done)

**Success Criteria:**
- Mock login endpoint returns token
- Token validation works
- User creation works for testing
- Authentication ready for frontend integration
- Simple and functional (will be replaced in Phase 8)

---

### 7. CORS Configuration

**Goal:** Configure CORS to allow web client to access API.

**Steps:**
1. Create `WebConfig` class implementing `WebFluxConfigurer`:
   - Configure CORS for all endpoints or specific paths
   - Allow web application origin (e.g., `http://localhost:3000`)
   - Allow methods: GET, POST, PUT, DELETE
   - Allow headers: Content-Type, Authorization
   - Allow credentials
2. Alternatively, use `@CrossOrigin` on controllers (less flexible)
3. Test CORS with web client making requests
4. Handle preflight OPTIONS requests correctly

**Success Criteria:**
- CORS configured for web client origin
- Preflight requests handled correctly
- Web client can make authenticated requests
- CORS errors eliminated

## Success Criteria (Phase Completion)

- ✅ Photo list and detail queries work
- ✅ Tag filtering functional
- ✅ Tag management commands work
- ✅ Download URLs generated correctly
- ✅ Mock authentication system operational
- ✅ CORS configured for web client
- ✅ All query endpoints return reactive types
- ✅ Complete backend API ready for web frontend integration

## Notes and Considerations

- **Query Performance:** Use pagination for large result sets. Consider database indexes on frequently queried columns (userId, tags, uploadDate).
- **Tag Filtering Logic:** Choose AND (photos with all tags) or OR (photos with any tag). AND is more restrictive, OR is more inclusive. Document the choice.
- **Download URLs:** Generate URLs on-demand rather than storing them. URLs expire, so generate fresh URLs for each request.
- **Mock Auth:** This is temporary. Keep it simple. Real JWT implementation comes in Phase 8. Mock tokens can be UUIDs stored in a simple map or database.
- **Reactive Queries:** All query handlers must return reactive types. Use `Flux` for lists, `Mono` for single results.
- **Error Handling:** Consistent error responses across all endpoints. Use `@ControllerAdvice` for global exception handling.
- **Next Steps:** Phase 5 will build the web frontend foundation and integrate with these backend APIs.

