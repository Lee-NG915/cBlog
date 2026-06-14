---
name: checks
description: Alert harness check rules reference — ESLint static checks, Sentry issue tag checks, and violation-to-fix mapping
type: reference
last-reviewed: 2026-05-18
version: 1.0.1
---

# Alert Harness — Check Rules Reference

## Static Checks (ESLint — automated)

The following checks run automatically via `eslint-plugin-observability` (8 rules). They do **not** need manual intervention — ESLint catches them at IDE time, pre-commit, and PR CI.

| ESLint Rule                       | What it catches                                          | Severity                    |
| --------------------------------- | -------------------------------------------------------- | --------------------------- |
| `no-bare-sentry-capture`          | Bare `Sentry.captureException` + degradation path misuse | warn                        |
| `no-sentry-in-edge`               | Sentry capture in middleware/edge                        | **error**                   |
| `page-requires-sentry-context`    | `page.tsx` missing `setGlobalSentryContext`              | warn / **error** (critical) |
| `layout-requires-sentry-provider` | `layout.tsx` missing `SentryContextProvider`             | warn / **error** (critical) |
| `async-layout-early-context`      | async layout `await` without early context               | warn                        |
| `no-deprecated-page-type-search`  | `PAGE_TYPES.SEARCH` usage                                | **error**                   |
| `no-double-reporting`             | `logger.error` + `captureStructuredError` in same catch  | **error**                   |
| `no-hardcoded-skip-sentry`        | Hardcoded `skipSentry: true`                             | warn                        |

Run: `pnpm lint:observability` or `npx eslint <file>`

---

## Sentry Issue Tag Checks (MCP analysis)

| #   | Check                                             | Logic                                       | Impact                                                      |
| --- | ------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| 1   | `domain` missing                                  | Tag absent or empty                         | Alert routing broken                                        |
| 2   | `page_type` empty string                          | Tag value is `""`                           | Dashboard Widget 9 shows `(empty)` row                      |
| 3   | `error_bucket` missing                            | Tag absent                                  | Sev-2 alerts will not fire                                  |
| 4   | `level` mismatched with domain                    | cart / product / search should be `warning` | Wrong alert tier triggered                                  |
| 5   | `PAGE_TYPES.SEARCH` remnant                       | `page_type` value is `search`               | Should be `plp` + `domain:search`                           |
| 6   | `js_fatal` + third-party stack                    | Stack frames contain third-party CDN URLs   | Noise in Sev-3 / Sev-1 alerts                               |
| 7   | `bucket_confidence:low` on api_5xx / upstream_5xx | Tag present but confidence is low           | Alert rule filter `!bucket_confidence:low` will suppress it |

---

## Violation → Fix Mapping

Quick lookup: violation type → how to locate the code → what to fix.

### Stop Hook violations

| Violation                                         | Locate code                    | Fix                                                                                                                                                                                                                                                                                                                          | Spec source                    |
| ------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Bare `Sentry.captureException`                    | File path from diff header     | Replace with `captureStructuredError(error, { domain: BUSINESS_DOMAIN.XXX, tags: {...}, extra: {...} })`. If the original call had `tags`/`extra` options, preserve them in the corresponding fields — do NOT flatten `tags` into `extra`. Tags are indexed in Sentry and used in alert rule filters; `extra` is debug-only. | `sentry-practices` §3          |
| `logger.error` + `captureException` double-report | Same file                      | Merge into single `captureStructuredError` call — it logs and reports in one call                                                                                                                                                                                                                                            | `logger` §2                    |
| New `page.tsx` missing `setGlobalSentryContext`   | The new page.tsx from diff     | Add `setGlobalSentryContext({ pageType: PAGE_TYPES.XXX, domain: BUSINESS_DOMAIN.XXX })` at top of the default export function                                                                                                                                                                                                | `sentry-practices` §2 RSC page |
| New `layout.tsx` missing `SentryContextProvider`  | The new layout.tsx from diff   | Wrap `{children}` with `<SentryContextProvider pageType={...} domain={...}>`. Import Provider from `/client`, constants from `/server`                                                                                                                                                                                       | `sentry-practices` §2 Layout   |
| Unknown `BUSINESS_DOMAIN` value                   | File from diff                 | Replace with a valid domain from: `user / order / payment / cart / product / search / checkout / cms / promotion`                                                                                                                                                                                                            | `alert-metrics` §1             |
| `PAGE_TYPES.SEARCH`                               | File from diff                 | Replace with `PAGE_TYPES.PLP` + `domain: BUSINESS_DOMAIN.SEARCH`                                                                                                                                                                                                                                                             | `alert-metrics` §2             |
| Sentry capture in middleware/edge                 | `middleware.ts` or `*.edge.ts` | Replace with `logger.warn(...)` or `logger.error(...)` — logs to stdout, no Sentry reporting                                                                                                                                                                                                                                 | `logger` §1                    |

