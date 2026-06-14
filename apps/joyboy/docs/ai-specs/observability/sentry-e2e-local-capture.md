---
status: accepted
owner: lychee27z
version: 1.2.0
last-reviewed: 2026-04-18
related-human-docs:
  - docs/observability/sentry-e2e-local-capture-guide.md
---

# Sentry E2E Local Capture Runbook

Run `apps/web-e2e/src/sentry/*` tests with local capture for both browser-side and server-side Sentry events, without uploading to cloud Sentry.

This document is designed for:

- AI agents (executable checklist + guardrails)
- Human developers (copy/paste commands + troubleshooting)

---

## Scope

Applies to `joyboy` observability E2E flows:

- Sentry tag verification (`project: sentry-tags`)
- Local standalone runtime (`http://localhost:3000`)
- Optional API proxy (`http://localhost:8010`, `E2E_USE_LOCAL_API_PROXY=1`)
- Local Sentry mock ingest (`http://localhost:8123`)

Non-goals:

- Replacing production Sentry dashboards
- Replacing unit/integration tests

---

## Hard Rules

1. Never run Sentry E2E against real cloud DSN when local validation is intended.
2. Prefer local capture scripts over ad-hoc Playwright commands.
3. Treat `Cart` as intentionally skipped until migration is completed.
4. If UI mode is requested, use `--ui` and avoid restrictive `--grep` unless explicitly requested.
5. **Build must use `E2E_LOCAL_ASSETS=1`**: production build defaults `assetPrefix` to the CDN (`static.castlery.sg`). Without this flag, all JS chunks (including `instrumentation-client` / Sentry SDK) are loaded from CDN which is inaccessible locally — Sentry never initialises and every test times out.
6. **E2E build must bypass Nx cache** (`--skip-nx-cache`) when validating local Sentry capture. Otherwise stale cached artifacts may keep a cloud DSN in the client bundle and silently invalidate local capture.
7. **`NEXT_PUBLIC_API_HOST` at build time (default: production gateway).** `run-server-capture.sh` **does not** override it unless `E2E_USE_LOCAL_API_PROXY=1`, in which case it sets `http://localhost:8010` and starts the proxy. Default behaviour inlines `apps/web/.env.production` (e.g. `https://apigw-sg-prod.castlery.com`) so SSR/browser API calls hit production like a normal prod build. Artifact verification uses `E2E_EXPECT_PROD_API_HOST` (default same URL) when the proxy is off.

---

## Prerequisites

### Build with local assets

The standalone build used by these tests **must** be produced with:

- local assets (`E2E_LOCAL_ASSETS=1`)
- local mock DSN override (`NEXT_PUBLIC_SENTRY_DSN=http://e2e@localhost:8123/4507648850591744`)
- cache bypass (`--skip-nx-cache`)
- **`NEXT_PUBLIC_API_HOST`**: omitted in `run-server-capture.sh` by default → Next loads `apps/web/.env.production` (production API). For local MITM, set `E2E_USE_LOCAL_API_PROXY=1` before the script (build + proxy both use `http://localhost:8010`).

**Default (production API gateway):**

```bash
NEXT_PUBLIC_SENTRY_DSN="http://e2e@localhost:8123/4507648850591744" \
E2E_LOCAL_ASSETS=1 \
pnpm nx build web --skip-nx-cache
```

**Optional — local API proxy baked into the bundle:**

```bash
E2E_USE_LOCAL_API_PROXY=1 bash scripts/e2e/sentry/run-server-capture.sh
# or manual build:
NEXT_PUBLIC_SENTRY_DSN="http://e2e@localhost:8123/4507648850591744" \
NEXT_PUBLIC_API_HOST="http://localhost:8010" \
E2E_LOCAL_ASSETS=1 \
pnpm nx build web --skip-nx-cache
```

`run-server-capture.sh` executes the build automatically before starting the test stack — manual pre-build is no longer required.

Without `E2E_LOCAL_ASSETS=1`, `assetPrefix` points to `static.castlery.sg` (CDN). The CDN is not accessible in local E2E runs, so `main-app` chunk fails to load, Sentry SDK never initialises, and all envelope assertions time out.

All `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time. Overriding them only at runtime (e.g. when starting the standalone server) has no effect on browser-side behaviour.

### Post-build: copy static assets into standalone directory

The Next.js standalone server does **not** include static chunks or the `public` folder by default. They must be copied manually after each build, mirroring `Dockerfile-CI` lines 25–27:

```bash
# server.js resolves distDir as "../../dist/apps/web/.next" relative to apps/web/server.js,
# so static chunks must live at standalone/dist/apps/web/.next/static.
cp -r dist/apps/web/.next/static dist/apps/web/.next/standalone/dist/apps/web/.next/static
cp -r apps/web/public            dist/apps/web/.next/standalone/apps/web/public
```

**Without this step**, the standalone server returns 404 for all JS/CSS chunks — pages render as unhydrated (blurry) HTML, client-side Sentry never initialises, and all client-side E2E assertions time out.

`run-server-capture.sh` performs this copy automatically after every build.

---

## Canonical Commands

### 1) Client-only E2E (fast path)

```bash
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... pnpm e2e:sentry-tags:local -- --ui
```

What it does:

- Runs `sentry-tags` project
- Captures browser-side Sentry envelopes via Playwright route interception
- Writes client capture to `.tmp/sentry-mock/client-envelopes.ndjson`

### 2) Client + Server capture E2E (recommended default)

```bash
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... pnpm e2e:sentry-tags:server-capture
```

What it does:

1. Builds `web` with `E2E_LOCAL_ASSETS=1`, mock DSN, `--skip-nx-cache`, and **either** production `NEXT_PUBLIC_API_HOST` from `.env.production` (default) **or** `http://localhost:8010` when `E2E_USE_LOCAL_API_PROXY=1`
2. Copies `dist/apps/web/.next/static` and `apps/web/public` into the standalone directory
3. Verifies build artifacts contain the inlined mock DSN and expected API host string
4. Starts local mock ingest (`scripts/e2e/sentry/mock-ingest.mjs`) on port 8123
5. Starts/reuses local API proxy on port 8010 **only if** `E2E_USE_LOCAL_API_PROXY=1`
6. Starts standalone app on port 3000 with local DSN
7. Runs `sentry-tags`
8. Prints server summary + combined summary

