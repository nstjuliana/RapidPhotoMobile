# Project Rules: RapidPhotoUpload

## Overview

This document defines the coding standards, directory structure, file naming conventions, and organizational principles for the RapidPhotoUpload project. These rules are designed to create an **AI-first codebase** that is modular, scalable, and easy to understand for both human developers and AI tools.

**Core Principles:**
- **Modularity:** Code organized into small, focused modules
- **Navigability:** Clear directory structure and descriptive file names
- **Documentation:** Comprehensive inline documentation for all code
- **Size Limits:** Files must not exceed 500 lines to maximize AI tool compatibility
- **Consistency:** Uniform patterns and conventions across all codebases

---

## Directory Structure

### Repository Root Structure

```
RapidPhotoWeb/
├── backend/              # Spring Boot application
├── web/                  # Next.js web application
├── mobile/               # Expo/React Native mobile application
├── _docs/                # Project documentation
│   ├── Project Overview.md
│   ├── user-flow.md
│   ├── tech-stack.md
│   ├── project-rules.md
│   └── phases/           # Phase-specific documentation
├── .gitignore
└── README.md
```

---

## Backend Directory Structure (Spring Boot + WebFlux)

### Overview
The backend follows **Domain-Driven Design (DDD)**, **CQRS**, and **Vertical Slice Architecture (VSA)** principles. Code is organized by feature slices, with clear separation between domain, application, and infrastructure layers.

