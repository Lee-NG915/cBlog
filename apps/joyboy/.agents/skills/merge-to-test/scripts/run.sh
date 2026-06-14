#!/usr/bin/env bash
# merge-to-test/scripts/run.sh
# Deterministic git operations for merging a feature branch into a test environment.
# AI calls this script and reads its output to decide next steps.
#
# Usage:
#   bash run.sh <feature-branch> <target-branch>
#
# Exit codes:
#   0 - success, pushed
#   1 - usage error
#   2 - merge conflict (stdout lists conflicted files, one per line)
#   3 - push rejected
#   4 - other git error

set -euo pipefail

FEATURE_BRANCH="${1:-}"
TARGET_BRANCH="${2:-}"

if [[ -z "$FEATURE_BRANCH" || -z "$TARGET_BRANCH" ]]; then
  echo "Usage: run.sh <feature-branch> <target-branch>" >&2
  exit 1
fi

echo "[merge-to-test] feature=$FEATURE_BRANCH target=$TARGET_BRANCH"

echo "[merge-to-test] fetching origin/$TARGET_BRANCH..."
if ! git fetch origin "$TARGET_BRANCH" 2>&1; then
  echo "[merge-to-test] ERROR: failed to fetch origin/$TARGET_BRANCH" >&2
  exit 4
fi

echo "[merge-to-test] resetting local $TARGET_BRANCH to origin/$TARGET_BRANCH (any local-only commits will be discarded)..."
git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH"

echo "[merge-to-test] merging $FEATURE_BRANCH into $TARGET_BRANCH..."
if ! git merge "$FEATURE_BRANCH" --no-edit 2>&1; then
  CONFLICTED=$(git diff --name-only --diff-filter=U)
  echo "[merge-to-test] CONFLICT: conflicted files:"
  echo "$CONFLICTED"
  exit 2
fi

echo "[merge-to-test] pushing $TARGET_BRANCH to origin..."
if ! git push origin "$TARGET_BRANCH" 2>&1; then
  echo "[merge-to-test] ERROR: push rejected for $TARGET_BRANCH" >&2
  git checkout "$FEATURE_BRANCH" 2>/dev/null || true
  exit 3
fi

echo "[merge-to-test] SUCCESS: $TARGET_BRANCH pushed"
git checkout "$FEATURE_BRANCH"
