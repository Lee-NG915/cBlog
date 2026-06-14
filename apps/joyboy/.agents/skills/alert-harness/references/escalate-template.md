---
name: escalate-template
description: Standardized ESCALATE report template for remediation loop max attempts
type: reference
last-reviewed: 2026-04-22
version: 1.0.1
---

# ESCALATE Report Template

Use this exact format when `MAX_ATTEMPTS` is exceeded in the remediation loop.

## Output Format

```
## ESCALATE — Auto-fix failed after 3 attempts

Violations still present:
- <file>:<line> — <rule> — <error message>

E2E failures (if applicable):
- <page> — expected <tag>=<value>, got <actual>

Attempted fixes:
- Attempt 1: <what was changed>
- Attempt 2: <what was changed>
- Attempt 3: <what was changed>

Next step: manual investigation required. Do not add fixes ISSUE-ID to the PR title or PR description.
```

## Loop Invariants

1. **Empty diff detection**: Each attempt must produce a non-empty diff from the previous attempt. If the same fix is applied twice with no change, stop immediately and ESCALATE — the root cause is not addressable by code edit alone.
2. **No regression**: Do not revert previously passing checks to fix a new violation. If lint passes but E2E fails, the fix scope must widen, not undo lint changes.
3. **Retry accounting**: Retries count toward `MAX_ATTEMPTS` only for **transient** failures (e.g. MCP timeout, flaky local env). **Hard-rule / blocked paths / same lint output twice** -> ESCALATE immediately with evidence (do not burn retries).

## Machine-readable ESCALATE JSON

When emitting ESCALATE output, also write a machine-readable record:

```json
{
  "status": "error",
  "summary": "Auto-fix failed after 3 attempts",
  "next_actions": ["Manual investigation of <file>:<line>", "Escalate to observability team"],
  "artifacts": [".agents/skills/alert-harness/logs/remediation-<run-id>.json"],
  "escalate": {
    "attempts": 3,
    "violations_remaining": [{ "file": "<file>", "line": "<line>", "rule": "<rule>", "message": "<msg>" }],
    "e2e_failures": [{ "page": "<page>", "expected": "<tag>=<value>", "actual": "<value>" }],
    "attempted_fixes": [
      { "attempt": 1, "description": "<what was changed>" },
      { "attempt": 2, "description": "<what was changed>" },
      { "attempt": 3, "description": "<what was changed>" }
    ]
  },
  "generated_at": "2026-04-22T10:00:00Z"
}
```
