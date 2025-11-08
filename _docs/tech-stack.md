# Technology Stack: RapidPhotoUpload

## Overview

This document defines the complete technology stack for the RapidPhotoUpload project. All technology choices have been selected to meet the project requirements for handling 100 concurrent photo uploads, implementing Domain-Driven Design (DDD), CQRS, and Vertical Slice Architecture (VSA), while maintaining high performance and user experience across web and mobile platforms.

**Project Context:**
- High-volume concurrent uploads (up to 100 photos per session)
- Asynchronous, non-blocking architecture
- Real-time progress tracking
- Cross-platform support (web + mobile)
- 5-day development timeline

---

## Backend Stack

### Core Framework
- **Spring Boot 3.x** with **Spring WebFlux** (Reactive)
  - **Rationale:** WebFlux provides non-blocking, reactive programming model essential for handling 100 concurrent uploads efficiently. Uses Project Reactor for reactive streams, enabling better resource utilization and scalability compared to traditional servlet-based Spring MVC.
  - **Key Features:**
    - Reactive streams with `Mono` and `Flux`
    - Non-blocking I/O for database and S3 operations
    - Built-in async support for concurrent request handling

#### Spring WebFlux Best Practices
- **Always return reactive types:** Controllers should return `Mono<T>` or `Flux<T>`, never block on reactive chains
- **Use `flatMap` for sequential operations:** Chain dependent operations with `flatMap`, not `map`
- **Use `zip` for parallel operations:** Combine independent `Mono` operations with `Mono.zip()`
- **Avoid blocking calls:** Never use `.block()` in reactive chains; use `subscribe()` or return reactive types
- **Error handling:** Use `onErrorResume()`, `onErrorReturn()`, or `onErrorMap()` for error handling
- **Backpressure:** Respect backpressure with `Flux` - use `limitRate()` if needed
- **Thread safety:** Reactive code is single-threaded per subscription; don't share mutable state
- **Testing:** Use `StepVerifier` from Project Reactor Test for testing reactive code

#### Spring WebFlux Limitations
- **Learning curve:** Reactive programming requires different mindset than imperative code
- **Debugging complexity:** Stack traces can be harder to read with reactive chains
- **Limited ecosystem:** Not all libraries support reactive programming (may need adapters)
- **Blocking operations:** Any blocking call (JDBC, file I/O) breaks the reactive chain
- **Memory overhead:** Reactive streams have overhead; may not be beneficial for simple CRUD

#### Spring WebFlux Conventions
- **Naming:** Use descriptive names for reactive types: `Mono<Photo>`, `Flux<Photo>`
- **Error handling:** Centralize error handling with `@ControllerAdvice` returning `Mono<ResponseEntity<ErrorResponse>>`
- **Null handling:** Use `Mono.empty()` instead of `null` for empty results
- **Composition:** Prefer composing small reactive functions over large monolithic ones
- **Documentation:** Document reactive chains with comments explaining the flow

#### Spring WebFlux Common Pitfalls
- **Blocking in reactive chain:** Using `.block()`, `Thread.sleep()`, or blocking I/O
- **Subscribing multiple times:** Each subscription creates a new execution; cache with `cache()` if needed
- **Not handling errors:** Missing error handlers can cause silent failures
- **Mixing reactive and blocking:** Using JPA blocking repositories in reactive controllers
- **Infinite streams:** Creating `Flux` that never completes without proper termination
- **Memory leaks:** Not disposing subscriptions or creating unbounded `Flux`
- **Testing without StepVerifier:** Using blocking assertions instead of reactive testing tools

### Database Access
- **Spring Data JPA** with **Hibernate**
  - **Rationale:** Provides rich ORM features and repository pattern, simplifying domain object persistence. Works seamlessly with DDD principles for modeling Photo, Upload Job, and User entities.
  - **Key Features:**
    - Repository abstraction layer
    - Automatic transaction management
    - Entity lifecycle management

#### Spring Data JPA Best Practices
- **Use `@Transactional` correctly:** Place on service layer, not repository layer; use `readOnly=true` for queries
- **Lazy loading:** Use `@OneToMany(fetch = FetchType.LAZY)` to avoid N+1 queries
- **Eager loading:** Only use `EAGER` for associations that are always needed
- **DTO projection:** Use DTOs or projections for read operations to avoid loading entire entities
- **Pagination:** Always use `Pageable` for list queries to prevent loading all records
- **Batch operations:** Use `@BatchSize` or `saveAll()` for bulk inserts/updates
- **Query optimization:** Use `@Query` with native queries for complex operations when needed
- **Entity design:** Keep entities focused on domain logic; avoid anemic domain models
- **Versioning:** Use `@Version` for optimistic locking on entities that may be concurrently modified

#### Spring Data JPA Limitations
- **N+1 query problem:** Lazy loading can cause multiple queries; use `@EntityGraph` or join fetch
- **Performance overhead:** ORM abstraction adds overhead; may need native queries for complex cases
- **Memory usage:** Loading large result sets can consume significant memory
- **Transaction boundaries:** Long-running transactions can hold database connections
- **Reactive support:** JPA is blocking; cannot use directly with WebFlux (need R2DBC for reactive)

#### Spring Data JPA Conventions
- **Repository naming:** Extend `JpaRepository<Entity, ID>` or `CrudRepository<Entity, ID>`
- **Method naming:** Use Spring Data query method naming conventions (`findBy`, `existsBy`, etc.)
- **Entity naming:** Use singular nouns: `Photo`, `User`, `UploadJob`
- **Table naming:** Use plural snake_case: `photos`, `users`, `upload_jobs`
- **ID strategy:** Use `@GeneratedValue(strategy = GenerationType.IDENTITY)` for auto-increment
- **Auditing:** Use `@CreatedDate` and `@LastModifiedDate` for timestamp tracking

#### Spring Data JPA Common Pitfalls
- **N+1 queries:** Accessing lazy-loaded collections in loops without proper fetching
- **Transaction rollback:** Unchecked exceptions cause rollback; catch and handle appropriately
- **Detached entities:** Entities become detached after transaction; merge or refresh when needed
- **Cascade types:** Incorrect `CascadeType` can cause unintended deletions or saves
- **Bidirectional relationships:** Forgetting to set both sides of relationship
- **Query method names:** Typos in method names cause runtime errors; use IDE autocomplete
- **Pagination without sorting:** Results may be inconsistent without explicit sorting
- **Loading too much data:** Fetching entire entity graph when only specific fields needed

### File Upload Strategy
- **Presigned S3 URLs (Direct Client Upload)**
  - **Rationale:** Backend generates presigned URLs, allowing clients to upload directly to S3. This approach:
    - Reduces backend load and bandwidth consumption
    - Enables faster uploads (direct to S3)
    - Better handles 100 concurrent uploads without backend bottleneck
    - Scales more efficiently than proxy uploads
  - **Implementation:** AWS SDK for Java v2 to generate presigned URLs with expiration

