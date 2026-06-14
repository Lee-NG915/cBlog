#!/usr/bin/env node
/**
 * remediation-loop.mjs
 *
 * Single-execution verification tool for the alert-harness remediation loop.
 *
 * The CALLER (agent) controls the loop — applying fixes between attempts and
 * re-invoking this script. This script ONLY validates; it never modifies code.
 *
 * Enforced invariants (all require caller state via CLI flags):
 * - Empty-diff detection  (no --previous-diff-hash needed)
 * - Same-diff detection   (--previous-diff-hash vs current diff)
 * - No-regression rule    (--lint-passed-before flag)
 * - Same-output detection (--previous-lint-output / --previous-e2e-output)
 * - Retry accounting      (--attempt / --max-attempts)
 *
 * Usage (caller must re-invoke after applying fixes):
 *   node scripts/remediation-loop.mjs \
 *     --run-id <uuid> \
 *     --mode <fix|fix --with-pr> \
 *     --e2e-required <true|false> \
 *     --attempt <n> \
 *     --max-attempts <n> \
 *     [--previous-diff-hash <hash>] \
 *     [--previous-lint-output <str>] \
 *     [--previous-e2e-output <str>] \
 *     [--lint-passed-before] \
 *     [--json]
 *
 * Exit codes:
 *   0  → all checks passed, proceed to commit/PR
 *   1  → verification failed; caller should fix and retry, or ESCALATE if
 *         the JSON output has escalate=true
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const LOG_DIR = '.agents/skills/alert-harness/logs';
const MAX_ARTIFACT_LINES = 5;

function resolveLogPath(runId) {
  return path.resolve(process.cwd(), LOG_DIR, `remediation-${runId}.json`);
}

function runLint() {
  try {
    const output = execSync('pnpm lint:observability', {
      encoding: 'utf8',
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024,
    });
    return { exitCode: 0, output };
  } catch (error) {
    return { exitCode: error.status || 1, output: error.stdout + error.stderr };
  }
}

function runE2E() {
  try {
    const output = execSync('pnpm e2e:sentry-tags:server-capture', {
      encoding: 'utf8',
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024,
      timeout: 600_000,
    });
    return { exitCode: 0, output };
  } catch (error) {
    return { exitCode: error.status || 1, output: error.stdout + error.stderr };
  }
}

function getDiffHash() {
  try {
    return execSync('git diff HEAD | sha256sum', { encoding: 'utf8', cwd: process.cwd() }).trim();
  } catch {
    return '';
  }
}

function hasWorkingDiff() {
  try {
    execSync('git diff --quiet HEAD', { cwd: process.cwd() });
    return false;
  } catch {
    return true;
  }
}

function getDiffFiles() {
  try {
    return execSync('git diff --name-only HEAD', { encoding: 'utf8', cwd: process.cwd() })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function stripAnsi(value) {
  return value.replaceAll(/\[[0-9;]*m/g, '');
}

function toSingleLine(value) {
  return stripAnsi(value).replaceAll(/\s+/g, ' ').trim();
}

function topNonEmptyLines(output, maxLines = MAX_ARTIFACT_LINES) {
  return stripAnsi(output)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxLines);
}

function isTransientFailure(output) {
  return /(timeout|timed out|econnreset|eai_again|enotfound|network error|socket hang up|temporar)/i.test(output);
}

function isHardRuleOrBlockedFailure(output) {
  return /(hard-rule|hard rule|blocked path|must not|forbidden|do not add|integration blocked)/i.test(output);
}

function parseLintViolations(output) {
  const lines = topNonEmptyLines(output, 20);
  const parsed = [];
  for (const line of lines) {
    const match = line.match(/^(.+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|mdx))[:(](\d+)[):]?\s*(.*)$/i);
    if (!match) {
      continue;
    }
    parsed.push({
      file: match[1],
      line: match[2],
      rule: 'lint_violation',
      message: match[3] || 'Lint violation',
    });
  }
  if (parsed.length > 0) {
    return parsed;
  }
  const first = topNonEmptyLines(output, 1)[0] || 'Lint failed';
  return [{ file: 'unknown', line: 'unknown', rule: 'lint_violation', message: first }];
}

function parseE2EFailures(output) {
  const lines = topNonEmptyLines(output, 40);
  const parsed = [];
  for (const line of lines) {
    const tagMatch = line.match(/expected\s+([a-z_]+)=([^\s,]+),?\s*got\s+([^\s,]+)/i);
    if (tagMatch) {
      parsed.push({
        page: 'unknown',
        expected: `${tagMatch[1]}=${tagMatch[2]}`,
        actual: tagMatch[3],
      });
      continue;
    }
    const simpleMatch = line.match(/expected\s+(.+?)\s+got\s+(.+)$/i);
    if (simpleMatch) {
      parsed.push({
        page: 'unknown',
        expected: toSingleLine(simpleMatch[1]),
        actual: toSingleLine(simpleMatch[2]),
      });
    }
  }
  if (parsed.length > 0) {
    return parsed;
  }
  const first = topNonEmptyLines(output, 1)[0] || 'E2E failed';
  return [{ page: 'unknown', expected: 'tag assertion', actual: first }];
}

function buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures, diffFiles, reason }) {
  const violationLines = violations.length
    ? violations.map((item) => `- ${item.file}:${item.line} — ${item.rule} — ${item.message}`)
    : ['- unknown:unknown — unknown — No structured violation parsed'];
  const e2eLines = e2eFailures.length
    ? e2eFailures.map((item) => `- ${item.page} — expected ${item.expected}, got ${item.actual}`)
    : ['- (none)'];

  return [
    `## ESCALATE — Auto-fix failed after ${attempt} of ${maxAttempts} attempts`,
    '',
    `Reason: ${reason}`,
    '',
    'Violations still present:',
    ...violationLines,
    '',
    'E2E failures (if applicable):',
    ...e2eLines,
    '',
    `Changed files this attempt: ${diffFiles.length ? diffFiles.join(', ') : '(none)'}`,
    '',
    'Next step: manual investigation required. Do not add fixes ISSUE-ID to the PR title or PR description.',
  ].join('\n');
}

function buildEscalateRecord({
  summary,
  runId,
  mode,
  attempt,
  maxAttempts,
  logPath,
  violations,
  e2eFailures,
  diffFiles,
  reason,
  generatedAt,
}) {
  const primaryViolation = violations[0];
  const firstTarget =
    primaryViolation && primaryViolation.file !== 'unknown'
      ? `${primaryViolation.file}:${primaryViolation.line}`
      : 'remaining violations';
  return {
    status: 'error',
    summary,
    next_actions: [`Manual investigation of ${firstTarget}`, 'Escalate to observability team'],
    artifacts: [logPath],
    run_id: runId,
    mode,
    escalate: true,
    escalate_reason: reason,
    attempt,
    max_attempts: maxAttempts,
    violations_remaining: violations,
    e2e_failures: e2eFailures,
    changed_files: diffFiles,
    generated_at: generatedAt,
  };
}

function buildRetryRecord({
  summary,
  runId,
  mode,
  attempt,
  maxAttempts,
  logPath,
  violations,
  e2eFailures,
  diffFiles,
  reason,
  generatedAt,
}) {
  return {
    status: 'error',
    summary,
    next_actions: ['Fix violations and re-run this script with incremented --attempt'],
    artifacts: [logPath],
    run_id: runId,
    mode,
    escalate: false,
    escalate_reason: reason,
    attempt,
    max_attempts: maxAttempts,
    violations_remaining: violations,
    e2e_failures: e2eFailures,
    changed_files: diffFiles,
    generated_at: generatedAt,
  };
}

function buildSuccessRecord({ runId, mode, attempt, logPath, e2eRequired, e2eSkipEvidence, diffFiles, generatedAt }) {
  const durationSeconds = Math.round((Date.now() - globalThis.__startTime) / 1000);
  return {
    status: 'success',
    summary: `Remediation verification passed on attempt ${attempt}`,
    next_actions: e2eRequired
      ? ['Proceed to Step 8 (commit + PR)']
      : [`Proceed to Step 8 (commit + PR). E2E skipped with evidence: ${e2eSkipEvidence?.unit_test_command} => ${e2eSkipEvidence?.unit_test_result}`],
    artifacts: [logPath],
    run_id: runId,
    mode,
    e2e_required: e2eRequired,
    lint_attempts: attempt,
    duration_seconds: durationSeconds,
    changed_files: diffFiles,
    generated_at: generatedAt,
  };
}

function emitResult({ record, markdown, jsonOnly }) {
  if (jsonOnly) {
    console.log(JSON.stringify(record));
    return;
  }
  if (markdown) {
    console.log(markdown);
    return;
  }
  console.log(record.summary);
}

function logToFile(runId, record) {
  const logPath = resolveLogPath(runId);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, JSON.stringify(record) + '\n', 'utf8');
}

function main() {
  const { values } = parseArgs({
    options: {
      'run-id': { type: 'string' },
      mode: { type: 'string' },
      'e2e-required': { type: 'string' },
      'e2e-skip-reason': { type: 'string' },
      'e2e-unit-test-command': { type: 'string' },
      'e2e-unit-test-result': { type: 'string' },
      attempt: { type: 'string', default: '1' },
      'max-attempts': { type: 'string', default: '3' },
      'previous-diff-hash': { type: 'string' },
      'previous-lint-output': { type: 'string' },
      'previous-e2e-output': { type: 'string' },
      'lint-passed-before': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`Usage: node remediation-loop.mjs --run-id <uuid> --mode <mode> --e2e-required <true|false> [options]

Single-execution verification. The CALLER controls the loop by applying fixes
and re-invoking this script with incremented --attempt.

Required:
  --run-id <uuid>            Unique run identifier
  --mode <string>            e.g. fix, fix --with-pr
  --e2e-required <bool>      Whether E2E is required by the decision gate

Loop state (caller must track and pass back on re-invocation):
  --attempt <n>              Current attempt number (default: 1)
  --max-attempts <n>         Max loop attempts (default: 3)
  --previous-diff-hash <str> Previous attempt's git diff hash
  --previous-lint-output <str>  Previous attempt's lint compact output
  --previous-e2e-output <str>   Previous attempt's E2E compact output
  --lint-passed-before       Set if lint has passed in a previous attempt

E2E skip evidence (required when --e2e-required=false):
  --e2e-skip-reason <txt>    Why E2E is skipped
  --e2e-unit-test-command    Unit test command executed
  --e2e-unit-test-result     Unit test result (e.g. pass)

Output:
  --json                     Machine-readable JSON output
  --help                     Show this help

Exit codes:
  0  → success (lint passed, E2E passed if required)
  1  → failure; check JSON "escalate" field: true = stop, false = retry
`);
    process.exit(0);
  }

  if (!values['run-id'] || !values.mode || !values['e2e-required']) {
    console.error('[remediation-loop] --run-id, --mode, and --e2e-required are required');
    process.exit(1);
  }

  const runId = values['run-id'];
  const mode = values.mode;
  const e2eRequired = values['e2e-required'] === 'true';
  const e2eSkipReason = values['e2e-skip-reason'] || '';
  const e2eUnitTestCommand = values['e2e-unit-test-command'] || '';
  const e2eUnitTestResult = values['e2e-unit-test-result'] || '';
  const attempt = Number(values.attempt);
  const maxAttempts = Number(values['max-attempts']);
  const previousDiffHash = values['previous-diff-hash'] || '';
  const previousLintOutput = values['previous-lint-output'] || '';
  const previousE2eOutput = values['previous-e2e-output'] || '';
  const lintPassedBefore = values['lint-passed-before'];
  const jsonOnly = values.json;
  const startTime = Date.now();
  globalThis.__startTime = startTime;
  const logPath = resolveLogPath(runId);

  if (!e2eRequired && (!e2eSkipReason || !e2eUnitTestCommand || !e2eUnitTestResult)) {
    const violations = [
      {
        file: 'unknown',
        line: 'unknown',
        rule: 'missing_e2e_skip_evidence',
        message: 'E2E skip requires reason + unit test command + unit test result',
      },
    ];
    const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
    const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles: [], reason: 'missing-e2e-skip-evidence' });
    const record = buildEscalateRecord({
      summary,
      runId,
      mode,
      attempt,
      maxAttempts,
      logPath,
      violations,
      e2eFailures: [],
      diffFiles: [],
      reason: 'missing-e2e-skip-evidence',
      generatedAt: new Date().toISOString(),
    });
    record.report_markdown = markdown;
    logToFile(runId, record);
    emitResult({ record, markdown, jsonOnly });
    process.exit(1);
  }

  // --- Invariant 1: empty diff ---
  const diffFiles = getDiffFiles();
  const currentDiffHash = getDiffHash();

  if (!hasWorkingDiff()) {
    const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
    const violations = [{ file: 'unknown', line: 'unknown', rule: 'empty_diff', message: 'No code diff detected' }];
    const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles: [], reason: 'empty-diff' });
    const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles: [], reason: 'empty-diff', generatedAt: new Date().toISOString() });
    record.report_markdown = markdown;
    logToFile(runId, record);
    emitResult({ record, markdown, jsonOnly });
    process.exit(1);
  }

  // --- Invariant: same diff between attempts ---
  if (previousDiffHash && currentDiffHash === previousDiffHash) {
    const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
    const violations = [{ file: 'unknown', line: 'unknown', rule: 'same_fix_no_diff', message: 'Current attempt produced the same diff as previous attempt' }];
    const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles, reason: 'same-diff-consecutive-attempts' });
    const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles, reason: 'same-diff-consecutive-attempts', generatedAt: new Date().toISOString() });
    record.report_markdown = markdown;
    logToFile(runId, record);
    emitResult({ record, markdown, jsonOnly });
    process.exit(1);
  }

  // --- Step 7a: Static lint ---
  const lintResult = runLint();
  const lintPassed = lintResult.exitCode === 0;

  if (!lintPassed) {
    const lintOutput = lintResult.output || '';
    const compactOutput = topNonEmptyLines(lintOutput, 30).join('\n');
    const violations = parseLintViolations(lintOutput);

    // Invariant 2: no regression allowed after lint has passed in a previous attempt.
    if (lintPassedBefore) {
      const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
      const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles, reason: 'no-regression-lint-reverted' });
      const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles, reason: 'no-regression-lint-reverted', generatedAt: new Date().toISOString() });
      record.report_markdown = markdown;
      logToFile(runId, record);
      emitResult({ record, markdown, jsonOnly });
      process.exit(1);
    }

    // Same output twice → fix is not progressing.
    if (previousLintOutput && previousLintOutput === compactOutput) {
      const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
      const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles, reason: 'same-lint-output-twice' });
      const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles, reason: 'same-lint-output-twice', generatedAt: new Date().toISOString() });
      record.report_markdown = markdown;
      logToFile(runId, record);
      emitResult({ record, markdown, jsonOnly });
      process.exit(1);
    }

    const hardRuleOrBlocked = isHardRuleOrBlockedFailure(compactOutput);
    if (hardRuleOrBlocked) {
      const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
      const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles, reason: 'hard-rule-or-blocked-path' });
      const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles, reason: 'hard-rule-or-blocked-path', generatedAt: new Date().toISOString() });
      record.report_markdown = markdown;
      logToFile(runId, record);
      emitResult({ record, markdown, jsonOnly });
      process.exit(1);
    }

    const transient = isTransientFailure(compactOutput);

    // Max attempts reached → always ESCALATE.
    if (attempt >= maxAttempts) {
      const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
      const reason = transient ? 'transient-lint-failure-at-max-attempts' : 'lint-still-failing-after-max-attempts';
      const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations, e2eFailures: [], diffFiles, reason });
      const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles, reason, generatedAt: new Date().toISOString() });
      record.report_markdown = markdown;
      logToFile(runId, record);
      emitResult({ record, markdown, jsonOnly });
      process.exit(1);
    }

    // Not max attempts yet. Transient → retryable; non-transient → also retryable
    // (caller may still fix the code), but we signal clearly.
    const summary = `Lint failed on attempt ${attempt} of ${maxAttempts}`;
    const reason = transient ? 'transient-lint-failure-retryable' : 'lint-failure-retryable';
    const record = buildRetryRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations, e2eFailures: [], diffFiles, reason, generatedAt: new Date().toISOString() });
    record.current_lint_compact_output = compactOutput;
    record.current_diff_hash = currentDiffHash;
    logToFile(runId, record);
    emitResult({ record, jsonOnly });
    process.exit(1);
  }

  // --- Step 7b: E2E decision gate ---
  if (e2eRequired) {
    const e2eResult = runE2E();
    const e2ePassed = e2eResult.exitCode === 0;

    if (!e2ePassed) {
      const e2eOutput = e2eResult.output || '';
      const compactOutput = topNonEmptyLines(e2eOutput, 30).join('\n');
      const e2eFailures = parseE2EFailures(e2eOutput);

      // Same output twice → not progressing.
      if (previousE2eOutput && previousE2eOutput === compactOutput) {
        const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
        const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations: [{ file: 'unknown', line: 'unknown', rule: 'none', message: 'Lint passed' }], e2eFailures, diffFiles, reason: 'same-e2e-output-twice' });
        const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations: [{ file: 'unknown', line: 'unknown', rule: 'none', message: 'Lint passed' }], e2eFailures, diffFiles, reason: 'same-e2e-output-twice', generatedAt: new Date().toISOString() });
        record.report_markdown = markdown;
        logToFile(runId, record);
        emitResult({ record, markdown, jsonOnly });
        process.exit(1);
      }

      const transient = isTransientFailure(compactOutput);

      // Max attempts reached → always ESCALATE.
      if (attempt >= maxAttempts) {
        const summary = `Auto-fix failed on attempt ${attempt} of ${maxAttempts}`;
        const reason = transient ? 'transient-e2e-failure-at-max-attempts' : 'e2e-still-failing-after-max-attempts';
        const markdown = buildEscalateMarkdown({ attempt, maxAttempts, violations: [{ file: 'unknown', line: 'unknown', rule: 'none', message: 'Lint passed' }], e2eFailures, diffFiles, reason });
        const record = buildEscalateRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations: [{ file: 'unknown', line: 'unknown', rule: 'none', message: 'Lint passed' }], e2eFailures, diffFiles, reason, generatedAt: new Date().toISOString() });
        record.report_markdown = markdown;
        logToFile(runId, record);
        emitResult({ record, markdown, jsonOnly });
        process.exit(1);
      }

      // Retryable.
      const summary = `E2E failed on attempt ${attempt} of ${maxAttempts}`;
      const reason = transient ? 'transient-e2e-failure-retryable' : 'e2e-failure-retryable';
      const record = buildRetryRecord({ summary, runId, mode, attempt, maxAttempts, logPath, violations: [{ file: 'unknown', line: 'unknown', rule: 'none', message: 'Lint passed' }], e2eFailures, diffFiles, reason, generatedAt: new Date().toISOString() });
      record.current_e2e_compact_output = compactOutput;
      record.current_diff_hash = currentDiffHash;
      logToFile(runId, record);
      emitResult({ record, jsonOnly });
      process.exit(1);
    }
  }

  // --- All checks green ---
  const record = buildSuccessRecord({
    runId,
    mode,
    attempt,
    logPath,
    e2eRequired,
    e2eSkipEvidence: e2eRequired
      ? undefined
      : {
          changed_files: diffFiles,
          reason: e2eSkipReason,
          unit_test_command: e2eUnitTestCommand,
          unit_test_result: e2eUnitTestResult,
        },
    diffFiles,
    generatedAt: new Date().toISOString(),
  });
  logToFile(runId, record);
  emitResult({ record, jsonOnly });
  process.exit(0);
}

try {
  main();
} catch (error) {
  const record = {
    status: 'error',
    summary: `Remediation loop crashed: ${error.message}`,
    next_actions: ['Check environment and rerun', 'Escalate to observability team if repeated'],
    artifacts: [],
    escalate: true,
    escalate_reason: 'runtime_crash',
    violations_remaining: [{ file: 'unknown', line: 'unknown', rule: 'runtime_crash', message: error.message }],
    attempted_fixes: [{ attempt: 1, description: 'Loop crashed before completion' }],
    generated_at: new Date().toISOString(),
  };
  const jsonOnly = process.argv.includes('--json');
  if (jsonOnly) {
    emitResult({ record, jsonOnly });
  } else {
    console.error('[remediation-loop] failed:', error.message);
  }
  process.exit(1);
}
