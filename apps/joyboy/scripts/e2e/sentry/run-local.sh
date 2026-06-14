#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

BASE_URL="${BASE_URL:-http://localhost:3000}"
PW_SKIP_WEBSERVER="${PW_SKIP_WEBSERVER:-1}"
SENTRY_CLIENT_ENVELOPES_OUTPUT="${SENTRY_CLIENT_ENVELOPES_OUTPUT:-.tmp/sentry-mock/client-envelopes.ndjson}"

PLAYWRIGHT_ARGS=(
  "--config=apps/web-e2e/playwright.config.ts"
  "--project=sentry-tags"
  "--reporter=line"
)

usage() {
  cat <<'EOF'
Usage:
  bash scripts/e2e/sentry/run-local.sh [--headed] [--ui] [--grep <pattern>] [-- <extra-playwright-args>]

Examples:
  bash scripts/e2e/sentry/run-local.sh
  bash scripts/e2e/sentry/run-local.sh --headed     # visible browser, fully automated (demo mode)
  bash scripts/e2e/sentry/run-local.sh --ui         # interactive Playwright UI (requires manual Run click)
  bash scripts/e2e/sentry/run-local.sh --grep "Account"

Required env (for Account login flow):
  E2E_LOGIN_EMAIL
  E2E_LOGIN_PASSWORD

Optional env:
  BASE_URL (default: http://localhost:3000)
  PW_SKIP_WEBSERVER (default: 1)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ui)
      PLAYWRIGHT_ARGS+=("--ui")
      shift
      ;;
    --headed)
      # Run with visible browser, fully automated (no manual click needed, unlike --ui)
      # --workers=1 ensures only one browser window is open at a time (clean demo mode)
      PLAYWRIGHT_ARGS+=("--headed" "--workers=1")
      shift
      ;;
    --grep)
      if [[ $# -lt 2 ]]; then
        echo "--grep requires a pattern argument" >&2
        exit 1
      fi
      PLAYWRIGHT_ARGS+=("--grep" "$2")
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        PLAYWRIGHT_ARGS+=("$1")
        shift
      done
      ;;
    *)
      PLAYWRIGHT_ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ -z "${E2E_LOGIN_EMAIL:-}" || -z "${E2E_LOGIN_PASSWORD:-}" ]]; then
  echo "Missing E2E_LOGIN_EMAIL or E2E_LOGIN_PASSWORD (required for Account route)." >&2
  exit 1
fi

mkdir -p "$(dirname "$SENTRY_CLIENT_ENVELOPES_OUTPUT")"
: > "$SENTRY_CLIENT_ENVELOPES_OUTPUT"

echo "[sentry-tags-local] BASE_URL=$BASE_URL PW_SKIP_WEBSERVER=$PW_SKIP_WEBSERVER"

source ~/.nvm/nvm.sh
nvm use 20.9.0 >/dev/null

PW_SKIP_WEBSERVER="$PW_SKIP_WEBSERVER" \
BASE_URL="$BASE_URL" \
SENTRY_CLIENT_ENVELOPES_OUTPUT="$SENTRY_CLIENT_ENVELOPES_OUTPUT" \
SENTRY_SERVER_ENVELOPES_OUTPUT="${SENTRY_SERVER_ENVELOPES_OUTPUT:-}" \
SENTRY_E2E_ENABLED="${SENTRY_E2E_ENABLED:-}" \
E2E_LOGIN_EMAIL="$E2E_LOGIN_EMAIL" \
E2E_LOGIN_PASSWORD="$E2E_LOGIN_PASSWORD" \
pnpm exec playwright test "${PLAYWRIGHT_ARGS[@]}"
