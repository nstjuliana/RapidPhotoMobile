# Phase 10: Mobile Foundation

## Goal

Establish the mobile application foundation using Expo (managed workflow), Expo Router for file-based routing, state management, JWT authentication flow, and API client setup. This phase creates the scaffolding for the mobile app that mirrors the web application functionality.

## Deliverables

- Expo project initialized and configured with Expo Router
- File-based routing structure using Expo Router
- Zustand and TanStack Query configured
- JWT authentication screens and flow
- API client setup for backend integration
- Basic navigation structure with layouts
- Development environment ready

## Prerequisites

- Phase 9 completed (web JWT authentication working)
- Backend API fully functional with JWT
- Expo CLI installed
- iOS Simulator or Android Emulator (or physical device)

## Features

### 1. Expo Project Initialization

**Goal:** Set up Expo project with TypeScript and essential configuration.

**Steps:**
1. Initialize Expo project in `mobile/` directory:
   - Use `npx create-expo-app` with TypeScript template
   - Configure `app.json` with app metadata
   - Set up project structure following mobile conventions
2. Configure TypeScript:
   - `tsconfig.json` with strict mode
   - Path aliases (@/ for src directory)
   - Type definitions for React Native
3. Install core dependencies:
   - `expo-router` for file-based routing
   - Zustand, TanStack Query
   - Axios for API calls
   - Secure storage for tokens (`expo-secure-store`)
4. Configure Expo SDK:
   - Set SDK version in `package.json`
   - Configure `app.json` with required permissions
   - Set up development build configuration
5. Test project runs:
   - Start Expo dev server
   - Run on iOS simulator or Android emulator
   - Verify basic app displays

**Success Criteria:**
- Expo project initialized successfully
- TypeScript configured correctly
- Dependencies installed
- App runs on simulator/emulator
- Project structure organized

---

### 2. Expo Router Setup

**Goal:** Configure file-based routing structure using Expo Router.

**Steps:**
1. Install Expo Router dependencies:
   - `expo-router` (includes React Navigation under the hood)
   - `react-native-screens`, `react-native-safe-area-context` (peer dependencies)
2. Configure Expo Router:
   - Update `app.json` to use Expo Router entry point
   - Set `scheme` for deep linking
   - Configure `expo-router` in `package.json`
3. Create file-based routing structure:
   - `app/_layout.tsx` - Root layout with providers
   - `app/(auth)/login.tsx` - Login screen
   - `app/(auth)/signup.tsx` - Signup screen
   - `app/(tabs)/_layout.tsx` - Tab navigator layout
   - `app/(tabs)/gallery.tsx` - Gallery screen
   - `app/(tabs)/upload.tsx` - Upload screen
   - `app/gallery/[id].tsx` - Photo detail screen (dynamic route)
4. Configure layouts and groups:
   - Use route groups `(auth)` and `(tabs)` for organization
   - Create stack layouts for nested navigation
   - Configure tab bar styling and options
5. Set up navigation utilities:
   - Use `useRouter()`, `usePathname()`, `useSegments()` hooks
   - Type-safe navigation with TypeScript
   - Handle deep linking configuration
6. Test navigation:
   - Navigate between screens using `router.push()`
   - Test deep linking
   - Verify file-based routing works correctly

**Success Criteria:**
- Expo Router configured and working
- File-based routing structure created
- Layouts and groups organized properly
- Navigation hooks work correctly
- Deep linking configured (if implemented)

---

### 3. State Management Setup

**Goal:** Configure Zustand and TanStack Query for mobile app state management.

**Steps:**
1. Install state management dependencies:
   - `zustand` for UI state
   - `@tanstack/react-query` for server state
2. Create Zustand stores:
   - `src/lib/stores/uploadStore.ts` - Upload queue management
   - `src/lib/stores/uiStore.ts` - UI state (filters, selection)
   - `src/lib/stores/authStore.ts` - Authentication state
3. Configure TanStack Query:
   - `src/lib/queries/queryClient.ts` - QueryClient configuration
   - Wrap app with QueryClientProvider in `app/_layout.tsx`
   - Configure default options (staleTime, cacheTime)
4. Create query key factories:
   - `src/lib/queries/keys.ts` - Consistent query keys
   - Photo queries, auth queries, tag queries
5. Test state management:
   - Stores update correctly
   - Queries fetch data
   - State persists appropriately

**Success Criteria:**
- Zustand stores created and functional
- TanStack Query configured
- Query keys organized consistently
- State management ready for features
- Providers wrap app correctly

---

### 4. API Client Configuration

**Goal:** Set up API client for backend communication with JWT authentication.

**Steps:**
1. Create `src/lib/api/client.ts`:
   - Configure axios with base URL
   - Request interceptor: add Authorization header
   - Response interceptor: handle 401, token refresh
2. Create API endpoints:
   - `src/lib/api/endpoints.ts` - Endpoint constants and functions
   - Match web API client structure
3. Create API types:
   - `src/lib/api/types.ts` - TypeScript types matching backend DTOs
   - Request/response types
4. Implement secure token storage:
   - Use `expo-secure-store` for token storage
   - Store access and refresh tokens securely
   - Retrieve tokens for API calls
5. Test API client:
   - Health check endpoint works
   - Authentication headers added
   - Token refresh works
   - Error handling correct

**Success Criteria:**
- API client configured with base URL
- Authentication headers added automatically
- Secure token storage implemented
- Token refresh works
- Error handling covers failures

---

### 5. Authentication Screens

**Goal:** Create login and signup screens with JWT authentication flow using Expo Router.

**Steps:**
1. Create `app/(auth)/login.tsx`:
   - Email and password input fields
   - Login button
   - Error message display
   - Loading state during login
   - Use `useRouter()` for navigation
