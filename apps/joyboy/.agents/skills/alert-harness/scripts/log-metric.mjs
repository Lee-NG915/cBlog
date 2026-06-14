#!/usr/bin/env node
/**
 * log-metric.mjs
 *
 * Append a single metric record to the harness metrics log.
 * All alert-harness scripts should call this after a run completes.
 *
 * Usage:
 *   node scripts/log-metric.mjs --run-id <uuid> --mode <mode> [fields...]
 *
 * Or programmatically:
 *   import { logMetric } from './log-metric.mjs';
 *   await logMetric({ run_id, mode, issues_analyzed, fixes_applied, ... });
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const METRICS_PATH = '.agents/skills/alert-harness/assets/metrics.jsonl';

function resolveMetricsPath() {
  return path.resolve(process.cwd(), METRICS_PATH);
}

export async function logMetric(record) {
  const filePath = resolveMetricsPath();
  const line = JSON.stringify(record) + '\n';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, line, 'utf8');
  return record;
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
}

function toNumber(value) {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function main() {
  const { values } = parseArgs({
    options: {
      'run-id': { type: 'string' },
      mode: { type: 'string' },
      'issues-analyzed': { type: 'string' },
      'fixes-applied': { type: 'string' },
      'lint-attempts': { type: 'string' },
      'e2e-required': { type: 'string' },
      'e2e-passed': { type: 'string' },
      escalated: { type: 'string' },
      'pr-created': { type: 'string' },
      'duration-seconds': { type: 'string' },
      'error-message': { type: 'string' },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`Usage: node log-metric.mjs --run-id <uuid> --mode <mode> [options]

Options:
  --run-id <uuid>          Unique run identifier
  --mode <string>          e.g. analyze-only, fix, fix --with-pr
  --issues-analyzed <n>    Number of issues analyzed
  --fixes-applied <n>      Number of fixes applied
  --lint-attempts <n>      Lint attempts in remediation loop
  --e2e-required <bool>    Whether E2E was required
  --e2e-passed <bool>      Whether E2E passed
  --escalated <bool>       Whether run ended in escalation
  --pr-created <bool>      Whether a PR was created
  --duration-seconds <n>   Total run duration
  --error-message <text>   Error summary if failed
  --help                   Show help
`);
    process.exit(0);
  }

  if (!values['run-id'] || !values.mode) {
    console.error('[log-metric] --run-id and --mode are required');
    process.exit(1);
  }

  const record = {
    run_id: values['run-id'],
    timestamp: new Date().toISOString(),
    mode: values.mode,
  };

  const numFields = [
    'issues-analyzed',
    'fixes-applied',
    'lint-attempts',
    'duration-seconds',
  ];
  for (const field of numFields) {
    const n = toNumber(values[field]);
    if (n !== undefined) {
      record[field.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = n;
    }
  }

  const boolFields = ['e2e-required', 'e2e-passed', 'escalated', 'pr-created'];
  for (const field of boolFields) {
    if (values[field] !== undefined) {
      record[field.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = toBool(
        values[field]
      );
    }
  }

  if (values['error-message']) {
    record.errorMessage = values['error-message'];
  }

  logMetric(record);

  if (process.stdout.isTTY) {
    console.log('[log-metric] Record appended.');
  }
}

try {
  main();
} catch (error) {
  console.error('[log-metric] failed:', error.message);
  process.exit(1);
}
