# Alert Harness Changelog

## 2.10.3 - 2026-05-18

- **checks.md fix**: Removed `stripe.com`, `segment.io`, `googletagmanager.com` from "Known CDNs" example in `js_fatal` fix row — `stripe.com` is in `CRITICAL_THIRD_PARTY_PATTERNS` and must never be silenced; `segment` and `googletagmanager` are already covered by existing `THIRD_PARTY_PATTERNS` substrings. Added guard note to check CRITICAL list before adding any new pattern.
- **checks.md fix**: Updated Route → File Lookup paths to include the `[deviceTheme]/[region]/[locale]/` prefix that matches the actual Next.js app directory structure. Fixed `(home)` → `home` and `(plp)` → `(PLP)` casing.
- **CHANGELOG fix**: Corrected 2.9.3 date from 2026-04-21 to 2026-04-22 (patch versions must not predate their minor base).

## 2.10.0 - 2026-04-22

- **Observation quality**: All scripts now support `--json` for machine-readable output following the `status`/`summary`/`next_actions`/`artifacts` contract (`diff-issues.mjs`, `check-doc-sync.mjs`, `remediation-loop.mjs`).
- **Benchmarking**: Added `assets/metrics.jsonl` + `scripts/log-metric.mjs` to track completion rate, lint attempts, E2E pass/fail, and escalation rate per run.
- **Context budget**: Externalized long inline tables/templates from `SKILL.md` into dedicated reference files:
  - `references/fetch-decision-tree.md` (Step 2c progressive fetch)
  - `references/e2e-layer-b-params.md` (Step 7b Layer B parameter matrix)
  - `references/escalate-template.md` (Remediation Loop ESCALATE output + invariants)
- **Recovery quality**: Added `scripts/remediation-loop.mjs` that enforces loop invariants automatically (empty-diff detection, no-regression rule, retry accounting).
- **Git strategy**: Added `assets/.gitattributes` with `merge=union` for `issue-snapshots.json` and `metrics.jsonl` to reduce cross-machine conflicts.

## 2.9.3 - 2026-04-22

- Deduplicated docs: removed duplicate machine-readable contract in `references/checks.md`; `SKILL.md` Step 9 points at checks for JSON fields; `README.md` Layer 4 workflow points at `SKILL.md` instead of repeating Steps 2–7/E2E bullets.

## 2.9.0 - 2026-04-22

- Added explicit command mode contract: `analyze-only`, `fix`, `verify-only`, `pr-only`.
- Standardized report output contract (`status`, `summary`, `next_actions`, `artifacts`).
- Added `check-doc-sync.mjs` to guard against SKILL/README drift.
- Added manual-only scenario reference for safe escalation boundaries.
- Clarified single-query baseline for Sentry issue retrieval.

## 2.8.3 - 2026-04-21

- Updated incremental issue snapshot behavior and scheduled-run docs.
