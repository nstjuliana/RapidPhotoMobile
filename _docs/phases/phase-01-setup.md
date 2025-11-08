# Phase 1: Setup

## Goal

Establish the barebones infrastructure foundation for the RapidPhotoUpload project. This phase creates the basic project structure, initializes development environments, and sets up essential infrastructure services (database, cloud storage) with minimal functionality to verify everything works.

## Deliverables

- Backend Spring Boot project initialized with WebFlux
- Web Next.js project initialized with TypeScript
- PostgreSQL database configured (local or RDS)
- AWS S3 bucket created and configured
- Basic health check endpoints working
- Git repository initialized with proper structure
- Development environment ready for Phase 2

## Prerequisites

- AWS account with appropriate permissions
- Java JDK 17+ installed
- Node.js 18+ and npm/yarn installed
- PostgreSQL installed locally or AWS RDS access
- Git installed

## Features

### 1. Repository Structure Setup

**Goal:** Create the foundational directory structure for the monorepo.

**Steps:**
1. Initialize Git repository in project root with `.gitignore` configured for Java, Node.js, and IDE files
2. Create `backend/` directory for Spring Boot application
3. Create `web/` directory for Next.js application
4. Create `mobile/` directory (placeholder for future mobile app)
5. Create `_docs/` directory structure with `phases/` subdirectory

**Success Criteria:**
- Repository structure matches project-rules.md specification
- `.gitignore` properly excludes build artifacts and dependencies
- All directories created and ready for project initialization

---

### 2. Backend Project Initialization

**Goal:** Set up Spring Boot 3.x project with WebFlux and essential dependencies.

**Steps:**
1. Initialize Spring Boot project in `backend/` using Spring Initializr or Maven archetype with:
   - Spring Boot 3.x
   - Spring WebFlux (reactive web)
   - Spring Data JPA
   - PostgreSQL Driver
   - Spring Boot Actuator (for health checks)
2. Configure `pom.xml` with project metadata and dependencies
3. Create main application class `RapidPhotoUploadApplication.java` in package `com.rapidphotoupload`
4. Create basic `application.yml` with server port configuration (default: 8080)
5. Verify project builds successfully with `mvn clean install`

**Success Criteria:**
- Spring Boot application starts without errors
- Application runs on configured port
- All dependencies resolve correctly
- Project structure follows DDD/CQRS/VSA organization (directories created, empty for now)

---

### 3. Database Setup

**Goal:** Configure PostgreSQL database connection and verify connectivity.

**Steps:**
1. Create PostgreSQL database named `rapid_photo_upload` (local or RDS instance)
2. Configure database connection in `application.yml` with:
   - Database URL, username, password
   - Connection pool settings
   - Hibernate/JPA configuration
3. Create `application-dev.yml` for development environment overrides
4. Test database connection by starting Spring Boot application
5. Verify connection pool initializes successfully

**Success Criteria:**
- Application connects to PostgreSQL database
- No connection errors in application logs
- Database is accessible and ready for schema creation in Phase 2

---

### 4. AWS S3 Bucket Configuration

**Goal:** Create and configure S3 bucket for photo storage with proper security settings.

**Steps:**
1. Create S3 bucket named `rapid-photo-upload-[environment]` (e.g., `rapid-photo-upload-dev`)
2. Configure bucket settings:
   - Versioning enabled (optional but recommended)
   - Server-side encryption enabled (SSE-S3)
   - Block public access enabled
3. Configure CORS policy for web client uploads:
   - Allow PUT requests from web application origin
   - Allow headers: Content-Type, Authorization
   - Allow credentials
4. Create IAM user/role with S3 permissions for backend application
5. Store AWS credentials securely (environment variables or AWS credentials file)

**Success Criteria:**
- S3 bucket created and accessible
- CORS configuration allows web client uploads
- Backend can authenticate with AWS (verify with AWS SDK connection test)
- Bucket policies prevent public access

---

### 5. Health Check Endpoints

**Goal:** Implement basic health check endpoints to verify system components are operational.

**Steps:**
1. Enable Spring Boot Actuator endpoints in `application.yml`:
   - `/actuator/health` (basic health)
   - `/actuator/info` (application info)
2. Create custom health indicator for database connectivity
3. Create custom health indicator for S3 connectivity (optional, can use AWS SDK health check)
4. Test health endpoints return 200 OK when all systems operational
5. Verify health endpoints show "DOWN" status when database/S3 unavailable

**Success Criteria:**
- `/actuator/health` returns `{"status":"UP"}` when all systems healthy
- Database health indicator reflects actual connection status
- Health checks can be used to verify infrastructure setup

---

### 6. Web Project Initialization

**Goal:** Set up Next.js 14+ project with TypeScript and essential tooling.

**Steps:**
1. Initialize Next.js project in `web/` directory using `create-next-app` with:
   - TypeScript enabled
   - App Router (not Pages Router)
   - ESLint enabled
   - Tailwind CSS enabled
2. Configure `tsconfig.json` with strict mode enabled
3. Create basic `app/layout.tsx` root layout component
4. Create basic `app/page.tsx` home page with "Hello World" content
5. Verify project runs with `npm run dev` and displays correctly

**Success Criteria:**
- Next.js application starts on port 3000 (default)
- TypeScript compilation succeeds without errors
- Basic page renders in browser
- Project structure follows Next.js App Router conventions

---

### 7. Git Configuration

**Goal:** Establish proper Git workflow and initial commit structure.

**Steps:**
1. Create comprehensive `.gitignore` covering:
   - Java build artifacts (`target/`, `*.class`)
   - Node.js dependencies (`node_modules/`, `.next/`)
   - IDE files (`.idea/`, `.vscode/`, `*.iml`)
   - Environment files (`.env.local`, `.env.production`)
   - AWS credentials (never commit)
2. Create initial `README.md` with project overview and setup instructions
3. Make initial commit with project structure and configuration files
4. Create `main` branch (or `master` if preferred) as primary development branch
5. Document Git workflow conventions in README (branch naming, commit messages)

**Success Criteria:**
- Git repository initialized with proper ignore rules
- Initial commit contains all setup files
- README provides clear setup instructions
- Repository ready for collaborative development

## Success Criteria (Phase Completion)

- ✅ Backend Spring Boot application starts successfully
- ✅ Database connection established and verified
- ✅ S3 bucket created and accessible from backend
- ✅ Health check endpoints return UP status
- ✅ Web Next.js application runs and displays correctly
- ✅ Git repository initialized with proper structure
- ✅ All infrastructure components verified and operational

## Notes and Considerations

- **Database Choice:** Use local PostgreSQL for development, RDS for production. Ensure connection strings are environment-specific.
- **S3 Bucket Naming:** Use environment-specific bucket names to separate dev/staging/prod data.
- **Credentials Management:** Never commit AWS credentials or database passwords. Use environment variables or secure credential management.
- **Port Configuration:** Backend default port 8080, web default port 3000. Ensure no conflicts.
- **Next Steps:** Phase 2 will build domain layer and database schema on top of this foundation.

