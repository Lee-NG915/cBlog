---
name: observability-self-check
description: Mandates lint verification after any observability-related code edit during general development. Always-on rule loaded via AGENTS.md @include (CLAUDE.md delegates via @AGENTS.md).
type: enforcement
version: 1.0.2
last-modified: 2026-05-14
---

# Observability Self-Check — General Development Rule

After completing any code edits that touch observability-related paths, you must verify compliance before reporting the task as complete.

## Trigger Paths

This rule activates when any edited file matches:

- `libs/shared/observability/**`
- `apps/web/instrumentation*.ts`
- `apps/web/**/page.tsx`
- `apps/web/**/layout.tsx`
- Any file containing `setGlobalSentryContext`, `captureStructuredError`, or `SentryContextProvider`

## Verification Loop

```
finish all code edits first (never verify mid-batch)

attempt = 1
MAX_ATTEMPTS = 3

loop:
  run: pnpm lint:observability
  → 0 violations: done, report task complete
  → violations remain AND attempt < MAX_ATTEMPTS: fix violations, attempt++, continue loop
  → violations remain AND attempt == MAX_ATTEMPTS: EXIT → ESCALATE
```

**ESCALATE output** (when max attempts exceeded):

```
## ESCALATE — Observability lint failed after 3 attempts

Violations still present:
- <file>:<line> — <rule> — <error message>

Attempted fixes:
- Attempt 1: <what was changed>
- Attempt 2: <what was changed>
- Attempt 3: <what was changed>

Next step: manual investigation required. Do not report task as complete.
```

## Scope

- **Lint only** — E2E (Sentry envelope verification) is not triggered here. E2E requires a production build and is only run explicitly via `/alert-harness`.
- **No checkout / payment files** — see "Checkout / Payment: integration blocked" in `AGENTS.md` § Observability Hard Rules: these paths are blocked until migration completes.
- **No middleware / edge files for Sentry capture** — see "Middleware / Edge: no Sentry capture" in `AGENTS.md` § Observability Hard Rules: they must stay silent.

## Loop Invariant

If the same fix produces no diff from the previous attempt, stop immediately and ESCALATE — the violation is not addressable by code edit alone (likely a config or tooling issue).
