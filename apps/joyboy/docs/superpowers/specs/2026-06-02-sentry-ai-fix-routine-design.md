# Sentry AI Fix Weekly Routine — Design Spec

**Date:** 2026-06-02  
**Author:** jasper.zhang  
**Status:** draft

---

## Overview

A weekly autonomous routine that uses AI to triage and fix Sentry issues assigned to each team member. The routine runs every Monday via Claude Code's built-in CronCreate scheduler. Each team member sets it up independently — it reads their own assigned issues, attempts a fix for the highest-impact one, and raises a PR following existing team conventions.

This spec covers three interdependent parts:

| Part | What                               | Why now                                                                               |
| ---- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| 1    | `docs/ai-specs/estimation/` rubric | Shared scoring standard referenced by the routine prompt and future skills            |
| 2    | Generic `doc-governance.yaml` CI   | Replaces hardcoded observability spec governance; covers all `docs/ai-specs/` domains |
| 3    | Sentry AI Fix cron prompt          | The weekly routine itself                                                             |

---

## Part 1: Estimation Rubric

### Location

```
docs/ai-specs/estimation/
  INDEX.md       ← spec registry (same format as observability/INDEX.md)
  rubric.md      ← multi-dimensional scoring rules
```

### Frontmatter (both files)

```yaml
---
status: accepted
version: 1.0.0
owner: jasper.zhang
last-reviewed: 2026-06-02
---
```

Freshness enforcement: covered automatically by the existing `doc-freshness` rule (scope: `docs/ai-specs/**/*.md`).

### Scoring Rubric

**1 sprint point = 0.5 working day.**

Score each of the four dimensions independently, then sum:

| Dimension              | 1 pt                                       | 2 pt                        | 3 pt                                          |
| ---------------------- | ------------------------------------------ | --------------------------- | --------------------------------------------- |
| **File scope**         | Single file, < 20 lines changed            | 2–3 files                   | 4+ files or new file required                 |
| **Root cause clarity** | Directly visible (e.g. missing null check) | Requires tracing call chain | Uncertain, needs investigation                |
| **Test coverage**      | Existing tests validate the fix            | Partial coverage            | No tests; fix requires writing tests          |
| **Domain coupling**    | Fully isolated, single domain              | Crosses 1 domain boundary   | Crosses multiple domains or touches `shared/` |

**Sum → Sprint Point mapping:**

| Total score | Sprint points   | Action                                       |
| ----------- | --------------- | -------------------------------------------- |
| 4–5         | 1 pt (0.5 day)  | Proceed with auto-fix                        |
| 6–7         | 2 pt (1 day)    | Proceed with auto-fix                        |
| 8–9         | 3 pt (1.5 days) | Proceed with auto-fix                        |
| 10–12       | 5 pt (2.5 days) | Skip auto-fix → flag as "needs human review" |

**Confidence–score correlation:** Low confidence implies uncertain root cause, which raises the "Root cause clarity" dimension score. The two signals are naturally aligned — no separate handling needed.

### Reuse Potential

This rubric is domain-agnostic. Other use cases:

- **PR review complexity hint** — surface in `submit-pr` flow as expected review effort
- **Tech debt estimation** — when creating tasks in FE Refactoring list (`901808352655`)
- **alert-harness fix prioritisation** — order multiple violations by fix effort

---

## Part 2: Doc Governance CI

### Problem

`observability-lint.yaml` hardcodes spec governance for `docs/ai-specs/observability/` only. Adding `docs/ai-specs/estimation/` requires a generic solution.

### Solution: Option B — Single generic workflow

**Files changed:**

| Action | File                                                              |
| ------ | ----------------------------------------------------------------- |
| New    | `scripts/lint/doc-governance-check.js`                            |
| New    | `.github/workflows/doc-governance.yaml`                           |
| Modify | `.github/workflows/observability-lint.yaml`                       |
| Delete | `tools/eslint-plugin-observability/tests/spec-governance.test.js` |

### `scripts/lint/doc-governance-check.js`

Generic script. Auto-discovers every subdirectory of `docs/ai-specs/` and applies the same rule set. Accepts `--domain <path>` for targeted runs.

