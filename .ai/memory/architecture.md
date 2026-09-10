# ARCHITECTURE MEMORY

## Decision: Reuse Existing Abstractions

Status: Active

Date: 2026-08-30

Decision:

Existing components, services, utilities, and API abstractions should be reused when they already solve the problem.

Why:

Parallel abstractions create inconsistency and maintenance cost.

Implications:

Search the repository before introducing a new abstraction.

---

## Decision: Preserve Layer Responsibilities

Status: Active

Date: 2026-08-30

Decision:

Business logic should remain in the appropriate service/domain layer when the existing architecture separates it from controllers.

Why:

This keeps responsibilities clear and improves reuse/testability.

Implications:

Do not move business logic into controllers merely for convenience.

---

## Decision: API Contract Stability

Status: Active

Date: 2026-08-30

Decision:

Existing API contracts should remain stable unless an intentional change is required.

Why:

Existing clients depend on current behavior.

Implications:

Inspect consumers before modifying response/request contracts.

---

## Decision: Client-side Image Processing & Direct R2 Upload

Status: Active

Date: 2026-09-09

Decision:

Images (avatar, cover, post) must be processed on client (validation, resize, crop, WebP conversion) and uploaded directly to Cloudflare R2 via presigned URLs before confirming with the backend.

Profile avatar and cover updates confirm directly via `PATCH /profiles/me` (with `{ avatarUrl }` or `{ coverUrl }`), rather than separate `/users/avatar` or `/users/cover` endpoints.

Why:

Offloads heavy image processing and bandwidth from the backend server to client browser and Cloudflare edge, while standardizing user profile modifications through a single `PATCH /profiles/me` contract.

Implications:

- Use `ImageCropperModal` for user drag/zoom/crop prior to passing the cropped image to `uploadImageToR2`.
- Use `processImagePipeline` in `src/shared/utils/image-processor.ts`.
- Use `uploadImageToR2` in `src/shared/services/upload-service.ts`.
- Follow defined dimension, crop, and quality policies (Avatar: 256x256 WebP Q85, Cover: max 1920px WebP Q85, Post: max 1600x1600 WebP Q80).
- Post-upload profile confirmation targets `PATCH /profiles/me` with a fully qualified public URL (via `getPublicStorageUrl` using `VITE_R2_PUBLIC_URL` or presigned domain) to satisfy backend `@IsUrl()` validation.
- All API endpoints must normalize leading and trailing slashes through `getApiBaseUrl()` and strip extra slashes to avoid double-slash (`//endpoint`) routing errors.
- SPA frontend routes (such as `/auth`) are handled directly by Vite dev server (`index.html`), while backend API calls use direct absolute URLs from `getApiBaseUrl()` (pointing to `http://localhost:3636` or `VITE_API_BASE_URL`).

---

## Decision: Centralized API Client & OpenAPI Endpoint Synchronization

Status: Active

Date: 2026-09-10

Decision:

All backend HTTP requests MUST use the centralized `apiRequest` utility in `src/shared/api/client.ts` rather than ad-hoc `fetch` calls. The API client uses `buildSafeApiUrl` to guarantee clean URL path construction with no accidental double slashes (e.g. `//auth/login`), automatically injects JWT tokens, and handles token refresh flows.

In addition, all backend OpenAPI endpoints for Games (`/games/*`, `/games/{appid}/guides/*`, `/games/{appid}/reviews/*`, `/games/{appid}/patch-notes/*`) are centralized in `src/shared/api/index.ts` with corresponding typed React Query hooks in `src/shared/api/useQueries.ts`.

Why:

Prevents fragmented network request logic, inconsistent error formatting, broken authentication token attaching, and NestJS strict URL matching 404 errors.

Implications:

- Do not call native `fetch()` for backend API requests.
- Add new endpoints to `src/shared/api/index.ts` and React Query hooks to `src/shared/api/useQueries.ts`.
- The only acceptable uses of native `fetch` are in `apiRequest` itself, direct PUT to Cloudflare R2 bucket via pre-signed URL, and reading local browser `blob:` URLs.
