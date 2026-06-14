#!/usr/bin/env bash
# PostToolUse Hook: real-time single-file compliance check
# Receives Claude Code JSON via stdin, extracts file_path

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
# compatible with Edit / Write / MultiEdit input shapes
print(
  data.get('tool_input', {}).get('file_path') or
  data.get('tool_input', {}).get('path') or
  ''
)
" 2>/dev/null)

[[ -z "$FILE" ]] && exit 0

# --- Guard: warn if a skill definition file is being modified ---
if echo "$FILE" | grep -qiE "(\.agents/skills/(alert-harness|harness-guide)/|docs/ai-specs/observability/)" ; then
  echo ""
  echo "================================================================"
  echo "  [WARN] SKILL FILE MODIFIED"
  echo "================================================================"
  echo ""
  echo "  File: $FILE"
  echo ""
  echo "  This file defines the observability compliance rules for the"
  echo "  entire team. Changes here affect all future alert checks."
  echo ""
  echo "  Before proceeding, confirm:"
  echo "    • Is this an intentional update to the spec?"
  echo "    • Have the corresponding code patterns / CLAUDE.md been updated?"
  echo "    • Has this been reviewed with the team?"
  echo ""
  echo "  If this was accidental, revert the change now."
  echo ""
  exit 0
fi

# check if file is alert-related
if ! echo "$FILE" | grep -qiE \
  "(sentry|observability|monitoring|alert|error-bucket|\
captureStructured|logger|domains|page-types|priorities|\
BUSINESS_DOMAIN|PAGE_TYPES|withServerAction)"; then
  exit 0
fi

echo ""
echo "[WARN] [Alert Harness] Alert-related file modified: $FILE"
echo ""

# print relevant ai-spec pointers (do not dump full docs into stdout)
echo "  Relevant specs for this file:"

if echo "$FILE" | grep -qiE "(sentry|captureStructured|withServerAction|instrumentation|hooks/web)"; then
  echo "    -> docs/ai-specs/observability/sentry-practices.md"
fi

if echo "$FILE" | grep -qiE "(logger|cLog|skipSentry|isExpected|unified-logger)"; then
  echo "    -> docs/ai-specs/observability/logger.md"
fi

if echo "$FILE" | grep -qiE "(alert|error-bucket|domains|page-types|priorities|BUSINESS_DOMAIN|PAGE_TYPES|monitoring)"; then
  echo "    -> docs/ai-specs/observability/alert-metrics.md"
fi

echo ""
echo "  Check the changes against the relevant spec. Fix any violations immediately."
echo ""
