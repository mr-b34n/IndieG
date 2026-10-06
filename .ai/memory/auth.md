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

---

## Decision: Mock Test Accounts & Session Token Resolution
Status: Active
Date: 2026-10-01

Decision:
A standardized suite of 6 preset test accounts with full profile data, specific roles, and test credentials is integrated across `TEST_ACCOUNTS` (`src/features/auth/constants.ts`) and `src/mocks/users.mock.ts`:
1. **Admin**: `admin@indieg.com` / `Admin123!` (role: admin, verified)
2. **Founder / Pro Gamer**: `gamer@indieg.com` / `Gamer123!` (role: user, verified)
3. **Hardcore RPG**: `eldenlord@gmail.com` / `Souls123!` (role: user, verified)
4. **Streamer**: `streamer@indieg.com` / `Stream123!` (role: user, verified)
5. **FPS Pro**: `shadowhunter@fps.io` / `Shadow123!` (role: user, verified)
6. **Unverified**: `unverified@indieg.com` / `User123!` (role: user, unverified)

`authApi.login` matches against these accounts, assigns scoped mock tokens (`mock_token_${userId}`), and `profilesApi.getMe()` / `getMyProfile()` dynamically resolves the session to prevent account reset on page reloads. The `/auth` page presents a clean, streamlined form where credentials can be entered directly.

Why:
Allows developers and users to seamlessly test role-based access control (RBAC), verified email gates, and personalized game/creator profiles without manual registration friction or server dependencies.

---

## Decision: Banned, Archived, and Moderated Mock Account Lifecycle

Status: Active
Date: 2026-10-02

Decision:
1. **Banned and Archived Users**:
   - Banned accounts (`usr_banned_cheater` with cheater tools ban reason, `usr_banned_toxic` with harassment ban reason) have `status: "banned"`, `isBanned: true`, negative karma, and prominent alert banners/badges on their user profiles and community member lists.
   - Archived accounts (`usr_archived_veteran`, `usr_archived_inactive`) maintain preserved history with `status: "archived"`, `archived: true`, and archived notice indicators.
2. **Multi-Device Interactive Sessions**:
   - Expanded to 10 cross-platform mock sessions (Windows 11 PC, MacBook Pro M3, iPhone 15 Pro, Steam Deck, ROG Ally, iPad Air, ThinkPad Linux, plus revoked Cyber Cafe and suspicious Tor sessions).
   - `usersApi.getSessions` and `revokeSession` dynamically update session status, enabling real-time revocation in Settings > Security.
3. **Community Reports & Audit History**:
   - 10+ categorized reports across posts, comments, and users with pending, in-review, resolved, and dismissed statuses.
   - `reportsApi` connects to `getMockReports`, `getMockReportHistory`, and `resolveMockReport` allowing real-time moderation actions in Community Manage Moderation.

---

## Decision: Login Page Account Type Dropdown & Theme Toggle Removal

Status: Active
Date: 2026-10-05

Decision:
1. **Theme Toggle Removal on /auth**:
   - The dark/light mode toggle is removed from the `/auth` page header. Theme customization remains centralized in `/settings` (Appearance tab).
2. **Account Type Selector Dropdown Menu**:
   - Replaced by an "Account" pill button (`faUsers`, badge, and `faChevronDown`) in the top navigation header, with a matching quick-select prompt in the login form.
   - Clicking opens a downward dropdown menu (`animate-in fade-in slide-in-from-top-2`) displaying the 6 preset account types (Admin, Founder/VIP, Hardcore RPG, Streamer, FPS Pro, Tân thủ chưa verify).
   - Selecting an account auto-fills the login form fields, switches to login mode, and validates inputs.
   - Includes a 1-click "Vào ngay" (`faBolt`) instant login option in each dropdown row for zero-friction role switching during development and testing.