#### S3 Presigned URLs Best Practices
- **Expiration time:** Set appropriate expiration (15-60 minutes) based on upload size and network speed
- **Content-Type validation:** Specify allowed content types in presigned URL generation
- **File size limits:** Enforce maximum file size in presigned URL policy
- **Metadata validation:** Validate file metadata (name, size, type) before generating URL
- **Error handling:** Handle S3 upload failures gracefully; provide retry mechanism on client
- **CORS configuration:** Configure S3 bucket CORS properly for web client uploads
- **Bucket policies:** Use IAM policies to restrict presigned URL permissions (PUT only, specific prefix)
- **URL caching:** Cache presigned URLs briefly (1-2 minutes) to reduce backend calls
- **Monitoring:** Track presigned URL generation rate and S3 upload success/failure rates

#### S3 Presigned URLs Limitations
- **Expiration:** URLs expire after set time; large uploads may fail if timeout too short
- **No progress tracking:** Backend cannot track upload progress directly (client must report)
- **Security:** URLs are valid until expiration; cannot revoke individual URLs
- **File validation:** Limited validation before upload; must validate after upload completes
- **Error handling:** S3 errors must be handled client-side; backend only knows after completion
- **Bandwidth:** Client upload speed depends on their connection to S3, not backend

#### S3 Presigned URLs Conventions
- **URL generation:** Generate URLs in service layer, not controller
- **Naming:** Use UUID or timestamp-based naming for S3 keys to avoid collisions
- **Path structure:** Organize files: `{userId}/{year}/{month}/{filename}` or `{userId}/{uploadJobId}/{filename}`
- **Metadata storage:** Store S3 key, bucket name, and upload status in database
- **Error responses:** Return structured error responses for failed URL generation

#### S3 Presigned URLs Common Pitfalls
- **Too short expiration:** Large files fail to upload before URL expires
- **Missing CORS:** Web client blocked by CORS when uploading to S3
- **Insecure bucket policies:** Allowing public access or overly permissive policies
- **Not validating upload completion:** Assuming upload succeeded without confirmation
- **Race conditions:** Multiple clients uploading to same key without proper naming
- **Missing error handling:** Not handling S3 errors (403, 404, 500) on client
- **Not cleaning up failed uploads:** Failed uploads leave partial files in S3
- **Exposing credentials:** Accidentally including AWS credentials in client code

### Authentication & Security
- **Spring Security** with **JWT (JSON Web Tokens)**
  - **Token Strategy:** Access tokens (short-lived, 15 minutes) + Refresh tokens (long-lived)
  - **Storage:** Tokens stored client-side (localStorage for web, secure storage for mobile)
  - **Implementation:** 
    - JWT generation and validation
    - Stateless authentication
    - Token refresh endpoint
  - **Rationale:** Stateless authentication suitable for distributed systems, works seamlessly across web and mobile clients

#### Spring Security + JWT Best Practices
- **Token expiration:** Short-lived access tokens (15 min), longer refresh tokens (7-30 days)
- **Token rotation:** Rotate refresh tokens on each use to prevent token reuse attacks
- **Secure storage:** Use httpOnly cookies for web (if possible) or secure storage for mobile
- **HTTPS only:** Always use HTTPS in production; tokens transmitted over secure connection
- **Token validation:** Validate token signature, expiration, and issuer on every request
- **Blacklisting:** Implement refresh token blacklist for revoked tokens (use Redis or database)
- **Rate limiting:** Limit login and refresh attempts to prevent brute force attacks
- **Claims validation:** Validate user ID, roles, and other claims match current user state
- **Error handling:** Return generic error messages; don't reveal if user exists or not

#### Spring Security + JWT Limitations
- **Token size:** JWTs can be large if many claims included; affects request size
- **Revocation:** Cannot revoke access tokens until expiration; must use short expiration
- **Stateless:** Cannot track active sessions; harder to implement "logout all devices"
- **XSS vulnerability:** localStorage vulnerable to XSS; httpOnly cookies safer but harder with S3 uploads
- **Refresh token storage:** Must securely store refresh tokens; compromise = account takeover
- **Clock skew:** Token validation requires synchronized clocks between servers

