---
status: accepted
version: 1.0.0
owner: lychee27z
last-reviewed: 2026-04-21
---

# Observability AI Specs — Index

Spec registry for `docs/ai-specs/observability/`. All AI agents (Claude, Cursor, harness scripts) should consult this index to discover which spec to read for a given task.

**Authority rule**: if `docs/ai-specs/` and `docs/observability/` conflict, ai-specs win.

---

## Core Specs

| File                                                         | Status      | Purpose                                                                                                                                                       | When to read                                                                                |
| ------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`alert-metrics.md`](alert-metrics.md)                       | ✅ accepted | Domain constants, severity mapping, 10 alert rules (mutually exclusive), error_bucket taxonomy                                                                | Classifying errors, checking alert routing, adding a new domain                             |
| [`sentry-practices.md`](sentry-practices.md)                 | ✅ accepted | Sentry instrumentation, SentryContextProvider, captureStructuredError, migrating bare `Sentry.*` calls, GitHub `fixes` keywords (PR title + description only) | Adding error reporting to any layout / page / server action; linking fixes to Sentry issues |
| [`sentry-e2e-local-capture.md`](sentry-e2e-local-capture.md) | ✅ accepted | Local Sentry E2E runbook (client + server capture, UI mode, summaries)                                                                                        | Running/maintaining `sentry-tags` E2E, avoiding cloud uploads                               |
| [`logger.md`](logger.md)                                     | ✅ accepted | logger vs captureStructuredError choice, PII filtering, noise control                                                                                         | Writing any log statement, deciding whether to also report to Sentry                        |
| [`package-architecture.md`](package-architecture.md)         | ✅ accepted | @castlery/observability entry points, module structure, extension guide                                                                                       | Onboarding to observability layer, adding new domain shortcuts                              |

## References (supplementary examples)

| File                                                                           | Purpose                                                                     |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [`references/sentry-scenes.md`](references/sentry-scenes.md)                   | Copy-paste code examples per scene (layout, page, server action, API route) |
| [`references/scenes-quick-reference.md`](references/scenes-quick-reference.md) | One-table quick lookup: scene → import → what it produces                   |
| [`references/observability-guide.md`](references/observability-guide.md)       | Full package usage walkthrough                                              |

---

## Status Definitions

| Status          | Meaning                                                          |
| --------------- | ---------------------------------------------------------------- |
| `proposed`      | Draft under review — do not use as authoritative source yet      |
| `accepted`      | Active spec — authoritative source for AI agents and code review |
| `deprecated`    | Superseded — read the `supersedes` field to find the replacement |
| `superseded-by` | Renamed/split — follow the pointer                               |

---

## Evaluation — Coverage Metrics

Every PR to `master` receives an automated **Sentry Context Coverage Report** comment showing:

- `page.tsx` / `layout.tsx` instrumentation coverage rates
- Expandable list of missing files
- Delta vs committed baseline

The report is informational — it does not block merges. Incremental enforcement is handled by ESLint error rules.

Baseline file: `tools/eslint-plugin-observability/metrics/baseline.json`

Update baseline after bulk instrumentation:

```bash
bash tools/eslint-plugin-observability/scripts/coverage-scan.sh --ci > tools/eslint-plugin-observability/metrics/baseline.json
```

---

## Human-Facing Counterparts

These docs are for developers, not AI agents. They explain the same system in tutorial form.

| File                                                                                                         | Relationship to ai-specs                                              |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [`docs/observability/error-handling-flow.md`](../observability/error-handling-flow.md)                       | Explains concepts from `sentry-practices.md` + `logger.md` in Chinese |
| [`docs/observability/sentry-issue-routing-guide.md`](../observability/sentry-issue-routing-guide.md)         | Explains `alert-metrics.md` domain tagging in tutorial form           |
| [`docs/observability/sentry-e2e-local-capture-guide.md`](../observability/sentry-e2e-local-capture-guide.md) | Human runbook for local `sentry-tags` E2E + summaries                 |
| [`docs/observability/sentry-ownership-rules-setup.md`](../observability/sentry-ownership-rules-setup.md)     | Sentry Dashboard admin config — no ai-spec counterpart (ops only)     |

---

## Change Protocol

1. Edit the spec file directly.
2. Update `version` (semver) and `last-reviewed` in frontmatter.
3. If removing/renaming a spec: set `status: deprecated`, add `superseded-by: <new-path>` — **do not delete** until all consumers are updated.
4. Open PR — `docs/ai-specs/` is protected by CODEOWNERS (`@lychee27z` approval required).
5. Update this INDEX if a new spec is added or a status changes.
6. Check if the corresponding [Confluence Observability page](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914072196) needs updating — note in PR description if yes.
