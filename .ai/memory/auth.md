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
