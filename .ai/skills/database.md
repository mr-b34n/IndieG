# DATABASE SKILL

Use this skill for database and persistence changes.

## Workflow

```text
Model
→ relations
→ usages
→ queries
→ indexes
→ migration
→ dependent services
→ API consumers
```

## Safety

Before modifying schema:

* inspect existing data assumptions
* inspect migrations
* inspect constraints
* inspect indexes
* inspect dependent code

Prefer safe, backward-compatible changes.

## Performance

When adding new queries or access patterns, consider:

* indexes
* pagination
* filtering
* sorting
* relation loading
* query count
