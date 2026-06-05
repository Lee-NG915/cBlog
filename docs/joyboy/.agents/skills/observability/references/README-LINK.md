# Observability Guide — Location & Section Summaries

- **Full usage guide**: `references/observability-guide.md` (same directory as this file).

## Section Summaries (for quick navigation)

1. **Overview & Capabilities** — Package positioning, unified error capture, structured messages, context management, error bucketing & filtering, server-side tracing; data pipeline: capture → bucket & tag → filter → downstream.
2. **Business / Technical Scenes** — Business scenes (payment/order/cart/user/product etc.) and "when to use which API" table.
3. **Entry Points & Runtime Environments** — default / client / server three entry points; entry point per Next.js scene; Middleware must not use server tracing.
4. **Logger + Sentry Combination in Next.js** — Main path three steps (Layout wraps Provider → business calls capture/domain API → non-errors use logger); mount points per layer; tracing is Node server only; breadcrumb.
5. **Tag & Bucket Conventions** — Required tags (domain, priority, error_bucket); no PII; ERROR_BUCKET and classifyErrorBucket; severity-to-bucket mapping; aligned with Sentry Ownership rules.
6. **Alerts, Dashboards & Error Templates** — Alerts by error_bucket + priority; dashboard dimensions; error template parameter list.
7. **Project-Level error_bucket Implementation (Web Client)** — Package vs project responsibilities; `apps/web/instrumentation-client.ts` `beforeSend` order: call `classifyErrorBucket` to write `event.tags` first, then run filters; client-side (including Redux listeners) → beforeSend → tag first, then filter; alert/dashboard/error template dependency on the two tags.
8. **Noise Control & Compliance** — shouldSendToSentry, skipSentry, domainSpecificFilters, filterPII.
9. **Implementation Examples** — Code snippets for Layout, Server Action, Client, API Route with import conventions; each example annotates Sentry tag/severity.
10. **Advanced & References** — Log-before-capture explanation, createDomainErrorCapture, documentation links.

When writing or debugging, open the relevant section of `observability-guide.md` directly for the current scene.
