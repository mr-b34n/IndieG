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

---

## Decision: Unified Search API Integration (`GET /search`)

Status: Active

Date: 2026-09-13

Decision:

All search operations (both header live preview and `/search` full results page) route through `searchApi.search` calling `GET /search` with schema constraints:
- `q`: string, min 2, max 100 characters.
- `type`: optional scope (`game`, `community`, `profile`, `post`). Omitted for global search preview.
- `page`: min 1, default 1.
- `limit`: min 1, max 50, default 10.

Why:

Ensures unified, accurate backend search results across games, communities, user profiles, and posts while respecting rate limiting (20 req/60s) via input debouncing (300ms–400ms) and min-length guards.

Implications:

- Calls are debounced with `useDebounce` to prevent rate-limit throttling.
- If query length < 2 characters, client-side fallback/empty state is returned to prevent 400 Bad Request errors.
- Tab names are normalized (`games`/`game` -> `game`, `communities`/`community` -> `community`, `users`/`profile` -> `profile`, `posts`/`post` -> `post`, `all` -> omitted).

---

## Decision: Post Voting API Contract (`POST /votes/post/{postId}`)

Status: Active

Date: 2026-09-14

Decision:

Voting on posts uses `POST /votes/post/{postId}` with a JSON request body `{ voteType: 1 | -1 }` where:
- `1` represents an upvote.
- `-1` represents a downvote.
- Removing a vote / unvoting uses `DELETE /votes/{postId}/post`.

Why:

Matches backend VoteController specification for unified vote type handling per post.

Implications:

- In `src/shared/api/types.ts`: declared `VoteType = 1 | -1` and `VotePostDto { voteType: VoteType }`.
- In `src/shared/api/index.ts`: `votesApi.votePost(postId, voteType)` sends `POST /votes/post/{postId}` with `{ voteType }`. Convenience helpers `upVotePost` and `downVotePost` delegate to `votePost`.
- In `src/features/post/api/interaction-api.ts`: `usePostVoteInteraction(postId)` accepts `1`, `-1`, or `null` to update or remove votes.
- In `src/features/post/components/Post.tsx`: `handleLike` and `handleDownvote` dispatch the corresponding `1` or `-1` (or `null` when toggling off).

---

## Decision: Optimistic State Updates & Query Refetch Elimination for Votes & Comments

Status: Active

Date: 2026-09-16

Decision:

1. **Post & Comment Voting**: Voting applies optimistic state updates directly in local component state and `usePostsStore` immediately. TanStack Query cache is directly updated with `queryClient.setQueryData` for the target post/comment vote key, without invalidating or refetching post feeds (`queryKey: ['posts']`).
2. **Comment Submission & Tree Updates**: New comments and sub-replies appear instantly via optimistic state. When the creation API succeeds, the server-assigned ID replaces the temporary ID in-place and post comment count is incremented in `usePostsStore`. `useCreateCommentMutation` does not invalidate or refetch the entire comment list (`queryKey: ['comments']`), saving unnecessary network roundtrips.
3. **`currentUserVoteType` Field Handling**: All post responses include `currentUserVoteType` with values `[-1, 0, 1]` (`-1`: downvoted, `0`: no vote, `1`: upvoted). Post UI dynamically derives vote status from `currentUserVoteType`, and clicking up/down toggles colors, counts, and opposite vote cancellation identically to Facebook/Reddit reaction mechanisms.

Why:

Prevents aggressive network refetches, eliminates UI flickering, saves API rate limits and bandwidth, and provides a snappy Messenger-like user experience.



