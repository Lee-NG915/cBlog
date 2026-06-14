#!/usr/bin/env node
/**
 * check-doc-sync.mjs
 *
 * Guardrail for alert-harness docs that frequently drift:
 * - /alert-harness sub-command matrix
 * - Sentry issue fetch strategy (unified single-query baseline)
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = process.cwd();
const skillPath = path.join(ROOT, '.agents/skills/alert-harness/SKILL.md');
const readmePath = path.join(ROOT, '.agents/skills/alert-harness/README.md');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function includesAll(content, requiredSnippets) {
  return requiredSnippets.filter((snippet) => !content.includes(snippet));
}

function includesCommandLine(content, command) {
  return new RegExp(`^\\s*${command}\\s+`, 'm').test(content);
}

function emitResult({ status, summary, rootCause, safeRetry, mismatches }) {
  const record = {
    status,
    summary,
    ...(rootCause ? { root_cause: rootCause } : {}),
    ...(safeRetry ? { safe_retry: safeRetry } : {}),
    ...(mismatches ? { mismatches } : {}),
    generated_at: new Date().toISOString(),
  };
  console.log(JSON.stringify(record));
}

function main() {
  const { values } = parseArgs({
    options: {
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`Usage: node check-doc-sync.mjs [--json] [--help]`);
    process.exit(0);
  }

  const skill = readFile(skillPath);
  const readme = readFile(readmePath);

  const requiredFetchStrategy = [
    'Single entry point. No pre-filtering by tag',
    'query="is:unresolved !error_bucket:third_party"',
  ];

  const missingCommands = [];
  for (const command of [
    '/alert-harness',
    '/alert-harness sentry',
    '/alert-harness dashboard',
    '/alert-harness diff',
  ]) {
    if (!includesCommandLine(skill, command)) {
      missingCommands.push(`missing command line: ${command}`);
    }
  }

  const skillMissing = [
    ...missingCommands,
    ...includesAll(skill, requiredFetchStrategy),
  ];
  const readmeMissing = includesAll(readme, [
    'SKILL.md § Sub-commands',
    'single-query baseline',
  ]);

  const mismatches = [];
  if (skillMissing.length > 0) {
    mismatches.push({
      file: '.agents/skills/alert-harness/SKILL.md',
      missing: skillMissing,
    });
  }
  if (readmeMissing.length > 0) {
    mismatches.push({
      file: '.agents/skills/alert-harness/README.md',
      missing: readmeMissing,
    });
  }

  if (mismatches.length > 0) {
    if (values.json) {
      emitResult({
        status: 'error',
        summary: 'Alert-harness docs are out of sync',
        root_cause: 'Required snippets missing from SKILL.md or README.md',
        safe_retry: 'Align SKILL.md and README.md, then rerun this script.',
        mismatches,
      });
    } else {
      console.error('[doc-sync] FAILED — alert-harness docs are out of sync');
      for (const mismatch of mismatches) {
        console.error(`- ${mismatch.file}`);
        for (const missing of mismatch.missing) {
          console.error(`  - missing snippet: ${missing}`);
        }
      }
      console.error('[doc-sync] Safe retry: align SKILL.md and README.md, then rerun this script.');
    }
    process.exit(1);
  }

  if (values.json) {
    emitResult({
      status: 'success',
      summary: 'Key alert-harness docs are in sync',
    });
  } else {
    console.log('[doc-sync] PASS — key alert-harness docs are in sync.');
  }
}

main();
