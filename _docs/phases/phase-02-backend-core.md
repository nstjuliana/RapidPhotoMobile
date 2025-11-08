# Phase 2: Backend Core

## Goal

Implement the core domain layer following Domain-Driven Design (DDD) principles, establish database schema with migrations, and set up the foundational infrastructure adapters. This phase creates the domain entities, value objects, and repository interfaces that form the backbone of the application architecture.

## Deliverables

- Domain entities (Photo, UploadJob, User) with rich domain logic
- Value objects (PhotoId, UploadJobId, UserId, UploadStatus)
- Domain repository interfaces
- Database schema with Flyway migrations
- JPA entity mappings and adapters
- S3 storage service interface and basic implementation
- Application structure following DDD/CQRS/VSA patterns

## Prerequisites

- Phase 1 completed (infrastructure setup)
- Database connection working
- S3 bucket configured
- Understanding of DDD, CQRS, and VSA principles

## Features

### 1. Domain Entities and Value Objects

**Goal:** Create core domain entities with rich domain logic and value objects for type safety.

**Steps:**
1. Create `PhotoId` value object in `domain/photo/PhotoId.java`:
   - Wraps UUID with validation
   - Implements equals/hashCode
   - Immutable design
2. Create `Photo` domain entity in `domain/photo/Photo.java`:
   - Fields: id (PhotoId), userId (UserId), filename, s3Key, uploadDate, tags (Set<String>), status
   - Domain validation methods (e.g., `validateFilename()`)
   - Business logic methods (e.g., `addTag()`, `removeTag()`)
   - No JPA annotations (pure domain)
3. Create `UploadJobId` and `UploadJob` entity following same pattern
4. Create `UserId` value object and `User` entity (minimal for now)
5. Create `UploadStatus` enum: PENDING, UPLOADING, COMPLETED, FAILED

**Success Criteria:**
- All domain entities compile without infrastructure dependencies
- Value objects enforce type safety and immutability
- Domain logic methods validate business rules
- Entities follow DDD principles (rich domain models, not anemic)

---

### 2. Domain Repository Interfaces

**Goal:** Define repository interfaces in domain layer without implementation details.

**Steps:**
1. Create `PhotoRepository` interface in `domain/photo/PhotoRepository.java`:
   - Methods: `save(Photo)`, `findById(PhotoId)`, `findByUserId(UserId)`, `findAll()`
   - Returns domain objects, not JPA entities
   - Reactive return types (`Mono<Photo>`, `Flux<Photo>`) for WebFlux compatibility
2. Create `UploadJobRepository` interface with similar pattern
3. Create `UserRepository` interface (minimal for now)
4. Ensure interfaces are in domain package, no infrastructure imports

**Success Criteria:**
- Repository interfaces defined in domain layer
- Methods use domain objects (Photo, PhotoId) not infrastructure types
- Reactive types (Mono/Flux) used for async operations
- No JPA or infrastructure dependencies in domain layer

---

### 3. Database Schema and Migrations

**Goal:** Create database schema using Flyway migrations for version control.

**Steps:**
1. Add Flyway dependency to `pom.xml`
2. Create `resources/db/migration/` directory
3. Create `V1__Initial_schema.sql` migration with:
   - `users` table: id (UUID), email, password_hash, created_at, updated_at
   - `photos` table: id (UUID), user_id (FK), filename, s3_key, upload_date, status, created_at, updated_at
   - `upload_jobs` table: id (UUID), user_id (FK), status, total_files, completed_files, created_at, updated_at
   - `photo_tags` junction table: photo_id (FK), tag (VARCHAR)
   - Appropriate indexes on foreign keys and frequently queried columns
4. Configure Flyway in `application.yml` to run migrations on startup
5. Verify migrations run successfully and tables created

**Success Criteria:**
- Database schema created with all required tables
- Foreign key relationships properly defined
- Indexes created for performance
- Flyway migrations run automatically on application startup
- Schema matches domain model structure

---

### 4. JPA Entity Mappings

**Goal:** Create JPA entity classes that map to database tables and adapt to domain objects.

