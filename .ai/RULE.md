# PROJECT RULES

These rules are mandatory for all AI work on this repository.

## 1. Repository First

Before implementing a non-trivial task:

1. Inspect the relevant repository files.
2. Search for existing implementations.
3. Reuse existing patterns.
4. Inspect related APIs, models, services, and components.
5. Only then implement.

Never invent architecture that can be discovered from the repository.

---

## 2. Minimal Change

Make the smallest correct change.

Do not:

* refactor unrelated code
* redesign unrelated UI
* replace dependencies without justification
* create duplicate abstractions
* modify unrelated APIs
* change database structure unnecessarily

---

## 3. Source of Truth

Use sources according to their purpose:

* `RULE.md` → mandatory rules
* `SKILLS.md` → skill index
* `skills/*.md` → task-specific procedures
* `MEMORY.md` → memory index
* `memory/*.md` → durable project knowledge
* source code → current implementation
* API/OpenAPI → current API contract
* database schema/migrations → current persistence structure

If memory conflicts with current code, investigate before acting.

---

## 4. Security

Never weaken:

* authentication
* authorization
* email verification enforcement
* session security
* token security
* ownership checks

Frontend restrictions are not security boundaries.

Sensitive restrictions must be enforced server-side.

Never expose secrets, passwords, tokens, or credentials.

---

## 5. API

Preserve existing API contracts unless an explicit change is required.

Before modifying an API:

* inspect consumers
* inspect validation
* inspect authorization
* inspect response behavior
* inspect pagination/filtering conventions

Do not invent endpoints unnecessarily.

---

## 6. Database

Before modifying schema:

* inspect relations
* inspect usages
* inspect migrations
* inspect constraints
* inspect indexes
* consider existing data

Avoid destructive changes unless explicitly required.

---

## 7. UI

The product follows a:

* dark
* neutral
* modern
* minimal
* content-focused
* low-noise

visual direction.

Prefer hierarchy through:

* spacing
* typography
* surface contrast
* subtle elevation

Avoid:

* unnecessary borders
* heavy green surfaces
* crowded headers
* excessive cards
* excessive decorative colors
* excessive gradients

---

## 8. Search

Search is a discovery surface.

It may contain:

* communities
* games
* users
* posts

Large result sets should use previews and progressive discovery instead of rendering everything on the main search surface.

---

## 9. Verification

After meaningful changes, verify appropriate:

* type checking
* linting
* tests
* build
* API behavior
* integration
* relevant edge cases

Never claim a check passed if it was not performed.

---

## 10. Memory

Only update memory when durable knowledge has changed.

Store:

* decisions
* rationale
* constraints
* trade-offs
* non-obvious pitfalls

Do not store:

* trivial edits
* temporary task state
* changelog entries
* ordinary implementation details
* conversation history

When an active decision changes, update the relevant memory entry.

## 11. Cleanup Safety

When performing cleanup:

* prefer evidence-based deletion
* never delete unclear code merely because it looks unnecessary
* preserve types, schemas, configuration, and intentional defaults
* preserve meaningful comments
* inspect references before deleting files or symbols
* perform a second search after repository-wide cleanup
* do not turn cleanup into unrelated refactoring
* report anything intentionally preserved or still unclear