### Directory Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── rapidphotoupload/
│   │   │           ├── RapidPhotoUploadApplication.java
│   │   │           │
│   │   │           ├── domain/                    # Domain layer (DDD) - Shared
│   │   │           │   ├── photo/
│   │   │           │   │   ├── Photo.java         # Domain entity
│   │   │           │   │   ├── PhotoId.java       # Value object
│   │   │           │   │   └── PhotoRepository.java # Domain repository interface
│   │   │           │   ├── uploadjob/
│   │   │           │   │   ├── UploadJob.java
│   │   │           │   │   ├── UploadJobId.java
│   │   │           │   │   ├── UploadStatus.java  # Enum/Value object
│   │   │           │   │   └── UploadJobRepository.java
│   │   │           │   └── user/
│   │   │           │       ├── User.java
│   │   │           │       ├── UserId.java
│   │   │           │       └── UserRepository.java
│   │   │           │
│   │   │           ├── slices/                    # Vertical Slice Architecture (VSA)
│   │   │           │   ├── upload/                # Upload photo feature slice
│   │   │           │   │   ├── UploadController.java # REST controller
│   │   │           │   │   ├── UploadPhotoCommand.java # Command object
│   │   │           │   │   ├── UploadPhotoCommandHandler.java # Command handler
│   │   │           │   │   ├── GetUploadStatusQuery.java # Query object
│   │   │           │   │   ├── GetUploadStatusQueryHandler.java # Query handler
│   │   │           │   │   ├── UploadRequestDto.java # Request DTO
│   │   │           │   │   ├── UploadResponseDto.java # Response DTO
│   │   │           │   │   ├── UploadStatusDto.java # Status DTO
│   │   │           │   │   ├── UploadFailureDto.java # Failure DTO
│   │   │           │   │   └── UploadPhotoSlice.java # Slice documentation
│   │   │           │   │
│   │   │           │   ├── photo/                 # Photo gallery feature slice
│   │   │           │   │   ├── PhotoController.java
│   │   │           │   │   ├── GetPhotoQuery.java
│   │   │           │   │   ├── GetPhotoQueryHandler.java
│   │   │           │   │   ├── ListPhotosQuery.java
│   │   │           │   │   ├── ListPhotosQueryHandler.java
│   │   │           │   │   ├── PhotoDto.java
│   │   │           │   │   └── PhotoSlice.java
│   │   │           │   │
│   │   │           │   ├── auth/                  # Authentication feature slice
│   │   │           │   │   ├── AuthController.java
│   │   │           │   │   ├── LoginCommand.java
│   │   │           │   │   ├── LoginCommandHandler.java
│   │   │           │   │   ├── ValidateTokenQuery.java
│   │   │           │   │   ├── ValidateTokenQueryHandler.java
│   │   │           │   │   ├── LoginRequestDto.java
│   │   │           │   │   ├── LoginResponseDto.java
│   │   │           │   │   └── AuthSlice.java
│   │   │           │   │
│   │   │           │   └── tag/                   # Tag photo feature slice
│   │   │           │       ├── TagController.java
│   │   │           │       ├── TagPhotoCommand.java
│   │   │           │       ├── TagPhotoCommandHandler.java
│   │   │           │       ├── TagRequestDto.java
│   │   │           │       └── TagPhotoSlice.java
│   │   │           │
│   │   │           ├── infrastructure/            # Infrastructure layer - Shared
│   │   │           │   ├── persistence/           # Database implementation
│   │   │           │   │   ├── jpa/
│   │   │           │   │   │   ├── PhotoJpaRepository.java
│   │   │           │   │   │   ├── PhotoJpaEntity.java
│   │   │           │   │   │   └── PhotoJpaAdapter.java # Adapter pattern
│   │   │           │   │   └── config/
│   │   │           │   │       └── JpaConfig.java
│   │   │           │   │
│   │   │           │   ├── storage/               # S3 storage implementation
│   │   │           │   │   ├── s3/
│   │   │           │   │   │   ├── S3StorageService.java
│   │   │           │   │   │   ├── PresignedUrlGenerator.java
│   │   │           │   │   │   └── S3Config.java
│   │   │           │   │   └── StorageAdapter.java # Interface
│   │   │           │   │
│   │   │           │   ├── security/              # Security implementation
│   │   │           │   │   ├── jwt/
│   │   │           │   │   │   ├── JwtTokenProvider.java
│   │   │           │   │   │   ├── JwtAuthenticationFilter.java
│   │   │           │   │   │   └── SecurityConfig.java
│   │   │           │   │   └── config/
│   │   │           │   │       └── SecurityConfig.java
│   │   │           │   │
│   │   │           │   └── web/                   # Web/API layer - Shared infrastructure
│   │   │           │       ├── controllers/       # Shared controllers (e.g., health, home)
│   │   │           │       │   └── HomeController.java
│   │   │           │       │
│   │   │           │       ├── dto/                # Shared DTOs
│   │   │           │       │   └── ErrorResponseDto.java
│   │   │           │       │
│   │   │           │       └── exceptions/         # Exception handlers
│   │   │           │           └── GlobalExceptionHandler.java
│   │   │           │
│   │   │           └── shared/                    # Shared utilities
│   │   │               ├── exceptions/
│   │   │               ├── validators/
│   │   │               └── utils/
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/                     # Flyway migrations
│   │               └── V1__Initial_schema.sql
│   │
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── rapidphotoupload/
│       │           ├── integration/              # Integration tests
│       │           │   ├── UploadPhotoIntegrationTest.java
│       │           │   └── GetPhotoMetadataIntegrationTest.java
│       │           │
│       │           ├── unit/                      # Unit tests
│       │           │   ├── domain/
│       │           │   │   └── photo/
│       │           │   │       └── PhotoTest.java
│       │           │   └── slices/
│       │           │       └── upload/
│       │           │           └── UploadPhotoCommandHandlerTest.java
│       │           │
│       │           └── fixtures/                  # Test fixtures
│       │               └── PhotoFixtures.java
│       │
│       └── resources/
│           └── application-test.yml
│
├── pom.xml                                        # Maven dependencies
└── README.md
```

### Backend File Naming Conventions

- **Classes:** PascalCase: `PhotoController.java`, `UploadPhotoCommand.java`
- **Interfaces:** PascalCase with descriptive suffix: `PhotoRepository.java`, `StorageAdapter.java`
- **DTOs:** PascalCase with `Dto` suffix: `PhotoDto.java`, `UploadRequestDto.java`
- **Entities:** PascalCase, singular nouns: `Photo.java`, `User.java`, `UploadJob.java`
- **Value Objects:** PascalCase: `PhotoId.java`, `UploadStatus.java`
- **Config Classes:** PascalCase with `Config` suffix: `SecurityConfig.java`, `JpaConfig.java`
- **Test Classes:** PascalCase with `Test` suffix: `PhotoTest.java`, `UploadPhotoIntegrationTest.java`
- **Packages:** lowercase, dot-separated: `com.rapidphotoupload.domain.photo`

### Backend Code Organization Rules

1. **Vertical Slice Architecture (VSA):** 
   - Each feature is organized as a self-contained slice in `slices/{feature}/`
   - Each slice contains: Controller, Commands, Command Handlers, Queries, Query Handlers, DTOs, and documentation
   - All application layer code for a feature lives together in one slice directory
   - No horizontal organization by layer (no separate `application/commands/` or `application/queries/` directories)
   - Domain and infrastructure remain shared across slices (as they should be in DDD)

2. **CQRS Separation:** 
   - Commands (mutations) and queries (reads) are clearly separated within each slice
   - Command handlers handle write operations
   - Query handlers handle read operations
   - Both coexist in the same slice directory

3. **Domain Layer:** 
   - Contains only business logic, no infrastructure dependencies
   - Shared across all slices
   - Defines repository interfaces (implementations in infrastructure)

4. **Application Layer:** 
   - Lives within feature slices (`slices/{feature}/`)
   - Orchestrates domain objects and infrastructure
   - Contains command/query handlers specific to each feature

5. **Infrastructure Layer:** 
   - Implements interfaces defined in domain layer
   - Shared across all slices
   - Contains persistence, storage, security, and web infrastructure

6. **Slice Documentation:** 
   - Each slice should have a `{Feature}Slice.java` class that documents the complete flow
   - This class serves as architectural documentation (no implementation code)

7. **File Size Limit:** No file should exceed 500 lines; split into smaller classes if needed

---

## Web Frontend Directory Structure (Next.js + TypeScript)

### Overview
The web application uses Next.js 14+ with App Router, TypeScript, React, Zustand, TanStack Query, and Tailwind CSS. Code is organized by feature with clear separation of concerns.

### Directory Structure

```
web/
├── app/                                          # Next.js App Router
│   ├── layout.tsx                                # Root layout
│   ├── page.tsx                                  # Home/Gallery page
│   ├── (auth)/                                   # Route group for auth
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                              # Route group for authenticated pages
│   │   ├── layout.tsx                            # Dashboard layout with nav
│   │   ├── gallery/
│   │   │   ├── page.tsx                          # Gallery/Dashboard page
│   │   │   └── components/
│   │   │       ├── PhotoGrid.tsx
│   │   │       ├── PhotoCard.tsx
│   │   │       └── FilterBar.tsx
│   │   │
│   │   ├── upload/
│   │   │   ├── page.tsx                          # Upload page
│   │   │   └── components/
│   │   │       ├── UploadDropzone.tsx
│   │   │       ├── UploadProgress.tsx
│   │   │       └── UploadQueue.tsx
│   │   │
│   │   └── photos/
│   │       └── [id]/
│   │           ├── page.tsx                      # Photo detail page
│   │           └── components/
│   │               └── PhotoDetailView.tsx
│   │
│   ├── api/                                      # API routes (if needed)
│   │   └── health/
│   │       └── route.ts
│   │
│   └── globals.css                               # Global styles
│
├── components/                                   # Shared components
│   ├── ui/                                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── layout/                                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   │
│   ├── features/                                 # Feature-specific components
│   │   ├── photo/
│   │   │   ├── PhotoThumbnail.tsx
│   │   │   ├── PhotoGrid.tsx
│   │   │   └── PhotoTagEditor.tsx
│   │   │
│   │   └── upload/
│   │       ├── FileUploader.tsx
│   │       └── ProgressIndicator.tsx
│   │
│   └── common/                                   # Common reusable components
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── EmptyState.tsx
│
├── lib/                                          # Utilities and configurations
│   ├── api/                                      # API client
│   │   ├── client.ts                             # Axios/fetch client setup
│   │   ├── endpoints.ts                          # API endpoint definitions
│   │   └── types.ts                             # API request/response types
│   │
│   ├── hooks/                                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePhotoUpload.ts
│   │   └── usePhotoGallery.ts
│   │
│   ├── stores/                                   # Zustand stores
│   │   ├── uploadStore.ts
│   │   ├── uiStore.ts
│   │   └── filterStore.ts
│   │
│   ├── queries/                                  # TanStack Query hooks
│   │   ├── photoQueries.ts
│   │   ├── tagQueries.ts
│   │   └── authQueries.ts
│   │
│   ├── utils/                                    # Utility functions
│   │   ├── formatDate.ts
│   │   ├── validateFile.ts
│   │   └── constants.ts
│   │
│   └── types/                                    # TypeScript types
│       ├── photo.ts
│       ├── upload.ts
│       ├── user.ts
│       └── api.ts
│
├── styles/                                       # Additional styles
│   └── components.css                            # Component-specific styles
│
├── public/                                       # Static assets
│   ├── images/
│   └── icons/
│
├── __tests__/                                    # Test files
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── next.config.js                                # Next.js configuration
├── tailwind.config.js                            # Tailwind CSS configuration
├── tsconfig.json                                 # TypeScript configuration
├── package.json
└── README.md
```

### Web Frontend File Naming Conventions

- **React Components:** PascalCase: `PhotoCard.tsx`, `UploadDropzone.tsx`
- **Pages:** `page.tsx` (Next.js convention) or PascalCase: `GalleryPage.tsx`
- **Layouts:** `layout.tsx` (Next.js convention) or PascalCase: `DashboardLayout.tsx`
- **Hooks:** camelCase with `use` prefix: `useAuth.ts`, `usePhotoUpload.ts`
- **Stores:** camelCase with `Store` suffix: `uploadStore.ts`, `uiStore.ts`
- **Utilities:** camelCase: `formatDate.ts`, `validateFile.ts`
- **Types:** camelCase: `photo.ts`, `upload.ts`, `user.ts`
- **Constants:** camelCase: `constants.ts`, `apiEndpoints.ts`
- **Test Files:** Same as source file with `.test.ts` or `.spec.ts`: `PhotoCard.test.tsx`

### Web Frontend Code Organization Rules

1. **Feature-based organization:** Group related components, hooks, and utilities by feature
2. **Co-location:** Keep components close to where they're used when feature-specific
3. **Shared components:** Place truly reusable components in `components/common/`
4. **API layer:** Centralize API calls in `lib/api/`
5. **State management:** Use Zustand for UI state, TanStack Query for server state
6. **Type safety:** Define types in `lib/types/` and import where needed
7. **File Size Limit:** No file should exceed 500 lines; split components or extract logic

---

## Mobile Frontend Directory Structure (Expo + React Native)

### Overview
The mobile application uses Expo (managed workflow), React Native, TypeScript, React Navigation, Zustand, and TanStack Query. Code is organized by feature with screen-based navigation.

### Directory Structure

```
mobile/
├── app/                                          # Expo Router (if using) or screens
│   ├── _layout.tsx                               # Root layout
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   │
│   └── (tabs)/                                   # Tab navigation
│       ├── _layout.tsx
│       ├── gallery.tsx
│       ├── upload.tsx
│       └── profile.tsx
│
├── src/
│   ├── screens/                                  # Screen components (if not using Expo Router)
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   │
│   │   ├── gallery/
│   │   │   ├── GalleryScreen.tsx
│   │   │   └── PhotoDetailScreen.tsx
│   │   │
│   │   └── upload/
│   │       └── UploadScreen.tsx
│   │
│   ├── components/                               # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   │
│   │   ├── photo/
│   │   │   ├── PhotoThumbnail.tsx
│   │   │   ├── PhotoGrid.tsx
│   │   │   └── PhotoTagEditor.tsx
│   │   │
│   │   └── upload/
│   │       ├── ImagePicker.tsx
│   │       └── UploadProgress.tsx
│   │
│   ├── navigation/                               # Navigation configuration
│   │   ├── AppNavigator.tsx                      # Root navigator
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts                              # Navigation types
│   │
│   ├── lib/                                      # Utilities and configurations
│   │   ├── api/                                  # API client
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── hooks/                                # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePhotoUpload.ts
│   │   │   └── usePhotoGallery.ts
│   │   │
│   │   ├── stores/                               # Zustand stores
│   │   │   ├── uploadStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── filterStore.ts
│   │   │
│   │   ├── queries/                              # TanStack Query hooks
│   │   │   ├── photoQueries.ts
│   │   │   ├── tagQueries.ts
│   │   │   └── authQueries.ts
│   │   │
│   │   ├── utils/                                # Utility functions
│   │   │   ├── formatDate.ts
│   │   │   ├── validateFile.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── types/                                 # TypeScript types
│   │       ├── photo.ts
│   │       ├── upload.ts
│   │       ├── user.ts
│   │       └── navigation.ts
│   │
│   └── services/                                 # Service layer
│       ├── storage/
│       │   └── SecureStorage.ts                  # Secure token storage
│       └── permissions/
│           └── PermissionService.ts              # Camera/media permissions
│
├── assets/                                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── __tests__/                                    # Test files
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── app.json                                      # Expo configuration
├── tsconfig.json                                 # TypeScript configuration
├── package.json
└── README.md
```

### Mobile Frontend File Naming Conventions

- **Screen Components:** PascalCase with `Screen` suffix: `GalleryScreen.tsx`, `UploadScreen.tsx`
- **Components:** PascalCase: `PhotoCard.tsx`, `UploadProgress.tsx`
- **Navigators:** PascalCase with `Navigator` suffix: `AppNavigator.tsx`, `AuthNavigator.tsx`
- **Hooks:** camelCase with `use` prefix: `useAuth.ts`, `usePhotoUpload.ts`
- **Stores:** camelCase with `Store` suffix: `uploadStore.ts`, `uiStore.ts`
- **Services:** PascalCase with `Service` suffix: `SecureStorage.ts`, `PermissionService.ts`
- **Utilities:** camelCase: `formatDate.ts`, `validateFile.ts`
- **Types:** camelCase: `photo.ts`, `upload.ts`, `navigation.ts`

### Mobile Frontend Code Organization Rules

1. **Screen-based organization:** Group screens by feature area
2. **Component reusability:** Extract reusable components to `components/`
3. **Navigation types:** Define navigation param types in `navigation/types.ts`
4. **API layer:** Centralize API calls in `lib/api/`
5. **State management:** Use Zustand for UI state, TanStack Query for server state
6. **Platform-specific code:** Use `.ios.tsx` and `.android.tsx` extensions when needed
7. **File Size Limit:** No file should exceed 500 lines; split screens or extract logic

---

## File Documentation Standards

### File Header Documentation

Every file must begin with a header comment explaining its purpose and contents.

#### Java Files (Backend)

```java
/**
 * Photo domain entity representing a user-uploaded photo.
 * 
 * This entity contains the core domain logic for photos, including:
 * - Photo metadata (filename, upload date, tags)
 * - S3 storage key reference
 * - Upload status tracking
 * - Domain validation rules
 * 
 * @author RapidPhotoUpload Team
 * @since 1.0.0
 */
