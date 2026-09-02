# AUTHENTICATION MEMORY

## Decision: Authentication and Verification Are Separate

Status: Active

Date: 2026-08-30

Decision:

Authentication and email verification are separate states.

Why:

Authenticated users may still be unverified.

Implications:

Do not assume login automatically makes a user eligible for verified-only functionality.

---

## Decision: Verification Must Be Server-Enforced

Status: Active

Date: 2026-08-30

Decision:

Frontend verification gates are UX controls only.

Backend enforcement is the security boundary.

Why:

Clients can bypass frontend restrictions.

Implications:

Verified-only functionality must be enforced by the backend.

---

## Decision: Preserve Secure Refresh Mechanism

Status: Active

Date: 2026-08-30

Decision:

The established secure refresh-token/cookie strategy must be preserved unless an explicit architecture change is made.

Why:

Refresh credentials are security-sensitive.

Implications:

Inspect the complete authentication architecture before changing refresh-token storage or cookie behavior.

---

## Decision: 401 Interceptor and Session Expiration Recovery
Status: Active
Date: 2026-08-31

Decision:
All API requests intercept 401 Unauthorized responses. If an access token is expired, `apiRequest` automatically executes a single in-flight `POST /auth/refresh` request, updates stored tokens, and seamlessly replays the failed request with the new access token. If refresh token is also invalid or expired, the interceptor clears session tokens, sets a session-expired indicator, and redirects the user to `/auth?expired=1` displaying a clear session expiration notice.

Why:
Prevents abrupt user disconnections during routine access token expirations while securely redirecting to login when credentials are fully expired.

Implications:
Auth submission endpoints (e.g., login, register) bypass the refresh flow so form validation errors are returned directly to the user interface.

---

## Decision: No User Account Information in LocalStorage & In-Memory Single Fetch
Status: Active
Date: 2026-09-02

Decision:
User account profile information (username, email, avatar, bio, verification status) must NOT be stored in `localStorage`. Only authentication tokens (`accessToken`, `refreshToken`) reside in client storage. The user profile is held purely in-memory in `useAuthStore` and fetched once upon application boot or on profile query cache invalidation.

Why:
Ensures data privacy, guarantees accurate fresh server-state synchronization across left bar and header, prevents stale cache desyncs, and removes duplicate sequential API calls to `/profiles/me`.

Implications:
Do not save user profile objects to `localStorage`. Profile mutations must update in-memory Zustand store and TanStack Query cache directly.
