# Phase 8: Backend JWT Authentication

## Goal

Replace the mock authentication system with a full JWT-based authentication implementation using Spring Security. This phase implements secure token generation, validation, refresh tokens, and protected endpoints.

## Deliverables

- JWT token generation and validation service
- Spring Security configuration with JWT filter
- Access token and refresh token mechanism
- Token refresh endpoint
- Protected endpoint security
- User authentication and authorization
- Token blacklisting (optional)

## Prerequisites

- Phase 4 completed (mock auth working)
- Understanding of JWT tokens and Spring Security
- Backend API endpoints ready for protection

## Features

### 1. JWT Token Service

**Goal:** Implement JWT token generation and validation service.

**Steps:**
1. Add JWT dependencies to `pom.xml`:
   - `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson`
2. Create `JwtTokenProvider` in `infrastructure/security/jwt/JwtTokenProvider.java`:
   - `generateAccessToken(userId, email)` - generates short-lived access token (15 min)
   - `generateRefreshToken(userId)` - generates long-lived refresh token (7-30 days)
   - `validateToken(token)` - validates token signature and expiration
   - `getUserIdFromToken(token)` - extracts user ID from token
   - `getExpirationDateFromToken(token)` - gets expiration date
3. Configure JWT properties:
   - Secret key (from environment variable, never hardcoded)
   - Access token expiration: 15 minutes
   - Refresh token expiration: 7 days
   - Token issuer and audience
4. Handle token exceptions:
   - ExpiredJwtException → Token expired
   - MalformedJwtException → Invalid token
   - SignatureException → Invalid signature
5. Test token generation and validation

**Success Criteria:**
- Access tokens generated with 15-minute expiration
- Refresh tokens generated with longer expiration
- Token validation works correctly
- Token exceptions handled appropriately
- Secret key stored securely (environment variable)

---

### 2. Spring Security Configuration

**Goal:** Configure Spring Security with JWT authentication filter.

**Steps:**
1. Add Spring Security dependency (if not already included)
2. Create `SecurityConfig` in `infrastructure/security/config/SecurityConfig.java`:
   - Disable default security (for API, not web forms)
   - Configure security filter chain
   - Allow public endpoints: `/api/auth/**`, `/actuator/health`
   - Require authentication for all other `/api/**` endpoints
3. Create `JwtAuthenticationFilter` extending `OncePerRequestFilter`:
   - Extracts token from `Authorization: Bearer <token>` header
   - Validates token using JwtTokenProvider
   - Sets authentication in SecurityContext
   - Continues filter chain on success
4. Configure authentication entry point:
   - Returns 401 Unauthorized for unauthenticated requests
   - Returns 403 Forbidden for unauthorized requests
5. Test security configuration:
   - Public endpoints accessible without token
   - Protected endpoints require valid token
   - Invalid tokens rejected with 401

**Success Criteria:**
- Spring Security configured correctly
- JWT filter extracts and validates tokens
- Public endpoints accessible without authentication
- Protected endpoints require valid JWT token
- Security context set correctly after authentication

---

### 3. Authentication Endpoints

**Goal:** Implement login, signup, and token refresh endpoints with JWT.

**Steps:**
1. Update `LoginCommandHandler`:
   - Validates user credentials (email/password)
   - Generates access token and refresh token
   - Returns tokens and user info in response
2. Create `RefreshTokenCommand` and handler:
   - Validates refresh token
   - Generates new access token
   - Optionally rotates refresh token (security best practice)
3. Update `AuthController`:
   - `POST /api/auth/login` - Returns access + refresh tokens
   - `POST /api/auth/refresh` - Returns new access token
   - `POST /api/auth/signup` - Creates user, returns tokens
   - `POST /api/auth/logout` - Invalidates refresh token (optional)
4. Create `LoginResponseDto`:
   - accessToken, refreshToken, expiresIn, user (id, email)
5. Implement password hashing:
   - Use BCryptPasswordEncoder for password hashing
   - Hash passwords on signup
   - Verify passwords on login

**Success Criteria:**
- Login endpoint returns JWT tokens
- Refresh token endpoint generates new access tokens
- Signup creates users with hashed passwords
- Password hashing uses BCrypt
- Token responses include expiration times

---

### 4. User Entity and Repository

**Goal:** Enhance user domain model and persistence for authentication.

**Steps:**
1. Update `User` domain entity:
   - Fields: id, email, passwordHash, createdAt, updatedAt
   - Domain methods: `changePassword()`, `validateEmail()`
2. Update `UserRepository` interface:
   - `findByEmail(email)` - for login lookup
   - `existsByEmail(email)` - for signup validation
3. Implement `UserJpaEntity` and adapter:
   - Maps to `users` table
   - Handles password hash storage
   - Converts between domain and JPA entities
4. Create user service (optional):
   - `UserService` for user management
   - Password validation rules
   - Email validation
