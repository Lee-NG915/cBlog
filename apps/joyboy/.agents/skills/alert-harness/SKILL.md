---
name: alert-harness
version: 2.10.5
last-modified: 2026-06-04
description: >
  Use when analyzing live Sentry issues against the alert coverage matrix in
  docs/ai-specs/observability/alert-metrics.md, or when
  answering questions about domain severity, error_bucket routing, alert rule ownership,
  or Sentry tag compliance. Static code compliance (bare captureException, middleware capture,
  layout pattern, deprecated PAGE_TYPES.SEARCH) is now enforced automatically by ESLint —
  no manual check needed. Trigger on: running /alert-harness; reviewing Sentry dashboards;
  questions about error_bucket classification or alert routing.
---

# /alert-harness — Observability Triage & Auto-fix

> System architecture and layer details: see `README.md`
> Hard rules: see `AGENTS.md` § Observability Hard Rules

## Sub-commands

```
/alert-harness                       → analyze-only (default, safe mode)
/alert-harness sentry                → analyze-only (Sentry issues tag compliance only)
/alert-harness dashboard             → analyze-only (dashboard attribution only)
/alert-harness diff                  → analyze-only (current git diff only)
/alert-harness fix                   → analyze + apply fixes (no PR)
/alert-harness verify                → verification-only on existing diff
/alert-harness pr                    → PR-only step for already prepared changes
/alert-harness fix --with-pr         → full chain (analyze + fix + verify + PR)
```

> Stop Hook and other layers are documented in `README.md` § Architecture Overview.

### Command mode contract

| Mode          | Can edit files | Runs verify | Creates/updates PR |
| ------------- | -------------- | ----------- | ------------------ |
| analyze-only  | No             | No          | No                 |
| fix           | Yes            | Yes         | No                 |
| verify-only   | No             | Yes         | No                 |
| pr-only       | No             | No          | Yes                |
| fix --with-pr | Yes            | Yes         | Yes                |

Default mode is **analyze-only**. High-impact actions must be explicit.

---

## /alert-harness Analysis Flow

### Step 1: Load spec baseline

Read these files as the judgment reference:

- `docs/ai-specs/observability/alert-metrics.md` — bucket taxonomy, alert rules, domain constants
- `docs/ai-specs/observability/sentry-practices.md` — layout/page instrumentation patterns
- `docs/ai-specs/observability/logger.md` — logger vs captureStructuredError boundaries
- `docs/ai-specs/observability/package-architecture.md` — import paths and layer constraints
- `libs/shared/observability/src/lib/sentry/errors/error-bucket.ts` — `classifyErrorBucket` implementation, `THIRD_PARTY_PATTERNS`, `CRITICAL_THIRD_PARTY_PATTERNS`, `OWN_DOMAIN_PATTERNS`

### Step 2: Fetch Sentry issues via MCP

Use Sentry MCP tools directly for issue retrieval and issue evidence gathering.

**2a. Resolve org + project (once per session):**

```
find_organizations()     → note the org_slug
find_projects(org_slug)  → find the joyboy / joyboy-web project slug
```

**2b. Unified fetch — one query, sorted by impact:**

```
search_issues(
  org_slug,
  project=["<project_slug>"],
  query="is:unresolved !error_bucket:third_party",
  sort="users",       ← highest user impact first
  limit=5
)
```

Single entry point. No pre-filtering by tag — classification happens in Step 3.
The `!error_bucket:third_party` filter removes confirmed noise; everything else is in scope.

**2c. Per-issue data — fetch only what's needed:**

Read from the search result first (title, culprit, times_seen, users, tags if present).
Only make additional MCP calls when the search result is insufficient.

> Progressive fetch decision tree with stop conditions: see `references/fetch-decision-tree.md`.
>
> Hard rule: **Never call all four tag keys for every issue.** Fetch progressively — stop when enough evidence exists to make a classification judgment.

**2d. Incremental issue gating (optional performance layer):**

> **Note**: 2d only detects field-level changes (title, culprit, error_bucket). It cannot detect whether an issue already has a linked ClickUp task or an associated PR. **Step 2e is the authoritative dedup gate; 2d is an optional speed-up.**

After obtaining candidate issues from 2b, run the local helper to skip unchanged issues before entering the expensive analysis/fix loop:

