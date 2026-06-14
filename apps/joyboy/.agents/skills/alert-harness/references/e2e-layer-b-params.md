---
name: e2e-layer-b-params
description: Layer B targeted E2E test parameter mapping for generate-fix-test.mjs
type: reference
last-reviewed: 2026-04-22
version: 1.0.0
---

# Layer B Targeted E2E Test — Parameter Mapping

When generating a targeted test via `scripts/e2e/sentry/generate-fix-test.mjs`.

## URL Rules

- `url` is always the path from the Sentry issue's `transaction` tag, with the leading region segment stripped (e.g. `/sg/products/foo` -> `/products/foo`).
- The generated test reads `REGION_PREFIX` env var at runtime (default `/sg`) so it works across markets without rebuilding.
- Supply `fallbackUrl` (also without region prefix) when the issue's exact page may not exist in the local build — the test retries on 404 automatically.

## Parameter Matrix

| Fix type                                                                                 | `errorBucket`                                                     | `errorMessageSuffix`                                                      | `errorName`                                                            |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `THIRD_PARTY_PATTERNS` addition (message-based)                                          | `"third_party"`                                                   | the pattern from the issue message, e.g. `"Failed to fetch (gladly.com)"` | omit                                                                   |
| `classifyErrorBucket` message regex changed                                              | expected bucket after fix                                         | representative message that triggered the rule                            | omit                                                                   |
| `jsFatalNames` / errorName classification fix (e.g. `InvalidCharacterError -> js_fatal`) | expected bucket after fix                                         | omit                                                                      | the `errorName` from the Sentry issue (e.g. `"InvalidCharacterError"`) |
| DOM exception / untraced-frame fix                                                       | omit — E2E can't reproduce; unit tests cover                      | omit                                                                      | omit                                                                   |
| `CRITICAL_THIRD_PARTY_PATTERNS` addition                                                 | omit                                                              | omit                                                                      | omit                                                                   |
| `SentryContextProvider` / `setGlobalSentryContext` fix                                   | omit                                                              | omit                                                                      | omit                                                                   |
| `app_error` / `isExplicitCapture` fix                                                    | omit — requires business-flow Playwright test, not this generator | omit                                                                      | omit                                                                   |

## Capability Boundaries

Layer B is a **classification pipeline verifier**, not a full production replay.

### Can verify

- `message` + `errorName` + `statusCode` -> correct `error_bucket`
- Page correctly sets `page_type` / `domain` tags
- Event passes `beforeSend` without being dropped (E2E injects `/_next/` frames)

### Cannot verify

- Production frame structures (`app:///UUID.js`, `chrome-extension://`) and their effect on `hasOwnCode`
- `isExplicitCapture=true` path (`captureStructuredError`) — requires a business-flow Playwright test with API mocking
- Untraced-frame scenarios — `beforeSend` drops them before envelope is sent

For `isExplicitCapture` fixes, write a dedicated Playwright test that mocks the upstream failure, triggers the user action, and asserts the envelope. Unit tests (`error-bucket.spec.ts`, `client-before-send.spec.ts`) cover code paths that E2E cannot reproduce.