#### Spring Security + JWT Conventions
- **Token structure:** Include `sub` (user ID), `exp` (expiration), `iat` (issued at), `iss` (issuer)
- **Naming:** Use `accessToken` and `refreshToken` consistently across codebase
- **Endpoints:** `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- **Headers:** Use `Authorization: Bearer <token>` header format
- **Error codes:** Use consistent error codes: `401 Unauthorized`, `403 Forbidden`

#### Spring Security + JWT Common Pitfalls
- **Storing sensitive data:** Including passwords or sensitive info in JWT claims
- **Not validating expiration:** Forgetting to check `exp` claim
- **Weak secret keys:** Using weak or hardcoded secret keys
- **Token in URL:** Passing tokens in query parameters (logged in server logs)
- **Not handling refresh failures:** Not gracefully handling expired refresh tokens
- **Race conditions:** Multiple refresh requests creating multiple valid tokens
- **Missing CSRF protection:** Not implementing CSRF tokens for state-changing operations
- **Token leakage:** Logging tokens in error messages or stack traces

### API Design
- **RESTful JSON API**
  - **Documentation:** Springdoc OpenAPI (Swagger UI)
  - **Protocol:** HTTP/HTTPS with JSON payloads
  - **File Upload:** Multipart form data for metadata, presigned URLs for actual file uploads
  - **Rationale:** Simple, widely understood, standard HTTP methods for CRUD operations

### Architecture Patterns
- **Domain-Driven Design (DDD):** Core domain objects (Photo, UploadJob, User) with rich domain logic
- **CQRS (Command Query Responsibility Segregation):** Separate command handlers for uploads/mutations and query handlers for reads
- **Vertical Slice Architecture (VSA):** Code organized by features (e.g., `UploadPhotoSlice`, `GetPhotoMetadataSlice`)

---

## Web Frontend Stack

### Core Framework
- **Next.js 14+** (App Router)
  - **Rationale:** 
    - Server-side rendering capabilities for better SEO and performance
    - Built-in routing with file-based structure
    - Production optimizations (code splitting, image optimization)
    - API routes for backend integration
  - **Key Features:**
    - App Router for modern React patterns
    - Server Components and Client Components
    - Built-in TypeScript support

#### Next.js Best Practices
- **Server vs Client Components:** Use Server Components by default; add `'use client'` only when needed (interactivity, hooks, browser APIs)
- **Data fetching:** Use Server Components for data fetching; fetch at component level, not in `useEffect`
- **Image optimization:** Always use `next/image` component instead of `<img>` for automatic optimization
- **Route organization:** Use `app/` directory structure; co-locate components with routes
- **Loading states:** Use `loading.tsx` and `error.tsx` files for route-level loading/error states
- **Metadata:** Use `metadata` export or `generateMetadata` for SEO and social sharing
- **Caching:** Understand Next.js caching (Request Memoization, Data Cache, Full Route Cache)
- **Dynamic routes:** Use `[param]` for dynamic segments, `[...slug]` for catch-all routes
- **API routes:** Use API routes sparingly; prefer Server Actions for mutations

#### Next.js Limitations
- **Vercel lock-in:** Some features optimized for Vercel deployment
- **Learning curve:** App Router is relatively new; different from Pages Router
- **Server Components:** Cannot use hooks, event handlers, or browser APIs
- **Build time:** Large applications can have long build times
- **Hydration:** Client-side hydration can cause layout shifts if not careful
- **File system routing:** Less flexible than programmatic routing for complex cases

#### Next.js Conventions
- **File naming:** Use `page.tsx` for routes, `layout.tsx` for layouts, `loading.tsx` for loading states
- **Component structure:** Co-locate components in route folders: `app/photos/[id]/PhotoDetail.tsx`
- **Exports:** Use named exports for components, default exports for pages/layouts
- **Route groups:** Use `(groupName)` folders for organization without affecting URLs
- **Metadata:** Define metadata in `layout.tsx` or `page.tsx` using `metadata` export

#### Next.js Common Pitfalls
- **Using `useEffect` for data fetching:** Should use Server Components or Server Actions
- **Not marking Client Components:** Forgetting `'use client'` when using hooks or browser APIs
- **Hydration mismatches:** Server-rendered HTML not matching client-rendered HTML
- **Not using Image component:** Missing automatic image optimization and lazy loading
- **Incorrect caching:** Not understanding when data is cached vs revalidated
- **API route overuse:** Using API routes when Server Actions would be better
- **Large bundle sizes:** Not code-splitting or lazy loading heavy components
- **Missing error boundaries:** Not handling errors at route level with `error.tsx`

### Language
- **TypeScript**
  - **Rationale:** Type safety, better developer experience, catches errors at compile time
  - **Strict Mode:** Enabled for maximum type safety

#### TypeScript Best Practices
- **Strict mode:** Enable all strict flags in `tsconfig.json`: `strict`, `noImplicitAny`, `strictNullChecks`
- **Type inference:** Let TypeScript infer types when obvious; explicitly type function parameters and returns
- **Interface vs Type:** Use `interface` for object shapes, `type` for unions, intersections, and computed types
- **Avoid `any`:** Use `unknown` instead of `any` when type is truly unknown; narrow with type guards
- **Utility types:** Leverage built-in utility types: `Partial<T>`, `Pick<T>`, `Omit<T>`, `Record<K, V>`
- **Generic constraints:** Use generic constraints (`extends`) to make generics more specific
- **Type guards:** Create type guard functions for runtime type checking
- **Branded types:** Use branded types for IDs and other primitives that should not be mixed
- **Type assertions:** Minimize use of `as`; prefer type guards or proper typing

#### TypeScript Limitations
- **Runtime behavior:** Types are erased at runtime; cannot use types for runtime logic
- **Learning curve:** Requires understanding of type system, generics, and advanced features
- **Build time:** Type checking adds to build time (mitigated with incremental compilation)
- **Third-party libraries:** Some libraries have poor or missing type definitions
- **Complex types:** Very complex types can be hard to read and maintain
- **Type errors:** Can be cryptic for beginners; requires understanding of type system

#### TypeScript Conventions
- **Naming:** Use PascalCase for types/interfaces, camelCase for variables/functions
- **File organization:** One main type/interface per file, or group related types
- **Type definitions:** Place type definitions near usage or in dedicated `types/` directory
- **Imports:** Use type-only imports when possible: `import type { User } from './types'`
- **Enums:** Prefer const enums or union types over regular enums for better tree-shaking
- **Config:** Use `tsconfig.json` with strict settings; extend base configs when possible

#### TypeScript Common Pitfalls
- **Using `any`:** Defeats purpose of TypeScript; use `unknown` and narrow types
- **Type assertions without validation:** Using `as` without runtime checks
- **Overly complex types:** Creating types that are hard to understand or maintain
- **Not using strict mode:** Missing potential type errors
- **Ignoring type errors:** Using `@ts-ignore` instead of fixing types
- **Mixing `interface` and `type`:** Inconsistent usage across codebase
- **Not typing function returns:** Missing return types can hide errors
- **Circular dependencies:** Creating circular type dependencies between modules

### State Management
- **Zustand** (UI State)
  - **Rationale:** Lightweight, minimal boilerplate, perfect for managing upload progress state, UI state, and navigation state
  - **Use Cases:** Upload queue, selected photos, filter state

#### Zustand Best Practices
- **Store organization:** Create separate stores for different domains (uploadStore, uiStore, filterStore)
- **Selective subscriptions:** Use selectors to prevent unnecessary re-renders: `useStore(state => state.uploadQueue)`
- **Immer integration:** Use `immer` middleware for immutable updates with mutable syntax
- **Persistence:** Use `persist` middleware for state that should survive page reloads
- **DevTools:** Enable Redux DevTools middleware for debugging in development
- **Actions outside components:** Define actions as separate functions, not inside components
- **Type safety:** Use TypeScript with proper store typing for type-safe state access
- **Store splitting:** Split large stores into smaller, focused stores

#### Zustand Limitations
- **No built-in async:** No built-in support for async actions; handle manually or use middleware
- **No time-travel debugging:** Unlike Redux, no built-in time-travel debugging (can use DevTools)
- **Smaller ecosystem:** Fewer middleware options compared to Redux
- **No middleware chain:** Simpler than Redux but less flexible middleware system

#### Zustand Conventions
- **Store naming:** Use camelCase with "Store" suffix: `uploadStore`, `uiStore`
- **Action naming:** Use verb-noun pattern: `addPhoto`, `removePhoto`, `updateProgress`
- **File structure:** One store per file: `stores/uploadStore.ts`
- **Exports:** Export store hook and actions: `export const useUploadStore = create(...)`

#### Zustand Common Pitfalls
- **Not using selectors:** Subscribing to entire store causes unnecessary re-renders
- **Mutating state directly:** Mutating state outside of setState causes issues
- **Creating stores in components:** Stores should be created at module level, not in components
- **Over-using Zustand:** Using for state that could be local component state
- **Not persisting correctly:** Persisting sensitive data or too much data

- **TanStack Query (React Query)** (Server State)
  - **Rationale:** 
    - Automatic caching and refetching
    - Optimistic updates
    - Background synchronization
    - Perfect for photo gallery data, metadata fetching
  - **Use Cases:** Photo list, photo details, tag management, authentication state

#### TanStack Query Best Practices
- **Query keys:** Use consistent, hierarchical query keys: `['photos'], ['photos', id], ['photos', { filter: 'tag' }]`
- **Stale time:** Set appropriate `staleTime` based on data freshness requirements
- **Cache time:** Use `gcTime` (formerly `cacheTime`) to control how long unused data stays in cache
- **Error handling:** Use `onError` in query options or global error handler
- **Loading states:** Use `isLoading`, `isFetching`, `isPending` appropriately for different UI states
- **Optimistic updates:** Use `useMutation` with `onMutate` for optimistic UI updates
- **Parallel queries:** Use `useQueries` or `Promise.all` for parallel data fetching
- **Dependent queries:** Use `enabled` option for queries that depend on other data
- **Refetching:** Use `refetchOnWindowFocus`, `refetchOnReconnect` based on requirements

#### TanStack Query Limitations
- **Learning curve:** Understanding cache behavior and refetch strategies takes time
- **Bundle size:** Adds ~13KB to bundle (gzipped)
- **Server state only:** Not for client-only state (use Zustand or useState)
- **No built-in persistence:** Need to use plugins or manual implementation for persistence
- **Complex invalidation:** Managing query invalidation can be complex in large apps

#### TanStack Query Conventions
- **Hook naming:** Use descriptive names: `usePhotos`, `usePhoto(id)`, `useUpdatePhoto`
- **Query key factories:** Create query key factories for type-safe keys: `photoKeys.all, photoKeys.detail(id)`
- **Mutation naming:** Use verb pattern: `useCreatePhoto`, `useUpdatePhoto`, `useDeletePhoto`
- **Error types:** Define error types for type-safe error handling
- **Query client:** Create single `QueryClient` instance and provide via `QueryClientProvider`

#### TanStack Query Common Pitfalls
- **Incorrect query keys:** Changing query keys unintentionally causes cache misses
- **Not invalidating:** Forgetting to invalidate queries after mutations
- **Over-fetching:** Fetching data that's already in cache
- **Stale closures:** Using stale data in callbacks; use `queryClient.setQueryData` instead
- **Not handling errors:** Not providing error UI or error handling
- **Race conditions:** Multiple mutations updating same resource without proper sequencing
- **Cache pollution:** Not cleaning up unused query data
- **Infinite loops:** Circular dependencies in query invalidation

### File Upload
- **react-dropzone** + Native Fetch API
  - **Rationale:** 
    - Drag-and-drop file selection
    - File validation (size, type)
    - Progress tracking with XMLHttpRequest or fetch streams
    - Lightweight, customizable
  - **Implementation:** Direct upload to S3 using presigned URLs with progress tracking

#### react-dropzone Best Practices
- **File validation:** Use `accept` prop for MIME types and `maxSize` for file size limits
- **Multiple files:** Use `multiple` prop and handle array of files
- **Custom styling:** Use `getRootProps()` and `getInputProps()` for custom UI
- **Error handling:** Handle `onDropRejected` for validation errors
- **Preview:** Generate preview URLs with `URL.createObjectURL()` for images
- **Cleanup:** Revoke object URLs with `URL.revokeObjectURL()` to prevent memory leaks
- **Accessibility:** Ensure dropzone is keyboard accessible and has proper ARIA labels
- **Progress tracking:** Use XMLHttpRequest for upload progress (fetch doesn't support progress)

#### react-dropzone Limitations
- **No built-in progress:** Must implement progress tracking manually with XMLHttpRequest
- **Browser compatibility:** Some older browsers may not support drag-and-drop
- **Mobile support:** Limited drag-and-drop on mobile; relies on file input
- **File size limits:** Browser may have limits on file sizes (varies by browser)

#### react-dropzone Conventions
- **Component structure:** Wrap dropzone in styled container, use `isDragActive` for visual feedback
- **File handling:** Process files immediately in `onDrop` callback
- **Validation messages:** Display clear error messages for rejected files
- **Loading states:** Show loading indicator during file processing

#### react-dropzone Common Pitfalls
- **Not revoking URLs:** Memory leaks from not cleaning up object URLs
- **Missing validation:** Not validating file types or sizes before upload
- **Poor UX:** Not providing visual feedback during drag operations
- **Accessibility issues:** Not making dropzone keyboard accessible
- **Not handling errors:** Not handling file read errors or upload failures
- **Memory issues:** Loading too many large files into memory at once

### UI Component Library
- **Tailwind CSS** + **shadcn/ui**
  - **Rationale:**
    - Utility-first CSS for rapid development
    - shadcn/ui provides copy-paste components (no package dependency)
    - Highly customizable, accessible components
    - Modern, clean design system
  - **Key Features:**
    - Responsive design
    - Dark mode support (optional)
    - Accessible components

#### Tailwind CSS Best Practices
- **Component extraction:** Extract repeated utility patterns into components or `@apply` directives
- **Responsive design:** Use mobile-first approach: `text-sm md:text-base lg:text-lg`
- **Dark mode:** Use `dark:` prefix for dark mode styles; prefer system preference
- **Customization:** Extend theme in `tailwind.config.js` for brand colors and spacing
- **Purge/JIT:** Use JIT mode for faster builds and smaller CSS output
- **Arbitrary values:** Use square brackets for one-off values: `w-[123px]`
- **Plugin usage:** Use official plugins (forms, typography) for common patterns
- **Performance:** Avoid deeply nested selectors; prefer utility classes

#### Tailwind CSS Limitations
- **Learning curve:** Requires learning utility class names and patterns
- **HTML verbosity:** Can make HTML/JSX more verbose with many classes
- **Design system:** Need to establish design system separately (colors, spacing)
- **Dynamic styles:** Harder to apply truly dynamic styles (use CSS variables or inline styles)
- **Bundle size:** Can grow if not properly purged (mitigated with JIT mode)

#### Tailwind CSS Conventions
- **Class ordering:** Use consistent class order (layout, spacing, typography, colors, etc.)
- **Responsive breakpoints:** Use standard breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Color naming:** Use semantic color names: `primary`, `secondary`, `danger`, not `blue-500`
- **Spacing scale:** Use Tailwind spacing scale (4px increments) for consistency
- **Component patterns:** Create reusable component patterns, not just utility classes

#### Tailwind CSS Common Pitfalls
- **Not purging:** Including unused styles in production bundle
- **Inline styles:** Mixing Tailwind with inline styles unnecessarily
- **Over-abstracting:** Creating too many custom components instead of using utilities
- **Not responsive:** Forgetting to make designs responsive
- **Color inconsistency:** Using arbitrary colors instead of theme colors
- **Accessibility:** Forgetting to add focus states and ARIA attributes

#### shadcn/ui Best Practices
- **Copy, don't install:** Copy components to your project; customize as needed
- **Component location:** Place in `components/ui/` directory
- **Customization:** Modify components directly; they're your code
- **Dependencies:** Install required dependencies (Radix UI, class-variance-authority, etc.)
- **Theming:** Use CSS variables for theming; customize in `globals.css`
- **Accessibility:** Components use Radix UI primitives; maintain accessibility when customizing

#### shadcn/ui Limitations
- **No package:** Components are copied, not installed; need to update manually
- **Radix dependency:** Most components depend on Radix UI (adds bundle size)
- **Styling:** Uses Tailwind; need Tailwind setup
- **Customization effort:** Significant customization may require understanding Radix UI

#### shadcn/ui Conventions
- **Component structure:** Follow shadcn component structure and naming
- **Variants:** Use `class-variance-authority` for component variants
- **Composition:** Compose components from Radix UI primitives
- **Styling:** Use Tailwind classes and CSS variables for theming

#### shadcn/ui Common Pitfalls
- **Not customizing:** Using components as-is without adapting to design system
- **Breaking accessibility:** Modifying components in ways that break Radix UI accessibility
- **Not updating:** Forgetting to update copied components when shadcn updates
- **Bundle size:** Not understanding that Radix UI adds to bundle size
- **Over-customization:** Modifying components so much they're unrecognizable

### Routing
- **Next.js App Router** (Built-in)
  - File-based routing
  - Dynamic routes for photo details
  - Layout support for consistent navigation

---

## Mobile Frontend Stack

### Core Framework
- **Expo** (Managed Workflow)
  - **Rationale:**
    - Fast setup, no native code required initially
    - Built-in file picker and camera access
    - Easy OTA updates
    - Simplified deployment process
  - **Key Features:**
    - Expo SDK for native APIs
    - Development build support
    - EAS (Expo Application Services) for builds

#### Expo Best Practices
- **SDK version:** Pin Expo SDK version in `package.json`; upgrade carefully
- **Development builds:** Use development builds for testing native modules before production
- **Config plugins:** Use `app.json` config plugins for native configuration
- **Asset optimization:** Use Expo's asset optimization for images and fonts
- **Environment variables:** Use `.env` files with `expo-constants` for environment config
- **Error handling:** Use Error Boundaries and proper error logging
- **Performance:** Use `expo-dev-client` for development; production builds for release
- **OTA updates:** Use EAS Update for JavaScript-only updates; native changes require new build

#### Expo Limitations
- **Native module restrictions:** Cannot use arbitrary native modules; limited to Expo SDK
- **Ejecting complexity:** Ejecting to bare workflow is one-way and complex
- **Bundle size:** Expo SDK adds to bundle size (mitigated with modern Expo)
- **Build time:** EAS builds can take 10-20 minutes
- **Custom native code:** Requires ejecting or config plugins for complex native features

#### Expo Conventions
- **Project structure:** Use `app/` directory for screens (if using Expo Router) or `screens/` folder
- **Asset organization:** Place assets in `assets/` directory
- **Config:** Use `app.json` or `app.config.js` for Expo configuration
- **Naming:** Use PascalCase for screen components, camelCase for utilities

#### Expo Common Pitfalls
- **Not testing on real devices:** Testing only on simulator/emulator misses device-specific issues
- **Ignoring SDK updates:** Not keeping Expo SDK updated can cause compatibility issues
- **Bundle size:** Not optimizing images and assets increases bundle size
- **Native dependencies:** Adding incompatible native dependencies without checking Expo compatibility
- **Config mistakes:** Incorrect `app.json` configuration causing build failures
- **Not using EAS:** Trying to build locally instead of using EAS Build
- **OTA update issues:** Pushing native changes via OTA update (requires new build)

### Language
- **TypeScript**
  - **Rationale:** Same as web frontend for consistency, type safety across platforms

### Navigation
- **React Navigation v6+**
  - **Rationale:** Industry standard for React Native, supports stack, tab, and drawer navigation
  - **Navigation Types:**
    - Stack Navigator (main navigation)
    - Tab Navigator (optional bottom navigation)
  - **Features:**
    - Deep linking support
    - Type-safe navigation (with TypeScript)

#### React Navigation Best Practices
- **Type safety:** Use TypeScript with navigation types for type-safe navigation
- **Navigation structure:** Use nested navigators appropriately (Stack inside Tab, etc.)
- **Screen options:** Configure screen options at navigator or screen level
- **Deep linking:** Configure deep linking for app URLs and universal links
- **Navigation ref:** Use `navigationRef` for navigation outside React components
- **Performance:** Use `React.memo` for screen components to prevent unnecessary re-renders
- **Header customization:** Customize headers per screen or globally
- **Back handling:** Handle Android back button with `BackHandler` when needed

#### React Navigation Limitations
- **Learning curve:** Navigation structure can be complex for beginners
- **Bundle size:** Adds to bundle size (small, but present)
- **Performance:** Deep navigation stacks can impact performance
- **TypeScript setup:** Type-safe navigation requires proper TypeScript configuration

#### React Navigation Conventions
- **Screen naming:** Use PascalCase for screen names: `PhotoGallery`, `UploadScreen`
- **Param types:** Define param types for each screen: `type PhotoDetailParams = { photoId: string }`
- **Navigator structure:** Organize navigators in `navigation/` directory
- **Route names:** Use consistent route naming: `PhotoGallery`, `PhotoDetail`, `Upload`

#### React Navigation Common Pitfalls
- **Not typing navigation:** Missing TypeScript types for navigation params
- **Navigation loops:** Creating circular navigation that traps users
- **State persistence:** Not handling navigation state persistence on app restart
- **Deep linking:** Not properly configuring deep linking
- **Header issues:** Header not updating when navigating between screens
- **Back button:** Not handling Android back button correctly
- **Performance:** Not optimizing screen components causing slow navigation

### State Management
- **Zustand** + **TanStack Query**
  - **Rationale:** Same as web frontend for consistency and code sharing
  - **Storage:** Zustand with persistence for offline state (optional)

### File Upload
- **expo-image-picker** + **axios** with progress tracking
  - **Rationale:**
    - Native image picker access
    - Camera roll integration
    - Upload progress tracking
    - Works seamlessly with presigned S3 URLs
  - **Implementation:** Direct upload to S3 with progress callbacks

#### expo-image-picker Best Practices
- **Permissions:** Request camera and media library permissions before use
- **Image quality:** Use `quality` option to balance file size and image quality
- **Multiple selection:** Use `allowsMultipleSelection` for batch photo selection
- **Image manipulation:** Use `expo-image-manipulator` for resizing before upload
- **Error handling:** Handle permission denials and picker errors gracefully
- **Memory management:** Dispose of image URIs after use to free memory
- **Platform differences:** Handle iOS and Android differences in picker behavior

#### expo-image-picker Limitations
- **Permissions:** Requires user permission for camera and media library
- **Platform differences:** iOS and Android have different picker UIs and behaviors
- **File size:** Large images can cause memory issues; need to resize
- **Format support:** Limited to formats supported by platform

#### expo-image-picker Conventions
- **Permission handling:** Check permissions before showing picker
- **Error messages:** Provide clear error messages for permission denials
- **Image processing:** Process images (resize, compress) before upload

#### expo-image-picker Common Pitfalls
- **Not requesting permissions:** Assuming permissions are granted
- **Memory issues:** Loading too many large images into memory
- **Not handling errors:** Not handling permission or picker errors
- **Platform assumptions:** Assuming iOS and Android behave identically
- **Not optimizing images:** Uploading full-resolution images when thumbnails would suffice

### UI Components
- **React Native** core components + **Expo** components
  - **Styling:** StyleSheet API or styled-components (optional)
  - **Rationale:** Native performance, platform-specific UI patterns

---

## Infrastructure & Cloud Services

### Cloud Platform
- **Amazon Web Services (AWS)**

### Database
- **Amazon RDS PostgreSQL**
  - **Rationale:**
    - Fully managed service with automated backups
    - Multi-AZ support for high availability
    - Excellent JSON support for flexible metadata storage
    - Scalable instance types
  - **Use Cases:**
    - User accounts
    - Photo metadata (filename, upload date, tags, S3 key)
    - Upload job status tracking

#### RDS PostgreSQL Best Practices
- **Connection pooling:** Use connection pooler (PgBouncer) to manage connections efficiently
- **Backup strategy:** Enable automated backups with appropriate retention period
- **Multi-AZ:** Use Multi-AZ deployment for production high availability
- **Parameter groups:** Create custom parameter groups for optimized PostgreSQL settings
- **Monitoring:** Set up CloudWatch alarms for CPU, memory, connection count, and storage
- **Indexing:** Create appropriate indexes for frequently queried columns
- **VACUUM:** Monitor and tune autovacuum settings for table maintenance
- **Connection limits:** Set appropriate `max_connections` based on instance size
- **SSL/TLS:** Enforce SSL connections for database access

#### RDS PostgreSQL Limitations
- **Cost:** More expensive than self-hosted PostgreSQL
- **Limited customization:** Cannot access underlying OS or install arbitrary software
- **Backup window:** Automated backups may impact performance during backup window
- **Scaling:** Vertical scaling requires downtime; horizontal scaling requires read replicas
- **Version updates:** Major version updates require manual intervention and downtime

#### RDS PostgreSQL Conventions
- **Naming:** Use descriptive names for databases, users, and parameter groups
- **Security groups:** Restrict access to database via security groups (only from application)
- **Credentials:** Store database credentials in AWS Secrets Manager, not code
- **Monitoring:** Use CloudWatch for metrics and logs

#### RDS PostgreSQL Common Pitfalls
- **Connection leaks:** Not properly closing database connections
- **Too many connections:** Exceeding `max_connections` limit
- **No backups:** Forgetting to enable automated backups
- **Public access:** Accidentally making database publicly accessible
- **Weak passwords:** Using weak or default passwords
- **No monitoring:** Not setting up CloudWatch alarms for critical metrics
- **Index bloat:** Not monitoring and maintaining indexes
- **Transaction timeouts:** Long-running transactions blocking other operations

### Object Storage
- **Amazon S3 Standard**
  - **Rationale:**
    - 99.99% availability SLA
    - Lifecycle policies for cost optimization
    - Event notifications (optional for post-upload processing)
    - Presigned URL support for direct client uploads
  - **Bucket Configuration:**
    - Versioning enabled (optional)
    - CORS configured for web client access
    - Lifecycle policies for old file cleanup (optional)

#### S3 Best Practices
- **Bucket naming:** Use globally unique bucket names (S3 bucket names are globally unique)
- **Versioning:** Enable versioning for critical data to prevent accidental deletion
- **Lifecycle policies:** Use lifecycle policies to transition old files to cheaper storage classes
- **CORS configuration:** Configure CORS properly for web client uploads
- **Bucket policies:** Use bucket policies to restrict access; principle of least privilege
- **Encryption:** Enable server-side encryption (SSE-S3 or SSE-KMS)
- **Access logging:** Enable access logging for audit and debugging
- **Key naming:** Use hierarchical key structure: `{userId}/{year}/{month}/{filename}`
- **Multipart upload:** Use multipart upload for files larger than 5MB

#### S3 Limitations
- **Request costs:** Each PUT/GET request has a cost; high-volume operations can be expensive
- **Eventual consistency:** PUT operations have eventual consistency (rarely an issue)
- **File size:** Maximum object size is 5TB; use multipart upload for large files
- **Rate limits:** 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix
- **No file system:** Not a file system; cannot mount or use like traditional storage

#### S3 Conventions
- **Bucket naming:** Use lowercase, no underscores: `rapid-photo-upload-prod`
- **Key structure:** Use forward slashes for "directory" structure
- **Metadata:** Store file metadata in database, not S3 object metadata
- **Error handling:** Handle S3 errors (403, 404, 500) appropriately

#### S3 Common Pitfalls
- **Public access:** Accidentally making bucket or objects publicly accessible
- **CORS misconfiguration:** Incorrect CORS configuration blocking web client uploads
- **Cost overruns:** Not monitoring S3 costs; large files or high request volume
- **No versioning:** Losing data due to accidental deletion without versioning
- **Key collisions:** Not using unique keys causing file overwrites
- **Missing encryption:** Storing sensitive data without encryption
- **No lifecycle policies:** Accumulating old files and increasing storage costs
- **Presigned URL expiration:** URLs expiring before large uploads complete

### Backend Deployment
- **AWS Elastic Beanstalk**
  - **Rationale:**
    - Managed platform (EC2, Load Balancer, Auto Scaling)
    - Easy deployment (JAR upload or Git integration)
    - Built-in monitoring and logging
    - Environment management (dev, staging, prod)
  - **Alternative Considered:** ECS Fargate (more complex, Docker required)

#### Elastic Beanstalk Best Practices
- **Environment configuration:** Use `.ebextensions` for custom configuration
- **Health checks:** Configure proper health check endpoint (`/actuator/health`)
- **Auto scaling:** Configure auto scaling based on CPU, memory, or request count
- **Load balancer:** Use Application Load Balancer for better routing and SSL termination
- **Environment variables:** Store sensitive config in environment properties, not code
- **Deployment strategy:** Use rolling deployments for zero-downtime deployments
- **Logging:** Enable log streaming to CloudWatch for centralized logging
- **Monitoring:** Set up CloudWatch alarms for environment health and metrics

#### Elastic Beanstalk Limitations
- **Platform lock-in:** Tied to AWS; less portable than container-based solutions
- **Limited customization:** Less control than managing EC2 instances directly
- **Deployment time:** Deployments can take 5-10 minutes
- **Cost:** Can be more expensive than managing infrastructure directly
- **Version updates:** Platform updates may require application changes

#### Elastic Beanstalk Common Pitfalls
- **Not configuring health checks:** Application failing health checks causing deployment issues
- **Memory issues:** Not allocating enough memory causing out-of-memory errors
- **Environment variables:** Storing secrets in code instead of environment properties
- **No auto scaling:** Not configuring auto scaling for traffic spikes
- **Deployment failures:** Not monitoring deployment logs for failures
- **Platform version:** Not keeping platform version updated

### Web Frontend Deployment
- **Vercel** (if using Next.js) or **AWS Amplify**
  - **Rationale:**
    - Automatic deployments from Git
    - Global CDN for fast content delivery
    - Preview deployments for pull requests
    - Built-in CI/CD
  - **Alternative Considered:** S3 + CloudFront (more manual setup)

### Mobile App Distribution
- **Expo EAS (Expo Application Services)**
  - **Rationale:**
    - Integrated with Expo workflow
    - Build, submit, and update services
    - OTA updates for JavaScript changes
    - Simplified App Store/Play Store submission
  - **Features:**
    - EAS Build for native builds
    - EAS Submit for store submission
    - EAS Update for OTA updates

---

## DevOps & Development Tools

### CI/CD
- **GitHub Actions**
  - **Rationale:**
    - Integrated with GitHub repositories
    - Free for public repositories
    - Large marketplace of actions
    - Supports Java, Node.js, Docker builds
  - **Workflows:**
    - Backend: Build JAR, run tests, deploy to Elastic Beanstalk
    - Web: Build Next.js app, deploy to Vercel/Amplify
    - Mobile: Build with EAS (optional automation)

### Version Control
- **Git** with **GitHub**
  - Repository structure:
    - `/backend` - Spring Boot application
    - `/web` - Next.js application
    - `/mobile` - Expo/React Native application
    - `/docs` - Documentation

### Testing

#### Backend Testing
- **JUnit 5** (Unit Tests)
- **Mockito** (Mocking)
- **Testcontainers** (Integration Tests)
  - **Rationale:**
    - Testcontainers provides real PostgreSQL and S3 (LocalStack) for integration tests
    - Ensures tests run against actual database and storage, not mocks
    - Validates complete upload flow end-to-end
  - **Test Types:**
    - Unit tests for domain logic
    - Integration tests for API endpoints
    - End-to-end tests for upload flow (client → backend → S3)

#### JUnit 5 Best Practices
- **Test organization:** Use `@DisplayName` for readable test names
- **Assertions:** Use AssertJ or Hamcrest for fluent assertions
- **Test lifecycle:** Use `@BeforeEach` and `@AfterEach` for setup/teardown
- **Parameterized tests:** Use `@ParameterizedTest` for testing multiple inputs
- **Test isolation:** Each test should be independent and not rely on other tests
- **Naming:** Use descriptive test method names: `shouldReturnPhotoWhenIdExists()`

#### Testcontainers Best Practices
- **Container reuse:** Use `@Container` with `REUSABLE` mode for faster tests
- **Database initialization:** Use Flyway or Liquibase for database schema in tests
- **Cleanup:** Ensure containers are properly cleaned up after tests
- **Network isolation:** Use Docker network isolation for test containers
- **Resource management:** Share containers across test classes when possible
- **LocalStack:** Use LocalStack for S3 testing instead of real AWS

#### Testcontainers Limitations
- **Docker requirement:** Requires Docker to be running; CI/CD must have Docker
- **Test speed:** Starting containers adds overhead; slower than unit tests
- **Resource usage:** Containers consume memory and CPU resources
- **Port conflicts:** Need to manage port conflicts when running multiple containers

#### Testcontainers Common Pitfalls
- **Not cleaning up:** Containers not properly stopped causing resource leaks
- **Port conflicts:** Multiple tests trying to use same ports
- **Slow tests:** Not reusing containers causing slow test execution
- **Docker not running:** Tests failing because Docker daemon not running
- **Database state:** Not properly resetting database state between tests

#### Web Frontend Testing
- **Vitest** (Unit/Integration Tests)
  - **Rationale:** Faster than Jest, Vite-native, better ESM support
- **React Testing Library** (Component Tests)
  - **Rationale:** Tests user interactions, not implementation details
- **Playwright** (E2E Tests)
  - **Rationale:** Cross-browser testing, reliable automation

#### Vitest Best Practices
- **Configuration:** Use `vitest.config.ts` for test configuration
- **Coverage:** Use `@vitest/coverage-v8` for code coverage
- **Mocking:** Use Vitest's built-in mocking (`vi.mock()`) instead of external libraries
- **Test files:** Use `.test.ts` or `.spec.ts` suffix for test files
- **Watch mode:** Use watch mode for development: `vitest --watch`
- **Parallel execution:** Tests run in parallel by default; use `describe.sequential()` when needed

#### React Testing Library Best Practices
- **User-centric:** Test from user's perspective, not implementation
- **Queries:** Prefer `getByRole`, `getByLabelText` over `getByTestId`
- **Async:** Use `findBy*` queries for async elements, `waitFor` for complex async
- **User events:** Use `@testing-library/user-event` for user interactions
- **Accessibility:** Tests should verify accessibility (screen readers, keyboard navigation)
- **Avoid:** Don't test implementation details (state, props, internal methods)

#### React Testing Library Common Pitfalls
- **Using `getByTestId`:** Overusing test IDs instead of semantic queries
- **Testing implementation:** Testing component internals instead of behavior
- **Not waiting:** Not properly waiting for async operations
- **Over-mocking:** Mocking too much, reducing test value
- **Accessibility:** Not testing accessibility features

#### Playwright Best Practices
- **Page Object Model:** Use Page Object Model pattern for maintainable tests
- **Selectors:** Prefer stable selectors (data-testid, role, text) over CSS selectors
- **Waiting:** Use auto-waiting; avoid `sleep()` or hard-coded waits
- **Isolation:** Each test runs in isolated browser context
- **Screenshots:** Use screenshots and videos for debugging failed tests
- **Parallel execution:** Run tests in parallel for faster execution

#### Playwright Limitations
- **Browser installation:** Requires browser binaries (handled automatically)
- **Test speed:** E2E tests are slower than unit/integration tests
- **Flakiness:** Can be flaky due to network, timing, or browser issues
- **Maintenance:** Requires maintenance as UI changes

#### Playwright Common Pitfalls
- **Flaky tests:** Not using proper waiting strategies causing flaky tests
- **Hard waits:** Using `page.waitForTimeout()` instead of proper waiting
- **Not isolating:** Tests affecting each other due to shared state
- **Over-testing:** Testing too much in single E2E test
- **No cleanup:** Not cleaning up test data after tests

#### Mobile Testing
- **Jest** (Unit/Integration Tests)
  - **Rationale:** Standard for React Native, works with Expo
- **React Native Testing Library** (Component Tests)
- **Detox** (E2E Tests)
  - **Rationale:** Native E2E testing for iOS and Android simulators

#### Jest (React Native) Best Practices
- **Configuration:** Use `jest.config.js` with React Native preset
- **Mocking:** Mock native modules with `jest.mock()`
- **Async:** Use `async/await` or `.resolves/.rejects` for async tests
- **Snapshots:** Use snapshots sparingly; prefer explicit assertions
- **Coverage:** Use `--coverage` flag for code coverage reports

#### Detox Best Practices
- **Setup:** Properly configure Detox for iOS and Android
- **Matchers:** Use Detox matchers (`by.id`, `by.text`, `by.label`)
- **Actions:** Use Detox actions (`tap()`, `typeText()`, `swipe()`)
- **Synchronization:** Detox auto-synchronizes; avoid manual waits
- **Device selection:** Use `detox build` and `detox test` with device selection

#### Detox Limitations
- **iOS/Android setup:** Requires proper native setup for both platforms
- **Test speed:** E2E tests are slow; use for critical paths only
- **Simulator/Emulator:** Requires running simulators/emulators
- **Flakiness:** Can be flaky due to timing or device issues

#### Detox Common Pitfalls
- **Not waiting:** Not understanding Detox synchronization
- **Wrong matchers:** Using incorrect matchers causing test failures
- **Device issues:** Simulator/emulator not running or misconfigured
- **Build issues:** Not building app before running tests
- **Flaky tests:** Tests failing intermittently due to timing issues

---

## Monitoring & Observability

### Application Monitoring
- **AWS CloudWatch** + **Spring Boot Actuator**
  - **Rationale:**
    - Native AWS integration
    - Metrics, logs, and alarms
    - Cost-effective
    - Spring Boot Actuator provides health checks and metrics endpoints
  - **Metrics:**
    - Upload success/failure rates
    - Upload duration
    - Concurrent upload count
    - API response times

### Error Tracking
- **Sentry**
  - **Rationale:**
    - Real-time error tracking with stack traces
    - Breadcrumbs for debugging
    - Multi-platform support (Java backend, React web, React Native mobile)
    - Release tracking
  - **Integration:**
    - Backend: Sentry Java SDK
    - Web: Sentry React SDK
    - Mobile: Sentry React Native SDK

### Logging
- **SLF4J** with **Logback** (Backend)
  - Structured logging (JSON format)
  - Log levels: DEBUG, INFO, WARN, ERROR
  - Integration with CloudWatch Logs

---

## Key Architectural Decisions

### 1. Reactive Backend (WebFlux)
**Decision:** Use Spring WebFlux instead of traditional Spring MVC

**Rationale:**
- Handles 100 concurrent uploads more efficiently with non-blocking I/O
- Better resource utilization (fewer threads needed)
- Aligns with reactive S3 SDK and R2DBC (if used) for database
- Essential for meeting performance benchmarks (100 photos in 90 seconds)

### 2. Presigned S3 URLs
**Decision:** Clients upload directly to S3 using presigned URLs

**Rationale:**
- Reduces backend bandwidth and processing load
- Faster uploads (direct client-to-S3 connection)
- Backend only handles metadata and URL generation
- Scales better for high-volume concurrent uploads
- Industry standard approach (used by Dropbox, Google Drive, etc.)

### 3. Shared State Management (Web + Mobile)
**Decision:** Use Zustand + TanStack Query for both web and mobile

**Rationale:**
- Code consistency across platforms
- Shared patterns and mental models
- TanStack Query works identically on web and mobile
- Zustand is lightweight and performant on both platforms

### 4. Expo for Mobile
**Decision:** Use Expo managed workflow instead of bare React Native

**Rationale:**
- Faster development and setup
- Built-in file picker and camera access
- Easier deployment with EAS
- Can eject to bare workflow if needed later
- Sufficient for project requirements

### 5. Testcontainers for Integration Tests
**Decision:** Use Testcontainers instead of in-memory H2 database

**Rationale:**
- Tests run against real PostgreSQL (same as production)
- Can test S3 integration with LocalStack
- More realistic test environment
- Catches database-specific issues early
- Required for mandatory integration tests

---

## Development Dependencies

### Backend (Java/Spring Boot)
- Spring Boot 3.x
- Spring WebFlux
- Spring Data JPA
- Spring Security
- AWS SDK for Java v2 (S3)
- PostgreSQL Driver
- JWT libraries (jjwt)
- Springdoc OpenAPI
- Testcontainers
- JUnit 5
- Mockito

### Web Frontend (Next.js/React)
- Next.js 14+
- React 18+
- TypeScript
- Zustand
- TanStack Query
- react-dropzone
- Tailwind CSS
- shadcn/ui components
- Vitest
- React Testing Library
- Playwright

### Mobile Frontend (Expo/React Native)
- Expo SDK (latest)
- React Native
- TypeScript
- React Navigation v6+
- Zustand
- TanStack Query
- expo-image-picker
- axios
- Jest
- React Native Testing Library
- Detox

---

## Performance Considerations

### Backend
- Reactive streams for non-blocking I/O
- Connection pooling for PostgreSQL
- Async processing for metadata updates
- Efficient S3 presigned URL generation (cached if possible)

### Frontend (Web)
- Code splitting with Next.js
- Image optimization (Next.js Image component)
- Lazy loading for photo gallery
- Optimistic UI updates with TanStack Query

### Frontend (Mobile)
- Image caching and optimization
- Lazy loading for gallery
- Background upload processing
- Efficient state management to prevent re-renders

### Infrastructure
- CDN for static assets (Vercel/Amplify)
- S3 transfer acceleration (optional)
- Database connection pooling
- Auto-scaling for backend (Elastic Beanstalk)

---

## Security Considerations

### Authentication
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation
- Secure token storage (localStorage for web, secure storage for mobile)

### API Security
- HTTPS only
- CORS configuration for web client
- JWT validation on all protected endpoints
- Rate limiting (optional, via API Gateway or Spring Security)

### S3 Security
- Presigned URLs with expiration (15 minutes)
- Bucket policies restricting access
- CORS configuration for web client
- IAM roles with least privilege

### Data Protection
- Input validation on all endpoints
- SQL injection prevention (JPA parameterized queries)
- XSS prevention (React's built-in escaping)
- File type validation before upload

---

## Summary

This technology stack has been carefully selected to meet the project requirements:

✅ **High Concurrency:** WebFlux reactive backend handles 100 concurrent uploads  
✅ **Performance:** Presigned S3 URLs enable fast, direct uploads  
✅ **Architecture:** DDD, CQRS, and VSA patterns supported  
✅ **Cross-Platform:** Consistent stack for web and mobile  
✅ **Scalability:** AWS managed services (RDS, S3, Elastic Beanstalk)  
✅ **Testing:** Comprehensive testing strategy with Testcontainers  
✅ **Developer Experience:** Modern tools (Next.js, Expo, TypeScript)  
✅ **Production Ready:** Monitoring, error tracking, CI/CD in place

All technology choices align with industry best practices and are suitable for a production-grade application handling high-volume photo uploads.