```bash
node .agents/skills/alert-harness/scripts/diff-issues.mjs \
  --input /tmp/current-issues.json \
  --output /tmp/issue-diff-result.json \
  --ttl-days 14 \
  --max-issues 50
```

Rules:

- Feed `search_issues` results into `current-issues.json` (array or `{ issues: [...] }`).
- Default behavior: process only `NEW` + `CHANGED`; skip `UNCHANGED`.
- Use `--force` when full replay is required.
- Snapshot state is persisted in `.agents/skills/alert-harness/assets/issue-snapshots.json`.
  - Keep this file in git when cross-machine scheduled jobs need shared incremental state.
  - `assets/` location is intentional for lightweight skill runtime state.

If `2d` is not used, continue with the full candidate list.

**2e. Real-time handled-status filter (mandatory):**

For each candidate issue (highest `users_affected` first), read issue details via Sentry MCP and check:

1. **Already linked to ClickUp?**
   Call `get_sentry_resource` or inspect `externalIssues` on the issue — if a ClickUp link exists, the issue is already tracked.

2. **Already has an associated commit or PR?**
   Check issue details for `firstSeen`/`lastSeen` git links, or run:
   ```bash
   gh pr list --search "{ISSUE_SHORT_ID}" --state all
   ```
   If an open or merged PR exists, someone is already working on it.

If either check is true → log:

```
⏭ {ISSUE_ID} — already handled (linked ClickUp / associated PR) — skipping
```

and move to the next candidate.

Pick the **first issue that passes both checks** as the target for Steps 3–9.

If all candidates are already handled → output:

```
✅ No actionable issues this run — all issues are already linked or in progress.
```

and stop.

### Step 3: Classification inference + compliance check

For each issue, infer the expected `error_bucket` by applying the classification logic from:

- `docs/ai-specs/observability/alert-metrics.md` § 4 (error_bucket Taxonomy) — the authoritative bucket definitions and priority order
- `libs/shared/observability/src/lib/sentry/errors/error-bucket.ts` — the exact code implementation (`classifyErrorBucket`, `THIRD_PARTY_PATTERNS`, `CRITICAL_THIRD_PARTY_PATTERNS`, `OWN_DOMAIN_PATTERNS`)

Both are already loaded in Step 1. Use the issue title, message, and stack frames as input. Compare **inferred** bucket to the **actual** `error_bucket` tag from Sentry.

> If inferred ≠ actual, use the already-read `error-bucket.ts` code to locate the root cause, then consult `references/checks.md` § Violation → Fix Mapping for the exact file and fix pattern.
>
> Validate domain and page_type constants against `docs/ai-specs/observability/alert-metrics.md` § Domain Constants and § Error Bucket Taxonomy.

### Step 4: Alert rule coverage matrix

> Apply the 10-rule mutually exclusive coverage matrix from `docs/ai-specs/observability/alert-metrics.md` § Alert Rules.

Issues landing only in `[Sev-4]` with high frequency → the code path is missing context injection.

### Step 5: Dashboard widget attribution

> Check widget attribution against `docs/ai-specs/observability/alert-metrics.md` § Dashboard Widgets.

### Step 6: Auto-fix violations

For every mismatch found in Step 3 and every violation found in Steps 4–5, apply the fix using the root cause identified in Step 3. Consult `references/checks.md` § Violation → Fix Mapping for exact file locations and patterns.

**Fix execution rules:**

| Severity | Action                                                  |
| -------- | ------------------------------------------------------- |
| [ERR]    | Fix immediately using Edit tool, no confirmation needed |
| [WARN]   | Explain the issue and ask if intentional before fixing  |

**Root-cause fix paths (from Step 3 mismatch table):**

