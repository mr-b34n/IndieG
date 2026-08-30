# CLEAN SKILL

Use this skill for repository cleanup, removal of obsolete content, dead code, temporary artifacts, mock data, redundant code, and other unnecessary project residue.

The goal is to leave the repository cleaner without changing intended behavior.

---

## 1. Core Principle

Clean what is demonstrably unnecessary.

Do not equate:

```text
unused-looking
=
safe to delete
```

Every cleanup target must be classified before removal when its purpose is not obvious.

Prefer deletion over hiding obsolete code when deletion is safe.

Do not perform unrelated refactoring.

---

## 2. Cleanup Scope

Depending on the task, inspect relevant categories such as:

### Runtime Data

* mock data
* demo data
* sample data
* dummy data
* fake data
* placeholder data
* hardcoded entity data
* development-only fallback data
* obsolete default data

### Code

* dead code
* unreachable code
* unused functions
* unused variables
* unused constants
* unused imports
* obsolete helpers
* duplicate implementations
* abandoned experiments
* temporary workarounds
* commented-out code

### Debug / Development Residue

* `console.log`
* debug statements
* temporary logging
* debug flags
* development-only UI
* temporary test hooks
* debug endpoints
* temporary bypasses

Remove these only when they are not intentionally part of the current development or operational workflow.

### Comments

Remove comments that are:

* obvious restatements of code
* stale
* inaccurate
* temporary
* TODOs that are no longer relevant
* commented-out code
* debugging notes
* implementation history that belongs in Git instead

Preserve comments that explain:

* non-obvious business rules
* security constraints
* important architectural decisions
* external API quirks
* performance considerations
* intentional workarounds
* behavior that would otherwise be difficult to understand

### UI / Content

Depending on the request:

* placeholder text
* demo usernames
* fake avatars
* sample communities
* sample posts
* temporary labels
* unused UI states
* obsolete empty states
* development-only controls

### Files / Assets

When relevant:

* obsolete files
* unused assets
* temporary generated files
* abandoned components
* duplicate assets
* old fixtures
* obsolete configuration

Do not delete files solely because they appear unused without checking references and project conventions.

---

## 3. Repository-Wide Search

When the user asks for:

* "remove all"
* "clean completely"
* "clean the project"
* "remove unnecessary things"
* "delete leftovers"
* "clean up"

interpret the request as repository-wide unless the user explicitly limits the scope.

Search broadly before editing.

Use multiple detection strategies.

Do not rely only on filenames or variable names.

For example, mock data may be named:

```text
mockData
data
items
users
defaultUsers
initialData
fallback
examples
constants
```

The same principle applies to comments, debug code, temporary code, and other cleanup targets.

---

## 4. Classification

Classify potential targets into:

```text
SAFE_TO_REMOVE
POSSIBLY_UNNECESSARY
INTENTIONALLY_REQUIRED
UNCLEAR
```

### SAFE_TO_REMOVE

Examples:

* unused import
* unreachable branch
* commented-out code with no purpose
* obsolete mock fixture no longer referenced
* debug `console.log` explicitly covered by the cleanup request

Remove directly.

### POSSIBLY_UNNECESSARY

Examples:

* apparently unused helper
* fallback behavior
* static default value
* unusual comment
* suspicious duplicated code

Inspect usage and surrounding context first.

### INTENTIONALLY_REQUIRED

Examples:

* TypeScript types/interfaces
* validation schemas
* legitimate configuration defaults
* required fallback behavior
* security comments
* documented business constraints
* required test fixtures
* framework-required files

Do not remove.

### UNCLEAR

Do not guess.

Inspect:

* references
* imports
* consumers
* configuration
* build tooling
* runtime behavior
* tests

If still unclear, preserve it and report it.

---

## 5. Comments

Do not perform blind comment deletion.

Use this decision process:

```text
Is the comment explaining something non-obvious?
    YES → keep

Is it documenting an important constraint?
    YES → keep

Is it explaining a workaround that still exists?
    YES → keep

Is it merely describing the code literally?
    YES → remove if cleanup scope includes comments

Is it commented-out code?
    YES → remove if no longer needed

Is it stale or inaccurate?
    YES → remove or update

Is its purpose unclear?
    → inspect before changing
```

Never remove documentation required by:

* licensing
* generated code
* public APIs
* framework conventions
* legal/compliance requirements

---

## 6. Mock / Fake / Placeholder Data

When removing mock-like runtime data:

Search for:

```text
mock
mocked
demo
sample
dummy
fake
fixture
seed
placeholder
fallback
initial
default
example
```

Also inspect hardcoded entity values even when their names do not indicate mock data.

Examples:

```ts
const users = [
  { name: "John Doe" }
];

const posts = [
  { title: "Sample Post" }
];

const defaultCommunity = {
  name: "Test Community"
};
```

Do not remove type definitions merely because they contain fields that resemble data.

---

## 7. Dead Code Cleanup

When removing code:

1. identify the target
2. find references
3. determine whether it is reachable
4. remove the target
5. remove newly unused imports/constants/helpers
6. search for remaining references

Do not leave broken references behind.

---

## 8. Debug Code Cleanup

When requested, inspect for:

```text
console.log
console.debug
debugger
temporary flags
development bypasses
temporary endpoints
debug UI
```

Before removal, determine whether the code is:

* temporary debugging residue
* intentional production logging
* required observability
* framework-specific behavior

Do not blindly remove legitimate operational logging.

---

## 9. Duplicate / Redundant Code

When cleanup includes duplication:

Prefer existing project abstractions.

Before merging or deleting duplicate logic:

* compare behavior
* inspect consumers
* inspect edge cases
* preserve the implementation that fits existing architecture

Do not turn cleanup into a large refactor unless explicitly requested.

---

## 10. Files and Assets

Before deleting a file:

Search for:

* imports
* dynamic references
* route registration
* configuration references
* build references
* scripts
* tests
* generated-code relationships

For assets, also check:

* CSS references
* component references
* metadata
* public/static paths

If a file appears unused but its usage cannot be confidently determined, preserve it.

---

## 11. Scope Control

Cleanup does NOT automatically mean:

* redesigning architecture
* rewriting components
* renaming everything
* reformatting the repository
* changing behavior
* upgrading dependencies
* rewriting APIs
* modifying unrelated tests

Only perform these when required to complete the cleanup safely.

---

## 12. Verification

After cleanup, perform a second search.

This is mandatory for repository-wide cleanup.

Verify:

### Target Residue

Search again for the patterns and categories covered by the request.

### References

Check for:

* unused imports
* broken references
* dead exports
* missing assets
* invalid configuration

### Behavior

Run appropriate:

* typecheck
* lint
* tests
* build
* relevant integration checks

Use only checks available in the repository.

---

## 13. Completeness

For a request containing "completely", "all", or equivalent language:

Do not stop after finding the first instances.

Use this loop:

```text
SEARCH
  ↓
CLASSIFY
  ↓
REMOVE
  ↓
SEARCH AGAIN
  ↓
INSPECT RESIDUE
  ↓
VERIFY
```

Repeat until another search produces no obvious applicable targets, or remaining matches are intentionally preserved.

---

## 14. Reporting

At the end, report briefly:

```text
Cleanup scope
Removed
Preserved intentionally
Verification
Remaining items requiring judgment
```

Do not claim "completely cleaned" if intentional or unclear matches remain.

---

## 15. Memory

Only update project memory if cleanup reveals durable knowledge such as:

* a recurring project pitfall
* an architectural constraint
* a permanent convention
* an important reason something must not be removed

Do not record ordinary cleanup operations in memory.
