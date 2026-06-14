#!/usr/bin/env bash
# Observability compliance check on git diff changed files.
# Project-level script - usable by humans, CI, and AI agent wrappers.
#
# Usage:
#   scripts/lint/observability-diff-check.sh               # check unstaged + staged
#   scripts/lint/observability-diff-check.sh --staged-only # check staged only
#
# Exit: 0 = pass, 1 = has errors

set -euo pipefail

STAGED_ONLY=false
[[ "${1:-}" == "--staged-only" ]] && STAGED_ONLY=true
SUMMARY_FILE=".agents/skills/alert-harness/logs/observability-diff-summary.json"

if $STAGED_ONLY; then
  FILES=$(git diff --name-only --cached 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
else
  CHANGED=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
  STAGED=$(git diff --name-only --cached 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
  FILES=$(printf "%s\n%s" "$CHANGED" "$STAGED" | sort -u | grep -v '^$' || true)
fi

if [[ -z "$FILES" ]]; then
  echo "[OK] No TypeScript files changed."
  exit 0
fi

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo ""
echo "=================================================="
echo "  [INFO] Observability Compliance Check"
echo "=================================================="
echo "Files scanned: $FILE_COUNT"
echo "$FILES" | while read -r f; do echo "  - $f"; done
echo ""

# Run ESLint with observability rules on changed files
set +e
ESLINT_OUTPUT=$(echo "$FILES" | xargs npx eslint --format unix 2>&1)
ESLINT_EXIT=$?
set -e
RESULT=$(echo "$ESLINT_OUTPUT" | grep "observability/" || true)
FALLBACK_TRIGGERED=false

# Fallback: if ESLint failed to run, use grep for key high-risk violation signatures
if [[ -z "$RESULT" ]]; then
  # Check if ESLint actually ran by looking for common output patterns
  if ! echo "$ESLINT_OUTPUT" | grep -qE "(0 problems|no problems)" 2>/dev/null; then
    WEB_FILES=$(echo "$FILES" | grep "^apps/web/" || true)
    if [[ -n "$WEB_FILES" ]]; then
      FALLBACK_TRIGGERED=true
      FALLBACK_RESULT=""

      BARE_CAPTURE_RESULT=$(echo "$WEB_FILES" | xargs rg -n "Sentry\\.captureException" 2>/dev/null || true)
      if [[ -n "$BARE_CAPTURE_RESULT" ]]; then
        FALLBACK_RESULT="${FALLBACK_RESULT}"$'[ERR][grep-fallback] Bare Sentry.captureException detected:\n'"$BARE_CAPTURE_RESULT"$'\n'
      fi

      EDGE_CAPTURE_RESULT=$(echo "$WEB_FILES" | xargs rg -n "captureStructuredError|withServerActionInstrumentation|Sentry\\.captureException" --glob "middleware.ts" --glob "*.edge.ts" 2>/dev/null || true)
      if [[ -n "$EDGE_CAPTURE_RESULT" ]]; then
        FALLBACK_RESULT="${FALLBACK_RESULT}"$'[ERR][grep-fallback] Sentry capture API detected in middleware/edge file:\n'"$EDGE_CAPTURE_RESULT"$'\n'
      fi

      DEPRECATED_PAGE_TYPE_RESULT=$(echo "$WEB_FILES" | xargs rg -n "PAGE_TYPES\\.SEARCH" 2>/dev/null || true)
      if [[ -n "$DEPRECATED_PAGE_TYPE_RESULT" ]]; then
        FALLBACK_RESULT="${FALLBACK_RESULT}"$'[ERR][grep-fallback] Deprecated PAGE_TYPES.SEARCH detected:\n'"$DEPRECATED_PAGE_TYPE_RESULT"$'\n'
      fi

      if [[ -n "$FALLBACK_RESULT" ]]; then
        RESULT="$FALLBACK_RESULT"
      fi
    fi
  fi
fi

if [[ "$ESLINT_EXIT" -ne 0 && -z "$RESULT" ]]; then
  echo "[ERR] ESLint execution failed; cannot safely determine observability compliance."
  echo "$ESLINT_OUTPUT"
  mkdir -p "$(dirname "$SUMMARY_FILE")"
  cat > "$SUMMARY_FILE" <<EOF
{
  "status": "error",
  "summary": "[ERR] ESLint execution failed; cannot safely determine observability compliance.",
  "root_cause": "ESLint crashed or produced no structured output — likely a parser/dependency issue unrelated to observability rules",
  "safe_retry": "Run 'npx eslint <file>' directly to diagnose; fix any syntax/type errors, then rerun this script",
  "next_actions": ["Run npx eslint directly on failing file(s)","Fix syntax/type errors first, then re-run"],
  "artifacts": ["$SUMMARY_FILE"],
  "fallback_triggered": false,
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  exit 1
fi

if [[ -z "$RESULT" ]]; then
  echo "[OK] All observability checks passed."
  mkdir -p "$(dirname "$SUMMARY_FILE")"
  cat > "$SUMMARY_FILE" <<EOF
{
  "status": "success",
  "summary": "[OK] Observability checks passed",
  "next_actions": [],
  "artifacts": ["$SUMMARY_FILE"],
  "fallback_triggered": $FALLBACK_TRIGGERED,
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  exit 0
fi

echo "$RESULT"
echo ""
ERROR_COUNT=$(echo "$RESULT" | grep -cE "( error |\[ERR\])" 2>/dev/null || echo "0")
WARN_COUNT=$(echo "$RESULT" | grep -cE "( warning |\[WARN\])" 2>/dev/null || echo "0")
echo "  Errors: $ERROR_COUNT   Warnings: $WARN_COUNT"

NEXT_ACTIONS='["Run pnpm lint:observability","Run npx eslint <file> for detailed errors","Escalate after 3 repeated failures"]'
if [[ "$WARN_COUNT" -gt 0 && "$ERROR_COUNT" -eq 0 ]]; then
  NEXT_ACTIONS='["Review warning details","Re-run pnpm lint:observability"]'
fi

STATUS="success"
if [[ "$ERROR_COUNT" -gt 0 ]]; then
  STATUS="error"
elif [[ "$WARN_COUNT" -gt 0 ]]; then
  STATUS="warning"
fi

FALLBACK_CONFIDENCE="high"
if [[ "$FALLBACK_TRIGGERED" == true ]]; then
  FALLBACK_CONFIDENCE="low"
fi

ROOT_CAUSE=""
SAFE_RETRY=""
if [[ "$ERROR_COUNT" -gt 0 ]]; then
  ROOT_CAUSE="observability rule violation or fallback high-risk signature match"
  SAFE_RETRY="Run 'npx eslint <file>' for details, fix violations, then rerun this script"
elif [[ "$WARN_COUNT" -gt 0 ]]; then
  ROOT_CAUSE="observability warnings detected (non-blocking)"
  SAFE_RETRY="Review warning details, then rerun this script to confirm resolution"
fi

mkdir -p "$(dirname "$SUMMARY_FILE")"
cat > "$SUMMARY_FILE" <<EOF
{
  "status": "$STATUS",
  "summary": "[INFO] Observability compliance check completed",
  "next_actions": $NEXT_ACTIONS,
  "artifacts": ["$SUMMARY_FILE"],
  "fallback_triggered": $FALLBACK_TRIGGERED,
  "fallback_confidence": "$FALLBACK_CONFIDENCE",
  "root_cause": "$ROOT_CAUSE",
  "safe_retry": "$SAFE_RETRY",
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

if [[ "$ERROR_COUNT" -gt 0 ]]; then
  echo "  Fix errors before committing. Run: npx eslint <file> for details."
  echo "  Root cause hint: observability rule violation or fallback high-risk signature match."
  echo "  Safe retry: pnpm lint:observability"
  echo "  Stop condition: if the same error repeats 3 times, escalate to /alert-harness sentry."
  exit 1
fi

exit 0