| Root cause                                                                  | Fix                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Domain missing from `THIRD_PARTY_PATTERNS`                                  | Add pattern to `libs/shared/observability/src/lib/sentry/errors/error-bucket.ts` → `THIRD_PARTY_PATTERNS` array. Single entry point — `denyUrls` in `instrumentation-client.ts` is derived automatically.                                  |
| `isFetchFromNonCritical` regex not matching a "Failed to fetch (X)" variant | Adjust the regex in `classifyErrorBucket` step 2c logic in `error-bucket.ts`                                                                                                                                                               |
| Status code extraction failing                                              | Fix `classifyErrorBucket` step 3 logic or the `statusCode` passed from the `beforeSend` call site in `instrumentation-client.ts`                                                                                                           |
| Third-party frame domain not in `THIRD_PARTY_PATTERNS`                      | Add domain substring to `THIRD_PARTY_PATTERNS` (same file as above)                                                                                                                                                                        |
| Route missing `domain` / `page_type`                                        | Use Route → File Lookup in `references/checks.md` → add `SentryContextProvider` to `layout.tsx` or `setGlobalSentryContext` to `page.tsx`. Patterns in `docs/ai-specs/observability/sentry-practices.md` and `references/sentry-scenes.md` |
| `captureStructuredError` call site producing wrong mechanism                | Fix the call site — ensure `mechanism` is not overridden; `captureStructuredError` sets `type='generic'` automatically                                                                                                                     |

**Do not fix:**

- Checkout / payment files — integration is blocked ("Checkout / Payment: integration blocked" in `AGENTS.md` Hard Rules)
- Middleware / edge files for Sentry capture — they must stay silent ("Middleware / Edge: no Sentry capture" in `AGENTS.md` Hard Rules); use `logger.*` instead

### Step 7: Verify

After applying all fixes:

**7a. Static lint (always run)**

```bash
pnpm lint:observability
```

Must return 0 violations on the changed files. If new violations appear, fix them before proceeding.

**7b. Post-fix verification decision gate**

**Does this fix affect tag output?**

| Fix type                                                                                  | Affects tag output? | E2E required                          |
| ----------------------------------------------------------------------------------------- | ------------------- | ------------------------------------- |
| `classifyErrorBucket` logic changed                                                       | Yes                 | Layer A + B                           |
| `THIRD_PARTY_PATTERNS` / `CRITICAL_THIRD_PARTY_PATTERNS` / `OWN_DOMAIN_PATTERNS` modified | Yes                 | Layer A + B                           |
| `SentryContextProvider` added/modified in layout                                          | Yes                 | Layer A + B                           |
| `setGlobalSentryContext` added/modified in page.tsx                                       | Yes                 | Layer A + B                           |
| Structural fix only (e.g. import path, comment, non-tag field)                            | No                  | Layer B candidate (may skip via gate) |

**E2E decision gate (must follow):**

- Decide after fixes are applied (post-fix), per iteration.
- If any changed fix in this iteration maps to **Layer A + B** in the table, E2E is required.
- If all changed fixes map to **Layer B candidate (may skip via gate)**, agent may skip E2E only when **all** conditions below are met:
  1. The change is small and structural (for example import path, comments, non-tag behavior).
  2. The touched code path has relevant unit tests.
  3. Unit tests are executed in this run and pass.
  4. No tag-output logic changed (`error_bucket`, `domain`, `page_type`, beforeSend routing).
- When E2E is required, `SKIPPED` is not allowed.
- If E2E is skipped by decision, Step 9 report must include explicit evidence (changed files + unit test command + pass result + reason).
- If E2E is not skipped, execution path is deterministic:
  1. Prepare Layer B targeted tests for affected pages when applicable.
  2. Run `pnpm e2e:sentry-tags:server-capture` once as the canonical full-chain entrypoint.
  3. Remove generated targeted tests after run completion.

Fixing an `unclassified` issue almost always touches `error-bucket.ts` → always run Layer A + B.

Two-layer verification — full procedure in `docs/ai-specs/observability/sentry-e2e-local-capture.md` § AI Agent Execution Checklist:

- **Layer A**: regression suite — verifies core 4 pages (PDP/PLP/Home/Account) not broken. Run when E2E is required by the decision gate.
- **Layer B**: generate a targeted test via `scripts/e2e/sentry/generate-fix-test.mjs` for the affected page/route, run, then delete when E2E is executed.

Key decision: Layer A guards against regression; Layer B verifies the fix itself. When E2E is required, both must pass before reporting complete.

When Layer A + B is required, run:

```bash
pnpm e2e:sentry-tags:server-capture
```

This command is the canonical entrypoint and handles the production-style local stack (standalone app on port 3000) and build/runtime prerequisites. Do not replace it with ad-hoc manual checks.

**Layer B generation rules — how to pick parameters:**

`url` is always the path from the Sentry issue's `transaction` tag, with the leading region segment stripped (e.g. `/sg/products/foo` → `/products/foo`). The generated test reads `REGION_PREFIX` env var at runtime (default `/sg`) so it works across markets without rebuilding.

