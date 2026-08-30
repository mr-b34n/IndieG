# SKILL INDEX

Use this file only to select relevant skills.

Do NOT load every skill for every task.

## Selection Rules

Select only the skills directly relevant to the current task.

If a task spans multiple domains, load only the necessary skills.

### UI / Frontend

File:

`skills/ui.md`

Use when the task involves:

* page layout
* components
* styling
* responsive design
* navigation
* visual hierarchy

---

### Search

File:

`skills/search.md`

Use when the task involves:

* search
* search results
* discovery
* filtering search results
* result grouping
* communities/games/users/posts in search

---

### Authentication

File:

`skills/auth.md`

Use when the task involves:

* register
* login
* logout
* refresh
* sessions
* password reset
* email verification
* authentication guards

---

### API

File:

`skills/api.md`

Use when the task involves:

* endpoints
* controllers
* DTOs
* request/response schemas
* API integration
* API contracts

---

### Database

File:

`skills/database.md`

Use when the task involves:

* database models
* relations
* migrations
* queries
* indexes
* persistence

---

### Debugging

File:

`skills/debugging.md`

Use when the task involves:

* bugs
* unexpected behavior
* runtime errors
* integration failures
* performance investigation

---

## Loading Rule

Do not load unrelated skills.

Examples:

```text
"Fix search UI"
→ ui.md + search.md

"Add email verification gate"
→ auth.md + ui.md
(if frontend UI is involved)

"Add community endpoint"
→ api.md
(+ database.md only if schema changes)

"Fix database query"
→ database.md + debugging.md

"Change button spacing"
→ ui.md
```

---
### Cleanup

File:

`skills/clean.md`

Use when the task involves:

* removing mock/demo/sample data
* removing placeholder content
* removing dead code
* removing unused imports/functions/constants
* removing stale comments
* removing commented-out code
* removing debug code
* removing temporary development artifacts
* removing obsolete files/assets
* cleaning duplicate or redundant code
* repository-wide cleanup
* "remove all" / "clean completely" requests

This skill is intentionally generic.

Select it whenever the primary goal is **removal of unnecessary project residue**, regardless of the specific residue type.


If the task is trivial and can be completed safely without a skill file, do not load unnecessary skills.
