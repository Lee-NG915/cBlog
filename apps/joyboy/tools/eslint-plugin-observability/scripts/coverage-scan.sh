#!/usr/bin/env bash
# Sentry context coverage for apps/web/app — bash + grep only, always exits 0.
# Usage: coverage-scan.sh [--ci]

set -euo pipefail

CI_MODE=false
if [[ "${1:-}" == '--ci' ]]; then
  CI_MODE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
APPDIR="$REPO_ROOT/apps/web/app"

if [[ ! -d "$APPDIR" ]]; then
  echo "coverage-scan: apps/web/app not found at $APPDIR" >&2
  exit 0
fi

json_escape() {
  # shellcheck disable=SC2001
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

is_blocked_segment() {
  local rel="$1"
  case "$rel" in
  *'/cart/'* | *'/payment/'* | *'/checkout/'* | *'(checkout)'*) return 0 ;;
  *) return 1 ;;
  esac
}

is_root_layout() {
  local rel="$1"
  [[ "$rel" == 'layout.tsx' ]]
}

first_lines_have_use_client() {
  local f="$1"
  head -n 24 "$f" | grep -qE "^[[:space:]]*['\"]use client['\"][；;]?[[:space:]]*$|^[[:space:]]*'use client'|^[[:space:]]*\"use client\""
}

page_has_context() {
  grep -q 'setGlobalSentryContext' "$1"
}

layout_has_provider() {
  grep -q 'SentryContextProvider' "$1"
}

# Page scan
p_total=0
p_covered=0
p_missing_files=()
declare -a p_skip_blocked=()
declare -a p_skip_client=()

while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  rel="${f#"$APPDIR"/}"
  if is_blocked_segment "$rel"; then
    p_skip_blocked+=("$rel")
    continue
  fi
  if first_lines_have_use_client "$f"; then
    p_skip_client+=("$rel")
    continue
  fi
  ((p_total++)) || true
  if page_has_context "$f"; then
    ((p_covered++)) || true
  else
    p_missing_files+=("$rel")
  fi
done < <(find "$APPDIR" -name 'page.tsx' -type f 2>/dev/null | LC_ALL=C sort) || true

# Layout scan
l_total=0
l_covered=0
l_missing_files=()
declare -a l_skip_blocked=()
declare -a l_skip_root=()

while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  rel="${f#"$APPDIR"/}"
  if is_root_layout "$rel"; then
    l_skip_root+=("$rel")
    continue
  fi
  if is_blocked_segment "$rel"; then
    l_skip_blocked+=("$rel")
    continue
  fi
  ((l_total++)) || true
  if layout_has_provider "$f"; then
    ((l_covered++)) || true
  else
    l_missing_files+=("$rel")
  fi
done < <(find "$APPDIR" -name 'layout.tsx' -type f 2>/dev/null | LC_ALL=C sort) || true

grand_total=$((p_total + l_total))
grand_covered=$((p_covered + l_covered))
missing_count=$((${#p_missing_files[@]} + ${#l_missing_files[@]}))

pct() {
  local num="$1" den="$2"
  if [[ "$den" -eq 0 ]]; then
    printf '0.0'
    return
  fi
  awk -v n="$num" -v d="$den" 'BEGIN { printf "%.1f", (n / d) * 100 }'
}

if $CI_MODE; then
  echo '{'
  echo '  "pages": {'
  echo "    \"totalEligible\": $p_total,"
  echo "    \"covered\": $p_covered,"
  echo -n '    "missing": ['
  for i in "${!p_missing_files[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', '
    echo -n "\"$(json_escape "${p_missing_files[$i]}")\""
  done
  echo '],'
  echo -n '    "skippedBlocked": ['
  for i in "${!p_skip_blocked[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', '
    echo -n "\"$(json_escape "${p_skip_blocked[$i]}")\""
  done
  echo '],'
  echo -n '    "skippedUseClient": ['
  for i in "${!p_skip_client[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', '
    echo -n "\"$(json_escape "${p_skip_client[$i]}")\""
  done
  echo ']'
  echo '  },'
  echo '  "layouts": {'
  echo "    \"totalEligible\": $l_total,"
  echo "    \"covered\": $l_covered,"
  echo -n '    "missing": ['
  for i in "${!l_missing_files[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', '
    echo -n "\"$(json_escape "${l_missing_files[$i]}")\""
  done
  echo '],'
  echo -n '    "skippedBlocked": ['
  for i in "${!l_skip_blocked[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', '
    echo -n "\"$(json_escape "${l_skip_blocked[$i]}")\""
  done
  echo '],'
  echo -n '    "skippedRootLayout": ['
  for i in "${!l_skip_root[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', '
    echo -n "\"$(json_escape "${l_skip_root[$i]}")\""
  done
  echo ']'
  echo '  },'
  echo '  "summary": {'
  echo "    \"eligibleTotal\": $grand_total,"
  echo "    \"coveredTotal\": $grand_covered,"
  echo "    \"missingCount\": $missing_count"
  echo '  }'
  echo '}'
  exit 0
fi

echo '=================================================='
echo '  Sentry Context Coverage Report'
echo ''
echo '[page.tsx]'
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  rel="${f#"$APPDIR"/}"
  if is_blocked_segment "$rel"; then
    printf '    ⏭️   %-44s — SKIPPED (blocked path)\n' "$rel"
    continue
  fi
  if first_lines_have_use_client "$f"; then
    printf '    ⏭️   %-44s — SKIPPED ('\''use client'\'')\n' "$rel"
    continue
  fi
  if page_has_context "$f"; then
    printf '    ✅ %-44s — setGlobalSentryContext found\n' "$rel"
  else
    printf '    ❌ %-44s — MISSING setGlobalSentryContext\n' "$rel"
  fi
done < <(find "$APPDIR" -name 'page.tsx' -type f 2>/dev/null | LC_ALL=C sort) || true

if [[ "$p_total" -eq 0 ]]; then
  echo ''
  echo '    Covered: 0/0 (n/a)'
else
  echo ''
  echo "    Covered: $p_covered/$p_total ($(pct "$p_covered" "$p_total")%)"
fi

echo ''
echo '[layout.tsx]'
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  rel="${f#"$APPDIR"/}"
  if is_root_layout "$rel"; then
    printf '    ⏭️   %-44s — SKIPPED (root layout)\n' "$rel"
    continue
  fi
  if is_blocked_segment "$rel"; then
    printf '    ⏭️   %-44s — SKIPPED (blocked path)\n' "$rel"
    continue
  fi
  if layout_has_provider "$f"; then
    printf '    ✅ %-44s — SentryContextProvider found\n' "$rel"
  else
    printf '    ❌ %-44s — MISSING SentryContextProvider\n' "$rel"
  fi
done < <(find "$APPDIR" -name 'layout.tsx' -type f 2>/dev/null | LC_ALL=C sort) || true

if [[ "$l_total" -eq 0 ]]; then
  echo ''
  echo '    Covered: 0/0 (n/a)'
else
  echo ''
  echo "    Covered: $l_covered/$l_total ($(pct "$l_covered" "$l_total")%)"
fi

echo ''
echo '=================================================='
if [[ "$grand_total" -eq 0 ]]; then
  echo '  Total: n/a (no eligible files)'
else
  echo "  Total: $grand_covered/$grand_total ($(pct "$grand_covered" "$grand_total")%)"
fi
echo "  Missing: $missing_count files need instrumentation"
echo ''

exit 0
