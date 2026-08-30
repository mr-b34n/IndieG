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