2. Create `app/(auth)/signup.tsx`:
   - Email, password, confirm password fields
   - Validation (password match, email format)
   - Signup button
   - Error handling
   - Use `useRouter()` for navigation
3. Create `app/(auth)/_layout.tsx`:
   - Stack layout for auth screens
   - Configure header options (hide header or customize)
   - Redirect authenticated users away from auth screens
4. Create `src/lib/hooks/useAuth.ts`:
   - `login(email, password)` - Calls API, stores tokens
   - `signup(email, password)` - Creates user, stores tokens
   - `logout()` - Clears tokens, navigates to login using `router.replace()`
   - `isAuthenticated()` - Checks token validity
5. Implement authentication flow:
   - Login → Store tokens → Navigate to Gallery using `router.replace()`
   - Signup → Store tokens → Navigate to Gallery using `router.replace()`
   - Logout → Clear tokens → Navigate to Login using `router.replace()`
6. Add navigation guards:
   - Create `app/_layout.tsx` with authentication check
   - Redirect authenticated users away from auth screens
   - Redirect unauthenticated users to login
   - Check authentication on app start using `useSegments()`

**Success Criteria:**
- Login screen functional with Expo Router
- Signup screen functional with Expo Router
- Authentication flow works with file-based routing
- Tokens stored securely
- Navigation guards work with Expo Router

---

### 6. Secure Token Storage

**Goal:** Implement secure storage for JWT tokens using Expo Secure Store.

**Steps:**
1. Install `expo-secure-store`:
   - Secure storage for sensitive data
   - Platform-specific secure storage
2. Create token storage utilities:
   - `src/lib/services/storage/SecureStorage.ts`
   - `setAccessToken(token)`, `getAccessToken()`, `clearTokens()`
   - Store access and refresh tokens securely
3. Integrate with authentication:
   - Store tokens after login/signup
   - Retrieve tokens for API calls
   - Clear tokens on logout
4. Handle token expiration:
   - Check token expiration before API calls
   - Refresh tokens automatically
   - Clear expired tokens
5. Test secure storage:
   - Tokens persist across app restarts
   - Tokens cleared on logout
   - Secure storage works on iOS and Android

**Success Criteria:**
- Secure token storage implemented
- Tokens persist securely
- Token retrieval works
- Token expiration handled
- Works on both iOS and Android

---

### 7. Basic Navigation Structure

**Goal:** Create placeholder screens and navigation structure for main app using Expo Router.

**Steps:**
1. Create placeholder screens using file-based routing:
   - `app/(tabs)/gallery.tsx` - Gallery placeholder
   - `app/(tabs)/upload.tsx` - Upload placeholder
   - `app/gallery/[id].tsx` - Photo detail placeholder (dynamic route)
2. Set up tab navigator layout:
   - `app/(tabs)/_layout.tsx` - Tab navigator with Gallery and Upload tabs
   - Configure tab bar styling and icons
   - Set up stack navigation for nested screens
3. Create root layout:
   - `app/_layout.tsx` - Root layout with providers (QueryClient, Zustand, etc.)
   - Handle authentication state and redirects
   - Configure global navigation options
4. Create navigation header:
   - Use Expo Router's header options or custom header component
   - Add logout button using `useRouter()`
   - Display user info
5. Add loading states:
   - Create `app/_layout.tsx` with loading screen while checking authentication
   - Add skeleton screens for data loading
   - Use `useSegments()` to determine current route
6. Test navigation:
   - Navigate between main screens using `router.push()` and `router.replace()`
   - Test dynamic routes (e.g., `/gallery/[id]`)
   - Header displays correctly
   - Logout navigates to login using `router.replace()`

**Success Criteria:**
- File-based navigation structure created
- Tab navigator works with Expo Router
- Placeholder screens display correctly
- Dynamic routes work
- Header works correctly
- Navigation flows work with Expo Router
- Ready for feature implementation

## Success Criteria (Phase Completion)

- ✅ Expo project initialized and running
- ✅ Expo Router configured with file-based routing
- ✅ State management (Zustand + TanStack Query) set up
- ✅ API client configured with JWT authentication
- ✅ Login and signup screens functional with Expo Router
- ✅ Secure token storage implemented
- ✅ Navigation structure created with layouts and groups
- ✅ Foundation ready for mobile features

## Notes and Considerations

- **Expo SDK:** Pin Expo SDK version for stability. Upgrade carefully to avoid breaking changes.
- **Expo Router:** File-based routing similar to Next.js. Use `app/` directory for routes, route groups `(name)` for organization, and `_layout.tsx` files for nested layouts. Navigation uses `useRouter()`, `usePathname()`, and `useSegments()` hooks.
- **File Structure:** Follow Expo Router conventions: `app/` for routes, `app/_layout.tsx` for root layout, route groups with parentheses for organization, dynamic routes with `[param]`, and `+not-found.tsx` for 404 pages.
- **Navigation:** Expo Router uses React Navigation under the hood. Use `router.push()`, `router.replace()`, `router.back()` for navigation. Type-safe navigation with TypeScript through route parameters.
- **Secure Storage:** Use `expo-secure-store` for tokens. More secure than AsyncStorage. Works on iOS and Android.
- **API Client:** Match web API client structure for consistency. Share types if possible (monorepo).
- **Platform Differences:** Handle iOS and Android differences (back button, safe areas, permissions). Expo Router handles platform-specific navigation automatically.
- **Development:** Use Expo Go for quick development, development builds for native modules. Expo Router works with both.
- **Deep Linking:** Configure `scheme` in `app.json` for deep linking. Expo Router handles deep links automatically based on file structure.
- **Next Steps:** Phase 11 will implement core mobile features (upload, gallery, etc.) using the Expo Router foundation.

