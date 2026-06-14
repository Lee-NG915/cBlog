'use strict';

/**
 * Generic doc governance check for docs/ai-specs/<domain>/ directories.
 *
 * Usage:
 *   node scripts/lint/doc-governance-check.js
 *     [--domain docs/ai-specs/<domain>]
 *     [--changed-files file1.md,file2.md,...]
 *     [--base-sha <sha>]  [--head-sha <sha>]
 *
 * Without --domain: scans all subdirectories of docs/ai-specs/
 * Without CI args: skips PR-context checks (INDEX sync in PR, version bump)
 *
 * Exit: 0 = pass, 1 = has errors
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
function getArg(flag) {
  const idx = argv.indexOf(flag);
  return idx !== -1 ? argv[idx + 1] : null;
}

const domainArg = getArg('--domain');
const changedFilesArg = getArg('--changed-files');
const baseSha = getArg('--base-sha');
const headSha = getArg('--head-sha');

const SPECS_ROOT = path.resolve(__dirname, '../../docs/ai-specs');
const VALID_STATUSES = ['proposed', 'accepted', 'deprecated'];
const REQUIRED_FRONTMATTER = ['status', 'version', 'owner', 'last-reviewed'];
const MAX_STALE_DAYS = 180;

let totalErrors = 0,
  totalWarnings = 0;

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line
      .slice(colonIdx + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (key) fm[key] = val;
  }
  return fm;
}

function checkDomain(domainPath, changedFiles) {
  const domainName = path.basename(domainPath);
  let errors = 0,
    warnings = 0;

  const err = (msg) => {
    console.error(`  ✗ ERROR: ${msg}`);
    errors++;
  };
  const warn = (msg) => {
    console.warn(`  ⚠ WARN:  ${msg}`);
    warnings++;
  };
  const ok = (msg) => {
    console.log(`  ✓ ${msg}`);
  };

  console.log(`\n── Domain: ${domainName} ${'─'.repeat(Math.max(0, 44 - domainName.length))}`);

  if (!fs.existsSync(domainPath)) {
    err(`directory not found: ${domainPath}`);
    return { errors, warnings };
  }

  const indexFile = path.join(domainPath, 'INDEX.md');
  const specFiles = fs
    .readdirSync(domainPath)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    .map((f) => path.join(domainPath, f));
  const allMd = [indexFile, ...specFiles].filter((f) => fs.existsSync(f));

  // [1] Frontmatter completeness & status validity
  console.log('\n  [1] Frontmatter & status');
  for (const filePath of allMd) {
    const rel = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) {
      err(`${rel}: missing frontmatter block`);
      continue;
    }
    for (const field of REQUIRED_FRONTMATTER) {
      if (!fm[field]) err(`${rel}: frontmatter missing '${field}'`);
      else ok(`${rel}: '${field}' present`);
    }
    if (fm.status) {
      if (VALID_STATUSES.includes(fm.status)) ok(`${rel}: status '${fm.status}' valid`);
      else err(`${rel}: status '${fm.status}' invalid (allowed: ${VALID_STATUSES.join(', ')})`);
    }
  }

  // [2] INDEX.md sync
  console.log('\n  [2] INDEX.md sync');
  if (!fs.existsSync(indexFile)) {
    err(`INDEX.md missing in ${domainName}/`);
  } else {
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    for (const filePath of specFiles) {
      const fileName = path.basename(filePath);
      const escapedName = fileName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const isReferenced = new RegExp(`(?<![a-zA-Z0-9_.-])${escapedName}(?![a-zA-Z0-9_.-])`).test(indexContent);
      if (isReferenced) ok(`INDEX.md references ${fileName}`);
      else err(`INDEX.md does not reference ${fileName}`);
    }
    if (changedFiles) {
      const domainChanged = changedFiles.filter(
        (f) =>
          f.includes(`/${domainName}/`) && !f.includes('INDEX.md') && !f.includes('/references/') && f.endsWith('.md')
      );
      if (domainChanged.length > 0) {
        const indexInPR = changedFiles.some((f) => f.includes(`/${domainName}/INDEX.md`));
        if (!indexInPR)
          err(
            `spec files changed (${domainChanged
              .map((f) => path.basename(f))
              .join(', ')}) but INDEX.md not updated in this PR`
          );
        else ok(`INDEX.md updated alongside spec changes`);
      }
    }
  }

  // [3] Version bump (CI-only when base/head sha provided)
  console.log('\n  [3] Version bump');
  if (baseSha && headSha && changedFiles) {
    const coreChanged = changedFiles.filter(
      (f) =>
        f.includes(`/${domainName}/`) && f.endsWith('.md') && !f.includes('INDEX.md') && !f.includes('/references/')
    );
    for (const relFile of coreChanged) {
      const gitDiff = spawnSync('git', ['diff', `${baseSha}...${headSha}`, '--', relFile], { encoding: 'utf8' });
      const diffLines = (gitDiff.stdout || '').split(/\r?\n/);

      const hasContentChange = diffLines.some(
        (line) =>
          /^[+-]/.test(line) &&
          !/^[+-]{3}/.test(line) &&
          !/^[+-](---|version:|last-reviewed:|status:|owner:|supersedes:|related)/.test(line)
      );

      if (!hasContentChange) {
        ok(`${relFile}: no content change`);
        continue;
      }

      const hasVersionBump = diffLines.some((line) => /^[+-]\s*version\s*:/.test(line) && !/^[+-]{3}/.test(line));

      if (hasVersionBump) ok(`${relFile}: version bumped`);
      else err(`${relFile}: content changed but 'version' not bumped in frontmatter`);
    }
  } else {
    console.log('  (skipped — provide --changed-files --base-sha --head-sha in CI)');
  }

  // [4] Review freshness
  console.log('\n  [4] Review freshness (accepted specs, max 180 days)');
  const today = new Date();
  for (const filePath of specFiles.filter((f) => fs.existsSync(f))) {
    const rel = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm || fm.status !== 'accepted' || !fm['last-reviewed']) continue;
    const reviewed = new Date(fm['last-reviewed']);
    if (isNaN(reviewed.getTime())) {
      err(`${rel}: last-reviewed date is invalid: ${fm['last-reviewed']}`);
      continue;
    }
    const daysSince = Math.floor((today - reviewed) / 86400000);
    if (daysSince > MAX_STALE_DAYS)
      warn(`${rel}: last-reviewed ${fm['last-reviewed']} is ${daysSince} days ago (limit ${MAX_STALE_DAYS})`);
    else ok(`${rel}: reviewed ${daysSince} days ago`);
  }

  // [5] Superseded paths gone
  console.log('\n  [5] Superseded paths');
  let supersededCount = 0;
  for (const filePath of specFiles.filter((f) => fs.existsSync(f))) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm || !fm.supersedes) continue;
    supersededCount++;
    const rel = path.relative(process.cwd(), filePath);
    const oldPath = path.resolve(process.cwd(), fm.supersedes);
    if (fs.existsSync(oldPath)) err(`${rel}: superseded path '${fm.supersedes}' still exists — migration incomplete`);
    else ok(`${rel}: superseded path gone`);
  }
  if (supersededCount === 0) console.log('  (no supersedes declarations)');

  return { errors, warnings };
}

// Main
const changedFiles = changedFilesArg
  ? changedFilesArg
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
  : null;

const domains = domainArg
  ? [path.resolve(process.cwd(), domainArg)]
  : fs
      .readdirSync(SPECS_ROOT)
      .map((d) => path.join(SPECS_ROOT, d))
      .filter((d) => fs.statSync(d).isDirectory());

for (const domain of domains) {
  const r = checkDomain(domain, changedFiles);
  totalErrors += r.errors;
  totalWarnings += r.warnings;
}

console.log(`\nDoc governance: ${totalErrors} error(s), ${totalWarnings} warning(s)\n`);
if (totalErrors > 0) process.exit(1);
