# PROJECT SKILLS

> Procedures and reasoning patterns for working on this repository.
>
> RULE.md defines what must be respected.
> SKILL.md defines how to approach the work.

---

# 1. Standard Engineering Workflow

For every meaningful task:

```text
Understand
    ↓
Load project context
    ↓
Explore repository
    ↓
Identify existing patterns
    ↓
Define affected areas
    ↓
Plan smallest solution
    ↓
Implement
    ↓
Verify
    ↓
Update memory if necessary
```

Do not skip repository exploration for non-trivial work.

---

# 2. Context Loading

Before implementation, inspect:

```text
.ai/RULE.md
.ai/SKILL.md
.ai/MEMORY.md
```

Then inspect the relevant source code.

Do not assume that MEMORY.md contains the complete implementation.

Memory provides context and decisions.

Source code provides current behavior.

---

# 3. Repository Exploration Skill

When starting a task, search for:

* related feature names
* related domain entities
* existing components
* existing hooks
* existing services
* existing controllers
* existing DTOs/schemas
* existing API clients
* existing database models
* existing tests

Use the nearest existing implementation as a reference.

---

# 4. Feature Planning

Before coding a non-trivial feature, determine:

## Product

* What problem does the feature solve?
* Who uses it?
* Which existing features does it interact with?
* Is it authenticated?
* Is it verified-user-only?
* Does authorization apply?
* What should happen when no data exists?

## Backend

Determine whether the feature requires:

* existing endpoint
* modified endpoint
* new endpoint
* new service
* new model
* new relation
* new validation
* new authorization rule

## Frontend

Determine:

* page/component location
* API integration
* state management
* loading state
* empty state
* error state
* authorization state
* responsive behavior
* reusable components

---

# 5. Change Surface Analysis

Before implementation, identify:

```text
UI
 ↓
Client/API layer
 ↓
Endpoint
 ↓
Service/business logic
 ↓
Database/external service
```

Then identify which layers actually need modification.

Do not modify every layer automatically.

If an existing API already provides the required information, do not create another endpoint simply because the frontend feature is new.

---

# 6. Authentication Workflow

For authentication-related changes, trace the complete flow.

Typical model:

```text
Register
   ↓
Email verification state
   ↓
Login
   ↓
Access token
+
Refresh mechanism
   ↓
Authenticated request
   ↓
Authorization
```

Check all relevant states:

```text
Unauthenticated
Authenticated + Unverified
Authenticated + Verified
Authorized
```

When modifying authentication, inspect:

* token creation
* token validation
* cookies
* sessions
* verification state
* frontend auth state
* backend guards/middleware
* logout behavior
* refresh behavior

---

# 7. Email Verification Gate Workflow

When a feature requires verified email:

```text
Request
  ↓
Authenticated?
  ├── No → authentication requirement
  │
  └── Yes
       ↓
     Verified?
       ├── No → verification gate
       │
       └── Yes → continue
```

The frontend should provide a useful UX.

The backend must enforce the actual restriction.

Never rely exclusively on frontend gating.

---

# 8. API Modification Workflow

When changing an endpoint:

```text
Route/controller
    ↓
Validation/schema
    ↓
Service
    ↓
Repository/database
    ↓
Response
    ↓
API consumers
```

Check all affected consumers before changing response semantics.

For a new endpoint, define:

* method
* path
* authentication requirement
* authorization requirement
* request schema
* validation
* response schema
* error behavior
* pagination
* sorting/filtering where applicable

Follow existing project conventions.

---

# 9. Search Feature Skill

Treat search as a multi-entity discovery system.

Possible entity groups:

```text
Communities
Games
Users
Posts
```

The main search surface should provide a useful preview.

For example:

```text
Search Results

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

Do not render hundreds of results directly.

---

## 9.1 Large Result Sets

When result counts are large:

* keep sections compact
* show a limited preview
* provide progressive discovery
* preserve entity grouping
* provide "View all" when useful
* avoid repeating large UI structures

The search page should answer:

> "What are the most relevant things I found?"

It should not necessarily answer:

> "Show me every matching record."

---

# 10. Community Feature Skill

When implementing community functionality, consider:

```text
Community
├── identity
├── members
├── posts
├── moderators
├── permissions
└── related game/category
```

Always inspect existing membership and authorization behavior before implementing new community actions.

Do not assume all communities have identical visibility or membership rules unless the existing product model says so.

---

# 11. Post Feature Skill

When modifying post functionality, inspect:

```text
Post
├── author
├── community
├── title
├── content
├── tags
└── interactions/comments
```

Consider:

* ownership
* community membership
* moderation
* visibility
* pagination
* sorting
* content validation

Do not implement post behavior independently of community and authorization rules.

---

# 12. Profile Feature Skill

When working on profiles, distinguish:

```text
Authentication identity
        ≠
Public profile
        ≠
