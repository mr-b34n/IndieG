# PROJECT RULES

> Mandatory rules for any AI working on this repository.
>
> These rules apply to coding, debugging, refactoring, architecture,
> API, database, authentication, and UI/UX work.

---

# 1. Core Principle

You are working on an existing product, not creating an isolated code sample.

Before changing anything, understand:

* the existing architecture
* existing implementation
* existing conventions
* existing product decisions
* existing API contracts
* existing security boundaries
* existing UI system

Prefer extending the existing system over creating parallel solutions.

---

# 2. Rule Priority

When making decisions, use this priority:

1. Security
2. Data integrity
3. Explicit product requirements
4. Existing architecture
5. Existing project decisions
6. API compatibility
7. Maintainability
8. UX consistency
9. Performance
10. Developer convenience

Never sacrifice a higher-priority concern merely to satisfy a lower-priority one.

---

# 3. Repository First

Do not assume how the project works.

Before implementing a non-trivial change:

* inspect the relevant files
* search for similar functionality
* identify existing abstractions
* inspect related API endpoints
* inspect related models
* inspect existing components
* inspect tests where available
* inspect configuration when relevant

If the repository already contains a solution, prefer reusing it.

---

# 4. Minimal Change

Make the smallest change that correctly solves the task.

Do not:

* refactor unrelated code
* rename unrelated files
* replace libraries without justification
* redesign unrelated pages
* modify unrelated APIs
* introduce unnecessary abstractions
* introduce unnecessary dependencies

A task should not become a rewrite unless the existing architecture genuinely prevents a correct solution.

---

# 5. Do Not Guess

If important information can be discovered from the repository, inspect it instead of guessing.

Do not invent:

* API endpoints
* database relationships
* response schemas
* authentication behavior
* permissions
* component APIs
* design tokens
* business rules

If the repository does not provide enough information, explicitly state the assumption.

---

# 6. Source of Truth

Use each source for the information it is best suited to provide.

### RULE.md

Mandatory AI behavior.

### SKILL.md

Recommended implementation procedures.

### MEMORY.md

Durable project decisions, constraints, rationale, and non-obvious pitfalls.

### Source code

Current implementation.

### API/OpenAPI schemas

Current API contract.

### Database schema/migrations

Current persistence structure.

If MEMORY.md conflicts with current implementation, investigate before changing anything.

Do not blindly trust stale memory.

---

# 7. Product Consistency

This application is a hybrid social/forum platform.

Important product concepts include:

* users
* profiles
* communities
* games
* posts
* comments/interactions
* discovery/search

New features must fit the existing product model.

Do not treat each page as an independent application.

---

# 8. UI/UX Rules

The interface should maintain a:

* dark-friendly
* modern
* minimal
* content-focused
* low-noise
* consistent

visual language.

Prefer:

* spacing
* typography
* hierarchy
* subtle surface differences
* restrained gradients
* meaningful elevation

Avoid unnecessary visual decoration.

---

## 8.1 Borders

Do not use borders by default.

A border should exist only when it communicates meaningful structure or improves usability.

Do not add borders simply to make an element visually distinct.

---

## 8.2 Colored Surfaces

Do not use large saturated colored surfaces without a strong product reason.

Avoid heavy green surfaces and visually dominant green headers.

Accent colors should support hierarchy rather than dominate the interface.

---

## 8.3 Cards

Do not wrap every piece of content in a card.

Use cards when they communicate grouping, hierarchy, or interaction.

Prefer lightweight surfaces when a card adds no meaningful structure.

---

## 8.4 Header

Keep the primary header visually lightweight.

Do not overload it with:

* excessive navigation
* too many buttons
* unnecessary metadata
* large decorative elements
* competing actions

Primary navigation and primary actions should remain obvious.

---

# 9. Search UX

Search is a discovery surface.

It may contain multiple entity types, including:

* communities
* games
* users
* posts

The main search page must remain usable when result counts are large.

Do not render unlimited results directly on the main discovery surface.

Prefer:

* limited previews
* clear sections
* progressive discovery
* "View all" when appropriate

Search should optimize for scanning and navigation.

---

# 10. Authentication & Authorization

Authentication and authorization are separate concepts.

Do not assume:

```text
authenticated = authorized
```

Also do not assume:

```text
authenticated = email verified
```

The system may have states such as:

```text
Unauthenticated
Authenticated + Unverified
Authenticated + Verified
Authorized
```

Security-sensitive functionality must be enforced server-side.

Frontend guards are UX mechanisms, not security boundaries.

---

# 11. Email Verification

Where product requirements require email verification:

* frontend should communicate the verification requirement
* backend must enforce the actual restriction

Do not bypass verification checks for convenience.

Do not assume that a valid access token means the user is eligible for every feature.

---

# 12. Token & Session Security

Treat the following as security-sensitive:

* access tokens
* refresh tokens
* refresh cookies
* sessions
* password reset tokens
* email verification tokens

Never expose secrets or credentials.

Do not move credentials between storage mechanisms without an explicit architectural reason.

Do not weaken cookie or session security merely to simplify frontend integration.

---

# 13. API Rules

The API is a contract.

When changing an API:

* inspect existing consumers
* preserve compatibility where possible
* preserve validation behavior
* preserve authorization behavior
* preserve error semantics
* preserve pagination conventions
* update dependent clients when required

Do not silently change response shapes.

Do not invent an endpoint when an existing endpoint can satisfy the requirement.

---

# 14. Database Rules

Before modifying database structure:

* inspect relationships
* inspect constraints
* inspect indexes
* inspect migrations
* inspect existing usages
* consider existing data

Avoid destructive migrations unless explicitly required.

Do not remove or rename fields casually.

Consider query performance and indexing when introducing new access patterns.

---

# 15. Error Handling

Errors must be:

* predictable
* safe
* consistent
* actionable

Never expose:

* credentials
* tokens
* secrets
* internal authentication details
* sensitive implementation information

Use existing project error conventions.

---

# 16. Dependencies

Before adding a dependency:

1. search the repository for an existing equivalent
2. determine whether native functionality is sufficient
3. consider bundle/runtime impact
4. consider maintenance cost
5. add it only when justified

Do not add dependencies for trivial functionality.

---

# 17. UI State Completeness

Significant UI features should consider:

* loading
* empty
* populated
* error
* disabled
* unauthorized
* unverified
* responsive/mobile states where relevant

Do not implement only the successful state.

---

# 18. Verification

After making changes, verify them whenever possible.

Relevant checks may include:

* type checking
* linting
* tests
* build
* API contract checks
* integration behavior
* relevant edge cases

Never claim a check passed if it was not actually performed.

Clearly state what was and was not verified.

---

# 19. Memory Rules

Only update MEMORY.md when a change creates durable project knowledge.

Good memory:

* architectural decisions
* product decisions
* UX decisions
* security decisions
* important constraints
* non-obvious bugs
* important trade-offs
* decisions that future developers/AI must preserve

Do not store:

* trivial edits
* routine implementation details
* temporary task state
* ordinary file changes
* conversation history
* changelog entries

---

# 20. Changing Existing Decisions

If a new request conflicts with an established decision:

1. identify the conflict
2. determine whether the new request intentionally changes the decision
3. implement the new direction only when appropriate
4. update MEMORY.md so the old decision is no longer treated as active

Never silently create contradictory rules.

---

# 21. Final Response

After meaningful work, report:

### Implemented

What was changed.

### Files

Important files affected.

### Decisions

Important implementation choices.

### Verification

Checks performed.

### Notes

Assumptions, limitations, or risks.

Keep the report concise unless detailed explanation is requested.
