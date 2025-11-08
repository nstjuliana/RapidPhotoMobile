# Phase 5: Web Foundation

## Goal

Establish the web application foundation with Next.js project structure, UI component library setup, state management configuration, mock authentication flow, and basic navigation. This phase creates the scaffolding for the web frontend that will integrate with the backend API.

## Deliverables

- Next.js project structure with App Router
- Tailwind CSS and shadcn/ui configured
- Zustand stores for UI state management
- TanStack Query configured for server state
- Mock authentication UI and flow
- Navigation and layout components
- API client setup for backend integration

## Prerequisites

- Phase 4 completed (backend queries and mock auth working)
- Backend API accessible from web application
- Understanding of Next.js App Router, React hooks, and state management

## Features

### 1. Next.js Project Structure

**Goal:** Set up Next.js project with proper directory structure following project rules.

**Steps:**
1. Verify Next.js project initialized (from Phase 1) and update structure:
   - `app/` directory for App Router pages
   - `components/` for React components
   - `lib/` for utilities and configurations
   - `public/` for static assets
2. Create route structure:
   - `app/(auth)/login/page.tsx` - Login page
   - `app/(auth)/signup/page.tsx` - Signup page
   - `app/(dashboard)/layout.tsx` - Dashboard layout with navigation
   - `app/(dashboard)/gallery/page.tsx` - Gallery page (placeholder)
   - `app/(dashboard)/upload/page.tsx` - Upload page (placeholder)
3. Create root `app/layout.tsx` with metadata and providers
4. Configure TypeScript paths in `tsconfig.json` (@/ alias for src directory)

**Success Criteria:**
- Next.js project structure follows conventions
- Route groups organized logically
- TypeScript paths configured correctly
- Project compiles without errors

---

### 2. Tailwind CSS and shadcn/ui Setup

**Goal:** Configure Tailwind CSS and install shadcn/ui components.

**Steps:**
1. Verify Tailwind CSS installed and configured:
   - `tailwind.config.js` configured
   - `app/globals.css` includes Tailwind directives
   - PostCSS configured
2. Install and configure shadcn/ui:
   - Run `npx shadcn-ui@latest init`
   - Configure `components.json` with project preferences
   - Set up CSS variables for theming
3. Install essential shadcn components:
   - Button, Card, Input, Dialog, Progress, Badge
   - Copy components to `components/ui/` directory
4. Create theme configuration:
   - Define color palette in CSS variables
   - Configure light/dark mode (if desired)
5. Test components render correctly

**Success Criteria:**
- Tailwind CSS working and styles applied
- shadcn/ui components installed and customizable
- Theme variables configured
- Components render without errors

---

### 3. State Management Setup

**Goal:** Configure Zustand for UI state and TanStack Query for server state.

**Steps:**
1. Install dependencies: `zustand`, `@tanstack/react-query`
2. Create `lib/stores/uploadStore.ts`:
   - State: uploadQueue (array of uploads), selectedPhotos (Set<string>)
   - Actions: addUpload, removeUpload, updateUploadProgress, clearQueue
   - Persist middleware for upload queue (optional)
3. Create `lib/stores/uiStore.ts`:
   - State: isSelectMode, filters, sidebarOpen
   - Actions: toggleSelectMode, setFilters, toggleSidebar
4. Create `lib/queries/queryClient.ts`:
   - Configure QueryClient with default options
   - Set staleTime, cacheTime, retry logic
5. Wrap app with `QueryClientProvider` in root layout
6. Create query key factories in `lib/queries/keys.ts`:
   - `photoKeys.all`, `photoKeys.detail(id)`, `photoKeys.list(filters)`

**Success Criteria:**
- Zustand stores created and functional
- TanStack Query configured and provider added
- Query keys organized consistently
- State management ready for feature implementation

---

### 4. API Client Configuration

**Goal:** Set up API client for backend communication with authentication support.

**Steps:**
1. Create `lib/api/client.ts`:
   - Configure axios or fetch client
   - Base URL from environment variable (`NEXT_PUBLIC_API_URL`)
   - Request interceptor: add Authorization header from token
   - Response interceptor: handle 401 (unauthorized) → redirect to login
2. Create `lib/api/endpoints.ts`:
   - Define API endpoint constants
   - Functions for each endpoint: `getPhotos()`, `getPhoto(id)`, `uploadPhoto()`, etc.
3. Create `lib/api/types.ts`:
   - TypeScript types matching backend DTOs
   - Request/response types for each endpoint
4. Create `lib/hooks/useAuth.ts`:
   - Manages authentication state (token storage)
   - Functions: `login()`, `logout()`, `getToken()`, `isAuthenticated()`
   - Uses localStorage for token storage (mock auth)