package com.rapidphotoupload.domain.photo;

public class Photo {
    // ...
}
```

#### TypeScript/TSX Files (Frontend)

```typescript
/**
 * PhotoCard Component
 * 
 * Displays a single photo thumbnail in the gallery grid with:
 * - Image preview
 * - Upload date and tags
 * - Click handler for navigation to detail view
 * - Selection state for batch operations
 * 
 * @module components/features/photo
 */

import { Photo } from '@/lib/types/photo';

interface PhotoCardProps {
  photo: Photo;
  onSelect?: (photoId: string) => void;
  isSelected?: boolean;
}

export function PhotoCard({ photo, onSelect, isSelected }: PhotoCardProps) {
  // ...
}
```

### Function Documentation

All functions, methods, and React components must have comprehensive documentation.

#### Java Methods (Backend)

```java
/**
 * Generates a presigned S3 URL for direct client upload.
 * 
 * Creates a time-limited presigned URL that allows the client to upload
 * directly to S3 without passing through the backend. This reduces backend
 * load and enables faster uploads.
 * 
 * @param photoId The unique identifier for the photo
 * @param fileName The original filename of the photo
 * @param contentType The MIME type of the photo (e.g., "image/jpeg")
 * @param expirationMinutes How long the URL should be valid (default: 15)
 * @return Mono containing the presigned URL string
 * @throws IllegalArgumentException if photoId or fileName is null/empty
 * @throws S3Exception if S3 URL generation fails
 */