Private/current-user data
```

Inspect existing endpoints and permissions before exposing or modifying profile information.

Preserve existing validation constraints unless an explicit product decision changes them.

---

# 13. UI Implementation Skill

Before creating a new UI:

1. find similar existing components
2. inspect existing design tokens
3. inspect spacing
4. inspect typography
5. inspect buttons
6. inspect cards/surfaces
7. inspect navigation
8. inspect responsive behavior

Reuse existing primitives.

---

# 14. UI Hierarchy Skill

When a page looks visually heavy, first reduce:

1. unnecessary containers
2. unnecessary borders
3. excessive colors
4. excessive cards
5. excessive metadata
6. excessive navigation
7. redundant actions

Prefer solving visual problems through hierarchy and spacing before adding decoration.

---

# 15. Responsive Skill

For meaningful UI changes, consider:

```text
Desktop
Tablet
Mobile
```

Do not simply shrink the desktop layout.

On smaller screens:

* stack content where appropriate
* prioritize primary actions
* reduce secondary information
* prevent horizontal overflow
* preserve readable typography
* preserve usable touch targets

---

# 16. Database Change Skill

Before changing the database:

```text
Model
 ↓
Relations
 ↓
Usages
 ↓
Queries
 ↓
Indexes
 ↓
Migrations
 ↓
Existing data assumptions
```

Then determine the smallest safe schema change.

Afterward, update all dependent layers.

---

# 17. Debugging Skill

Use root-cause debugging.

```text
Reproduce
   ↓
Locate
   ↓
Trace
   ↓
Identify root cause
   ↓
Fix root cause
   ↓
Regression check
```

Do not immediately patch the visible symptom.

For full-stack issues, trace across:

```text
Browser
 ↓
Frontend state
 ↓
API client
 ↓
HTTP request
 ↓
Backend
 ↓
Database/external service
```

---

# 18. Performance Skill

Do not optimize based on assumptions.

When performance is reported, investigate:

* network requests
* request duplication
* payload size
* database query count
* indexes
* pagination
* rendering frequency
* unnecessary computation
* caching
* bundle size

Prefer measurable improvements.

---

# 19. Security Review Skill

For security-sensitive changes, explicitly check:

* authentication
* authorization
* ownership
* privilege escalation
* token exposure
* cookie configuration
* input validation
* sensitive error messages
* rate limiting where relevant
* server-side enforcement

Ask:

> "Can a malicious client bypass this restriction by calling the API directly?"

If yes, the implementation is incomplete.

---

# 20. Code Review Skill

Review changes in this order:

```text
Correctness
Security
Data integrity
API compatibility
Architecture
Maintainability
UX
Performance
```

Look for:

* duplicated logic
* inconsistent patterns
* hidden authorization gaps
* unnecessary abstractions
* edge-case failures
* state handling problems
* regressions

---

# 21. Verification Skill

Choose verification based on the change.

### UI

Check:

* loading
* empty
* error
* populated
* responsive behavior
* interaction

### API

Check:

* request validation
* authentication
* authorization
* success response
* failure response
* pagination/filtering

### Database

Check:

* migration
* relations
* constraints
* queries
* indexes

### Full-stack

Check:

```text
Frontend
   ↓
API
   ↓
Backend
   ↓
Database
```

Do not stop at compilation if runtime behavior can be tested.

---

# 22. Memory Skill

At the end of a task, ask:

> "Did this task create knowledge that future AI sessions need to preserve?"

If no:

Do not modify MEMORY.md.

If yes, record the durable decision.

Good candidates:

* why an architecture was chosen
* why a UX pattern exists
* an important security rule
* an important constraint
* a non-obvious bug/root cause
* a deliberate trade-off

---

# 23. Memory Entry Format

Use this format for decisions:

```md
## Decision: <short name>

Status: Active
Date: YYYY-MM-DD

Decision:
<what was decided>

Why:
<why it was decided>

Implications:
<what future implementation must respect>
```

For constraints:

```md
## Constraint: <short name>

Status: Active
Date: YYYY-MM-DD

Constraint:
<what must remain true>

Reason:
<why>

Implications:
<what future work must consider>
```

For pitfalls:

```md
## Pitfall: <short name>

Status: Active
Date: YYYY-MM-DD

Problem:
<what went wrong>

Root cause:
<why>

Prevention:
<what future implementation should avoid>
```

---

# 24. Updating Superseded Decisions

Do not delete important historical decisions blindly.

When a decision changes:

```md
Status: Superseded
Superseded by: <new decision>
```

Then create the new active decision.

The current active decision always takes precedence.

---

# 25. Final Engineering Report

For meaningful work, report:

```text
Implemented
- ...

Files
- ...

Important decisions
- ...

Verification
- ...

Memory
- Updated / Not updated

Notes
- ...
```

Do not include unnecessary implementation narration.
