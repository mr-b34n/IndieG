# MEMORY INDEX

Use this file only to identify relevant project memory.

Do NOT load every memory file for every task.

## Memory Selection

### Product

File:

`memory/product.md`

Load when the task involves:

* product behavior
* feature decisions
* user experience principles
* product scope
* domain relationships

---

### UI

File:

`memory/ui.md`

Load when the task involves:

* visual design
* layout
* components
* colors
* borders
* headers
* search UI
* responsive behavior

---

### Authentication

File:

`memory/auth.md`

Load when the task involves:

* login
* registration
* email verification
* refresh tokens
* sessions
* password reset
* authentication security

---

### Architecture

File:

`memory/architecture.md`

Load when the task involves:

* architecture
* service boundaries
* API structure
* major integrations
* cross-layer changes
* architectural refactoring

---

### Pitfalls

File:

`memory/pitfalls.md`

Load when the task involves:

* debugging
* known problematic areas
* previous non-obvious bugs
* security pitfalls
* deployment-related problems

---

## Loading Rule

Load only memory directly relevant to the task.

Examples:

```text
Search UI
→ ui.md
→ product.md only if product behavior is affected

Login
→ auth.md

Database architecture change
→ architecture.md
→ auth.md only if authentication data is affected

UI bug
→ ui.md
→ pitfalls.md only if investigating a known problem

Small CSS change
→ ui.md
```

Do not load unrelated memory files.