5. Add user creation logic:
   - Validate email format and uniqueness
   - Hash password before saving
   - Create user with default settings

**Success Criteria:**
- User entity includes authentication fields
- User repository supports email lookup
- Passwords hashed before storage
- Email validation prevents duplicates
- User creation works correctly

---

### 5. Protected Endpoint Security

**Goal:** Secure all API endpoints with JWT authentication.

**Steps:**
1. Update existing controllers:
   - Add `@PreAuthorize` or rely on security filter chain
   - Extract userId from SecurityContext (not from request body)
   - Validate user owns resources (e.g., user can only access their photos)
2. Create `SecurityUtils` helper:
   - `getCurrentUserId()` - extracts userId from SecurityContext
   - `getCurrentUser()` - gets full user object
   - Throws exception if not authenticated
3. Update command handlers:
   - Inject userId from SecurityContext (not command)
   - Validate user permissions
   - Ensure users can only access their own data
4. Add authorization checks:
   - Photo queries filter by current user
   - Upload commands associate with current user
   - Prevent access to other users' photos
5. Test authorization:
   - User A cannot access User B's photos
   - User A cannot upload photos for User B
   - All endpoints require authentication

**Success Criteria:**
- All endpoints protected with JWT authentication
- User ID extracted from token (not request)
- Authorization prevents cross-user access
- Security context available in all handlers
- Authorization tests pass

---

### 6. Token Refresh Mechanism

**Goal:** Implement secure token refresh flow with optional token rotation.

**Steps:**
1. Store refresh tokens (optional):
   - Database table `refresh_tokens`: token, userId, expiresAt, revoked
   - Or use stateless refresh tokens (simpler, less secure)
2. Implement refresh token validation:
   - Check token signature and expiration
   - Check if token revoked (if using database)
   - Validate token belongs to user
3. Token rotation (optional, recommended):
   - Issue new refresh token on each refresh
   - Invalidate old refresh token
   - Prevents token reuse attacks
4. Handle refresh token errors:
   - Expired refresh token → require re-login
   - Invalid refresh token → return 401
   - Revoked refresh token → return 401
5. Update frontend integration:
   - Store refresh token securely
   - Use refresh token when access token expires
   - Handle refresh failures (redirect to login)

**Success Criteria:**
- Refresh token endpoint generates new access tokens
- Refresh tokens validated correctly
- Token rotation implemented (optional)
- Refresh failures handled gracefully
- Frontend can refresh tokens automatically

---

### 7. Token Blacklisting (Optional)

**Goal:** Implement token blacklisting for logout and security.

**Steps:**
1. Create `TokenBlacklistService`:
   - Store blacklisted tokens (Redis or database)
   - Check if token blacklisted on validation
   - Add token to blacklist on logout
2. Update `JwtTokenProvider`:
   - Check blacklist before validating token
   - Reject blacklisted tokens
3. Implement logout endpoint:
   - Add access token to blacklist (short expiration, optional)
   - Revoke refresh token (mark as revoked)
   - Clear user session
4. Handle token expiration:
   - Blacklisted tokens expire naturally (access tokens short-lived)
   - Clean up expired blacklist entries periodically
5. Test blacklisting:
   - Logout blacklists token
   - Blacklisted tokens rejected
   - Expired tokens removed from blacklist

**Success Criteria:**
- Token blacklisting works (if implemented)
- Logout invalidates tokens
- Blacklisted tokens rejected
- Blacklist cleanup works
- Security improved with token revocation

## Success Criteria (Phase Completion)

- ✅ JWT tokens generated and validated correctly
- ✅ Spring Security configured with JWT filter
- ✅ Login and signup endpoints return JWT tokens
- ✅ Token refresh endpoint works
- ✅ All API endpoints protected
- ✅ User authorization prevents cross-user access
- ✅ Passwords hashed with BCrypt
- ✅ Token security best practices followed

## Notes and Considerations

- **Token Storage:** Access tokens stored client-side (localStorage for web). Refresh tokens stored securely (httpOnly cookies preferred, but harder with S3 uploads).
- **Token Expiration:** Short-lived access tokens (15 min) reduce risk if compromised. Refresh tokens longer-lived (7-30 days) for better UX.
- **Secret Key:** Never hardcode JWT secret. Use environment variable. Use strong, random secret in production.
- **Token Rotation:** Rotating refresh tokens on each use prevents token reuse attacks. More secure but requires token storage.
- **Password Hashing:** Always hash passwords with BCrypt (or Argon2). Never store plaintext passwords.
- **Authorization:** Extract userId from JWT token, not from request body. Prevents users from accessing other users' data.
- **CORS:** Update CORS configuration to allow Authorization header. Credentials may be needed for cookie-based refresh tokens.
- **Next Steps:** Phase 9 will update the web frontend to use JWT authentication.

