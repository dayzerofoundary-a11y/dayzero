# Requirements Document

## Introduction

DayZero Foundry is a platform for innovative thinkers to become future entrepreneurs. The current React/Vite frontend uses Firebase Firestore for data persistence and a minimal Node.js intake API. This feature replaces all temporary/mock/Firebase implementations with a production-ready, self-hosted backend built on Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, and Redis.

The new backend must integrate seamlessly with the existing React frontend — specifically preserving the `/api/intake` endpoint contract used by `TheDraft` component, replacing the Firebase-powered `AdminDashboard` with a secure JWT-authenticated admin API, and providing a complete platform for future growth including authentication, file uploads, notifications, analytics, audit logging, and real-time capabilities.

Engineering philosophy: **build it once, build it right** — maintainability, security, observability, scalability.

## Glossary

- **API_Server**: The Node.js/Express.js/TypeScript backend application
- **Auth_Service**: The module responsible for authentication and authorisation
- **Token_Service**: The module responsible for JWT access token and refresh token lifecycle
- **Admin_Service**: The module providing admin-only APIs for dashboard, user management, analytics, and exports
- **Intake_Service**: The module handling idea submission (replacing the existing `/api/intake` endpoint and Firebase writes)
- **Notification_Service**: The module responsible for email, in-app, and push-ready notifications
- **File_Service**: The module handling file uploads via Multer and Cloudinary
- **Analytics_Service**: The module that aggregates and exposes usage metrics
- **Audit_Service**: The module that writes immutable audit log entries for all sensitive operations
- **Cache_Service**: The Redis-backed caching and session layer
- **Queue_Service**: The Redis-backed background job queue (Bull/BullMQ)
- **Database**: PostgreSQL accessed via Prisma ORM
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Token
- **PII**: Personally Identifiable Information
- **Soft_Delete**: Marking a record as deleted via `deletedAt` timestamp without physical removal
- **Cast_ID**: The human-readable reference number returned to submitters (e.g. `DZ-00-1234`)
- **Submitter**: An anonymous or authenticated user who submits an idea via The Draft form
- **Admin**: An authenticated user with the `admin` or `super_admin` role
- **Pagination_Cursor**: An opaque token or offset/limit pair used to page through large result sets

## Requirements

---

### Requirement 1: Project Structure and Configuration

**User Story:** As a backend engineer, I want a well-organised TypeScript project with strict typing, environment configuration, and dependency injection conventions, so that the codebase is maintainable, testable, and consistent.

#### Acceptance Criteria

1. THE API_Server SHALL be implemented in TypeScript with `strict: true` in `tsconfig.json`.
2. THE API_Server SHALL organise source code into the directories: `src/config`, `src/controllers`, `src/routes`, `src/middlewares`, `src/services`, `src/repositories`, `src/models`, `src/validators`, `src/utils`, `src/types`, `src/database`, `src/jobs`, `src/emails`, `src/storage`, `src/tests`, and `src/logs`.
3. THE API_Server SHALL load all configuration from environment variables defined in a `.env` file, with a committed `.env.example` listing every required variable with placeholder values and inline comments.
4. IF a required environment variable is absent at startup, THEN THE API_Server SHALL log a descriptive error and exit with a non-zero code before binding to any port; IF the logging itself fails during this check, THEN THE API_Server SHALL still exit with a non-zero code without binding to any port.
5. WHEN all required environment variables are present at startup, THE API_Server SHALL log a successful startup message including the bound port and environment name, then bind to the configured port.
6. THE API_Server SHALL expose a `GET /health` endpoint that returns `{ success: true, message: "OK", data: { uptime, environment, timestamp } }` with HTTP 200.
7. THE API_Server SHALL support graceful shutdown: WHEN a `SIGTERM` or `SIGINT` signal is received, THE API_Server SHALL finish in-flight requests within 10 seconds, drain the job queue, and close all database and Redis connections before exiting.
8. THE API_Server SHALL be fully containerised with a `Dockerfile` (multi-stage build: builder → production) and a `docker-compose.yml` providing PostgreSQL, Redis, and the API service with all required environment variables documented.