**Checks (applied per domain):**

| Rule                                                                                                      | Level   |
| --------------------------------------------------------------------------------------------------------- | ------- |
| Every `.md` has `status / version / owner / last-reviewed` frontmatter                                    | error   |
| `status` is one of `proposed / accepted / deprecated`                                                     | error   |
| Spec file changed → `INDEX.md` must also be updated in the same PR                                        | error   |
| Content changed → `version` must be incremented                                                           | error   |
| `accepted` spec `last-reviewed` within 180 days                                                           | warning |
| `supersedes` field present → referenced old path must not exist (migrated from `spec-governance.test.js`) | error   |

### `.github/workflows/doc-governance.yaml`

```
trigger: pull_request → master
paths:  docs/ai-specs/**
```

Steps:

1. Detect which `docs/ai-specs/<domain>/` directories have changed files
2. For each changed domain: `node scripts/lint/doc-governance-check.js --domain docs/ai-specs/<domain>`
3. Fail PR on any error; emit warnings as annotations

### `observability-lint.yaml` changes

Remove from `paths:`:

```yaml
# remove:
- 'docs/ai-specs/observability/**'
```

Remove three steps: `Get ai-specs changes`, `Run spec governance tests`, `Check ai-specs INDEX sync and version bump`.

### Zero overlap after change

| Workflow                  | Watches                                                                                                          | Does                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `observability-lint.yaml` | `apps/web/**`, `libs/shared/observability/**`, `tools/eslint-plugin-observability/**`, `apps/web/.eslintrc.json` | Code lint, ESLint rule tests, Sentry coverage report  |
| `doc-governance.yaml`     | `docs/ai-specs/**`                                                                                               | Spec frontmatter, INDEX sync, version bump, freshness |

---

## Part 3: Sentry AI Fix Weekly Routine

### Setup

Each team member runs this once in Claude Code:

```
/schedule "every Monday at 9:00 AM" — run the Sentry AI fix routine
```

Personalise `{USER_EMAIL}` and `{GIT_USERNAME}` before saving the cron prompt.

### Cron Prompt