public Mono<String> generatePresignedUploadUrl(
    PhotoId photoId,
    String fileName,
    String contentType,
    int expirationMinutes
) {
    // Implementation
}
```

#### TypeScript Functions (Frontend)

```typescript
/**
 * Custom hook for managing photo uploads to S3.
 * 
 * Handles the complete upload flow:
 * 1. Requests presigned URL from backend
 * 2. Uploads file directly to S3 using presigned URL
 * 3. Tracks upload progress
 * 4. Reports completion/errors to backend
 * 5. Updates upload store with status
 * 
 * @param file - The file to upload
 * @param tags - Optional tags to apply to the photo
 * @returns Object containing upload state and control functions
 * 
 * @example
 * ```tsx
 * const { upload, isUploading, progress, error } = usePhotoUpload();
 * 
 * const handleUpload = async () => {
 *   await upload(selectedFile, ['vacation', 'beach']);
 * };
 * ```
 */
export function usePhotoUpload() {
  // Implementation
}
```

#### React Components

```typescript
/**
 * PhotoGrid Component
 * 
 * Displays a responsive grid of photo thumbnails with:
 * - Infinite scroll loading
 * - Multi-select support
 * - Filter integration
 * - Empty state handling
 * 
 * @param photos - Array of photo objects to display
 * @param onPhotoClick - Callback when a photo is clicked
 * @param onPhotoSelect - Callback when a photo is selected (multi-select mode)
 * @param isSelectMode - Whether multi-select mode is active
 * @param selectedPhotoIds - Set of selected photo IDs
 * 
 * @example
 * ```tsx
 * <PhotoGrid
 *   photos={photos}
 *   onPhotoClick={(photo) => router.push(`/photos/${photo.id}`)}
 *   onPhotoSelect={handleSelect}
 *   isSelectMode={isSelectMode}
 *   selectedPhotoIds={selectedIds}
 * />
 * ```
 */
