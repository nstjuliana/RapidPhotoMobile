# Phase 3: Backend Upload Flow

## Goal

Implement the complete photo upload flow using CQRS command pattern. This phase creates the upload command handler, presigned URL generation, upload status tracking, and the REST API endpoint for initiating uploads. The system will support concurrent uploads with proper status tracking.

## Deliverables

- Upload command and command handler (CQRS)
- Presigned URL generation service
- Upload status tracking and persistence
- Upload completion callback/webhook endpoint
- REST API endpoint for upload initiation
- Upload status query endpoint
- Complete vertical slice for upload feature

## Prerequisites

- Phase 2 completed (domain layer, database, S3 service)
- Domain entities and repositories working
- S3 storage service functional
- Understanding of CQRS command pattern

## Features

### 1. Upload Command and DTOs

**Goal:** Define the upload command structure and data transfer objects for the upload API.

**Steps:**
1. Create `UploadPhotoCommand` in `slices/upload/UploadPhotoCommand.java`:
   - Fields: userId (UserId), filename (String), contentType (String), fileSize (Long), tags (Set<String>)
   - Validation logic for filename, file size limits, content type
2. Create `UploadRequestDto` in `slices/upload/UploadRequestDto.java`:
   - Fields: filename, contentType, fileSize, tags (optional)
   - JSON serialization annotations
   - Validation annotations (@NotNull, @Size, etc.)
3. Create `UploadResponseDto` with: photoId, presignedUrl, expirationTime
4. Create `UploadStatusDto` for status responses: photoId, status, progress (optional)

**Success Criteria:**
- Command object encapsulates upload request data
- DTOs properly serialize/deserialize JSON
- Validation annotations prevent invalid requests
- Command separates API concerns from domain logic

---

### 2. Presigned URL Generation Service

**Goal:** Implement service that generates presigned S3 URLs for direct client uploads.

**Steps:**
1. Enhance `S3StorageService` with `generatePresignedUploadUrl()` method:
   - Parameters: photoId, filename, contentType, expirationMinutes (default 15)
   - Uses AWS SDK `PresignedRequest` for PUT operations
   - Sets content-type and content-length in presigned URL policy
   - Returns Mono<String> with presigned URL
2. Create S3 key structure: `{userId}/{year}/{month}/{photoId}-{filename}`
3. Handle S3 exceptions and convert to domain exceptions
4. Add logging for presigned URL generation (without exposing full URL in logs)
5. Test presigned URL generation returns valid, expiring URLs

**Success Criteria:**
- Presigned URLs generated successfully
- URLs expire after configured time
- S3 key structure organized by user and date
- Error handling covers S3 failures gracefully

---

### 3. Upload Command Handler

**Goal:** Implement CQRS command handler that orchestrates the upload flow.

**Steps:**
1. Create `UploadPhotoCommandHandler` in `slices/upload/UploadPhotoCommandHandler.java`:
   - Implements command handler pattern
   - Dependencies: PhotoRepository, UploadJobRepository, StorageAdapter
   - Returns Mono<UploadResponseDto>
2. Handler logic:
   - Validate command (file size, content type, user exists)
   - Create Photo domain object with PENDING status
   - Generate presigned URL using StorageAdapter
   - Save Photo to repository
   - Create/update UploadJob for batch tracking
   - Return UploadResponseDto with presigned URL
3. Handle errors: convert domain exceptions to appropriate HTTP status codes
4. Use reactive types throughout (Mono, Flux) - no blocking operations
5. Add transaction management (@Transactional) if needed (note: reactive transactions require R2DBC)

**Success Criteria:**
- Command handler processes upload requests reactively
- Photo entity created and persisted
- Presigned URL generated and returned
- UploadJob tracks batch status
- Error handling provides meaningful feedback

---

### 4. Upload Status Tracking

**Goal:** Implement upload status persistence and querying.

**Steps:**
1. Enhance `Photo` entity with status update methods:
   - `markAsUploading()`, `markAsCompleted()`, `markAsFailed(String reason)`
2. Create query handler `GetUploadStatusQuery` and `GetUploadStatusQueryHandler`:
   - Query by photoId or uploadJobId
   - Returns current status, progress (if available), error message (if failed)
3. Create `UploadStatusQueryDto` for status response
4. Implement status update endpoint (called by client after S3 upload completes):
   - Endpoint: `POST /api/uploads/{photoId}/complete`
   - Updates Photo status to COMPLETED
   - Validates S3 object exists before marking complete
5. Handle failed uploads: client can report failures, status updated to FAILED

**Success Criteria:**
- Upload status persisted in database
- Status queries return current state
- Status updates work correctly
- Failed uploads tracked with error messages

---

### 5. Upload REST API Endpoints

**Goal:** Create REST controllers for upload initiation and status tracking.

**Steps:**
1. Create `UploadController` in `slices/upload/UploadController.java`:
   - `POST /api/uploads` - Initiate upload (returns presigned URL)
   - `GET /api/uploads/{photoId}/status` - Get upload status
   - `POST /api/uploads/{photoId}/complete` - Report upload completion
   - `POST /api/uploads/{photoId}/fail` - Report upload failure
2. Use Spring WebFlux reactive types:
   - Return `Mono<ResponseEntity<UploadResponseDto>>`
   - Use `@RequestBody Mono<UploadRequestDto>` for request body
3. Add request validation using `@Valid` annotation
4. Add error handling using `@ExceptionHandler` or `@ControllerAdvice`
5. Configure CORS for web client (allow origin, methods, headers)

**Success Criteria:**
- REST endpoints return reactive types
- Request validation works correctly
- CORS configured for web client
- Error responses formatted consistently
- Endpoints follow RESTful conventions

---

### 6. Upload Vertical Slice Integration

**Goal:** Integrate all upload components into a complete vertical slice.

**Steps:**
1. Create `UploadPhotoSlice` class/documentation showing complete flow:
   - Command → Handler → Domain → Repository → Infrastructure
   - Demonstrates VSA pattern (all layers in one feature)
2. Wire components together using Spring dependency injection:
   - Register command handler as Spring bean
   - Inject repositories and services
   - Configure controller to use command handler
3. Test complete flow:
   - Request presigned URL → Generate URL → Client uploads → Report completion → Status updated
4. Add logging at key points in the flow
5. Document the upload slice architecture

**Success Criteria:**
- Complete upload flow works end-to-end
- All components integrated via dependency injection
- Vertical slice demonstrates VSA pattern
- Flow handles errors gracefully
- Architecture documented

## Success Criteria (Phase Completion)

- ✅ Upload command handler processes requests reactively
- ✅ Presigned URLs generated and returned to clients
- ✅ Upload status tracked and queryable
- ✅ REST API endpoints functional
- ✅ Complete upload flow works end-to-end
- ✅ Error handling covers all failure scenarios
- ✅ Vertical slice architecture demonstrated

## Notes and Considerations

- **Reactive Programming:** All operations must be non-blocking. Use `Mono` and `Flux` consistently. Avoid `.block()` calls.
- **Presigned URL Expiration:** Set expiration to 15-60 minutes. Large files may need longer expiration.
- **Status Updates:** Client reports completion after S3 upload. Backend validates S3 object exists before marking complete.
- **Concurrent Uploads:** System must handle 100 concurrent uploads. Ensure thread pool and connection pool sizes accommodate this.
- **S3 Key Structure:** Organize files by user and date for easier management and potential lifecycle policies.
- **Error Handling:** Distinguish between client errors (400), server errors (500), and S3 errors (503).
- **Next Steps:** Phase 4 will add query handlers for retrieving photos and implement mock authentication.