```
You are an autonomous Sentry issue repair agent for the Castlery joyboy web project.

## Identity
Your Sentry email is: {USER_EMAIL}
Git username: {GIT_USERNAME}
Working directory: /Users/{LOCAL_USER}/Desktop/project/joyboy

## Step 1 — Fetch assigned Sentry issues

Use the Sentry MCP to list unresolved issues assigned to {USER_EMAIL} across all
production environments (au-prod, ca-prod, sg-prod, uk-prod, us-prod),
project ID 4507648850591744.

Filter: status=unresolved, assigned_to={USER_EMAIL}
Sort: users_affected descending
Take the top 20 results.

## Step 2 — Classify the top issue

For the issue with the most users affected, read its full details
(title, stack trace, error message, affected files).

Classify as one of:
- baseline: observability instrumentation gap (missing setGlobalSentryContext,
  bare Sentry.captureException, wrong error_bucket). → SKIP.
- business-error: application logic error causing a user-visible failure.
- boundary-caught: unexpected condition caught by an error boundary or try/catch
  that should be handled more gracefully.

If baseline → log "Skipped: baseline issue — use /alert-harness" and stop.

## Step 3 — Hard constraint check

Before any code analysis, verify the issue does NOT touch any of these paths:
- libs/shared/observability/**
- apps/web/instrumentation*.ts
- Any file containing BUSINESS_DOMAIN, PAGE_TYPES, error_bucket,
  captureStructuredError, SentryContextProvider, or setGlobalSentryContext
  definitions (not call sites — definitions)

If rooted in these paths → log "Skipped: observability core — do not auto-modify"
and stop.

## Step 4 — Score and estimate

Read docs/ai-specs/estimation/rubric.md.

Score each dimension (1–3):
  A. File scope
  B. Root cause clarity
  C. Test coverage
  D. Domain coupling

Map total to sprint points:
  4–5 → 1 pt | 6–7 → 2 pt | 8–9 → 3 pt | 10–12 → 5 pt

Assess confidence (0–100%): how clearly the root cause is identified,
whether a targeted fix exists without side effects, whether existing
tests can verify the result.

If total score = 10–12 OR confidence < 70%:
  Print:
    ⚠️  {ISSUE_ID} — {title}
    Users affected: {N}
    Classification: {type}
    Effort: 5 pt → needs human review
    Confidence: {X}%
    Reason: {why}
  Stop.

## Step 5 — Create ClickUp ticket

Create a task in the FE Sentry list (list_id: 901818201801):
  name: "[Sentry] {issue_title} — {ISSUE_ID}"
  status: "Open"
  tags: ["fe", "sentry", "auto-fix"]
  custom_fields:
    Business Line: Ecommerce  (3ec2df9e / 68a22c97-3329-4bfc-a332-e70ea0145f86)
    Tech Team: EC FE          (66de2a1c / bb6817e9-8f67-45f4-bec0-7aed3f30bc5d)
    Requirement Type: Tech    (198d5223-7543-4140-b27f-b9bc71975eb4 / 87ca950b-b689-47ea-ad05-411cb041b642)
    Sprint Points: {estimated_points}
  description: |
    Sentry: https://castlery.sentry.io/issues/{NUMERIC_ID}/
    Auto-generated by Sentry AI Fix routine.
    Classification: {type} | Confidence: {X}% | Scores: A={s1} B={s2} C={s3} D={s4}

Record the returned task_id.

## Step 6 — Branch and fix

Create git branch:
  {GIT_USERNAME}/CU-{task_id}/{kebab-case-issue-title}

Implement the minimal fix. Do NOT touch any file under the paths in Step 3.

Run: pnpm lint:observability
Fix any violations (max 3 attempts). If still failing after 3 attempts, stop and
report "Observability lint could not be resolved — manual fix required."

## Step 7 — Commit

  fix: {short description}

Do NOT include "fixes ISSUE_ID" in commit messages.

## Step 8 — Create PR

Title:  fix: [#{task_id}] {clickup_task_name} [fixes {ISSUE_ID}]
Body must include:
  fixes {ISSUE_ID}

Fill all standard PR sections. Add to Special notes:
  "Auto-generated by Sentry AI Fix routine. Confidence: {X}%. Effort: {N} pt."

## Step 9 — Link Sentry to ClickUp

Using Sentry MCP, add an external issue link on {ISSUE_ID}:
  URL:   https://app.clickup.com/t/{task_id}
  Title: ClickUp #{task_id}

## Step 10 — Summary

  ✅ Sentry AI Fix — {date}

  Issue:      {ISSUE_ID} — {title}
  Users:      {N} affected
  Type:       {classification}
  Confidence: {X}%
  Effort:     {N} pt

  ClickUp:    https://app.clickup.com/t/{task_id}
  Branch:     {branch_name}
  PR:         {pr_url}
  Sentry:     linked ✓

  Next: review the PR and merge. Sentry auto-resolves on merge.
```

### Key Design Decisions

| Decision                                       | Rationale                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| One issue per run                              | Keeps review burden manageable; quality over quantity             |
| ClickUp ticket before branch                   | Branch name must include `CU-{task_id}` per team convention       |
| `fixes` keyword in PR title + description only | Matches `AGENTS.md` Sentry auto-resolve rules                     |
| Observability paths hard-blocked               | AI errors here cause silent monitoring regressions                |
| 70% confidence threshold                       | Balances automation value vs. false-positive PR noise             |
| Sprint points set on ClickUp ticket            | Feeds weekly report and sprint planning without extra manual work |

### Integration Points

| System                | How                                                 |
| --------------------- | --------------------------------------------------- |
| Sentry                | Sentry MCP — list issues, create external link      |
| ClickUp               | ClickUp MCP — create task in list `901818201801`    |
| GitHub                | `gh` CLI — create PR                                |
| Estimation rubric     | Read `docs/ai-specs/estimation/rubric.md` in Step 4 |
| submit-pr conventions | PR title/body format, ClickUp link format           |

---

## Out of Scope

- Checkout / payment / cart code (migration blocked — see `AGENTS.md`)
- Observability baseline issues (handled by `alert-harness`)
- Auto-merging PRs (always requires human review)
- Multi-issue runs per Monday (one by design)
