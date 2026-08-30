# PROJECT MEMORY

> Persistent project knowledge for AI-assisted development.
>
> This file stores durable decisions, constraints, rationale,
> trade-offs, and non-obvious pitfalls.
>
> This is NOT:
>
> * a changelog
> * a task list
> * a copy of the API documentation
> * a copy of the database schema
> * a copy of source code
> * conversation history
>
> Source code and API schemas remain authoritative for current implementation.

---

# 1. Product Identity

## Decision: Product Type

Status: Active

Date: 2026-08-30

Decision:

The product is a hybrid social + forum/community platform.

The core product model combines:

* social interaction
* forum-style discussions
* communities
* users/profiles
* games
* posts and interactions

Why:

The product should support both fast social discovery and deeper community discussions.

Implications:

New features should fit the relationship between users, communities, content, and games rather than treating these as isolated systems.

---

# 2. Product Principles

## Decision: Content and Community First

Status: Active

Date: 2026-08-30

Decision:

The product should prioritize content discovery, community participation, and readable information hierarchy.

Why:

The application combines social and forum behavior, so users should be able to quickly discover relevant content while still having a strong sense of community context.

Implications:

When choosing between decorative UI and useful content hierarchy, prioritize the latter.

---

## Decision: Low Visual Noise

Status: Active

Date: 2026-08-30

Decision:

The product should maintain a visually calm and focused interface.

Why:

Previous interface directions became visually heavy because of excessive borders, colored surfaces, cards, and dense headers.

Implications:

Prefer:

* spacing
* typography
* hierarchy
* subtle surfaces
* restrained accents

Avoid unnecessary decoration.

---

# 3. Visual Design Decisions

## Decision: Dark Neutral Visual Language

Status: Active

Date: 2026-08-30

Decision:

The primary visual language should be dark, neutral, modern, and minimal.

Why:

The product is intended to work naturally in a dark environment and should keep attention on content.

Implications:

New pages should reuse the existing dark neutral surface hierarchy rather than introducing unrelated visual themes.

---

## Decision: Avoid Heavy Green Surfaces

Status: Active

Date: 2026-08-30

Decision:

Large green surfaces and visually dominant green headers should not be used as the primary visual language.

Why:

The previous green-heavy direction felt visually aggressive and did not integrate well with the dark interface.

Implications:

Green may still be used as an accent where appropriate, but it should not dominate page-level surfaces.

---

## Decision: Minimal Borders

Status: Active

Date: 2026-08-30

Decision:

Visible borders should be used sparingly.

Why:

Excessive borders make the interface feel fragmented and visually noisy.

Implications:

Use spacing, contrast, surface differences, typography, and subtle elevation before reaching for borders.

A border should have a clear structural or usability purpose.

---

## Decision: Lightweight Header

Status: Active

Date: 2026-08-30

Decision:

The primary header should remain visually lightweight.

Why:

The previous header direction felt crowded and contained too many competing elements.

Implications:

Primary navigation and primary actions should be obvious.

Secondary information should not compete with the main navigation.

---

## Decision: Avoid Card-Heavy UI

Status: Active

Date: 2026-08-30

Decision:

Not every content group should be wrapped in a visible card.

Why:

Excessive cards create visual fragmentation and increase perceived complexity.

Implications:

Use cards when they communicate meaningful grouping or interaction.

Prefer lightweight sections for content that already has sufficient hierarchy.

---

# 4. Search Decisions

## Decision: Search Is a Discovery Surface

Status: Active

Date: 2026-08-30

Decision:

The main search page is primarily a discovery surface rather than a complete database listing.

Why:

Search may return multiple entity types and potentially large result sets.

The user should quickly understand what is relevant without being overwhelmed by results.

Implications:

The main search page should favor:

* concise previews
* entity grouping
* relevance
* fast scanning
* progressive discovery

---

## Decision: Preview Large Result Sets

Status: Active

Date: 2026-08-30

Decision:

Large search result groups should use limited previews rather than rendering the complete result set on the main search page.

Why:

Rendering large collections makes the page long, noisy, and difficult to scan.

Implications:

Use a pattern such as:

```text
Communities
  Result
  Result
  Result
  View all →

Games
  Result
  Result
  Result
  View all →

Users
  Result
  Result
  Result
  View all →
```

The exact preview count should be determined by the current UI implementation and product requirements rather than hard-coded in this memory.

---

# 5. Authentication Decisions

## Decision: Authentication and Verification Are Separate States

Status: Active

Date: 2026-08-30

Decision:

Being authenticated does not imply that the user's email is verified.

The system must treat authentication and email verification as separate states.

Why:

The product contains features that may require verified email while still allowing an authenticated but unverified user to access permitted functionality.

Implications:

Do not use:

```text
authenticated === verified
```

as an assumption.

Feature eligibility may require:

```text
authenticated
+
verified
+
authorized
```

depending on the feature.

---

## Decision: Verification Gates Are Server-Enforced

Status: Active

Date: 2026-08-30

Decision:

Frontend verification gates are UX behavior; backend enforcement is the actual security boundary.

Why:

A user can bypass frontend restrictions by calling the API directly.

Implications:

Any verified-only capability must have corresponding server-side enforcement.

---

## Decision: Refresh Authentication Must Preserve Credential Security

Status: Active

Date: 2026-08-30

Decision:

Refresh authentication must follow the project's established secure credential-storage and cookie strategy.

Why:

Refresh credentials are long-lived and security-sensitive.

Implications:

