---
status: accepted
version: 1.0.0
owner: lychee27z
last-reviewed: 2026-04-15
related-human-docs:
  - docs/observability/sentry-issue-routing-guide.md
  - docs/observability/error-handling-flow.md
---

# joyboy Alert Metrics — Business Monitoring Vocabulary & Alert System

This spec covers the **business metric definitions** and **Sentry alert configuration** for the joyboy project. It answers "what level does this domain fire at", "which alert rule covers this error", and "why is the system designed this way".

---

## 1. Business Domain Constants (`BUSINESS_DOMAIN`)

Source: `libs/shared/observability/src/lib/monitoring/domains.ts`

| Constant                    | Tag value   | Business scope                  |
| --------------------------- | ----------- | ------------------------------- |
| `BUSINESS_DOMAIN.USER`      | `user`      | Login, register, auth           |
| `BUSINESS_DOMAIN.ORDER`     | `order`     | Order creation, status          |
| `BUSINESS_DOMAIN.PAYMENT`   | `payment`   | Payment processing              |
| `BUSINESS_DOMAIN.CART`      | `cart`      | Cart add/remove/update          |
| `BUSINESS_DOMAIN.PRODUCT`   | `product`   | PDP, product detail             |
| `BUSINESS_DOMAIN.SEARCH`    | `search`    | PLP, search results             |
| `BUSINESS_DOMAIN.CHECKOUT`  | `checkout`  | Checkout flow                   |
| `BUSINESS_DOMAIN.CMS`       | `cms`       | Blog, help-center, static pages |
| `BUSINESS_DOMAIN.PROMOTION` | `promotion` | Promotions (no active page yet) |

---

## 2. Page Type Constants (`PAGE_TYPES`)

Source: `libs/shared/observability/src/lib/monitoring/page-types.ts`

| Constant              | Tag value  | Route                                  |
| --------------------- | ---------- | -------------------------------------- |
| `PAGE_TYPES.PDP`      | `pdp`      | Product detail pages + PLA pages       |
| `PAGE_TYPES.PLP`      | `plp`      | Product listing + `/search`            |
| `PAGE_TYPES.CART`     | `cart`     | Cart page                              |
| `PAGE_TYPES.CHECKOUT` | `checkout` | Checkout flow                          |
| `PAGE_TYPES.ACCOUNT`  | `account`  | Account + auth pages                   |
| `PAGE_TYPES.HOME`     | `home`     | Homepage                               |
| `PAGE_TYPES.CMS`      | `cms`      | Dynamic CMS routes (`[...rest]`)       |
| `PAGE_TYPES.BLOG`     | `blog`     | Blog pages                             |
| `PAGE_TYPES.OTHER`    | `other`    | Wishlist, club pages, help center, STL |

**Key note**: `/search` page uses `PAGE_TYPES.PLP` + `domain: BUSINESS_DOMAIN.SEARCH`. `SEARCH` is a domain concept, not a page type. `PAGE_TYPES.SEARCH` does not exist (was deleted).

---

## 3. Domain → Severity → Sentry Level Mapping

Source: `libs/shared/observability/src/lib/monitoring/priorities.ts`

| Domain    | BusinessSeverity | Sentry Level | BusinessPriority | Alert Coverage                                 |
| --------- | ---------------- | ------------ | ---------------- | ---------------------------------------------- |
| payment   | CRITICAL         | fatal        | HIGH             | [Sev-3] Fatal/Error (module not in joyboy yet) |
| checkout  | CRITICAL         | fatal        | HIGH             | [Sev-3] Fatal/Error + n8n probe                |
| user      | CRITICAL         | fatal        | HIGH             | [Sev-3] Fatal/Error + [Sev-2] Account/User     |
| order     | HIGH             | error        | HIGH             | [Sev-3] Fatal/Error + [Sev-2] Order            |
| cart      | MEDIUM           | warning      | MEDIUM           | **[Sev-1] CART**                               |
| product   | MEDIUM           | warning      | MEDIUM           | **[Sev-1] PDP**                                |
| search    | MEDIUM           | warning      | MEDIUM           | **[Sev-1] PLP**                                |
| promotion | MEDIUM           | warning      | MEDIUM           | [Sev-4] Warning/Log Level Alert                |
| cms       | LOW              | log          | LOW              | [Sev-4] Warning/Log Level Alert                |