### Sentry issue tag violations

| Violation                                                              | Locate code                                                                                                        | Fix                                                                                                                                                                                                                                                                                                                                    | Spec source                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `domain` tag missing                                                   | From issue `transaction` URL → find route segment → `Glob apps/web/app/**/{layout,page}.tsx` matching the URL path | Add `SentryContextProvider` to route `layout.tsx` with correct `domain`                                                                                                                                                                                                                                                                | `sentry-practices` §2 Layout |
| `page_type` tag empty / missing                                        | Same route lookup as above — check both `layout.tsx` (Provider) and `page.tsx` (setGlobalSentryContext)            | Add `SentryContextProvider` to layout OR add `setGlobalSentryContext` to page.tsx                                                                                                                                                                                                                                                      | `sentry-practices` §2        |
| `error_bucket` missing (`unclassified`)                                | `libs/shared/observability/src/lib/sentry/errors/error-bucket.ts`                                                  | 1. Apply `classifyErrorBucket` decision tree against the issue title/message/stack to infer the correct bucket. 2. Locate the gap: domain missing from `THIRD_PARTY_PATTERNS`? regex not matching? status code not extracted? 3. Fix the classifier. Fixing `unclassified` almost always touches tag output → Step 7b E2E is required. | `alert-metrics` §4           |
| `js_fatal` but stack frames from third-party CDN                       | `libs/shared/observability/src/lib/sentry/errors/error-bucket.ts` → third-party patterns list                      | Add the CDN domain pattern to `THIRD_PARTY_PATTERNS`. ⚠️ First confirm it is NOT in `CRITICAL_THIRD_PARTY_PATTERNS` (DY, Algolia, Stripe, PayPal, Casa) — those must never be silenced. Example domains not yet in the list: `hotjar.com`, `intercom.io`.                                                                              | `alert-metrics` §4           |
| `level` wrong for domain (e.g. `cart` firing as `error` not `warning`) | Find `captureStructuredError` / `withServerActionInstrumentation` call with explicit `severity` override           | Remove the explicit `severity` — let it auto-infer from `domain` via `inferPriorityFromDomain`. Mapping: `cart/product/search → warning`, `user → fatal`, `order → error`                                                                                                                                                              | `alert-metrics` §3           |
| `page_type: search` remnant                                            | Route files for `/search` URL path                                                                                 | Change `PAGE_TYPES.SEARCH` → `PAGE_TYPES.PLP` + `domain: BUSINESS_DOMAIN.SEARCH`                                                                                                                                                                                                                                                       | `alert-metrics` §2           |
| `bucket_confidence:low` on `api_5xx` / `upstream_5xx`                  | `error-bucket.ts` classifier logic                                                                                 | Check why the error message didn't match the HIGH-confidence pattern. Adjust status code extraction or message pattern in the classifier                                                                                                                                                                                               | `alert-metrics` §4, §5       |

---

## Route → File Lookup Pattern

When an issue's `transaction` tag points to a URL, use this mapping to find the route files:

