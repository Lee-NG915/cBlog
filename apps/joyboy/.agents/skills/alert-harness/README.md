# Alert Harness — Observability Compliance System

Automated multi-layer system that enforces Sentry instrumentation correctness across the joyboy codebase. Prevents mis-routed alerts, noisy dashboards, and broken error classification before they reach production.

Scope: **`apps/web/` only** — POS is out of scope.

---

## Architecture Overview

```
Layer 1 — IDE Real-time    ESLint plugin (eslint-plugin-observability) — instant VS Code feedback
Layer 2 — Pre-commit       lint-staged — blocks commit if observability errors present
Layer 3 — Stop Hook        stop-review.sh — session-end git diff scan via ESLint
Layer 4 — On-demand        /alert-harness — active Sentry issue analysis + auto-fix
+ CI Gate                  observability-lint.yaml — PR check, blocks merge on error
```

Each layer catches violations at a different point in the development cycle: real-time feedback while coding → pre-commit enforcement → session sweep → PR gate → active Sentry monitoring.

---

## Layer 1: IDE Real-time (ESLint Plugin)

**Plugin**: `tools/eslint-plugin-observability/` — 8 rules registered in `apps/web/.eslintrc.json`

Provides instant red underlines in VS Code (requires ESLint extension). Runs on every file save automatically.

**Rules overview:**

| Rule                              | Severity                            | What it catches                                                                         |
| --------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------- |
| `no-bare-sentry-capture`          | warn                                | Bare `Sentry.captureException` + `withServerActionInstrumentation` on degradation paths |
| `no-sentry-in-edge`               | **error**                           | Any Sentry capture in middleware or `runtime='edge'` files                              |
| `page-requires-sentry-context`    | warn / **error** (critical pages)   | `page.tsx` missing `setGlobalSentryContext`                                             |
| `layout-requires-sentry-provider` | warn / **error** (critical layouts) | `layout.tsx` missing `<SentryContextProvider>`                                          |
| `async-layout-early-context`      | warn                                | Async layout with `await` but no `setGlobalSentryContext` before first await            |
| `no-deprecated-page-type-search`  | **error**                           | Use of deleted `PAGE_TYPES.SEARCH`                                                      |
| `no-double-reporting`             | **error**                           | `logger.error` + `captureStructuredError` in same catch block                           |
| `no-hardcoded-skip-sentry`        | warn                                | Inline `skipSentry: true` without a predicate or named constant                         |

**Critical page paths** (upgraded to error): `products/**/page.tsx`, `categories/**/page.tsx`, `collections/**/page.tsx`, `sales/**/page.tsx`, `search/page.tsx`, `home/page.tsx`, `account/**/page.tsx`

**Critical layout paths** (upgraded to error): same domain patterns for `layout.tsx`

**Blocked paths** (`checkout/`, `payment/`, `cart/`): ALL Sentry instrumentation APIs trigger `warn` via `no-restricted-syntax` ("Checkout / Payment: integration blocked" in `AGENTS.md` Hard Rules). These paths are under active migration — warn (not error) so the cart team can continue developing without being hard-blocked. Covered APIs: `captureStructuredError`, `withServerActionInstrumentation`, `setGlobalSentryContext`, `Sentry.captureException`.

Run tests: `node tools/eslint-plugin-observability/tests/rules.test.js`

---

## Layer 2: Pre-commit (lint-staged)

**Trigger**: On every `git commit`, lint-staged runs ESLint on staged files.

Catches violations before they enter git history. Already wired into the project's lint-staged setup — no additional configuration needed.

---

## Layer 3: Stop Hook (Session-end Scan)

**Trigger**: Fires at the end of every conversation session.

**Script**: `.agents/skills/alert-harness/scripts/stop-review.sh` (wrapper)

**Core logic**: `scripts/lint/observability-diff-check.sh` (project-level, also available as `pnpm lint:observability`)

**Behavior**:

1. Detects skill/spec definition file changes → warns
2. Delegates to `scripts/lint/observability-diff-check.sh`:
   - Gets changed TS files via `git diff`
   - Runs `npx eslint` on those files
   - Filters for `observability/` rule violations
   - Falls back to high-risk signature scan (`captureException`, middleware/edge capture APIs, `PAGE_TYPES.SEARCH`) when ESLint cannot provide structured rule output
3. Emits machine-readable summaries:
   - `.agents/skills/alert-harness/logs/review-summary-latest.json`
   - `.agents/skills/alert-harness/logs/observability-diff-summary.json`