**Steps:**
1. Create `PhotoJpaEntity` in `infrastructure/persistence/jpa/PhotoJpaEntity.java`:
   - JPA annotations (@Entity, @Table, @Id, @Column)
   - Maps to `photos` table
   - Includes JPA-specific fields (created_at, updated_at)
2. Create `PhotoJpaRepository` extending `JpaRepository<PhotoJpaEntity, UUID>`
3. Create `PhotoJpaAdapter` implementing `PhotoRepository`:
   - Converts between `PhotoJpaEntity` and `Photo` domain object
   - Implements repository methods using JPA repository
   - Handles reactive conversion (blocking JPA to reactive Mono/Flux)
4. Repeat for `UploadJobJpaEntity` and `UserJpaEntity`
5. Configure JPA in `application.yml` (dialect, ddl-auto: validate)

**Success Criteria:**
- JPA entities map correctly to database tables
- Adapters convert between JPA entities and domain objects
- Repository implementations use reactive types
- JPA configuration validates schema matches entities

---

### 5. S3 Storage Service Interface

**Goal:** Define storage service interface in domain/infrastructure boundary and basic implementation.

**Steps:**
1. Create `StorageAdapter` interface in `infrastructure/storage/StorageAdapter.java`:
   - Methods: `generatePresignedUploadUrl()`, `generatePresignedDownloadUrl()`, `deleteObject()`
   - Returns reactive types (Mono<String> for URLs)
2. Create `S3StorageService` implementing `StorageAdapter`:
   - Uses AWS SDK v2 for Java
   - Configures S3 client with credentials from environment
   - Implements presigned URL generation (PUT for upload, GET for download)
   - Handles S3 exceptions and converts to domain exceptions
3. Create `S3Config` class for S3 client bean configuration
4. Test S3 connection by generating a test presigned URL (verify URL format)

**Success Criteria:**
- Storage interface defined with reactive return types
- S3 service generates valid presigned URLs
- S3 client configured correctly with credentials
- Error handling converts S3 exceptions appropriately

---

### 6. Application Structure Organization

**Goal:** Organize codebase following Vertical Slice Architecture (VSA) and CQRS patterns.

**Steps:**
1. Create `slices/` directory for feature-based organization:
   - Each feature will have its own slice directory: `slices/{feature}/`
   - Each slice contains: Controller, Commands, Queries, DTOs, and documentation
2. Create placeholder directories for future slices:
   - `slices/upload/` (will contain upload controller, commands, queries, DTOs)
   - `slices/photo/` (will contain photo controller, queries, DTOs)
   - `slices/tag/` (will contain tag controller, commands, DTOs)
   - `slices/auth/` (will contain auth controller, commands, queries, DTOs)
3. Create `shared/` directory for shared utilities and exceptions
4. Ensure clear separation: domain → application (in slices) → infrastructure
5. Document architecture in code comments and README

**Success Criteria:**
- Directory structure follows VSA pattern (slices organized by feature)
- Clear separation between domain, application (in slices), and infrastructure layers
- Code organization supports feature-based development
- Architecture documented and understandable

## Success Criteria (Phase Completion)

- ✅ Domain entities created with business logic
- ✅ Value objects enforce type safety
- ✅ Database schema created and migrated
- ✅ JPA entities and adapters map domain to database
- ✅ S3 storage service interface and implementation working
- ✅ Application structure follows DDD/CQRS/VSA patterns
- ✅ All components compile and integrate successfully

## Notes and Considerations

- **Domain Purity:** Keep domain layer free of infrastructure dependencies. Use dependency inversion (interfaces in domain, implementations in infrastructure).
- **Reactive Conversion:** JPA is blocking, but we need reactive types. Use `Mono.fromCallable()` or `Schedulers.boundedElastic()` to convert blocking operations.
- **Value Objects:** Use value objects for IDs to prevent primitive obsession and add type safety.
- **Migrations:** Always use Flyway for schema changes. Never rely on JPA auto-DDL in production.
- **S3 URLs:** Presigned URLs expire. Set appropriate expiration times (15-60 minutes) based on use case.
- **Next Steps:** Phase 3 will implement the upload command handler using these domain objects and infrastructure services.

