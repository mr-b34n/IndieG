# SEARCH SKILL

Use this skill for search and discovery functionality.

## Workflow

1. Inspect current search page.
2. Identify supported entity types.
3. Inspect search API and response shape.
4. Inspect existing result components.
5. Determine preview vs full-result behavior.
6. Implement the smallest consistent change.

## UX Model

Search is primarily a discovery surface.

Prefer:

```text
Entity section
→ limited preview
→ View all
```

rather than rendering every result.

## Large Result Sets

The UI must remain usable when:

* communities > 3
* games > 3
* users > 3
* posts become numerous

Do not assume the page only contains a few results.

## Consistency

Maintain consistent:

* section hierarchy
* result item structure
* spacing
* interaction patterns
* empty states