4. Logs results to `.agents/skills/alert-harness/logs/review-YYYYMMDD.log`
5. Exits with code 1 if any observability errors found

**Log**: `.agents/skills/alert-harness/logs/review-YYYYMMDD.log`

---

## Layer 4: `/alert-harness` Command

Active analysis of live Sentry issues against alert routing rules in `docs/ai-specs/observability/alert-metrics.md`, followed by automatic code fixes.

Execution default is **analyze-only** (safe mode). Fix/PR actions must be explicit.

### Sub-commands

Authoritative command matrix (modes, defaults): see SKILL.md § Sub-commands.

### Single source of truth

- Process details, gates, and remediation logic: `SKILL.md` (authoritative)
- This README is an operational overview only.
- `references/checks.md` is mapping + templates only (no process authority).

### Workflow

0. **(Scheduled only)** Create ClickUp task (assign jasper, status `in progress`) → `git checkout master && git pull && git checkout -b fix/sentry-auto-CU-<task-id>`
1. Follow **`SKILL.md` Steps 1–9**. Sentry retrieval uses a **single-query baseline** (`is:unresolved !error_bucket:third_party`) — details in Step 2.
2. Post-fix lint, E2E gate, remediation loop, PR `fixes` format, and report shape: **`SKILL.md`** Steps 7–9 and `references/checks.md`.

### Incremental Issue Gating (Optional)

> **Step 2e is the authoritative dedup gate** — it checks `externalIssues` (ClickUp) and git links / `gh pr list` (associated PRs) directly from Sentry MCP. Run it every time regardless of whether 2d is used.
>
> `diff-issues.mjs` (Step 2d) is an **optional performance layer**: it reduces API calls by skipping field-unchanged issues, but cannot detect whether an issue already has a linked ClickUp task or PR.

Use `diff-issues.mjs` to skip unchanged unresolved issues before entering the expensive fix + E2E loop.

```bash
node .agents/skills/alert-harness/scripts/diff-issues.mjs \
  --input /tmp/current-issues.json \
  --output /tmp/issue-diff-result.json \
  --ttl-days 14 \
  --max-issues 50
```

Behavior:

- Classifies each issue as `NEW` / `CHANGED` / `UNCHANGED` (+ `ACTIVITY_ONLY` when enabled)
- Defaults to processing only `NEW` + `CHANGED` (`--force` overrides)
- Optional `--process-activity-changes` enables processing for activity-only drifts (`lastSeen/events/users`)
- Persists compact snapshots in `.agents/skills/alert-harness/assets/issue-snapshots.json`
- Prunes stale snapshots by TTL to keep long-term cost flat
- Supports `--json` for machine-readable output

### Snapshot state git strategy

`assets/issue-snapshots.json` and `assets/metrics.jsonl` are tracked in git with `merge=union` (see `assets/.gitattributes`). After each `/alert-harness` run, if these files changed, commit them separately:

```bash
git add .agents/skills/alert-harness/assets/
git commit -m "chore(alert-harness): refresh issue snapshots cache"
```

This ensures cross-machine scheduled jobs share incremental state.

## Benchmarking

Run metrics are appended to `assets/metrics.jsonl` via `scripts/log-metric.mjs`. Each record tracks:

```json
{
  "run_id": "uuid",
  "timestamp": "2026-04-22T10:00:00Z",
  "mode": "fix --with-pr",
  "issuesAnalyzed": 5,
  "fixesApplied": 3,
  "lintAttempts": 2,
  "e2eRequired": true,
  "e2ePassed": true,
  "escalated": false,
  "prCreated": true,
  "durationSeconds": 420
}
```

These metrics drive convergence analysis: if `lintAttempts` averages > 2, the fix mapping or Step 3 inference logic needs attention.

---

## CI Gate: PR Check

**File**: `.github/workflows/observability-lint.yaml`

Triggers on PRs to `master` when `apps/web/**/*.ts(x)`, `libs/shared/observability/**`, `tools/eslint-plugin-observability/**`, or `apps/web/.eslintrc.json` files change.

1. Gets changed files via git diff
2. Runs `npx eslint --format unix` on those files
3. Filters `observability/` violations
4. Exits 1 on any error → blocks PR merge

> Note: Runs at PR time only. Push CI (Deploy) is not affected.

> Branch protection: Add `Observability Compliance (web)` as a required status check in GitHub Settings → Branches → master.

## Dynamic Verification

### Unit Tests (beforeSend)

`clientBeforeSend` extracted as a pure function in `libs/shared/observability/src/lib/sentry/hooks/web/client-before-send.ts` — testable without browser runtime.

