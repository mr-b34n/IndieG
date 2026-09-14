# PROJECT PITFALLS

## Pitfall: Excessive Borders

Status: Active

Problem:

Using borders as the default way to create hierarchy makes the UI visually fragmented.

Root cause:

Containers were being visually separated instead of using spacing and surface hierarchy.

Prevention:

Use borders only when they communicate meaningful structure.

---

## Pitfall: Overloaded Header

Status: Active

Problem:

Putting too many controls and secondary information in the main header makes navigation feel crowded.

Prevention:

Keep primary navigation and primary actions clear.

---

## Pitfall: Frontend-Only Authorization

Status: Active

Problem:

A UI can hide a feature while the API remains directly callable.

Prevention:

Enforce sensitive restrictions server-side.

---

---

## Pitfall: Mock Data Shadowing API Responses

Status: Active

Problem:

Components defining hardcoded default mock arrays in `useMemo` or local state can unintentionally shadow or overwrite real API responses from TanStack Query.

Prevention:

Always map remote query data directly (`extractList` -> `mapEntityToModel`), render skeleton loaders while queries are pending, and display standard empty states when zero items are returned rather than falling back to hardcoded mock entries.

---

## Pitfall: Storage & Upload Pipeline Silent Rejections

Status: Active

Problem:

Image upload pipelines calling `POST /storage/presigned-url` can fail silently without triggering backend logs if:
1. Client is served via HTTPS while Backend API is HTTP localhost (Mixed Content blocked before network dispatch).
2. Auth token is missing from localStorage or invalid JWT.
3. Errors inside async handlers fail to surface visual feedback.

Prevention:

Always provide dynamic API Base URL overrides (`indieg_custom_api_url`), wrap upload pipeline steps with detailed console logging and error diagnostics, and provide a dedicated test sandbox in Developer tools for direct endpoint testing.

---

## Pitfall: Duplicate Concurrent GET Requests on Reload & StrictMode

Status: Active

Problem:

On page reload or in development React StrictMode, effects can trigger multiple identical GET requests within milliseconds. This bursts backend API endpoints, exhausting rate limits (429 Too Many Requests) and causing degraded user experience.

Prevention:

1. Use in-flight request deduplication (`inFlightGetRequests` / `inFlightSearchRequests`) in both central API client (`apiRequest`) and domain fetch functions to coalesce concurrent requests into a single promise.
2. Maintain short-lived response caches (15-20s TTL) for read-heavy search operations.
3. Guard route synchronization effects with `isInitialMountRef` to prevent redundant navigations on mount.

---

## Pitfall: External CDN (Steam/Akamai) Image Hotlink Protection (403 Forbidden)

Status: Active

Problem:

External CDN hosts (such as Steam's `cdn.akamai.steamstatic.com` and `shared.fastly.steamstatic.com`) block hotlinked images with 403 Forbidden when requests contain third-party `Referer` headers, causing `<img>` elements to break.

Prevention:

1. Always specify `<meta name="referrer" content="no-referrer" />` in `index.html` to suppress the referer header globally for cross-origin media requests.
2. Use `referrerPolicy="no-referrer"` explicitly on `<img>` tags displaying external game assets, banners, screenshots, or community avatars.
3. Provide fallback image handling via `onError` handlers so images never show broken icons if an external asset is unavailable.

---

## Pitfall: DTO Image Field Mismatch Across Features

Status: Active

Problem:

Backend API entities often name image fields differently across endpoints (e.g. `logo` vs `avatarUrl`, `backdrop` vs `bannerUrl`). When client UI components read `comm.avatarUrl` but the mapper only assigned `dto.logo`, images become `undefined` and render broken icons in search results even though the detail page renders them via fallback aliases.

Prevention:

1. In mapper functions (`mapCommunityDtoToCommunityData`, `mapUserProfileDtoToSearchUser`), populate both canonical aliases (`logo` and `avatarUrl`, `backdrop` and `bannerUrl`).
2. In UI components, always provide fallback chains on `img` `src` (e.g., `comm.avatarUrl || comm.logo`).