export function PhotoGrid({
  photos,
  onPhotoClick,
  onPhotoSelect,
  isSelectMode,
  selectedPhotoIds,
}: PhotoGridProps) {
  // Implementation
}
```

### Documentation Standards Summary

1. **File Headers:** Every file must have a header comment explaining its purpose
2. **Function Documentation:** All public functions must have JSDoc/TSDoc comments
3. **Parameter Documentation:** Document all parameters with types and descriptions
4. **Return Documentation:** Document return types and what the function returns
5. **Example Usage:** Include code examples for complex functions/components
6. **Error Documentation:** Document exceptions/errors that may be thrown
7. **Complex Logic:** Add inline comments for non-obvious logic or algorithms

---

## Code Organization Rules

### General Principles

1. **Single Responsibility:** Each file/class/function should have one clear purpose
2. **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions/utilities
3. **Separation of Concerns:** Keep business logic, UI, and data access separate
4. **Dependency Direction:** Dependencies should point inward (domain ← application ← infrastructure)
5. **Immutability:** Prefer immutable data structures where possible
6. **Type Safety:** Use TypeScript strict mode; avoid `any` types

### File Size Limit

**CRITICAL:** No file should exceed **500 lines** of code (excluding comments and blank lines).

**When a file approaches 500 lines:**
1. Extract related functions into separate utility files
2. Split large components into smaller sub-components
3. Move complex logic into custom hooks (frontend) or service classes (backend)
4. Break large classes into smaller, focused classes
5. Extract types/interfaces into separate type definition files

### Naming Conventions

#### Backend (Java)
- **Classes:** PascalCase: `PhotoController`, `UploadPhotoCommand`
- **Methods:** camelCase: `generatePresignedUrl`, `handleUploadCommand`
- **Variables:** camelCase: `photoId`, `uploadStatus`
- **Constants:** UPPER_SNAKE_CASE: `MAX_UPLOAD_SIZE`, `DEFAULT_EXPIRATION_MINUTES`
- **Packages:** lowercase, dot-separated: `com.rapidphotoupload.domain.photo`

#### Frontend (TypeScript/React)
- **Components:** PascalCase: `PhotoCard`, `UploadDropzone`
- **Functions:** camelCase: `formatDate`, `validateFile`
- **Hooks:** camelCase with `use` prefix: `useAuth`, `usePhotoUpload`
- **Variables:** camelCase: `photoId`, `isUploading`
- **Constants:** UPPER_SNAKE_CASE or camelCase: `MAX_FILE_SIZE`, `apiEndpoints`
- **Types/Interfaces:** PascalCase: `Photo`, `UploadRequest`
- **Files:** Match the primary export (PascalCase for components, camelCase for utilities)

### Import Organization

#### Backend (Java)
```java
// 1. Java standard library
import java.util.List;
import java.util.UUID;