Test file: `client-before-send.spec.ts` (same directory)

Run: `pnpm nx test shared-observability --testFile=client-before-send.spec.ts`

### E2E Sentry Tag Verification

Playwright tests intercept Sentry envelopes and assert `domain` / `page_type` / `error_bucket` tags on 5 core pages (PDP, PLP, Home, Account, Cart).

```
apps/web-e2e/src/sentry/
  ├── fixtures/sentry-envelope.ts  — page.route() envelope interceptor
  └── tag-verification.spec.ts     — 5 core page tag assertions
```

**Runbook reference**:

- Do not duplicate E2E command details in this README.
- Use `docs/ai-specs/observability/sentry-e2e-local-capture.md` as the single source of truth for:
  - build prerequisites (`E2E_LOCAL_ASSETS`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_API_HOST`, cache bypass policy)
  - canonical commands
  - troubleshooting and expected outputs

**Full automated fix → verify flow** (used by `/alert-harness`):

Full procedure: `docs/ai-specs/observability/sentry-e2e-local-capture.md` § AI Agent Execution Checklist.

Summary:

1. AI fixes code (layout, error-bucket, etc.)
2. If fixed page is outside core 4 — generate targeted test via `scripts/e2e/sentry/generate-fix-test.mjs`
3. If Step 7 requires Layer A + B, run the canonical full-chain command from the runbook (rebuilds automatically)
4. Delete generated tests, confirm summary

> Cart test is intentionally `test.skip` — blocked until cart migration completes ("Checkout / Payment: integration blocked" in `AGENTS.md` Hard Rules).

## Observability Specs & Hard Rules

The following are maintained as single sources of truth — not duplicated here:

- **10 alert rules**: `docs/ai-specs/observability/alert-metrics.md`
- **Hard rules (11)**: `AGENTS.md` § Observability Hard Rules
- **ESLint coverage**: 8/10 hard rules covered. See `tools/eslint-plugin-observability/CONTRIBUTING.md` for the full change checklist.

---

## File Structure

```
.agents/skills/alert-harness/
├── README.md                      # this file
├── SKILL.md                       # full spec: analysis flow; pointers to ai-specs for matrices/templates
├── CHANGELOG.md                   # harness behavior/version change log
├── references/
│   ├── checks.md                  # violation→fix mapping, route→file lookup
│   └── manual-only-scenarios.md   # scenarios that require manual handling (no auto-fix)
├── scripts/
│   ├── stop-review.sh             # Layer 3: wrapper -> calls scripts/lint/observability-diff-check.sh
│   ├── diff-issues.mjs            # incremental NEW/CHANGED/UNCHANGED gating helper (supports --json)
│   ├── check-doc-sync.mjs         # doc drift guard between SKILL and README (supports --json)
│   ├── remediation-loop.mjs       # scripted remediation loop with enforced invariants (supports --json)
│   └── log-metric.mjs             # append metric record to metrics.jsonl
├── assets/
│   ├── .gitattributes             # merge=union for issue-snapshots.json and metrics.jsonl
│   ├── issue-snapshots.json       # incremental issue snapshot state
│   └── metrics.jsonl              # per-run benchmarking metrics
└── logs/
    ├── review-YYYYMMDD.log        # auto-generated per session
    └── remediation-<run-id>.json  # per-run remediation loop log

scripts/lint/
└── observability-diff-check.sh    # Project-level compliance check (core logic)

tools/eslint-plugin-observability/
├── index.js                       # plugin entry, registers all rules
├── package.json
├── rules/                         # 8 rule implementations (js files)
└── tests/rules.test.js            # RuleTester, full coverage

apps/web/.eslintrc.json            # rule severity + file-pattern overrides (web-only)
.github/workflows/observability-lint.yaml  # PR CI gate

apps/web-e2e/src/sentry/
├── fixtures/sentry-envelope.ts         # Playwright envelope interceptor + ndjson output
└── tag-verification.spec.ts            # 5 core page tag assertions (Cart: test.skip)

scripts/e2e/sentry/                     # Sentry E2E runners + summaries
├── run-local.sh                        # Client-only E2E runner
├── run-server-capture.sh               # Client+server full-chain runner
├── mock-ingest.mjs                     # Local Sentry mock server (:8123)
├── summarize-server.mjs                # Server envelope summary
└── summarize-combined.mjs              # Combined client+server summary

scripts/network/
└── local-api-proxy.mjs                 # API proxy for standalone (:8010)
```