**Why cart/product/search need Sev-1 page_type alerts**: `MEDIUM` severity maps to `warning` level. Sev-3 only covers `fatal` and `error` — warning-level events would be missed without dedicated page_type alerts.

Mapping: `CRITICAL→fatal`, `HIGH→error`, `MEDIUM→warning`, `LOW→log`

---

## 4. error_bucket Taxonomy

Two classifier sets — one per runtime.

### Client buckets (`classifyErrorBucket`)

Priority order (first match wins):

| Bucket         | Confidence | Trigger                                                                                                |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `hydration`    | HIGH       | "Hydration failed" / "Text content does not match"                                                     |
| `third_party`  | MEDIUM     | Stack frame or message matches third-party patterns                                                    |
| `api_5xx`      | HIGH       | statusCode 500-599 or message contains 5xx                                                             |
| `api_timeout`  | HIGH       | AbortError / "timeout" / "ETIMEDOUT"                                                                   |
| `js_fatal`     | MEDIUM     | TypeError / ReferenceError / RangeError / SyntaxError                                                  |
| `app_error`    | MEDIUM     | `mechanism.handled=true + mechanism.type='generic'` — explicitly captured via `captureStructuredError` |
| `unclassified` | LOW        | Everything else (auto-caught, no matching pattern)                                                     |

Third-party is checked **before** api_5xx to prevent DY/Stripe/3rd-party 5xx from polluting `api_5xx`.

> **Important:** `error-bucket.ts` is the single source for all third-party domain lists. Two constants:
>
> - `CRITICAL_THIRD_PARTY_PATTERNS` (`dynamicyield`, `dy.com`, `algolia`, `stripe.com`, `paypal.com`) — all three detection paths (frame, message, "Failed to fetch") exempt these domains; their errors are never classified as `third_party` and will reach alert rules.
> - `THIRD_PARTY_PATTERNS` — all non-critical noise patterns; `denyUrls` in `instrumentation-client.ts` is derived from this list (with CRITICAL entries filtered out) — no manual maintenance needed.
>   `OWN_DOMAIN_PATTERNS` (`castlery.com`, `localhost`) ensures our own API fetch failures are never mistakenly bucketed as `third_party`. Never maintain separate domain lists elsewhere.

### Server buckets (`classifyErrorBucketServer`)

Priority order:

| Bucket             | Confidence | Trigger                                                                                                |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------ |
| `upstream_5xx`     | HIGH       | statusCode 500-599 or message contains 5xx                                                             |
| `upstream_timeout` | HIGH       | AbortError / timeout / ETIMEDOUT                                                                       |
| `js_fatal`         | MEDIUM     | Standard JS error names                                                                                |
| `app_error`        | MEDIUM     | `mechanism.handled=true + mechanism.type='generic'` — explicitly captured via `captureStructuredError` |
| `unclassified`     | LOW        | Everything else                                                                                        |

Skips `hydration` and `third_party` (browser-only concepts). Semantics: "our server called upstream and got 5xx/timeout".

---

## 5. The 10 Alert Rules (Sentry — joyboy-web project)

