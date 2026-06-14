#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

BASE_URL="${BASE_URL:-http://localhost:3000}"
MOCK_SENTRY_PORT="${MOCK_SENTRY_PORT:-8123}"
MOCK_OUTPUT="${MOCK_OUTPUT:-.tmp/sentry-mock/server-envelopes.ndjson}"
CLIENT_OUTPUT="${CLIENT_OUTPUT:-.tmp/sentry-mock/client-envelopes.ndjson}"
STANDALONE_DIR="${STANDALONE_DIR:-dist/apps/web/.next/standalone}"
STANDALONE_ENTRY="${STANDALONE_ENTRY:-apps/web/server.js}"
LOCAL_API_PROXY_PORT="${LOCAL_API_PROXY_PORT:-8010}"
LOCAL_API_HOST="${LOCAL_API_HOST:-http://localhost:${LOCAL_API_PROXY_PORT}}"
# Default: do not override NEXT_PUBLIC_API_HOST at build — Next inlines the value from apps/web/.env.production
# (e.g. https://apigw-sg-prod.castlery.com). Set E2E_USE_LOCAL_API_PROXY=1 to force http://localhost:8010.
E2E_USE_LOCAL_API_PROXY="${E2E_USE_LOCAL_API_PROXY:-0}"
# When not using the proxy, verify chunks contain this host (override if your .env.production differs).
E2E_EXPECT_PROD_API_HOST="${E2E_EXPECT_PROD_API_HOST:-https://apigw-sg-prod.castlery.com}"
MOCK_SENTRY_DSN="http://e2e@localhost:${MOCK_SENTRY_PORT}/4507648850591744"

if [[ -z "${E2E_LOGIN_EMAIL:-}" || -z "${E2E_LOGIN_PASSWORD:-}" ]]; then
  echo "Missing E2E_LOGIN_EMAIL or E2E_LOGIN_PASSWORD." >&2
  exit 1
fi

mkdir -p "$(dirname "$MOCK_OUTPUT")"
: > "$MOCK_OUTPUT"

source ~/.nvm/nvm.sh
nvm use 20.9.0 >/dev/null

echo "[server-capture] rebuilding web with forced E2E env (skip nx cache)"
if [[ "$E2E_USE_LOCAL_API_PROXY" == "1" ]]; then
  echo "[server-capture] build NEXT_PUBLIC_API_HOST=$LOCAL_API_HOST (E2E_USE_LOCAL_API_PROXY=1)"
  export NEXT_PUBLIC_API_HOST="$LOCAL_API_HOST"
else
  unset NEXT_PUBLIC_API_HOST 2>/dev/null || true
  echo "[server-capture] build NEXT_PUBLIC_API_HOST from apps/web/.env.production (expect $E2E_EXPECT_PROD_API_HOST)"
fi
echo "[server-capture] NEXT_PUBLIC_SENTRY_DSN=$MOCK_SENTRY_DSN"
NEXT_PUBLIC_SENTRY_DSN="$MOCK_SENTRY_DSN" \
NEXT_PUBLIC_APPLICATION_ENV="${NEXT_PUBLIC_APPLICATION_ENV:-sg-prod}" \
E2E_LOCAL_ASSETS=1 \
pnpm nx build web --skip-nx-cache

if [[ ! -f "$STANDALONE_DIR/$STANDALONE_ENTRY" ]]; then
  echo "Standalone entry not found after build: $STANDALONE_DIR/$STANDALONE_ENTRY" >&2
  exit 1
fi

# Mirror the Dockerfile-CI copy steps so the standalone server can serve static assets.
# server.js resolves distDir as "../../dist/apps/web/.next" relative to apps/web/server.js,
# so static chunks must live at standalone/dist/apps/web/.next/static.
echo "[server-capture] copying static assets into standalone directory"
mkdir -p "$STANDALONE_DIR/dist/apps/web/.next"
cp -r dist/apps/web/.next/static "$STANDALONE_DIR/dist/apps/web/.next/static"
cp -r apps/web/public "$STANDALONE_DIR/apps/web/public"
echo "[server-capture] static assets copied"

echo "[server-capture] verifying build artifacts contain forced E2E endpoints"
if [[ "$E2E_USE_LOCAL_API_PROXY" == "1" ]]; then
  _VERIFY_API_HOST="$LOCAL_API_HOST"
else
  _VERIFY_API_HOST="$E2E_EXPECT_PROD_API_HOST"
fi
EXPECTED_API_HOST="$_VERIFY_API_HOST" EXPECTED_DSN="$MOCK_SENTRY_DSN" node -e "
const fs = require('node:fs');
const path = require('node:path');

const chunksDir = path.resolve('dist/apps/web/.next/static/chunks');
const expectedApiHost = process.env.EXPECTED_API_HOST;
const expectedDsn = process.env.EXPECTED_DSN;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && full.endsWith('.js')) files.push(full);
  }
  return files;
}