---

### Requirement 2: Database Schema and Migrations

**User Story:** As a backend engineer, I want a complete, normalised PostgreSQL schema managed by Prisma, so that data integrity, referential consistency, and safe migrations are guaranteed.

#### Acceptance Criteria

1. THE Database SHALL contain the following tables: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `sessions`, `notifications`, `files`, `payments`, `subscriptions`, `reports`, `audit_logs`, `activity_logs`, `settings`, `analytics_events`, and `idea_submissions`.
2. EVERY table SHALL have the columns: `id` (UUID, primary key, default `gen_random_uuid()`), `created_at` (timestamptz, default now), `updated_at` (timestamptz, auto-updated), and `deleted_at` (timestamptz, nullable, used for Soft_Delete).
3. THE Database SHALL enforce all foreign key constraints and cascading rules as specified in the Prisma schema.
4. EVERY table column used in `WHERE`, `ORDER BY`, or `JOIN` clauses SHALL have an appropriate B-tree or GiST index defined in the Prisma schema.
5. THE Database SHALL enforce `NOT NULL`, `UNIQUE`, and `CHECK` constraints at the database level, not only in application code.
6. WHEN a Prisma migration is run, THE Database SHALL apply schema changes idempotently without data loss for additive changes.
7. THE Database SHALL use connection pooling via `DATABASE_URL` with PgBouncer-compatible settings configurable through environment variables.
8. THE Database's `idea_submissions` table SHALL store: `cast_id` (unique, human-readable reference), `idea_name`, `ambition_level`, `description`, `submitter_name`, `submitter_email`, `submitter_role`, `affiliation`, `category`, `ip_address`, `file_url` (nullable), `turnstile_verified` (boolean), and `status` (enum: `pending`, `reviewing`, `accepted`, `rejected`).

---

### Requirement 3: Idea Intake API (Frontend Compatibility)

**User Story:** As a Submitter, I want to submit my idea through the existing DayZero Foundry web form without any frontend changes, so that my submission is securely received, persisted in the production database, and I receive a Cast_ID confirmation.

#### Acceptance Criteria

1. THE Intake_Service SHALL expose `POST /api/intake` accepting `multipart/form-data` with fields: `name`, `email`, `role`, `affiliation`, `category`, `idea`, `turnstileToken`, and an optional `file` attachment up to 10 MB.
2. WHEN a `POST /api/intake` request is received, THE Intake_Service SHALL validate the Cloudflare Turnstile token against the Turnstile verification API before processing the submission.
3. IF the Turnstile token is invalid or absent, THEN THE Intake_Service SHALL return HTTP 422 with `{ success: false, errors: [{ field: "turnstileToken", message: "Security verification failed" }] }`.
4. WHEN a valid intake request is received, THE Intake_Service SHALL generate a unique Cast_ID in the format `DZ-YY-NNNN` (two-digit year, zero-padded 4-digit sequence), persist the submission to the Database, and return `{ success: true, message: "Idea submitted successfully", data: { castId } }` with HTTP 201.
5. WHEN a file is attached to the intake request, THE File_Service SHALL upload the file to Cloudinary and store the resulting URL in `idea_submissions.file_url`.
6. AFTER a successful intake submission, THE Notification_Service SHALL asynchronously enqueue an email notification to the configured admin recipients via the Queue_Service; IF the notification email fails to deliver (even after all retries), THE Intake_Service SHALL treat the submission as successfully completed and SHALL NOT block or flag the submission.
7. THE Intake_Service SHALL enforce a rate limit of 5 requests per IP address per hour on `POST /api/intake`, returning HTTP 429 with a `Retry-After` header only when the rate limit has actually been exceeded.
8. THE Intake_Service SHALL sanitise all text fields to prevent XSS and SQL injection before persistence.
9. THE Intake_Service response format SHALL be backward-compatible with the existing React frontend (the `data.castId` field is consumed by `TheDraft` component).