### 3) Show summaries

```bash
pnpm e2e:sentry-summary
pnpm e2e:sentry-summary:combined
```

---

## Data Outputs

- Server envelopes: `.tmp/sentry-mock/server-envelopes.ndjson`
- Client envelopes: `.tmp/sentry-mock/client-envelopes.ndjson`
- Combined table source:
  - server: `scripts/e2e/sentry/summarize-server.mjs`
  - client+server: `scripts/e2e/sentry/summarize-combined.mjs`

Expected combined table columns:

- `time`
- `source` (`client` / `server`)
- `type`
- `page_type`
- `domain`
- `error_bucket`
- `message`

---

## Playwright UI Guidance

Use full suite UI (except explicitly skipped tests):

```bash
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... pnpm e2e:sentry-tags:local -- --ui
```

If UI only shows partial tests, check for accidental `--grep`.

---

## Known Pitfalls and Fixes

### UI only shows Home/Account

Cause: command includes `--grep "Home|Account"`.
Fix: remove `--grep`.

### Home test intermittently missing `page_type`

Cause: context race on heavy page startup.
Current mitigation: Home test retries marker trigger up to 3 attempts.

### Events still appear in cloud Sentry

Possible causes:

- Real browser manual navigation outside Playwright
- Server process started with real DSN
- Not using server-capture script

Fix:

- Use `pnpm e2e:sentry-tags:server-capture`
- Verify local DSN is used by startup logs

### Client/server summaries are empty after a "successful" rebuild

Possible causes:

- Build reused Nx cache, so client bundle still contains old cloud DSN
- Stale Nx cache or wrong `NEXT_PUBLIC_API_HOST` in chunks (verify with artifact step). If you intended local proxy but see production host in bundle, set `E2E_USE_LOCAL_API_PROXY=1` and rebuild.

Fix — rebuild with required overrides (add `NEXT_PUBLIC_API_HOST` only when using the proxy):

```bash
NEXT_PUBLIC_SENTRY_DSN="http://e2e@localhost:8123/4507648850591744" \
E2E_LOCAL_ASSETS=1 \
pnpm nx build web --skip-nx-cache
```

When using `run-server-capture.sh`, defaults are applied automatically; use `E2E_USE_LOCAL_API_PROXY=1` for the local proxy path.

### Server summary shows no rows

Meaning: this run produced no `event` envelope in server channel (may still have client events).
Action: check combined summary first; then check whether server-side error path was actually triggered by the test.

---

## AI Agent Execution Checklist

### Running E2E after a code fix (automated fix → verify flow)

1. Use `pnpm e2e:sentry-tags:server-capture` (via `run-server-capture.sh`) — it automatically rebuilds with the correct E2E overrides before starting the test stack. No manual pre-build step required.
2. Confirm Node `20.9.0` and login env vars (`E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD`) are set.
3. **If fixed page is outside core 4 (PDP/PLP/Home/Account)** — generate a targeted test before running:
   ```bash
   node scripts/e2e/sentry/generate-fix-test.mjs \
     --fixes '[{"url":"<transaction-url>","pageType":"<value>","domain":"<value>","label":"<label>"}]'
   ```
   - `url`: use the Sentry issue's `transaction` tag (real production URL). Fallback: `references/checks.md` § Route → Sample URL.
   - The generated file lands in `apps/web-e2e/src/sentry/generated/` (gitignored, auto-picked up by sentry-tags project).
4. Run `pnpm e2e:sentry-tags:server-capture` — picks up generated tests automatically.
5. Delete generated tests after verification: `rm -rf apps/web-e2e/src/sentry/generated/`
6. Confirm combined summary shows correct `page_type / domain / error_bucket` for all core pages, and targeted fix test passed.
7. Report pass/fail per test, server summary, combined summary, and cloud upload risk.

### Running E2E in isolation (UI or manual validation)

1. Confirm `E2E_LOCAL_ASSETS=1` build exists.
2. Confirm login env vars are provided.
3. For full observability validation, run `e2e:sentry-tags:server-capture`.
4. If user requests UI, run with `--ui` and avoid unintended `--grep`.
5. Report:
   - pass/fail per test
   - server summary
   - combined summary
   - whether any cloud upload risk remains

---

## Related Specs

- [`sentry-practices.md`](sentry-practices.md)
- [`alert-metrics.md`](alert-metrics.md)
- [`logger.md`](logger.md)