if (!fs.existsSync(chunksDir)) {
  console.error('[server-capture] chunks dir not found:', chunksDir);
  process.exit(1);
}

const files = walk(chunksDir);
let hasApiHost = false;
let hasDsn = false;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (!hasApiHost && content.includes(expectedApiHost)) hasApiHost = true;
  if (!hasDsn && content.includes(expectedDsn)) hasDsn = true;
  if (hasApiHost && hasDsn) break;
}

if (!hasApiHost || !hasDsn) {
  console.error('[server-capture] build artifact verification failed');
  console.error('  NEXT_PUBLIC_API_HOST (' + expectedApiHost + ') found in chunks:', hasApiHost);
  console.error('  NEXT_PUBLIC_SENTRY_DSN (' + expectedDsn + ') found in chunks:', hasDsn);
  process.exit(1);
}
console.log('[server-capture] build artifact verification passed');
"

PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do
    kill -0 "$pid" 2>/dev/null && kill "$pid" 2>/dev/null || true
  done
  lsof -ti ":$MOCK_SENTRY_PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti ":$LOCAL_API_PROXY_PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
}
trap cleanup EXIT

if lsof -i ":$MOCK_SENTRY_PORT" >/dev/null 2>&1; then
  echo "[server-capture] killing stale process on :$MOCK_SENTRY_PORT"
  lsof -ti ":$MOCK_SENTRY_PORT" | xargs kill >/dev/null 2>&1 || true
  sleep 1
  lsof -ti ":$MOCK_SENTRY_PORT" | xargs kill -9 >/dev/null 2>&1 || true
fi
echo "[server-capture] starting mock sentry ingest on :$MOCK_SENTRY_PORT"
node scripts/e2e/sentry/mock-ingest.mjs --port "$MOCK_SENTRY_PORT" --output "$MOCK_OUTPUT" &
PIDS+=("$!")

if [[ "$E2E_USE_LOCAL_API_PROXY" == "1" ]]; then
  if ! lsof -i ":$LOCAL_API_PROXY_PORT" >/dev/null 2>&1; then
    echo "[server-capture] starting local api proxy on :$LOCAL_API_PROXY_PORT"
    node scripts/network/local-api-proxy.mjs &
    PIDS+=("$!")
  else
    echo "[server-capture] reusing local api proxy on :$LOCAL_API_PROXY_PORT"
  fi
else
  echo "[server-capture] skipping local api proxy (E2E_USE_LOCAL_API_PROXY!=1)"
fi

if lsof -i :3000 >/dev/null 2>&1; then
  echo "[server-capture] killing stale process on :3000"
  lsof -ti :3000 | xargs kill >/dev/null 2>&1 || true
  sleep 1
  lsof -ti :3000 | xargs kill -9 >/dev/null 2>&1 || true
fi

echo "[server-capture] starting standalone web server with NEXT_PUBLIC_SENTRY_DSN=$MOCK_SENTRY_DSN"
(
  cd "$STANDALONE_DIR"
  NEXT_PUBLIC_SENTRY_DSN="$MOCK_SENTRY_DSN" \
  NEXT_PUBLIC_APPLICATION_ENV="${NEXT_PUBLIC_APPLICATION_ENV:-sg-prod}" \
  SENTRY_E2E_ENABLED=1 \
  exec node "$STANDALONE_ENTRY"
) &
PIDS+=("$!")

echo "[server-capture] waiting for web server at $BASE_URL"
for _ in {1..40}; do
  if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "$BASE_URL" >/dev/null 2>&1; then
  echo "[server-capture] web server failed to start at $BASE_URL" >&2
  exit 1
fi

echo "[server-capture] running sentry-tags tests"
set +e
E2E_LOGIN_EMAIL="$E2E_LOGIN_EMAIL" \
E2E_LOGIN_PASSWORD="$E2E_LOGIN_PASSWORD" \
BASE_URL="$BASE_URL" \
SENTRY_CLIENT_ENVELOPES_OUTPUT="$CLIENT_OUTPUT" \
SENTRY_SERVER_ENVELOPES_OUTPUT="$MOCK_OUTPUT" \
SENTRY_E2E_ENABLED=1 \
bash scripts/e2e/sentry/run-local.sh "$@"
test_exit_code=$?
set -e

echo "[server-capture] done. captured server envelopes: $MOCK_OUTPUT"
echo "[server-capture] summary:"
node scripts/e2e/sentry/summarize-server.mjs "$MOCK_OUTPUT"
echo "[server-capture] combined summary:"
node scripts/e2e/sentry/summarize-combined.mjs "$MOCK_OUTPUT" "$CLIENT_OUTPUT"
exit "$test_exit_code"