---

### Requirement 4: Authentication System

**User Story:** As an Admin, I want a secure authentication system with JWT access tokens, refresh tokens, and RBAC, so that only authorised users can access protected resources and all sessions are auditable.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose the following endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/verify-email`, `POST /api/auth/resend-verification`, and `POST /api/auth/logout-all`.
2. WHEN a user registers, THE Auth_Service SHALL hash the password using bcrypt with a cost factor of 12 and store only the hash.
3. WHEN a user logs in with valid credentials, THE Token_Service SHALL issue a signed JWT access token (15-minute expiry, RS256 algorithm) and a refresh token (7-day expiry for standard login, 30-day expiry for "Remember Me"), store the refresh token hash in the `sessions` table, and set the refresh token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
4. WHEN a protected endpoint is called with a valid access token, THE Auth_Service SHALL attach the decoded user identity and permissions to the request context.
5. IF an access token is expired or invalid, THEN THE Auth_Service SHALL return HTTP 401 with `{ success: false, message: "Unauthorised", errors: [{ code: "TOKEN_EXPIRED" }] }`.
6. WHEN `POST /api/auth/refresh` is called with a valid refresh token cookie, THE Token_Service SHALL rotate the refresh token (invalidate the old one, issue a new one), issue a new access token, and return both.
7. IF a refresh token is reused after rotation, THEN THE Token_Service SHALL invalidate the entire session family (token theft detection) and return HTTP 401.
8. WHEN `POST /api/auth/logout-all` is called by an authenticated user, THE Auth_Service SHALL invalidate all active sessions for that user in the `sessions` table.
9. WHEN a user requests password reset, THE Auth_Service SHALL generate a cryptographically random 64-byte token, store its SHA-256 hash in the Database with a 1-hour expiry, and send a reset link to the user's verified email address via the Notification_Service.
10. IF a password reset token is expired or already used, THEN THE Auth_Service SHALL return HTTP 400 with `{ success: false, message: "Reset token is invalid or has expired" }`.
11. WHEN a new user account is created, THE Auth_Service SHALL send an email verification link valid for 24 hours via the Notification_Service.
12. WHILE a user's email is unverified, THE Auth_Service SHALL allow login but SHALL mark `email_verified: false` in the JWT claims.

---

### Requirement 5: Role-Based Access Control (RBAC) and Authorisation

**User Story:** As a system administrator, I want granular permission-based access control on every API endpoint, so that users can only perform actions their role permits.

#### Acceptance Criteria

1. THE Auth_Service SHALL define the following built-in roles: `super_admin`, `admin`, `moderator`, `user`, and `guest`.
2. EVERY protected API endpoint SHALL declare required permissions (e.g. `submissions:read`, `users:write`, `analytics:read`) and THE Auth_Service SHALL enforce them via middleware before the controller executes.
3. IF a user's role lacks the required permission, THEN THE Auth_Service SHALL return HTTP 403 with `{ success: false, message: "Forbidden", errors: [{ code: "INSUFFICIENT_PERMISSIONS" }] }`.
4. THE Admin_Service SHALL expose `POST /api/admin/roles/:userId/assign` and `DELETE /api/admin/roles/:userId/revoke` endpoints, accessible only to `super_admin`, to dynamically assign and revoke roles.
5. WHEN role or permission changes are made, THE Audit_Service SHALL record the change with the acting admin's ID, target user ID, old value, new value, and timestamp.
6. THE Auth_Service SHALL cache resolved permission sets in Redis with a TTL of 5 minutes, invalidating the cache on role or permission change.

---

### Requirement 6: Admin Dashboard API

**User Story:** As an Admin, I want a comprehensive set of admin APIs to manage submissions, users, analytics, notifications, files, settings, and export data, so that I can operate the platform without direct database access.

#### Acceptance Criteria

1. THE Admin_Service SHALL require the `admin` or `super_admin` role for all `/api/admin/*` endpoints.
2. THE Admin_Service SHALL expose `GET /api/admin/submissions` returning paginated idea submissions with filtering by `status`, `category`, `dateRange`, and full-text search on `submitter_name`, `email`, and `idea_name`.
3. THE Admin_Service SHALL expose `PATCH /api/admin/submissions/:id` to update submission status (`pending` → `reviewing` → `accepted` | `rejected`); IF the requested status is identical to the current status, THEN THE Admin_Service SHALL return HTTP 400 with `{ success: false, message: "Status is already set to the requested value" }`.
4. THE Admin_Service SHALL expose `GET /api/admin/users` returning paginated users with filtering by `role`, `status`, `dateRange`, and search by name or email.
5. THE Admin_Service SHALL expose `GET /api/admin/analytics/summary` returning: total submissions, submissions today, active users, registrations in the last 30 days, login count, file upload count, error rate, and system health indicators.
6. THE Admin_Service SHALL expose `GET /api/admin/analytics/timeseries?metric=submissions&granularity=day&from=&to=` returning time-series data for charting.
7. THE Admin_Service SHALL expose `GET /api/admin/logs/audit` returning paginated audit log entries with filtering by `actor`, `action`, `entityType`, and `dateRange`.
8. THE Admin_Service SHALL expose `GET /api/admin/notifications` and `POST /api/admin/notifications/broadcast` to list and send broadcast notifications to users.
9. THE Admin_Service SHALL expose `GET /api/admin/files` returning paginated uploaded files with metadata.
10. THE Admin_Service SHALL expose `GET /api/admin/settings` and `PATCH /api/admin/settings` to read and update platform-wide settings stored in the `settings` table.
11. THE Admin_Service SHALL expose `GET /api/admin/submissions/export?format=csv` and `GET /api/admin/submissions/export?format=pdf` returning a downloadable file of all submissions matching current filters.
12. THE Admin_Service SHALL expose `POST /api/admin/submissions/bulk` accepting an array of submission IDs and an action (`accept`, `reject`, `delete`) for bulk operations.
13. ALL Admin_Service list endpoints SHALL support `page`, `limit` (max 100), `sortBy`, and `sortOrder` query parameters, returning `{ success, message, data, pagination: { total, page, limit, totalPages, hasNext, hasPrev } }`.

---

### Requirement 7: File Upload System

**User Story:** As a Submitter or Admin, I want to upload images, PDFs, and documents securely, so that files are stored reliably in Cloudinary and metadata is tracked in the database.

#### Acceptance Criteria

1. THE File_Service SHALL accept the following MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
2. THE File_Service SHALL enforce a maximum file size of 10 MB per upload, returning HTTP 413 with a descriptive error for oversized files.
3. WHEN a file is uploaded, THE File_Service SHALL validate the MIME type against the file's magic bytes (not just the declared Content-Type), rejecting mismatched files with HTTP 422.
4. WHEN a file passes validation, THE File_Service SHALL upload it to Cloudinary under an organised folder structure (`dayzero/{entity}/{year}/{month}`) and store the `public_id`, `secure_url`, `format`, `bytes`, `width`, `height` (for images), and `original_filename` in the `files` table; IF the Database write fails after a successful Cloudinary upload, THEN THE File_Service SHALL delete the uploaded file from Cloudinary before returning an error.
5. THE File_Service SHALL expose `DELETE /api/files/:id` to remove a file from both Cloudinary and the Database, accessible only to admins or the file's owner.
6. THE File_Service SHALL generate signed Cloudinary URLs for private assets when accessed via `GET /api/files/:id/url`.

---

### Requirement 8: Notification System

**User Story:** As a platform operator, I want a queue-based notification system that supports email, in-app, and push-ready channels, so that users and admins receive timely, reliable notifications without blocking request processing.

#### Acceptance Criteria

1. THE Notification_Service SHALL process all outbound notifications asynchronously via the Queue_Service (Bull/BullMQ backed by Redis).
2. THE Notification_Service SHALL send transactional emails via Nodemailer using an SMTP provider configured through environment variables, with HTML templates stored in `src/emails/`.
3. THE Notification_Service SHALL expose `GET /api/notifications` (authenticated) returning the current user's unread and read in-app notifications, paginated.
4. THE Notification_Service SHALL expose `PATCH /api/notifications/:id/read` and `PATCH /api/notifications/read-all` to mark notifications as read.
5. WHEN a new idea submission is received, THE Notification_Service SHALL enqueue an email to all addresses in `NOTIFICATION_RECIPIENTS` with: submitter name, email, Cast_ID, category, and idea description.
6. WHEN a submission status changes, THE Notification_Service SHALL enqueue an email to the submitter's email address informing them of the new status.
7. THE Notification_Service SHALL implement retry logic: WHEN an email delivery fails, THE Queue_Service SHALL retry up to 3 times with exponential backoff (1 min, 5 min, 15 min).
8. IF all retry attempts for a notification delivery fail, THEN THE Notification_Service SHALL mark the notification as `failed` in the Database and emit a high-priority alert to the admin error log.
9. WHERE push notification credentials are configured (FCM), THE Notification_Service SHALL support sending push notifications as a drop-in extension without code changes to existing notification callers.

---

### Requirement 9: Security Middleware Stack

**User Story:** As a security engineer, I want comprehensive security middleware applied globally, so that the API is protected against common web vulnerabilities by default.

#### Acceptance Criteria

1. THE API_Server SHALL apply Helmet.js with a strict Content-Security-Policy to every response.
2. THE API_Server SHALL apply CORS middleware restricting allowed origins to the list defined in the `CORS_ALLOWED_ORIGINS` environment variable.
3. THE API_Server SHALL apply a global rate limiter of 100 requests per IP per 15-minute window, returning HTTP 429 with `Retry-After` only when the actual rate limit has been exceeded.
4. THE API_Server SHALL apply per-route rate limiting for sensitive endpoints: authentication endpoints limited to 10 requests per IP per 15 minutes.
5. THE API_Server SHALL sanitise all incoming request bodies with `express-mongo-sanitize` or equivalent to prevent NoSQL/prototype pollution attacks.
6. THE API_Server SHALL validate and parse all request bodies, query parameters, and path parameters using Zod schemas; any schema violation SHALL return HTTP 400 with `{ success: false, errors: [{ field, message }] }`.
7. THE API_Server SHALL log all incoming requests in Apache Combined Log Format via Morgan, writing to both stdout and a rotating log file in `src/logs/`.
8. IF an uncaught exception or unhandled promise rejection occurs, THEN THE API_Server SHALL attempt to log the full error via Winston and return HTTP 500 with a sanitised error response (no stack traces in production); IF the Winston logger itself fails, THE API_Server SHALL still return HTTP 500 to the client and continue serving requests, prioritising availability over complete audit trails.
9. THE API_Server SHALL include an `X-Request-ID` header in every response, generated per request, and propagate it through all internal log entries for tracing.
10. THE API_Server SHALL store passwords only as bcrypt hashes, never log PII (email, name, IP) at DEBUG level or above in production, and redact sensitive fields from all log outputs.

---

### Requirement 10: Audit and Activity Logging

**User Story:** As a compliance officer, I want immutable audit logs for all sensitive operations and activity logs for user actions, so that every data change can be traced, investigated, and reported.

#### Acceptance Criteria

1. THE Audit_Service SHALL write an `audit_logs` record for every mutating operation on sensitive entities (`users`, `roles`, `permissions`, `idea_submissions`, `settings`, `files`), capturing: `actor_id`, `action` (e.g. `user.created`, `submission.status_changed`), `entity_type`, `entity_id`, `old_value` (JSON), `new_value` (JSON), `ip_address`, `user_agent`, and `created_at`.
2. THE Audit_Service SHALL write an `activity_logs` record for every authenticated API request, capturing: `user_id`, `method`, `path`, `status_code`, `duration_ms`, `ip_address`, and `created_at`.
3. THE Audit_Service SHALL NOT allow audit log records to be updated or deleted through any API endpoint.
4. THE Admin_Service SHALL expose `GET /api/admin/logs/audit` with filtering by `actor_id`, `action`, `entity_type`, `dateFrom`, `dateTo`, and full-text search on `action`.
5. WHEN audit log storage exceeds the configured retention period (`AUDIT_LOG_RETENTION_DAYS`), THE Queue_Service SHALL execute a nightly job to archive old records to a configured S3-compatible storage location before removing them from the Database.

---

### Requirement 11: Application Logging (Winston)

**User Story:** As an operations engineer, I want structured, levelled, and rotated application logs persisted to disk and stdout, so that errors can be diagnosed and monitoring systems can ingest them.

#### Acceptance Criteria

1. THE API_Server SHALL use Winston as the sole logging library with transports for: coloured console output (development) and structured JSON file output (all environments).
2. THE API_Server SHALL write separate log files for: `application.log` (all levels), `error.log` (ERROR and FATAL only), `api.log` (HTTP request/response), `auth.log` (authentication events), `database.log` (slow queries > 100 ms), and `audit.log` (audit events).
3. EVERY log entry SHALL include: `timestamp` (ISO 8601), `level`, `message`, `requestId`, `service` (`dayzero-api`), and any structured metadata passed by the caller.
4. THE API_Server SHALL rotate log files daily, retaining a maximum of 30 days of logs, using `winston-daily-rotate-file`.
5. WHERE `LOG_LEVEL` environment variable is set, THE API_Server SHALL honour it for the minimum log level; default SHALL be `info` in production and `debug` in development.

---

### Requirement 12: Performance and Caching

**User Story:** As a platform architect, I want the API to use Redis caching, query optimisation, pagination, and background jobs, so that response times remain acceptable under load.

#### Acceptance Criteria

1. THE Cache_Service SHALL cache the result of `GET /api/admin/analytics/summary` in Redis with a 60-second TTL, returning the cached value on subsequent requests within the TTL window.
2. THE Cache_Service SHALL cache resolved RBAC permission sets per user in Redis with a 5-minute TTL, invalidated on role change.
3. THE API_Server SHALL apply HTTP response compression (gzip/br) via the `compression` middleware to all responses larger than 1 KB.
4. ALL Database queries that return multiple records SHALL use Prisma's `take`/`skip` or cursor-based pagination; unbounded queries (no `take`) SHALL be forbidden by a Prisma middleware guard.
5. THE Queue_Service SHALL process background jobs (email sending, file processing, analytics aggregation, audit archiving) in separate named queues to prevent head-of-line blocking.
6. THE Database connection pool SHALL be configurable via `DATABASE_POOL_MIN` and `DATABASE_POOL_MAX` environment variables.
7. WHEN a Redis connection is lost, THE Cache_Service SHALL fall back to direct Database queries and log a WARNING; the API SHALL continue serving requests without degradation.

---

### Requirement 13: API Response Format and Error Handling

**User Story:** As a frontend developer, I want every API response to follow a consistent JSON envelope, so that the React frontend can handle success, error, and pagination cases with a single response handler.

#### Acceptance Criteria

1. EVERY API response SHALL use the envelope: `{ "success": boolean, "message": string, "data": object | null, "pagination": object | null, "errors": array | null }`.
2. THE API_Server SHALL define a `CustomError` class hierarchy with `ValidationError` (HTTP 400), `UnauthorisedError` (HTTP 401), `ForbiddenError` (HTTP 403), `NotFoundError` (HTTP 404), `ConflictError` (HTTP 409), `RateLimitError` (HTTP 429), and `InternalError` (HTTP 500).
3. WHEN a `CustomError` is thrown, THE API_Server's global error middleware SHALL catch it, set the appropriate HTTP status code, and return a structured error response.
4. WHEN an unexpected error reaches the global error middleware, THE API_Server SHALL return HTTP 500 with `{ success: false, message: "An unexpected error occurred", errors: null }` and SHALL NOT expose stack traces or internal details in non-development environments.
5. WHEN a Zod validation schema fails, THE API_Server SHALL map Zod's error output to the `errors` array with `{ field: string, message: string }` objects.

---

### Requirement 14: Swagger / OpenAPI Documentation

**User Story:** As a developer integrating with the API, I want auto-generated, always-current OpenAPI 3.0 documentation served from the running server, so that I can explore and test all endpoints without consulting separate documents.

#### Acceptance Criteria

1. THE API_Server SHALL serve Swagger UI at `GET /api/docs` in non-production environments.
2. EVERY API route SHALL have JSDoc annotations (`@openapi`) that describe: summary, operationId, request body schema (Zod-derived), query parameters, response schemas for all returned status codes, and security requirements.
3. THE API_Server SHALL generate a downloadable `openapi.json` spec at `GET /api/docs/json`.
4. WHERE `SWAGGER_ENABLED=true` is set, THE API_Server SHALL also serve Swagger UI in production, protected by HTTP Basic Auth credentials from environment variables.
5. THE Swagger UI SHALL group endpoints by tag: `Auth`, `Intake`, `Admin-Submissions`, `Admin-Users`, `Admin-Analytics`, `Admin-Logs`, `Notifications`, `Files`, `Settings`, `Health`.

---

### Requirement 15: Testing

**User Story:** As a quality engineer, I want comprehensive unit, integration, and API tests, so that regressions are caught before deployment.

#### Acceptance Criteria

1. THE API_Server's test suite SHALL cover unit tests for all service-layer functions, integration tests for all repository functions (using a test database), and API (end-to-end) tests for all route handlers using Supertest.
2. THE API_Server's test suite SHALL achieve a minimum of 80% line coverage across `src/services`, `src/controllers`, and `src/validators`.
3. WHEN running tests, THE API_Server SHALL use a separate test database and a separate Redis instance (or `ioredis-mock`) configured via `TEST_DATABASE_URL` and `TEST_REDIS_URL` environment variables.
4. THE API_Server test suite SHALL include property-based tests using `fast-check` for the Cast_ID generator to verify format correctness and uniqueness across arbitrary call sequences.
5. THE API_Server test suite SHALL include property-based tests for all Zod request validators to verify that valid inputs are accepted and that invalid inputs (arbitrary bad values) are rejected with appropriate error structures.
6. FOR ALL valid idea submission payloads, the intake endpoint test SHALL verify that encoding the payload, submitting it, and decoding the response produces a Cast_ID that matches the format regex `^DZ-\d{2}-\d{4}$` (round-trip property).

---

### Requirement 16: Deployment and DevOps

**User Story:** As a DevOps engineer, I want Docker images, a health check endpoint, and deployment configurations for common cloud platforms, so that the backend can be deployed and operated reliably.

#### Acceptance Criteria

1. THE API_Server's `Dockerfile` SHALL produce an image under 300 MB using a multi-stage build with `node:20-alpine` as the production base.
2. THE `docker-compose.yml` SHALL define services for `api`, `postgres`, and `redis` with health checks, restart policies, named volumes for data persistence, and a `.env.example`-driven environment.
3. THE API_Server SHALL expose `GET /health` and `GET /health/ready` (readiness: DB + Redis connectivity) and `GET /health/live` (liveness: process is alive) for orchestrator health probes.
4. THE API_Server SHALL execute `prisma migrate deploy` as part of the Docker entrypoint before starting the server in production.
5. THE API_Server source SHALL include a `README.md` documenting: prerequisites, local setup steps, environment variable reference, available npm scripts, API endpoint index, deployment guide for Render/Railway/AWS/DigitalOcean, and contribution guidelines.
6. THE API_Server source SHALL include a Bruno API collection (`api-collection/`) and an exported Postman collection (`postman/`) with pre-configured environments for local, staging, and production.