// 2. Third-party libraries
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.RestController;

// 3. Project imports (grouped by package)
import com.rapidphotoupload.domain.photo.Photo;
import com.rapidphotoupload.domain.photo.PhotoRepository;
import com.rapidphotoupload.application.commands.upload.UploadPhotoCommand;
```

#### Frontend (TypeScript)
```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { useUploadStore } from '@/lib/stores/uploadStore';

// 3. Internal utilities and types
import { formatDate } from '@/lib/utils/formatDate';
import { Photo } from '@/lib/types/photo';

// 4. Components
import { PhotoCard } from '@/components/features/photo/PhotoCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
```

### Code Style Guidelines

#### Backend (Java)
- Use 4 spaces for indentation
- Use meaningful variable names with full words (avoid abbreviations)
- Prefer composition over inheritance
- Use reactive types (`Mono`, `Flux`) consistently in WebFlux code
- Avoid blocking operations in reactive chains
- Use `Optional` for nullable return values (when not using reactive types)

#### Frontend (TypeScript/React)
- Use 2 spaces for indentation
- Use functional components and hooks (avoid class components)
- Prefer `const` over `let`; avoid `var`
- Use arrow functions for component definitions and callbacks
- Destructure props at function signature
- Use early returns for conditional rendering
- Prefer named exports over default exports (except for pages/layouts)

---

## Architecture Patterns

### Backend Architecture

#### Domain-Driven Design (DDD)
- **Domain Layer:** Contains business logic, entities, value objects, and domain services
- **No Infrastructure Dependencies:** Domain layer should not depend on infrastructure
- **Rich Domain Models:** Entities contain business logic, not just data
- **Value Objects:** Use value objects for IDs and other domain concepts

#### CQRS (Command Query Responsibility Segregation)
- **Commands:** Handle mutations (create, update, delete) within feature slices (`slices/{feature}/`)
- **Queries:** Handle reads within feature slices (`slices/{feature}/`)
- **Co-location:** Commands and queries for a feature live together in the same slice directory
- **Separate Models:** Commands and queries can have different data models
- **Optimized Reads:** Queries can bypass domain layer for performance

#### Vertical Slice Architecture (VSA)
- **Feature Slices:** Each feature is organized in `slices/{feature}/` directory
- **Self-Contained:** Each slice contains Controller, Commands, Queries, DTOs, and documentation
- **Co-location:** All application layer code for a feature lives together in one slice
- **Shared Layers:** Domain and infrastructure remain shared across slices (as per DDD principles)
- **No Horizontal Layers:** Avoid organizing by technical layers (no `application/commands/` or `application/queries/` directories)
- **Slice Documentation:** Each slice includes a `{Feature}Slice.java` class documenting the complete flow

### Frontend Architecture

#### Component Architecture
- **Atomic Design:** Build components from smallest (atoms) to largest (pages)
- **Feature Components:** Group components by feature when they're feature-specific
- **Shared Components:** Place truly reusable components in `components/common/`
- **Container/Presentational:** Separate data fetching (containers) from presentation (components)

#### State Management
- **Zustand:** Use for UI state (upload queue, selected items, filters)
- **TanStack Query:** Use for server state (API data, caching, synchronization)
- **Local State:** Use `useState` for component-specific state that doesn't need sharing

#### Data Fetching
- **TanStack Query Hooks:** Centralize API calls in `lib/queries/`
- **Custom Hooks:** Extract complex data fetching logic into custom hooks
- **Optimistic Updates:** Use TanStack Query's optimistic update features

---

## Testing Standards

### Test File Organization

- **Co-location:** Place test files next to source files or in `__tests__/` directories
- **Naming:** Test files should match source files with `.test.ts` or `.spec.ts` suffix
- **Structure:** Mirror source directory structure in test directories

### Test Documentation

All test files and test cases should be documented:

```typescript
/**
 * Tests for PhotoCard component.
 * 
 * Covers:
 * - Rendering photo thumbnail and metadata
 * - Click handling and navigation
 * - Selection state in multi-select mode
 * - Empty state handling
 */