| #   | 告警名                          | Filter 条件                                                                                                                                                                                                                               | 触发条件               | Runbook                                                             |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| 1   | [Sev-1] PDP Issues              | `page_type:pdp !error_bucket:third_party !error_bucket:unclassified`                                                                                                                                                                      | new issue OR >20/5min  | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3924426791) |
| 2   | [Sev-1] PLP Issues              | `page_type:plp !error_bucket:third_party !error_bucket:unclassified`                                                                                                                                                                      | new issue OR >20/5min  | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3924426791) |
| 3   | [Sev-1] Cart Alert              | `page_type:cart !error_bucket:third_party !error_bucket:unclassified`                                                                                                                                                                     | new issue OR >20/5min  | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3940089930) |
| 4   | [Sev-2] Account/User Alert      | `domain:user !page_type:pdp !page_type:plp !page_type:cart !error_bucket:third_party !error_bucket:unclassified`                                                                                                                          | new issue OR >20/15min | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3939795044) |
| 5   | [Sev-2] Order Alert             | `domain:order !page_type:pdp !page_type:plp !page_type:cart !error_bucket:third_party !error_bucket:unclassified`                                                                                                                         | new issue OR >20/15min | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3940057160) |
| 6   | [Sev-2] API Errors              | `error_bucket:[api_5xx,api_timeout] !bucket_confidence:low !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order`                                                                                                      | new issue OR >20/15min | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3924164656) |
| 7   | [Sev-2] Upstream Errors         | `error_bucket:[upstream_5xx,upstream_timeout] !bucket_confidence:low !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order`                                                                                            | new issue OR >20/15min | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3939794992) |
| 8   | [Sev-3] Fatal/Error Level       | `level:[fatal,error] !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order !error_bucket:api_5xx !error_bucket:api_timeout !error_bucket:upstream_5xx !error_bucket:upstream_timeout !error_bucket:unclassified`       | new issue OR >30/15min | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3924557870) |
| 9   | [Sev-4] Warning/Log Level Alert | `!level:fatal !level:error !error_bucket:unclassified !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order !error_bucket:api_5xx !error_bucket:api_timeout !error_bucket:upstream_5xx !error_bucket:upstream_timeout` | new issue ONLY         | [→](https://castlery.atlassian.net/wiki/spaces/EC/pages/3939827771) |
| 10  | [Sev-4] Unclassified New Issue  | `error_bucket:unclassified`                                                                                                                                                                                                               | new issue ONLY         | (新建 Runbook — TBD)                                                |

---

## 6. Alert Layering Design — Mutual Exclusion

Rules are ordered by priority. Each layer explicitly excludes all higher-priority ranges so that **every issue triggers exactly one alert rule**.

Priority: Sev-1 > Sev-2 domain > Sev-2 bucket > Sev-3 > Sev-4
(highest) (lowest)

Sev-1 (page_type)
PDP / PLP / Cart — errors on these pages, excluding third_party noise and unclassified (has its own Rule #10)
Filter: page_type:xxx !error_bucket:third_party !error_bucket:unclassified

↓ all lower layers add: !page_type:pdp !page_type:plp !page_type:cart

Sev-2 domain (user / order)
Errors in high-priority business domains — domain takes precedence over bucket

↓ bucket rules add: !domain:user !domain:order

Sev-2 bucket (API / Upstream)
API Errors: api_5xx + api_timeout (client)
Upstream Errors: upstream_5xx + upstream_timeout (server)

↓ Sev-3 adds: !error_bucket:api_5xx !error_bucket:api_timeout !error_bucket:upstream_5xx !error_bucket:upstream_timeout

Sev-3 (level:fatal OR level:error)
Remaining fatal/error that escaped all Sev-1/Sev-2 rules

Sev-4
Warning/Log Level Alert — `!level:fatal !level:error !error_bucket:unclassified` + all upper exclusions, new issue only
Unclassified New Issue — `error_bucket:unclassified`, new issue only

**Design principles**:

- Each issue triggers **exactly one** alert rule — no duplicate notifications on a single channel
- `domain` priority over `bucket`: user/order domain errors route to their domain runbooks (including api_5xx within those domains)
- Hydration errors: covered by Sev-1 page_type frequency condition (>20/5min) for core pages; new hydration issues on other pages fall to Sev-4 Warning/Log Level Alert
- `error_bucket:unclassified` is excluded from Sev-1/Sev-3/Sev-4 Warning rules via `!error_bucket:unclassified`; it has its own dedicated Rule #10
- `error_bucket:third_party` is excluded from Sev-1 via `!error_bucket:third_party`; non-critical third_party is also dropped in `beforeSend` (denyUrls) as a defence-in-depth measure

---

## 7. Dashboard Widgets (9 configured)

| #   | Widget                     | Key filter                                      |
| --- | -------------------------- | ----------------------------------------------- |
| 1   | Active Fatal Issues        | level:fatal                                     |
| 2   | Affected Users (24h)       | `!error_bucket:third_party`                     |
| 3   | Total Error Rate           | —                                               |
| 4   | Errors by Domain           | grouped by `domain` tag                         |
| 5   | Fatal vs Error Level Trend | level:fatal + level:error                       |
| 6   | Error Bucket Breakdown     | grouped by `error_bucket`                       |
| 7   | Errors by Country          | grouped by `country` tag                        |
| 8   | Server Upstream Errors     | `error_bucket:upstream_5xx OR upstream_timeout` |
| 9   | Active Errors by Page Type | grouped by `page_type` tag                      |

Widget 9 historically had an `(empty string)` row — caused by missing `page_type` tags on some pages. Resolved by fixing `PAGE_TYPES.SEARCH→PLP` and removing `PAGE_TYPES.UNKNOWN`.

---

## 8. Architectural Decisions (Do Not Re-suggest)

| Decision                                                         | Rationale                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Edge Runtime / Middleware: permanently silent**                | Every HTTP request goes through middleware. Adding Sentry reporting or detailed logger output would generate massive noise and cost. `sentry.edge.config.ts` has no `beforeSend` by design — do not suggest adding it.                                                                        |
| **Payment / Checkout Sentry integration: deferred**              | These modules are currently being refactored and have not been migrated into joyboy. Integration will be done post-refactor. n8n probe provides minimal checkout monitoring in the interim.                                                                                                   |
| **Promotion domain: no dedicated alert**                         | No pages currently use `domain:promotion`. Sev-4 Warning/Log Level Alert handles new issues. Reassess when actual pages adopt this domain.                                                                                                                                                    |
| **No per-layout `setGlobalSentryContext` (synchronous layouts)** | `SentryContextProvider` handles this. Only exceptions: shop-the-look (async layout with 500-prone await before JSX) and home (legacy, keep as-is).                                                                                                                                            |
| **`!bucket_confidence:low` on api_5xx/upstream_5xx**             | Prevents low-confidence classifications from triggering high-signal alerts. Medium/high confidence signals only.                                                                                                                                                                              |
| **Alert rules are mutually exclusive by priority layer**         | Single notification channel — duplicate alerts for the same issue create noise and ambiguity about which runbook to follow. Each layer explicitly excludes all higher-priority ranges. Priority: Sev-1 page_type > Sev-2 domain > Sev-2 bucket > Sev-3 level > Sev-4 Warning/Log Level Alert. |
| **Same-type buckets are merged into one rule**                   | `api_5xx` + `api_timeout` → one "API Errors" rule; `upstream_5xx` + `upstream_timeout` → one "Upstream Errors" rule; `level:fatal` + `level:error` → one "Fatal/Error Level" rule. Reduces rule count and runbook fragmentation without losing coverage.                                      |

---

## 9. Release Name Format

`joyboy-web@${appEnv}@${appVersion}@${gitHash}`

Example: `joyboy-web@sg-prod@1.2.3@abc1234`

`appEnv` pattern: `{region}-{stage}` — e.g. `sg-prod`, `us-prod`, `au-prod`, `uk-prod`, `ca-prod`, `sg-test`, `sg-uat`

To filter all prod regions in Sentry: `release:joyboy-web@*-prod@*`

---

## References

- Domains source: `libs/shared/observability/src/lib/monitoring/domains.ts`
- Priorities/severity source: `libs/shared/observability/src/lib/monitoring/priorities.ts`
- Page types source: `libs/shared/observability/src/lib/monitoring/page-types.ts`
- Error bucket source: `libs/shared/observability/src/lib/sentry/errors/error-bucket.ts`
- Confluence Observability 总览: https://castlery.atlassian.net/wiki/spaces/EC/pages/3914072196
- Coverage analysis: https://castlery.atlassian.net/wiki/spaces/EC/pages/3926523907
- For logger API → see [`logger.md`](logger.md)
- For Sentry instrumentation code → see [`sentry-practices.md`](sentry-practices.md)

---

## See Also (Human-facing docs)

- [`docs/observability/sentry-issue-routing-guide.md`](../../observability/sentry-issue-routing-guide.md) — domain 标签打法教程（中文，面向开发者）
- [`docs/observability/error-handling-flow.md`](../../observability/error-handling-flow.md) — 错误处理流程（中文，面向开发者）
- [`docs/observability/sentry-ownership-rules-setup.md`](../../observability/sentry-ownership-rules-setup.md) — Sentry Dashboard Ownership Rules 配置（运维操作）
