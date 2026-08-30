# DEBUGGING SKILL

Use this skill when investigating bugs or unexpected behavior.

## Workflow

```text
Reproduce
→ locate
→ trace
→ identify root cause
→ fix
→ regression check
```

For full-stack problems:

```text
Browser
→ frontend state
→ API client
→ HTTP
→ backend
→ database/external service
```

## Rules

Do not patch symptoms before identifying the root cause.

Check nearby functionality for regressions.

If the root cause is non-obvious and likely useful in future work, record it in `memory/pitfalls.md`.
