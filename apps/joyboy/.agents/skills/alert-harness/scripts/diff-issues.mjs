#!/usr/bin/env node
/**
 * Incremental issue gating for /alert-harness.
 *
 * Compares current issue candidates against local snapshots and classifies:
 * - NEW
 * - CHANGED
 * - UNCHANGED
 *
 * Only NEW/CHANGED should enter expensive remediation flow by default.
 *
 * Usage:
 *   node .agents/skills/alert-harness/scripts/diff-issues.mjs \
 *     --input /tmp/current-issues.json
 *
 *   node .agents/skills/alert-harness/scripts/diff-issues.mjs \
 *     --input /tmp/current-issues.json \
 *     --output /tmp/issue-diff-result.json \
 *     --ttl-days 14 \
 *     --max-issues 50
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const DEFAULT_STATE_PATH = '.agents/skills/alert-harness/assets/issue-snapshots.json';

function printUsage() {
  console.log(`Usage:
  node .agents/skills/alert-harness/scripts/diff-issues.mjs --input <issues.json> [options]

Options:
  --state <path>       Snapshot state file path (default: ${DEFAULT_STATE_PATH})
  --output <path>      Optional output json file path
  --ttl-days <number>  Remove stale state records not seen for N days (default: 14)
  --max-issues <num>   Process only first N issues from input
  --process-activity-changes
                       Process activity-only updates (lastSeen/events/users changed)
  --force              Treat all current issues as process candidates
  --verbose            Print verbose details
  --json               Output machine-readable JSON to stdout (overrides human summary)
  --help               Show help

Input format:
  - Array of issue objects
  - Or object containing "issues" array
  - Or object containing "data" array
`);
}

function toIso(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numeric = Number(value.replace(/,/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
}

function resolveIssueId(issue) {
  return (
    issue.issueId ||
    issue.shortId ||
    issue.id ||
    issue.issue?.id ||
    issue.issue?.shortId ||
    issue.key ||
    ''
  );
}

function resolveErrorBucketTop(issue) {
  if (typeof issue.errorBucketTop === 'string') return issue.errorBucketTop;
  if (typeof issue.error_bucket === 'string') return issue.error_bucket;
  if (typeof issue.errorBucket === 'string') return issue.errorBucket;
  if (typeof issue?.tags?.error_bucket === 'string') return issue.tags.error_bucket;
  return '';
}

function resolveText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function normalizeIssue(issue) {
  const issueId = resolveIssueId(issue);
  const lastSeen =
    toIso(issue.lastSeen) ||
    toIso(issue.last_seen) ||
    toIso(issue.lastSeenAt) ||
    toIso(issue.lastSeenTs) ||
    '';
  const events =
    toNumber(issue.events) ||
    toNumber(issue.timesSeen) ||
    toNumber(issue.count) ||
    toNumber(issue.eventCount) ||
    0;
  const users =
    toNumber(issue.users) ||
    toNumber(issue.userCount) ||
    toNumber(issue.affectedUsers) ||
    0;
  const errorBucketTop = resolveErrorBucketTop(issue);
  const title = resolveText(issue.title, issue.message, issue.metadata?.title);
  const culprit = resolveText(issue.culprit, issue.location, issue.metadata?.culprit);
  const transaction = resolveText(
    issue.transaction,
    issue.tags?.transaction,
    issue.metadata?.transaction,
    issue.contexts?.trace?.transaction
  );
  const level = resolveText(issue.level, issue.tags?.level, issue.metadata?.level);

  return {
    issueId,
    title,
    culprit,
    transaction,
    level,
    lastSeen,
    events,
    users,
    errorBucketTop,
  };
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) return fallback;
  return JSON.parse(raw);
}

function ensureArrayInput(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.issues)) return payload.issues;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new Error('input json must be an array, or object with "issues"/"data" array');
}

function stableHash(snapshot) {
  const sortedKeys = Object.keys(snapshot).sort();
  const ordered = {};
  for (const key of sortedKeys) {
    ordered[key] = snapshot[key];
  }
  const content = JSON.stringify(ordered);
  return crypto.createHash('sha1').update(content).digest('hex');
}

function buildStableSnapshot(candidate) {
  return {
    title: candidate.title,
    culprit: candidate.culprit,
    transaction: candidate.transaction,
    level: candidate.level,
    errorBucketTop: candidate.errorBucketTop,
  };
}

function buildActivitySnapshot(candidate) {
  return {
    lastSeen: candidate.lastSeen,
    events: candidate.events,
    users: candidate.users,
  };
}

function pruneState(stateMap, ttlDays, keepIssueIds) {
  if (!Number.isFinite(ttlDays) || ttlDays <= 0) return stateMap;
  const cutoff = Date.now() - ttlDays * 24 * 60 * 60 * 1000;
  const next = {};

  for (const [issueId, record] of Object.entries(stateMap)) {
    if (keepIssueIds.has(issueId)) {
      next[issueId] = record;
      continue;
    }
    const updatedAt = toIso(record.updatedAt || record.lastSeen || '');
    const updatedMs = updatedAt ? Date.parse(updatedAt) : 0;
    if (updatedMs && updatedMs >= cutoff) {
      next[issueId] = record;
    }
  }

  return next;
}

function sortObjectByKeys(input) {
  return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)));
}

function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string' },
      state: { type: 'string', default: DEFAULT_STATE_PATH },
      output: { type: 'string' },
      'ttl-days': { type: 'string', default: '14' },
      'max-issues': { type: 'string' },
      'process-activity-changes': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
      verbose: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  function emitError(summary, rootCause, safeRetry) {
    if (values.json) {
      console.log(JSON.stringify({
        status: 'error',
        summary,
        root_cause: rootCause,
        safe_retry: safeRetry,
        stop_condition: 'Fix input and rerun with same flags',
        generated_at: new Date().toISOString(),
      }));
    } else {
      console.error(`[diff-issues] ${summary}`);
      if (rootCause) console.error(`  Root cause: ${rootCause}`);
      if (safeRetry) console.error(`  Safe retry: ${safeRetry}`);
    }
    process.exit(1);
  }

  if (!values.input) {
    emitError('--input is required', null, 'Provide --input <path>');
  }

  const ttlDays = Number(values['ttl-days']);
  if (!Number.isFinite(ttlDays) || ttlDays < 0) {
    emitError('--ttl-days must be a non-negative number', null, 'Use a number >= 0');
  }

  const maxIssues = values['max-issues'] ? Number(values['max-issues']) : undefined;
  if (values['max-issues'] && (!Number.isFinite(maxIssues) || maxIssues <= 0)) {
    emitError('--max-issues must be a positive number', null, 'Use a number > 0');
  }

  const inputPath = path.resolve(values.input);
  const statePath = path.resolve(values.state);
  const nowIso = new Date().toISOString();

  const payload = readJson(inputPath, null);
  if (!payload) {
    emitError('failed to read input json', 'File missing, unreadable, or empty', 'Verify --input path and file permissions');
  }

  const candidatesRaw = ensureArrayInput(payload);
  const candidatesSlice =
    typeof maxIssues === 'number' ? candidatesRaw.slice(0, maxIssues) : candidatesRaw;
  const candidates = candidatesSlice.map(normalizeIssue).filter((item) => item.issueId);

  const stateMap = readJson(statePath, {});
  const existingState = typeof stateMap === 'object' && stateMap ? stateMap : {};
  const seenIssueIds = new Set();

  const result = {
    generatedAt: nowIso,
    inputCount: candidatesRaw.length,
    candidateCount: candidates.length,
    ttlDays,
    maxIssues: maxIssues || null,
    force: values.force,
    processActivityChanges: values['process-activity-changes'],
    counts: {
      NEW: 0,
      CHANGED: 0,
      UNCHANGED: 0,
      ACTIVITY_ONLY: 0,
      PROCESS: 0,
      SKIPPED: 0,
    },
    items: [],
    processIssueIds: [],
    skippedIssueIds: [],
  };

  for (const candidate of candidates) {
    seenIssueIds.add(candidate.issueId);
    const stableSnapshot = buildStableSnapshot(candidate);
    const activitySnapshot = buildActivitySnapshot(candidate);
    const stableHashValue = stableHash(stableSnapshot);
    const activityHashValue = stableHash(activitySnapshot);
    const previous = existingState[candidate.issueId];

    let status = 'NEW';
    let activityChanged = false;
    if (previous) {
      const previousStableSnapshot = previous.stableSnapshot || {
        title: previous.title || '',
        culprit: previous.culprit || '',
        transaction: previous.transaction || '',
        level: previous.level || '',
        errorBucketTop: previous.errorBucketTop || '',
      };
      const previousActivitySnapshot = previous.activitySnapshot || {
        lastSeen: previous.lastSeen || '',
        events: previous.events || 0,
        users: previous.users || 0,
      };
      const previousStableHash = previous.stableHash || previous.hash || stableHash(previousStableSnapshot);
      const previousActivityHash = previous.activityHash || stableHash(previousActivitySnapshot);
      status = previousStableHash === stableHashValue ? 'UNCHANGED' : 'CHANGED';
      activityChanged = previousActivityHash !== activityHashValue;
    }

    const shouldProcess =
      values.force ||
      status !== 'UNCHANGED' ||
      (values['process-activity-changes'] && activityChanged);

    result.counts[status] += 1;
    if (status === 'UNCHANGED' && activityChanged) {
      result.counts.ACTIVITY_ONLY += 1;
    }
    if (shouldProcess) {
      result.counts.PROCESS += 1;
      result.processIssueIds.push(candidate.issueId);
    } else {
      result.counts.SKIPPED += 1;
      result.skippedIssueIds.push(candidate.issueId);
    }

    result.items.push({
      issueId: candidate.issueId,
      status,
      activityChanged,
      shouldProcess,
      stableSnapshot,
      activitySnapshot,
      previousSnapshot: previous
        ? {
            stableSnapshot: previous.stableSnapshot || {
              title: previous.title || '',
              culprit: previous.culprit || '',
              transaction: previous.transaction || '',
              level: previous.level || '',
              errorBucketTop: previous.errorBucketTop || '',
            },
            activitySnapshot: previous.activitySnapshot || {
              lastSeen: previous.lastSeen || '',
              events: previous.events || 0,
              users: previous.users || 0,
            },
          }
        : null,
    });

    // Keep repo diffs minimal: unchanged issues do not rewrite state rows unless explicitly requested.
    if (status !== 'UNCHANGED' || !previous || (values['process-activity-changes'] && activityChanged)) {
      existingState[candidate.issueId] = {
        stableSnapshot,
        activitySnapshot,
        stableHash: stableHashValue,
        activityHash: activityHashValue,
        // Backward compatibility for old consumers expecting `hash`.
        hash: stableHashValue,
        title: stableSnapshot.title,
        culprit: stableSnapshot.culprit,
        transaction: stableSnapshot.transaction,
        level: stableSnapshot.level,
        errorBucketTop: stableSnapshot.errorBucketTop,
        lastSeen: activitySnapshot.lastSeen,
        events: activitySnapshot.events,
        users: activitySnapshot.users,
        updatedAt: nowIso,
      };
    }
  }

  const prunedState = pruneState(existingState, ttlDays, seenIssueIds);
  const sortedState = sortObjectByKeys(prunedState);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(sortedState, null, 2)}\n`, 'utf8');

  if (values.output) {
    const outputPath = path.resolve(values.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }

  if (values.json) {
    const status = result.counts.PROCESS > 0 ? 'success' : 'success';
    const nextActions = result.counts.PROCESS > 0
      ? [`Run Step 3 classification on ${result.processIssueIds.length} issue(s)`]
      : ['No new or changed issues — no action required'];
    console.log(JSON.stringify({
      status,
      summary: `${result.counts.NEW} NEW, ${result.counts.CHANGED} CHANGED, ${result.counts.UNCHANGED} UNCHANGED → ${result.counts.PROCESS} to process`,
      next_actions: nextActions,
      artifacts: [statePath, values.output || ''].filter(Boolean),
      data: result,
      generated_at: nowIso,
    }));
  } else {
    console.log('[diff-issues] Incremental issue gating summary');
    console.log(`- Input issues: ${result.inputCount}`);
    console.log(`- Candidate issues: ${result.candidateCount}`);
    console.log(`- NEW: ${result.counts.NEW}`);
    console.log(`- CHANGED: ${result.counts.CHANGED}`);
    console.log(`- UNCHANGED: ${result.counts.UNCHANGED}`);
    console.log(`- ACTIVITY_ONLY: ${result.counts.ACTIVITY_ONLY}`);
    console.log(`- PROCESS: ${result.counts.PROCESS}`);
    console.log(`- SKIPPED: ${result.counts.SKIPPED}`);
    console.log(`- State: ${statePath}`);

    if (result.processIssueIds.length > 0) {
      console.log(`- To process: ${result.processIssueIds.join(', ')}`);
    }
    if (values.verbose && result.skippedIssueIds.length > 0) {
      console.log(`- Skipped unchanged: ${result.skippedIssueIds.join(', ')}`);
    }
  }
}

try {
  main();
} catch (error) {
  const errJson = {
    status: 'error',
    summary: `diff-issues failed: ${error.message}`,
    root_cause: error.stack?.split('\n')[0] || error.message,
    safe_retry: 'Fix root cause and rerun with same flags',
    stop_condition: 'After 3 identical failures → ESCALATE',
    generated_at: new Date().toISOString(),
  };
  // If argv contains --json, prefer JSON output even on uncaught exception
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(errJson));
  } else {
    console.error('[diff-issues] failed:', error.message);
  }
  process.exit(1);
}
