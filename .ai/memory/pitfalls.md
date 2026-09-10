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

