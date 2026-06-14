# Changelog — eslint-plugin-observability

## v2.2.0 (2026-04-09)

### Dynamic Verification (3b)

- Extracted `clientBeforeSend` as pure function → `hooks/web/client-before-send.ts`
- Unit tests: `client-before-send.spec.ts` — tag stamping + filter logic
- E2E: Playwright envelope interception + 5 core page tag assertions (`sentry-tags` project)
- Docs: package-architecture.md §7 updated; observability-guide.md §7/§8 deduplicated as pointers

## v2.1.0 (2026-04-08)

### Evaluation

- CI: `coverage-scan.sh` runs on every PR, posts coverage report as PR comment (upsert mode)
- Baseline: `metrics/baseline.json` for delta tracking
- PR comment: `page.tsx` / `layout.tsx` rates + missing file list + delta vs baseline

### Knowledge Architecture

- SKILL.md: removed orphaned Fix Templates pointer block
- README.md: consolidated spec/hard-rule pointers into single section
- CI: added `related-human-docs` sync warning when ai-specs change without updating linked human docs

## v2.0.0 (2026-04-03)

ESLint 工程范式重构，从 AI prompt-based 迁移到 AST-level 确定性检查。

### Rules (8)

- `no-bare-sentry-capture` (warn) — 裸 `Sentry.captureException` + 降级路径误用
- `no-sentry-in-edge` (error) — middleware/edge 禁止 Sentry capture
- `page-requires-sentry-context` (warn/error) — `page.tsx` 必须调 `setGlobalSentryContext`
- `layout-requires-sentry-provider` (warn/error) — `layout.tsx` 必须有 `SentryContextProvider`
- `async-layout-early-context` (warn) — async layout `await` 前调 `setGlobalSentryContext`
- `no-deprecated-page-type-search` (error) — `PAGE_TYPES.SEARCH` 已删除
- `no-double-reporting` (error) — 同 catch 块禁止 `logger.error` + `captureStructuredError`
- `no-hardcoded-skip-sentry` (warn) — 禁止硬编码跳过 Sentry 的旁路写法（由治理策略约束）

### Infrastructure

- CI gate: `.github/workflows/observability-lint.yaml`
- Pre-commit: lint-staged integration
- Session-end: `stop-review.sh`
- Config: `apps/web/.eslintrc.json` (web-only scope)
- Coverage scan (informational): `tools/eslint-plugin-observability/scripts/coverage-scan.sh`