Supply `fallbackUrl` (also without region prefix) when the issue's exact page may not exist in the local build — the test retries on 404 automatically.

Full parameter matrix, capability boundaries, and unit-test coverage gaps: see `references/e2e-layer-b-params.md`.

---

## Remediation Loop

Steps 6 and 7 form a bounded retry loop. Do not report the fix as complete until the loop exits green.

**Batch principle**: within each loop iteration, ALL fixes must be applied before ANY verification runs. Never interleave fix→verify per issue — fix everything first, then verify once.

```
attempt = 1
MAX_ATTEMPTS = 3

loop:
  [Step 6] apply fixes for ALL outstanding violations (batch — do not verify mid-batch)
  [Step 7a] run lint ONCE on all changed files: pnpm lint:observability
    → if violations remain AND attempt < MAX_ATTEMPTS: attempt++, continue loop
    → if violations remain AND attempt == MAX_ATTEMPTS: EXIT → ESCALATE
  [Step 7b] apply post-fix E2E decision gate:
    - if required=Layer A + B: run `pnpm e2e:sentry-tags:server-capture` once (SKIPPED not allowed)
    - if eligible for E2E skip: run relevant unit tests and record evidence in Step 9
    - otherwise (Layer B candidate but not eligible to skip): prepare targeted tests, then run `pnpm e2e:sentry-tags:server-capture` once
    → if E2E fails AND attempt < MAX_ATTEMPTS: attempt++, continue loop
    → if E2E fails AND attempt == MAX_ATTEMPTS: EXIT → ESCALATE
  break  ← all checks green
```

**Scripted remediation loop (enforces invariants automatically):**

For deterministic execution with enforced loop invariants:

```bash
node .agents/skills/alert-harness/scripts/remediation-loop.mjs \
  --run-id $(uuidgen) \
  --mode "fix --with-pr" \
  --e2e-required true \
  --json
```

This script enforces:

- Empty-diff detection (Invariant 1)
- No-regression rule (Invariant 2)
- Proper retry accounting (Invariant 3)
- Machine-readable JSON output and per-run log in `logs/remediation-<run-id>.json`

**ESCALATE output format and loop invariants:** see `references/escalate-template.md` for the exact output template, machine-readable JSON schema, and the three loop invariants.

---

### Step 8: Commit fixes + open/update PR with Sentry `fixes` on the PR only

Add `fixes ISSUE-ID` on the **PR title and PR description only** for every resolved Sentry issue (see `AGENTS.md` § Sentry Auto-Resolve). Do **not** put `fixes` lines in commit messages.

**Branch naming requirement (mandatory for PR-merged automation):**

The branch created in Phase 1 (local routine) or at fix time MUST follow this pattern:

```
<github_username>/CU-<task_id>/Auto-fix-Sentry-classification-issues-<DATE>
```

This pattern is required because the `PR Observability Clickup Automatic Change` routine detects `*/CU-<task-id>/Auto-fix-Sentry-*` on PR merge and automatically updates the ClickUp task status to `ready for release`. A branch that doesn't match this pattern will not trigger the automation.

If no branch was created yet, resolve it now:

1. Run `gh api user --jq .login` to get your GitHub username
2. Run `cup task <task_id>` — use the GitHub integration branch if already available
3. Otherwise construct: `<github_username>/CU-<task_id>/Auto-fix-Sentry-classification-issues-<TODAY_YYYY-MM-DD>`

**8a. PR title** — follow submit-pr skill convention. Include ClickUp task ID and Sentry fixes suffix:

```
fix: [#<task_id>] Auto-fix: Sentry classification issues — <DATE> [fixes JOYBOY-WEB-XXXX, fixes JOYBOY-WEB-YYYY]
```

**8b. PR description** — caught by Sentry's GitHub integration PR-based detection on merge:

```
fixes JOYBOY-WEB-XXXX
fixes JOYBOY-WEB-YYYY
```

**Official keyword**: `fixes` — standardize on this for consistency. Sentry also supports `resolves`, `resolved`, `closes`, `closed`, `fixed`.
**When to include**: only when the fix actually stops the error from occurring. Do NOT include for noise-reduction-only changes where the issue may recur.

After commits are ready, invoke `/submit-pr` to create (or update) the PR with the title/description `fixes` lines. If no files were changed in Step 6, skip PR creation and output "No changes — skipping PR".