describe('PhotoCard', () => {
  /**
   * Verifies that photo thumbnail and metadata are displayed correctly.
   */
  it('should render photo thumbnail and metadata', () => {
    // Test implementation
  });
});
```

---

## Git and Version Control

### Branch Naming
- **Feature branches:** `feature/upload-photo-progress`
- **Bug fixes:** `fix/presigned-url-expiration`
- **Hotfixes:** `hotfix/security-token-leak`
- **Refactoring:** `refactor/extract-upload-service`

### Commit Messages
- Use conventional commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat(upload): add progress tracking for S3 uploads`
  - `fix(auth): handle expired refresh tokens`
  - `refactor(photo): extract PhotoService from PhotoController`

---

## AI Tool Compatibility

### File Size
- **Maximum 500 lines per file** to ensure AI tools can process entire files
- Split large files into smaller, focused modules

### Code Clarity
- **Descriptive names:** Use full words, avoid abbreviations
- **Clear structure:** Organize code logically with clear sections
- **Comments:** Document complex logic and non-obvious decisions
- **Type safety:** Use TypeScript strict mode; avoid `any`

### Documentation
- **File headers:** Explain file purpose and contents
- **Function docs:** Document all public functions with JSDoc/TSDoc
- **Inline comments:** Explain "why" not "what" (code should be self-explanatory)

### Modularity
- **Small modules:** Keep files focused on single responsibility
- **Clear boundaries:** Use interfaces and types to define module boundaries
- **Dependency injection:** Make dependencies explicit and testable

---

## Summary Checklist

Before committing code, ensure:

- [ ] File does not exceed 500 lines
- [ ] File has descriptive header comment
- [ ] All functions have JSDoc/TSDoc documentation
- [ ] File follows naming conventions
- [ ] Code follows architecture patterns (DDD, CQRS, VSA for backend)
- [ ] Imports are organized correctly
- [ ] No `any` types (TypeScript) or raw types (Java)
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Code is formatted consistently

---

This document should be referenced regularly during development to ensure consistency and maintainability across the entire codebase.

