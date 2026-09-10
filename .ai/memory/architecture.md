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
