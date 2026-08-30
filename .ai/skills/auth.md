# AUTHENTICATION SKILL

Use this skill for authentication, authorization, sessions, tokens, password recovery, and email verification.

## Workflow

Trace the complete flow:

```text
Frontend
→ API
→ Authentication layer
→ Service
→ Session/token state
```

Inspect existing implementation before changing it.

## State Model

Keep these concepts separate:

```text
Unauthenticated
Authenticated
Authenticated + Unverified
Authenticated + Verified
Authorized
```

Do not assume one state implies another.

## Email Verification

For verified-only features:

```text
Frontend
→ explain requirement
→ provide verification action

Backend
→ enforce requirement
```

Frontend gating is not sufficient security.

## Security

When modifying authentication inspect:

* token lifecycle
* refresh behavior
* cookies
* sessions
* guards
* authorization
* ownership
* password reset
* verification tokens

Do not weaken existing security mechanisms.