Do not move refresh credentials to a less secure storage mechanism merely to simplify client-side implementation.

When changing refresh behavior, inspect the actual authentication implementation and deployment configuration first.

---

# 6. Architecture Memory

## Decision: Repository Before Abstraction

Status: Active

Date: 2026-08-30

Decision:

Existing project abstractions should be reused before introducing new ones.

Why:

Duplicated abstractions create inconsistent behavior and increase maintenance cost.

Implications:

Before creating a new component, service, hook, utility, or API abstraction, search for an existing equivalent.

---

## Decision: Controllers and Business Logic

Status: Active

Date: 2026-08-30

Decision:

When the architecture separates HTTP concerns from business logic, business rules should remain in the appropriate service/domain layer rather than being duplicated inside controllers.

Why:

This keeps responsibilities clear and makes business logic easier to reuse and test.

Implications:

Follow the actual repository architecture when locating business logic.

Do not introduce a new architectural layer unless the existing architecture requires it.

---

# 7. API Memory

## Decision: API Contract Preservation

Status: Active

Date: 2026-08-30

Decision:

Existing API contracts should be preserved unless a deliberate product/architecture change requires modification.

Why:

Frontend and potentially other clients depend on established request and response behavior.

Implications:

Before changing an endpoint, inspect its consumers.

If the contract must change, update all relevant consumers and documentation.

---

# 8. Database Memory

## Decision: Avoid Destructive Schema Changes

Status: Active

Date: 2026-08-30

Decision:

Database changes should favor backward-compatible and non-destructive migrations whenever practical.

Why:

Existing data and dependent code may rely on current schema behavior.

Implications:

Do not casually delete or rename fields.

Inspect migrations, relationships, indexes, and existing data assumptions before changing schema.

---

# 9. Security Memory

## Decision: Frontend Is Not a Security Boundary

Status: Active

Date: 2026-08-30

Decision:

Frontend guards, hidden buttons, disabled controls, and route restrictions are not sufficient security controls.

Why:

Clients are controlled by users and can send direct requests.

Implications:

Authorization, ownership, verification requirements, and sensitive access restrictions must be enforced server-side.

---

# 10. UX Constraints

## Constraint: Search Must Scale

Status: Active

Date: 2026-08-30

Constraint:

Search UI must remain usable when result counts become significantly larger than the small-preview case.

Reason:

The product may contain many communities, games, users, and posts.

Implications:

Do not design search solely around a fixed small number of results.

---

## Constraint: New UI Must Fit Existing Visual Language

Status: Active

Date: 2026-08-30

Constraint:

New pages and components must visually belong to the existing application.

Reason:

The product previously suffered from inconsistent page-level visual directions.

Implications:

Reuse existing primitives and visual patterns before introducing new ones.

---

# 11. Known Pitfalls

## Pitfall: Overusing Borders

Status: Active

Date: 2026-08-30

Problem:

Adding borders to cards, sections, inputs, and navigation elements independently can make the interface feel fragmented and heavy.

Root cause:

Using borders as the default method of creating hierarchy.

Prevention:

Try spacing, typography, surface contrast, and subtle elevation first.

---

## Pitfall: Overloading the Header

Status: Active

Date: 2026-08-30

Problem:

Adding too many controls and secondary information to the primary header makes navigation feel crowded.

Root cause:

Treating the header as a container for every important action.

Prevention:

Keep primary navigation and primary actions clear.

Move secondary actions elsewhere when appropriate.

---

## Pitfall: Rendering Every Search Result

Status: Active

Date: 2026-08-30

Problem:

Rendering every matching entity directly on the main search page makes the interface difficult to scan.

Root cause:

Treating the search page as a complete result listing instead of a discovery surface.

Prevention:

Use previews and progressive discovery.

---

## Pitfall: Frontend-Only Authorization

Status: Active

Date: 2026-08-30

Problem:

A feature may appear protected in the UI while its API remains callable by unauthorized clients.

Root cause:

Treating frontend guards as security controls.

Prevention:

Enforce authorization and verification requirements on the backend.

---

# 12. Important Trade-offs

## Trade-off: Visual Simplicity vs Explicit Containers

Current preference:

Favor visual simplicity.

Reason:

The product benefits more from clear hierarchy and whitespace than from explicit containers around every section.

When to break this preference:

Use stronger containers when they materially improve:

* grouping
* interaction
* readability
* accessibility
* information architecture

---

# 13. Pending Decisions

> Only record unresolved decisions that future implementation must not guess.

Currently:

No additional architectural decisions have been finalized here.

When an important product decision is unresolved, add it using:

```md
## Question: <topic>

Status: Pending

Date: YYYY-MM-DD

Question:
<what has not been decided>

Options:
1. ...
2. ...
3. ...

Impact:
<what depends on this decision>
```

---

# 14. Superseded Decisions

> Keep historical decisions only when they explain why the current architecture exists.

When a decision changes:

```md
## Decision: <old decision>

Status: Superseded

Superseded by:
<new decision>

Reason:
<why it changed>
```

Do not allow superseded decisions to be interpreted as current requirements.

---

# 15. Memory Maintenance Rules

When adding memory:

* prefer decisions over implementation details
* explain why important decisions exist
* record constraints that future work must preserve
* record non-obvious pitfalls
* remove obsolete information
* mark changed decisions as superseded
* avoid duplication with source code
* avoid duplication with API documentation
* avoid conversation history
* avoid changelog-style entries

A memory entry should remain useful months after it was written.

If it would become irrelevant after the current task is finished, it probably does not belong here.