**8c. Mandatory final PR format check (before Step 9 report):**

- PR title ends with: `[fixes JOYBOY-WEB-XXXX, ...]` when issues are resolved.
- PR description contains one line per issue: `fixes JOYBOY-WEB-XXXX`.
- Commit message must not contain `fixes JOYBOY-WEB-XXXX`.
- If `/submit-pr` generated a non-compliant title/body, immediately correct with `gh pr edit` before finishing.

### Step 8d: Create ClickUp task + link to Sentry issue

For each Sentry issue being fixed (those listed in the PR `fixes` lines), create a ClickUp tracking task and link it back to the Sentry issue so the weekly report can track resolution status.

**Only run this step when** at least one `fixes JOYBOY-WEB-XXX` line was added to the PR (i.e. real issues are being resolved, not noise-only changes).

**8d-1. Get Sentry issue numeric ID**

The numeric ID is needed for the external-issues API. It should already be available from the Step 2 Sentry MCP fetch results (`issue.id` field — the long numeric string, not the short `JOYBOY-WEB-XXX` ID). Use that value directly.

If for some reason it is not available, use the Sentry MCP `search_issues` with `query="is:unresolved"` and find the matching issue by `shortId`.

**8d-2. Create ClickUp task**

Prefer `cup` CLI (saves tokens). Fall back to ClickUp MCP only if `cup` is not available.

```bash
# Check cup availability first
if command -v cup &>/dev/null; then
  # Use cup CLI
  ASSIGNEE_ID=$(cup tasks --json 2>/dev/null | python3 -c "..." || echo "")
  cup create \
    --list 901818201801 \
    --name "[JOYBOY-WEB-XXX] {issue title, max 60 chars}" \
    --description "Sentry: JOYBOY-WEB-XXX\n{sentry permalink}\n\n{short issue description}" \
    --assignee "${ASSIGNEE_ID:-me}" \
    --json
  # → note task id and url from JSON output
else
  # Fall back to ClickUp MCP
  clickup_create_task(
    list_id="901818201801",
    name="[JOYBOY-WEB-XXX] {issue title, max 60 chars}",
    description="Sentry: JOYBOY-WEB-XXX\n{sentry permalink}\n\n{short issue description}",
    assignees=[resolved_user_id]
  )
fi
```

To resolve Sentry `assignedTo` email → ClickUp user ID when using `cup`, pass `--assignee me` if the issue is assigned to the current user, or use `cup tasks --json` to look up the user ID by email.

**8d-3. Link ClickUp task back to Sentry issue**

This step requires a Sentry **Personal API Token** (format: `sntryu_...`), which is different from the Sentry MCP's OAuth web auth. Obtain it from:
`https://sentry.io/settings/account/api/auth-tokens/` → Create New Token → scope: `project:read`, `event:write`

The token should be stored in `~/.zprofile` (or `~/.zshrc`) as:

```bash
export SENTRY_API_TOKEN=sntryu_...
```

Once set, run the link call:

```bash
curl -s -X POST \
  "https://sentry.io/api/0/sentry-app-installations/695041b9-ad61-47b5-b46d-1e18963a749f/external-issues/" \
  -H "Authorization: Bearer $SENTRY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"issueId\": \"<sentry_numeric_id>\", \"webUrl\": \"<clickup_task_url>\", \"project\": \"Sentry Issues\", \"identifier\": \"<clickup_task_id>\"}"
```

If `$SENTRY_API_TOKEN` is not set, **skip this linking step silently** and continue to Step 9. Log a single notice in the Step 9 report:
`ℹ️ Sentry–ClickUp link skipped: SENTRY_API_TOKEN not set. To enable, add to ~/.zprofile: export SENTRY_API_TOKEN=sntryu_...`

Do not block or prompt the user — the ClickUp task is still created and useful on its own.

Verify response contains `"serviceType": "clickup"` — if not, log a warning but do not block Step 9.

Repeat 8d-2 and 8d-3 for each issue fixed in this run.

### Step 9: Output report

Report format: see `references/checks.md` § Report Output Format.

Include a fix summary section listing every file changed, the rule it addresses, and any Sentry issue IDs resolved.

Machine-readable JSON fields (`status`, `summary`, `next_actions`, `artifacts`, optional keys): see `references/checks.md` § Machine-readable report contract.