```
/home                      → apps/web/app/[deviceTheme]/[region]/[locale]/home/
/products/[slug]           → apps/web/app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/
/search or /[category]     → apps/web/app/[deviceTheme]/[region]/[locale]/(PLP)/
/cart                      → apps/web/app/[deviceTheme]/[region]/[locale]/cart/
/account                   → apps/web/app/[deviceTheme]/[region]/[locale]/(account)/
/checkout                  → apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/   [BLOCKED — do not instrument]
```

Then check:

1. `layout.tsx` in that segment — should have `SentryContextProvider`
2. `page.tsx` in that segment — should call `setGlobalSentryContext`

---

## Route → Sample URL (for generate-fix-test.mjs)

When generating a targeted E2E fix test, prefer the Sentry issue's `transaction` tag as the URL.
If unavailable, use these fallback sample URLs (SG region):

| Route pattern         | Sample URL                                | pageType  | domain      |
| --------------------- | ----------------------------------------- | --------- | ----------- |
| `/products/[slug]`    | `/sg/products/owen-chaise-sectional-sofa` | `pdp`     | `product`   |
| `/search`             | `/sg/search?q=sofa`                       | `plp`     | `search`    |
| `/[category]` (PLP)   | `/sg/sofas`                               | `plp`     | `search`    |
| `/home`               | `/sg/home`                                | `home`    | `cms`       |
| `/account`            | `/sg/account`                             | `account` | `user`      |
| `/sales/[slug]`       | use transaction tag                       | `plp`     | `promotion` |
| `/collections/[slug]` | use transaction tag                       | `plp`     | `search`    |
| `/rooms/[slug]` (CMS) | use transaction tag                       | `cms`     | `cms`       |
| `/blog/[slug]`        | use transaction tag                       | `blog`    | `cms`       |

> Always prefer the real URL from the Sentry issue's `transaction` tag — it's a known-good production URL for that route.

---

## Fix Priority

- [ERR]: must be fixed before committing
- [WARN]: confirm intent; provide explanation if leaving as-is

Manual-only cases: see `references/manual-only-scenarios.md`.

---

## Report Output Format

```
==================================================
  [INFO] Harness Alert Coverage Review
==================================================

Time: 2026-03-27T10:00:00Z

[Stop Hook Report]
Changed files:
  - apps/web/app/(pdp)/products/[slug]/page.tsx
  - libs/shared/observability/src/lib/monitoring/domains.ts

Results:
  page.tsx     → [WARN] No setGlobalSentryContext found — add even if parent layout has SentryContextProvider
  domains.ts   → [OK] No issues

[/alert-harness Report]
Issue #1: Cannot read properties of undefined
  domain=product, page_type=pdp, level=warning, error_bucket=api_5xx
  Alert coverage: [OK] [Sev-1] PDP + [Sev-2] API Errors
  Dashboard: [OK] All widgets OK
  Verdict: CORRECT

Issue #2: TypeError: Cannot read property 'id'
  domain=(empty), page_type=cart, level=warning
  Alert coverage: [WARN] domain missing — relies on page_type to trigger [Sev-1] CART
  Dashboard: [ERR] Widget 4 (Errors by Domain) cannot classify
  Verdict: MISROUTED
  Fix: add SentryContextProvider to apps/web/app/(cart)/cart/layout.tsx
       domain: BUSINESS_DOMAIN.CART, pageType: PAGE_TYPES.CART

==================================================
Summary: [OK] 3 passed   [WARN] 1 warning   [ERR] 1 error
Log: .agents/skills/alert-harness/logs/review-20260327.log
==================================================
```

### Machine-readable report contract (required)

All harness reports (stop hook and `/alert-harness`) should also emit JSON with:

- `status`: `success` | `warning` | `error`
- `summary`: one-line result
- `next_actions`: ordered list of actionable follow-ups
- `artifacts`: file paths (log/report/evidence output)

Recommended optional fields:

- `mode`: `analyze-only` | `fix` | `verify-only` | `pr-only`
- `fallback_triggered`: boolean
- `fallback_confidence`: `high` | `low`
- `generated_at`: ISO timestamp
