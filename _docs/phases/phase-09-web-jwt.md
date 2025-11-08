# Phase 9: Web JWT Integration

## Goal

Update the web frontend to use JWT authentication instead of mock authentication. This includes token storage, API client authentication interceptors, automatic token refresh, protected route guards, and updated login/signup flows.

## Deliverables

- JWT token storage (localStorage with secure practices)
- API client authentication interceptors
- Automatic token refresh on expiration
- Protected route guards with JWT validation
- Updated login/signup UI with JWT flow
- Token expiration handling
- Secure token management

## Prerequisites

- Phase 8 completed (backend JWT authentication working)
- Web foundation and authentication UI in place (Phase 5)
- Understanding of JWT token lifecycle

## Features

### 1. Token Storage Management

**Goal:** Implement secure token storage for access and refresh tokens.

**Steps:**
1. Update `lib/hooks/useAuth.ts`:
   - Store access token in localStorage (key: `accessToken`)
   - Store refresh token in localStorage (key: `refreshToken`)
   - Store token expiration time for validation
   - Functions: `getAccessToken()`, `getRefreshToken()`, `setTokens()`, `clearTokens()`
2. Create token utilities:
   - `lib/utils/token.ts` - token parsing, expiration checking
   - `isTokenExpired(token)` - checks if token expired
   - `getTokenExpiration(token)` - extracts expiration from JWT
3. Implement secure storage practices:
   - Never log tokens to console
   - Clear tokens on logout
   - Validate token format before storing
4. Handle token refresh:
   - Check token expiration before API calls
   - Automatically refresh if expired
   - Store new tokens after refresh
5. Test token storage:
   - Tokens persist across page reloads
   - Tokens cleared on logout
   - Expiration checked correctly

**Success Criteria:**
- Access and refresh tokens stored securely
- Token expiration checked before use
- Tokens persist across sessions
- Token utilities work correctly
- Secure storage practices followed

---

### 2. API Client Authentication Interceptors

**Goal:** Update API client to automatically add JWT tokens to requests and handle token refresh.

**Steps:**
1. Update `lib/api/client.ts`:
   - Request interceptor: add `Authorization: Bearer <token>` header
   - Get access token from `useAuth()` hook or storage
   - Skip auth header for public endpoints (`/api/auth/login`, `/api/auth/signup`)
2. Implement token refresh interceptor:
   - Response interceptor: catch 401 Unauthorized responses
   - Attempt token refresh using refresh token
   - Retry original request with new access token
   - Redirect to login if refresh fails
3. Handle concurrent requests:
   - Queue requests during token refresh
   - Prevent multiple refresh attempts simultaneously
   - Retry all queued requests after refresh
4. Update error handling:
   - Distinguish between 401 (token expired) and 401 (invalid credentials)
   - Handle refresh token expiration (redirect to login)
   - Show user-friendly error messages
5. Test interceptors:
   - Tokens added to authenticated requests
   - Token refresh works automatically
   - Failed refresh redirects to login
   - Concurrent requests handled correctly

**Success Criteria:**
- Authorization header added to all authenticated requests
- Token refresh happens automatically on 401
- Failed refresh redirects to login
- Concurrent requests handled during refresh
- Error handling provides clear feedback

---

### 3. Automatic Token Refresh

**Goal:** Implement automatic token refresh before expiration and on 401 errors.

**Steps:**
1. Create `useTokenRefresh()` hook:
   - Checks token expiration before API calls
   - Refreshes token if expired or expiring soon (< 1 minute)
   - Returns new access token
2. Integrate with API client:
   - Check expiration in request interceptor
   - Refresh token proactively if expiring soon
   - Use refreshed token for request
3. Handle refresh errors:
   - Refresh token expired → logout and redirect to login
   - Network error → retry refresh (with backoff)
   - Invalid refresh token → logout and redirect
4. Update token storage:
   - Store new access token after refresh
   - Update expiration time
   - Keep refresh token (unless rotated)
5. Add refresh token rotation support:
   - Handle new refresh token from backend (if implemented)
   - Replace old refresh token with new one
   - Update storage with rotated tokens

**Success Criteria:**
- Tokens refreshed automatically before expiration
- Refresh happens on 401 errors
- Refresh errors handled gracefully
- Token rotation supported (if backend implements)
- User experience seamless (no manual re-login)

---

### 4. Updated Login and Signup Flow

**Goal:** Update authentication UI to work with JWT tokens.

**Steps:**
1. Update `components/auth/LoginForm.tsx`:
   - Call `/api/auth/login` endpoint
   - Receive access token and refresh token
   - Store tokens using `useAuth().setTokens()`
   - Redirect to gallery on success
   - Handle login errors (invalid credentials, network errors)
2. Update `components/auth/SignupForm.tsx`:
   - Call `/api/auth/signup` endpoint
   - Receive tokens after signup
   - Store tokens and redirect to gallery
   - Handle signup errors (email exists, validation errors)
3. Update `lib/hooks/useAuth.ts`:
   - `login(email, password)` - calls API, stores tokens
   - `signup(email, password)` - calls API, stores tokens
   - `logout()` - clears tokens, redirects to login
   - `isAuthenticated()` - checks if valid access token exists
