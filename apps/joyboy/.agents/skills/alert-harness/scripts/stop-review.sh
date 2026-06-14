#!/usr/bin/env bash
# Stop Hook: session-end observability compliance check (AI agent wrapper)
# Core logic: scripts/lint/observability-diff-check.sh
# This wrapper adds: logging to agent directory + skill file change detection

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/review-$(date +%Y%m%d).log"
SUMMARY_JSON="$LOG_DIR/review-summary-latest.json"
mkdir -p "$LOG_DIR"

# --- Guard: detect skill/spec definition file changes ---
ALL_CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached 2>/dev/null)
SKILL_FILES=$(echo "$ALL_CHANGED" | sort -u | grep -iE \
  "^(\.agents/skills/(alert-harness|harness-guide)/|docs/ai-specs/observability/)" \
  | grep -v '^$' || true)

if [[ -n "$SKILL_FILES" ]]; then
  echo ""
  echo "================================================================"
  echo "  [WARN] SKILL / SPEC DEFINITION FILES CHANGED"
  echo "================================================================"
  echo "$SKILL_FILES" | while read -r f; do echo "    - $f"; done
  echo "  Confirm changes are intentional and CLAUDE.md is updated."
  echo ""
  { echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) - SKILL/SPEC FILES CHANGED ==="; echo "$SKILL_FILES"; echo ""; } >> "$LOG_FILE"
fi

# --- Run core check ---
set +e
OUTPUT=$(bash "$REPO_ROOT/scripts/lint/observability-diff-check.sh" 2>&1)
EXIT_CODE=$?
set -e

echo "$OUTPUT"
{ echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="; echo "$OUTPUT"; echo ""; } >> "$LOG_FILE"

# Show log path and alert-harness hint
if [[ "$EXIT_CODE" -ne 0 ]] || echo "$OUTPUT" | grep -qE "( error |\[ERR\])" 2>/dev/null; then
  echo "  Root cause hint: observability rule violation or ESLint execution failure."
  echo "  Safe retry: pnpm lint:observability"
  echo "  Next escalation command: /alert-harness sentry"
  echo "  Stop condition: after 3 identical failures, escalate to manual investigation."
fi
echo ""
echo "Log: $LOG_FILE"
echo "Summary JSON: $SUMMARY_JSON"
echo ""

STATUS="success"
SUMMARY="[OK] stop-review completed without observability errors"
NEXT_ACTIONS="No action required"
if [[ "$EXIT_CODE" -ne 0 ]]; then
  STATUS="error"
  SUMMARY="[ERR] stop-review detected observability errors"
  NEXT_ACTIONS="Run pnpm lint:observability||Run /alert-harness sentry||Escalate after 3 repeated failures"
elif echo "$OUTPUT" | grep -q "\[WARN\]" 2>/dev/null; then
  STATUS="warning"
  SUMMARY="[WARN] stop-review completed with warnings"
  NEXT_ACTIONS="Review warning details||Run pnpm lint:observability for confirmation"
fi

export AH_STATUS="$STATUS"
export AH_SUMMARY="$SUMMARY"
export AH_NEXT_ACTIONS="$NEXT_ACTIONS"
export AH_OUTPUT="$OUTPUT"
export AH_LOG_FILE="$LOG_FILE"
export AH_SUMMARY_JSON="$SUMMARY_JSON"

node -e "const fs=require('node:fs');
const nextActions=(process.env.AH_NEXT_ACTIONS||'').split('||').filter(Boolean);
const payload={
  status: process.env.AH_STATUS || 'unknown',
  summary: process.env.AH_SUMMARY || '',
  next_actions: nextActions,
  artifacts: [process.env.AH_LOG_FILE || ''],
  output_excerpt: (process.env.AH_OUTPUT || '').split('\n').slice(0, 80),
  generated_at: new Date().toISOString(),
};
fs.writeFileSync(process.env.AH_SUMMARY_JSON, JSON.stringify(payload, null, 2) + '\n', 'utf8');"

exit "$EXIT_CODE"
