# API SKILL

Use this skill for API and backend endpoint work.

## Workflow

```text
Endpoint
→ validation
→ controller
→ service
→ persistence/external service
→ response
→ consumers
```

Inspect all affected layers.

## Before Adding an Endpoint

Check whether an existing endpoint already provides the required capability.

If a new endpoint is required, define:

* method
* path
* authentication
* authorization
* request schema
* validation
* response
* errors
* pagination/filtering where relevant

## Contract Safety

Before changing an existing endpoint:

* find consumers
* inspect response assumptions
* inspect validation
* inspect authorization
* preserve compatibility where practical