4. Add loading states:
   - Show loading spinner during login/signup
   - Disable form during API call
   - Show success message before redirect
5. Handle token expiration on login:
   - Check if stored tokens expired
   - Attempt refresh if refresh token valid
   - Require re-login if refresh token expired

**Success Criteria:**
- Login stores JWT tokens and redirects
- Signup creates user and stores tokens
- Logout clears tokens and redirects
- Error handling provides clear feedback
- Loading states improve UX

---

### 5. Protected Route Guards

**Goal:** Update route protection to validate JWT tokens.

**Steps:**
1. Update `lib/middleware/auth.ts` or route guard:
   - Check if access token exists and valid
   - Validate token expiration
   - Attempt token refresh if expired but refresh token valid
   - Redirect to login if no valid tokens
2. Create `components/auth/ProtectedRoute.tsx` wrapper:
   - Checks authentication state
   - Shows loading while checking
   - Redirects to login if not authenticated
   - Renders children if authenticated
3. Update dashboard layout:
   - Wrap dashboard routes with ProtectedRoute
   - Check authentication on route access
   - Handle token refresh during route check
4. Handle deep linking:
   - Store intended destination before redirect to login
   - Redirect to intended destination after login
   - Handle expired tokens on deep link access
5. Test route protection:
   - Unauthenticated users redirected to login
   - Authenticated users access dashboard
   - Expired tokens trigger refresh or redirect
   - Deep links work correctly

**Success Criteria:**
- Protected routes require valid JWT token
- Token validation happens on route access
- Expired tokens trigger refresh or redirect
- Deep linking works with authentication
- Route protection seamless for users

---

### 6. Token Expiration Handling

**Goal:** Handle token expiration gracefully throughout the application.

**Steps:**
1. Create token expiration checker:
   - `lib/utils/tokenExpiration.ts`
   - `checkTokenExpiration()` - checks if token expired or expiring soon
   - `shouldRefreshToken()` - determines if refresh needed
2. Add expiration handling to API calls:
   - Check expiration before each API call
   - Refresh proactively if expiring soon
   - Handle expiration during long-running operations
3. Update UI for expiration:
   - Show warning if token expiring soon (optional)
   - Handle expiration during user interactions
   - Seamless refresh without user notice
4. Handle refresh failures:
   - Show error message if refresh fails
   - Redirect to login with message
   - Clear invalid tokens
5. Test expiration scenarios:
   - Token expires during session → auto-refresh
   - Refresh token expired → redirect to login
   - Network error during refresh → retry or logout
   - User inactive during expiration → refresh on next action

**Success Criteria:**
- Token expiration checked proactively
- Expired tokens refreshed automatically
- Refresh failures handled gracefully
- User experience unaffected by expiration
- All expiration scenarios tested

---

### 7. Security Enhancements

**Goal:** Implement security best practices for token management.

**Steps:**
1. Implement token validation:
   - Validate token format before use
   - Check token expiration before API calls
   - Verify token structure (JWT format)
2. Add CSRF protection (if needed):
   - Use CSRF tokens for state-changing operations
   - Validate CSRF tokens on server
3. Secure token storage:
   - Never expose tokens in URLs or logs
   - Clear tokens on browser close (optional, sessionStorage)
   - Use secure storage practices
4. Handle token theft scenarios:
   - Detect suspicious activity (optional)
   - Implement token revocation (if backend supports)
   - Clear tokens on security events
5. Add security headers:
   - Configure Content-Security-Policy
   - Set secure cookie flags (if using cookies)
   - Prevent XSS attacks

**Success Criteria:**
- Token validation prevents invalid tokens
- Secure storage practices followed
- Security headers configured
- Token theft scenarios handled
- Security best practices implemented

## Success Criteria (Phase Completion)

- ✅ JWT tokens stored securely
- ✅ API client adds tokens to requests automatically
- ✅ Token refresh works automatically
- ✅ Login and signup use JWT tokens
- ✅ Protected routes validate JWT tokens
- ✅ Token expiration handled gracefully
- ✅ Security best practices followed
- ✅ User experience seamless

## Notes and Considerations

- **Token Storage:** localStorage is vulnerable to XSS. Consider httpOnly cookies for refresh tokens (requires backend changes). For this project, localStorage is acceptable with XSS prevention.
- **Token Refresh:** Refresh tokens proactively (before expiration) for better UX. Refresh on 401 as fallback.
- **Concurrent Requests:** Queue requests during token refresh to prevent multiple refresh attempts. Retry all queued requests after refresh.
- **Error Handling:** Distinguish between different 401 scenarios: expired token (refresh), invalid token (logout), no token (redirect to login).
- **Deep Linking:** Store intended destination before redirect to login. Redirect after successful login.
- **Security:** Never log tokens. Validate token format. Clear tokens on logout. Use secure storage practices.
- **User Experience:** Token refresh should be invisible to users. Show loading states during refresh if needed.
- **Next Steps:** Phase 10 will begin mobile application development with JWT authentication from the start.