5. Test API client with health check endpoint

**Success Criteria:**
- API client configured with base URL
- Authentication headers added automatically
- Error handling for 401 responses
- TypeScript types match backend DTOs
- API client ready for use in components

---

### 5. Mock Authentication UI

**Goal:** Create login and signup pages with mock authentication flow.

**Steps:**
1. Create `app/(auth)/login/page.tsx`:
   - Form with email and password fields
   - Uses shadcn Input and Button components
   - Calls `useAuth().login()` on submit
   - Redirects to gallery on success
   - Shows error messages on failure
2. Create `app/(auth)/signup/page.tsx`:
   - Form with email, password, confirm password
   - Validation (password match, email format)
   - Calls signup API endpoint
   - Redirects to gallery after signup
3. Create `lib/hooks/useAuth.ts` hook:
   - `login(email, password)` - calls `/api/auth/login`, stores token
   - `logout()` - clears token, redirects to login
   - `isAuthenticated()` - checks if token exists
   - Uses TanStack Query mutation for login
4. Create `components/auth/LoginForm.tsx` and `SignupForm.tsx`:
   - Reusable form components
   - Form validation and error handling
5. Add route protection: redirect unauthenticated users to login

**Success Criteria:**
- Login page functional with form validation
- Signup page creates users and logs in
- Authentication state persisted in localStorage
- Protected routes redirect to login
- Error handling displays user-friendly messages

---

### 6. Navigation and Layout Components

**Goal:** Create navigation menu and dashboard layout for authenticated pages.

**Steps:**
1. Create `app/(dashboard)/layout.tsx`:
   - Wraps dashboard pages with navigation
   - Includes header with user info and logout button
   - Responsive navigation (sidebar or top nav)
2. Create `components/layout/Header.tsx`:
   - Logo/brand name
   - Navigation links (Gallery, Upload)
   - User menu with logout option
3. Create `components/layout/Navigation.tsx`:
   - Navigation links component
   - Active route highlighting
   - Responsive mobile menu (hamburger)
4. Create `components/layout/Footer.tsx` (optional):
   - Footer with copyright or links
5. Add loading states:
   - Create `app/(dashboard)/loading.tsx` for route-level loading
   - Use Suspense boundaries for async components

**Success Criteria:**
- Dashboard layout wraps all authenticated pages
- Navigation menu functional with active states
- Responsive design works on mobile
- Logout functionality works
- Loading states displayed appropriately

---

### 7. Protected Route Guard

**Goal:** Implement route protection to redirect unauthenticated users.

**Steps:**
1. Create `lib/middleware/auth.ts` or use Next.js middleware:
   - Checks authentication token
   - Redirects to `/login` if not authenticated
   - Allows access to auth pages when not authenticated
2. Create `components/auth/ProtectedRoute.tsx` wrapper (if using client-side):
   - Checks `useAuth().isAuthenticated()`
   - Shows loading state while checking
   - Redirects to login if not authenticated
3. Apply protection to dashboard routes:
   - Wrap dashboard layout or individual pages
   - Auth routes (`/login`, `/signup`) accessible without auth
4. Handle token expiration:
   - Check token validity on route access
   - Clear invalid tokens and redirect

**Success Criteria:**
- Unauthenticated users redirected to login
- Authenticated users access dashboard
- Auth pages accessible without authentication
- Token validation works correctly
- Route protection seamless

## Success Criteria (Phase Completion)

- ✅ Next.js project structure organized correctly
- ✅ Tailwind CSS and shadcn/ui configured
- ✅ State management (Zustand + TanStack Query) set up
- ✅ API client configured with authentication
- ✅ Login and signup pages functional
- ✅ Navigation and layout components created
- ✅ Route protection implemented
- ✅ Foundation ready for feature implementation

## Notes and Considerations

- **API Base URL:** Use environment variable `NEXT_PUBLIC_API_URL` for backend URL. Default to `http://localhost:8080` for development.
- **Token Storage:** Use localStorage for mock auth. Will migrate to secure storage in Phase 9 (JWT enhancement).
- **Error Handling:** Create consistent error handling pattern. Use toast notifications or error messages in forms.
- **Loading States:** Use TanStack Query's `isLoading` and `isFetching` for loading states. Add skeleton screens for better UX.
- **Type Safety:** Ensure TypeScript types match backend DTOs exactly. Consider code generation if backend types change frequently.
- **Responsive Design:** Design mobile-first. Ensure navigation works on small screens.
- **Next Steps:** Phase 6 will implement the upload feature using this foundation.

