# Sentry AI Fix Routine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a weekly Monday autonomous routine that triages Sentry issues assigned to each team member, fixes the highest-impact one using AI, and raises a PR with a linked ClickUp ticket and Sentry external link.

**Architecture:** Three sequential parts — (1) estimation rubric docs as the shared scoring standard, (2) generic doc-governance CI replacing hardcoded observability spec checks, (3) Claude Code CronCreate prompt that references the rubric and drives the full fix + PR + ClickUp + Sentry API flow.

**Tech Stack:** Node.js (scripts), GitHub Actions YAML, Markdown with YAML frontmatter, Claude Code `/schedule`, ClickUp MCP, Sentry MCP

---

## File Map

| Action   | Path                                                              |
| -------- | ----------------------------------------------------------------- |
| Create   | `docs/ai-specs/estimation/INDEX.md`                               |
| Create   | `docs/ai-specs/estimation/rubric.md`                              |
| Create   | `scripts/lint/doc-governance-check.js`                            |
| Create   | `.github/workflows/doc-governance.yaml`                           |
| Modify   | `.github/workflows/observability-lint.yaml`                       |
| Delete   | `tools/eslint-plugin-observability/tests/spec-governance.test.js` |
| Schedule | Claude Code CronCreate (interactive — no file)                    |

---

## Task 1: Create `docs/ai-specs/estimation/INDEX.md`

**Files:**

- Create: `docs/ai-specs/estimation/INDEX.md`

- [ ] **Step 1: Write the file**

```markdown
---
status: accepted
version: 1.0.0
owner: jasper.zhang
last-reviewed: 2026-06-02
---

# Estimation AI Specs — Index

Spec registry for `docs/ai-specs/estimation/`. All AI agents (Claude, Cursor, harness scripts) should consult this index to discover which spec to read for estimation and scoring tasks.

**Authority rule**: if `docs/ai-specs/` and any other doc conflict, ai-specs win.

---

## Core Specs

| File                     | Status      | Purpose                                                                                   | When to read                                                                                                |
| ------------------------ | ----------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [`rubric.md`](rubric.md) | ✅ accepted | Multi-dimensional scoring rubric for effort estimation. 1 sprint point = 0.5 working day. | Any task requiring sprint point estimation: Sentry AI fix routine, PR review complexity, tech debt planning |
```

- [ ] **Step 2: Verify frontmatter parses**

```bash
node -e "const c=require('fs').readFileSync('docs/ai-specs/estimation/INDEX.md','utf8');const m=c.match(/^---\n([\s\S]*?)\n---/);console.log(m?'frontmatter OK':'MISSING frontmatter')"
```

Expected: `frontmatter OK`

- [ ] **Step 3: Commit**

```bash
git add docs/ai-specs/estimation/INDEX.md
git commit -m "docs: add estimation ai-specs INDEX"
```

---

## Task 2: Create `docs/ai-specs/estimation/rubric.md`

**Files:**

- Create: `docs/ai-specs/estimation/rubric.md`

- [ ] **Step 1: Write the file**

```markdown
---
status: accepted
version: 1.0.0
owner: jasper.zhang
last-reviewed: 2026-06-02
---

# Estimation Rubric — Multi-Dimensional Scoring

Shared scoring standard for AI-assisted effort estimation across all EC-FE workflows.

**1 sprint point = 0.5 working day.**

---

## Scoring Dimensions

Score each dimension independently (1–3), then sum all four scores.

| Dimension                 | 1 pt                                                        | 2 pt                        | 3 pt                                                |
| ------------------------- | ----------------------------------------------------------- | --------------------------- | --------------------------------------------------- |
| **A. File scope**         | Single file, < 20 lines changed                             | 2–3 files                   | 4+ files or new file required                       |
| **B. Root cause clarity** | Directly visible (e.g. missing null check, wrong condition) | Requires tracing call chain | Uncertain, needs investigation before fix           |
| **C. Test coverage**      | Existing tests validate the fix path                        | Partial coverage            | No tests; fix requires writing tests first          |
| **D. Domain coupling**    | Fully isolated, single domain                               | Crosses 1 domain boundary   | Crosses multiple domains or touches `shared/` layer |

---

## Sum → Sprint Point Mapping

| Total score | Sprint points | Effort   | Action                                    |
| ----------- | ------------- | -------- | ----------------------------------------- |
| 4–5         | 1 pt          | 0.5 day  | Proceed with auto-fix                     |
| 6–7         | 2 pt          | 1 day    | Proceed with auto-fix                     |
| 8–9         | 3 pt          | 1.5 days | Proceed with auto-fix                     |
| 10–12       | 5 pt          | 2.5 days | Skip auto-fix → flag "needs human review" |

---

## Confidence Alignment

Low confidence correlates with high "B. Root cause clarity" score. The two signals are naturally aligned — no separate adjustment needed. When confidence < 70%, the root cause dimension is typically 3, pushing total score to 10+ and triggering the human-review path automatically.

---

## Reuse Contexts

| Context                  | How to use                                                      |
| ------------------------ | --------------------------------------------------------------- |
| Sentry AI Fix routine    | Step 4 of the cron prompt — score issue before attempting fix   |
| PR review complexity     | Surface expected review effort in submit-pr flow                |
| Tech debt estimation     | Use when creating tasks in FE Refactoring list (`901808352655`) |
| alert-harness violations | Order multiple violations by fix effort (lowest score first)    |
```

- [ ] **Step 2: Commit**

```bash
git add docs/ai-specs/estimation/rubric.md
git commit -m "docs: add estimation rubric (4-dimension scoring, 1pt=0.5day)"
```

---

## Task 3: Create `scripts/lint/doc-governance-check.js`

**Files:**

- Create: `scripts/lint/doc-governance-check.js`

- [ ] **Step 1: Write the script**

```javascript
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
const { execSync } = require('child_process');

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
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key) fm[key] = val;
  }
  return fm;
}

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
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
      if (indexContent.includes(fileName)) ok(`INDEX.md references ${fileName}`);
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
      const contentDiff = runGit(
        `git diff "${baseSha}...${headSha}" -- "${relFile}" | grep '^[+-]' | grep -v '^[+-][+-][+-]' | grep -vE '^[+-](---|version:|last-reviewed:|status:|owner:|supersedes:|related)' || true`
      );
      if (!contentDiff) {
        ok(`${relFile}: no content change`);
        continue;
      }
      const versionDiff = runGit(
        `git diff "${baseSha}...${headSha}" -- "${relFile}" | grep '^[+-]version:' | grep -v '^---\\|^+++' || true`
      );
      if (versionDiff) ok(`${relFile}: version bumped`);
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
```

- [ ] **Step 2: Run locally — both domains must pass**

```bash
node scripts/lint/doc-governance-check.js
```

Expected last line: `Doc governance: 0 error(s), 0 warning(s)`

- [ ] **Step 3: Commit**

```bash
git add scripts/lint/doc-governance-check.js
git commit -m "feat: add generic doc-governance-check.js for all docs/ai-specs domains"
```

---

## Task 4: Create `.github/workflows/doc-governance.yaml`

**Files:**

- Create: `.github/workflows/doc-governance.yaml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Doc Governance

on:
  pull_request:
    branches:
      - master
    paths:
      - 'docs/ai-specs/**'

permissions:
  contents: read
  pull-requests: write

jobs:
  doc-governance:
    name: Spec Governance (docs/ai-specs)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: install
        uses: ./.github/workflows/actions/install

      - name: Get changed ai-specs files
        id: changed
        run: |
          BASE=${{ github.event.pull_request.base.sha }}
          HEAD=${{ github.event.pull_request.head.sha }}

          CHANGED=$(git diff --name-only "$BASE"..."$HEAD" -- 'docs/ai-specs/**' | grep -v '^$' || true)
          echo "files<<EOF" >> "$GITHUB_OUTPUT"
          echo "$CHANGED" >> "$GITHUB_OUTPUT"
          echo "EOF" >> "$GITHUB_OUTPUT"

          DOMAINS=$(echo "$CHANGED" | grep -oP 'docs/ai-specs/\K[^/]+' | sort -u || true)
          echo "domains<<EOF" >> "$GITHUB_OUTPUT"
          echo "$DOMAINS" >> "$GITHUB_OUTPUT"
          echo "EOF" >> "$GITHUB_OUTPUT"

      - name: Run doc governance check
        if: steps.changed.outputs.files != ''
        run: |
          BASE=${{ github.event.pull_request.base.sha }}
          HEAD=${{ github.event.pull_request.head.sha }}
          CHANGED_FILES="${{ steps.changed.outputs.files }}"
          DOMAINS="${{ steps.changed.outputs.domains }}"

          CHANGED_CSV=$(echo "$CHANGED_FILES" | tr '\n' ',' | sed 's/,$//')

          FAILED=0
          while IFS= read -r domain; do
            [[ -z "$domain" ]] && continue
            echo ""
            echo "==> Checking domain: $domain"
            node scripts/lint/doc-governance-check.js \
              --domain "docs/ai-specs/$domain" \
              --changed-files "$CHANGED_CSV" \
              --base-sha "$BASE" \
              --head-sha "$HEAD" || FAILED=1
          done <<< "$DOMAINS"

          if [[ $FAILED -eq 1 ]]; then
            echo "::error::Doc governance check failed. See above for violation details."
            exit 1
          fi

      - name: No relevant changes
        if: steps.changed.outputs.files == ''
        run: echo "[OK] No docs/ai-specs changes — governance check skipped."
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/doc-governance.yaml
git commit -m "ci: add generic doc-governance workflow for all docs/ai-specs domains"
```

---

## Task 5: Update `observability-lint.yaml`

**Files:**

- Modify: `.github/workflows/observability-lint.yaml`

- [ ] **Step 1: Remove `docs/ai-specs/observability/**`from`paths:`\*\*

Find the `paths:` block under `on: pull_request:` and remove this line:

```yaml
- 'docs/ai-specs/observability/**'
```

After edit the full `paths:` block should be:

```yaml
paths:
  - 'apps/web/**/*.ts'
  - 'apps/web/**/*.tsx'
  - 'libs/shared/observability/**'
  - 'tools/eslint-plugin-observability/**'
  - 'apps/web/.eslintrc.json'
```

- [ ] **Step 2: Remove the three spec-governance steps**

Delete these three steps entirely (lines 55–143 in the current file):

```
- name: Get ai-specs changes
- name: Run spec governance tests (when ai-specs change)
- name: Check ai-specs INDEX sync and version bump
```

- [ ] **Step 3: Validate YAML is still well-formed**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/observability-lint.yaml')); print('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 4: Confirm remaining step names are intact**

```bash
grep "      - name:" .github/workflows/observability-lint.yaml
```

Expected output (exactly these, in order):

```
      - name: install
      - name: Get changed web TS files
      - name: Get plugin/config changes
      - name: Run observability lint
      - name: Run ESLint rule tests (when plugin, observability lib, or web ESLint config changes)
      - name: No relevant changes
      - name: Run Sentry context coverage scan
      - name: Post coverage report and violation comment
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/observability-lint.yaml
git commit -m "ci: remove spec governance steps from observability-lint (moved to doc-governance)"
```

---

## Task 6: Delete `spec-governance.test.js`

**Files:**

- Delete: `tools/eslint-plugin-observability/tests/spec-governance.test.js`

- [ ] **Step 1: Confirm zero remaining CI references**

```bash
grep -r "spec-governance" .github/ scripts/ --include="*.yaml" --include="*.yml" --include="*.sh" --include="*.js" || echo "no references found"
```

Expected: `no references found`

- [ ] **Step 2: Delete and commit**

```bash
git rm tools/eslint-plugin-observability/tests/spec-governance.test.js
git commit -m "chore: remove spec-governance.test.js (superseded by doc-governance-check.js)"
```

---

## Task 7: Verify end-to-end locally

- [ ] **Step 1: Full scan — both domains**

```bash
node scripts/lint/doc-governance-check.js
```

Expected last line: `Doc governance: 0 error(s), 0 warning(s)`

- [ ] **Step 2: Targeted domain scans**

```bash
node scripts/lint/doc-governance-check.js --domain docs/ai-specs/estimation
node scripts/lint/doc-governance-check.js --domain docs/ai-specs/observability
```

Both expected: `Doc governance: 0 error(s), 0 warning(s)`

- [ ] **Step 3: Simulate PR context (INDEX sync check)**

```bash
node scripts/lint/doc-governance-check.js \
  --domain docs/ai-specs/estimation \
  --changed-files "docs/ai-specs/estimation/rubric.md,docs/ai-specs/estimation/INDEX.md"
```

Expected: no INDEX sync error (INDEX.md is in the changed files list).

---

## Task 8: Set up Claude Code CronCreate (per team member)

Each person runs this once. The prompt auto-detects credentials from local git/gh config — no hardcoding needed. Working directory is configured in the Routines panel.

- [ ] **Step 1: Open Claude Code → Routines → New routine → Local**

Set the working directory to the joyboy project root in the Routines panel.

- [ ] **Step 2: Paste this prompt (with placeholders filled)**

````
You are an autonomous Sentry issue repair agent for the Castlery joyboy web project.

---

## Global Hard Constraints (Mandatory)

### PR `fixes` format
Only add `fixes JOYBOY-WEB-XXXX` when this PR truly resolves the Sentry issue root cause.

1. `fixes ...` is allowed **only** in PR title and PR description — never in commit messages.
2. PR title must end with a bracket suffix: `[fixes JOYBOY-WEB-XXXX]`
3. PR description must include one line per issue: `fixes JOYBOY-WEB-XXXX`
4. If format is wrong after PR creation → immediately correct with `gh pr edit` before continuing.

### Observability hard boundary
Never modify files under `libs/shared/observability/**`, `apps/web/instrumentation*.ts`, or any file containing definitions of `BUSINESS_DOMAIN`, `PAGE_TYPES`, `error_bucket`, `captureStructuredError`, `SentryContextProvider`, `setGlobalSentryContext`.

---

## Identity

Run this command to detect your GitHub username (used for branch names):

```bash
gh api user --jq .login
````

Sentry credentials are handled by the Sentry MCP token — no email needed.

## Step 1 — Fetch assigned Sentry issues

Use the Sentry MCP to list unresolved issues assigned to you across all
production environments (au-prod, ca-prod, sg-prod, uk-prod, us-prod),
project ID 4507648850591744.

Filter: status=unresolved, assigned:me
Sort: users_affected descending
Take the top 20 results.

## Step 2 — Classify the top issue

For the issue with the most users affected, read its full details
(title, stack trace, error message, affected files).

Classify as one of:

- baseline: observability instrumentation gap (missing setGlobalSentryContext,
  bare Sentry.captureException, wrong error_bucket). SKIP — use /alert-harness instead.
- business-error: application logic error causing a user-visible failure.
- boundary-caught: unexpected condition caught by an error boundary or try/catch
  that should be handled more gracefully.

If baseline → log "Skipped: baseline issue — use /alert-harness" and stop.

## Step 3 — Hard constraint check

Before any code analysis, verify the issue does NOT root in any of these paths:

- libs/shared/observability/\*\*
- apps/web/instrumentation\*.ts
- Any file containing definitions (not call sites) of: BUSINESS_DOMAIN, PAGE_TYPES,
  error_bucket, captureStructuredError, SentryContextProvider, setGlobalSentryContext

If rooted in these paths → log "Skipped: observability core — do not auto-modify" and stop.

## Step 4 — Score and estimate

Read docs/ai-specs/estimation/rubric.md.

Score each dimension (1–3):
A. File scope
B. Root cause clarity
C. Test coverage
D. Domain coupling

Map total to sprint points:
4–5 → 1 pt | 6–7 → 2 pt | 8–9 → 3 pt | 10–12 → 5 pt

Assess confidence (0–100%): how clearly the root cause is identified, whether a
targeted fix exists without side effects, whether existing tests can verify the result.

If total score = 10–12 OR confidence < 70%:
Print:
⚠️ {ISSUE_ID} — {title}
Users affected: {N}
Classification: {type}
Effort: 5 pt → needs human review
Confidence: {X}%
Reason: {why}
Stop.

## Step 5 — Create ClickUp ticket

First resolve the current user's ClickUp ID:
clickup_resolve_assignees(["me"]) → capture the numeric user ID

Create a task in the FE Sentry list (list_id: 901818201801):
name: "[Sentry] {issue_title} — {ISSUE_ID}"
status: "in progress"
assignees: [<resolved_user_id>]
points: {estimated_points}
tags: ["fe", "sentry", "auto-fix"]
custom_fields: - id: 3ec2df9e-2049-4843-9cd1-79bd5d134a28, value: 68a22c97-3329-4bfc-a332-e70ea0145f86 (Business Line: Ecommerce) - id: 66de2a1c-adb7-417b-b248-0ff6b212471b, value: bb6817e9-8f67-45f4-bec0-7aed3f30bc5d (Tech Team: EC FE) - id: 198d5223-7543-4140-b27f-b9bc71975eb4, value: 87ca950b-b689-47ea-ad05-411cb041b642 (Requirement Type: Tech)
description: |
Sentry: https://castlery.sentry.io/issues/{NUMERIC_ID}/
Auto-generated by Sentry AI Fix routine.
Classification: {type} | Confidence: {X}% | Scores: A={s1} B={s2} C={s3} D={s4}

Record the returned task_id.

## Step 6 — Branch and implement fix

Resolve the branch name from ClickUp GitHub integration:
Run: cup task {task_id}
Read the GitHub integration branch if present.
If not yet available (sync delay), construct manually:
{github_username}/CU-{task_id}/Auto-fix-Sentry-{ISSUE_ID}

git checkout -b "{branch_name}"

Implement the minimal fix. Do NOT modify any file matching paths in Step 3.

Fix any violations (max 3 attempts). If still failing after 3 attempts, stop and
report "Observability lint failed after 3 attempts — manual fix required."

## Step 7 — Commit

fix: {short description of what was fixed}

Do NOT put "fixes ISSUE_ID" in commit messages.

## Step 8 — Create PR

Invoke the submit-pr skill (follow `.agents/skills/submit-pr/SKILL.md`).

PR title format:
fix: [#{task_id}] {clickup_task_name} [fixes {ISSUE_ID}]

PR description must include (one line per issue):
fixes {ISSUE_ID}

Add to Special notes section:
"Auto-generated by Sentry AI Fix routine. Confidence: {X}%. Effort: {N} pt."

Ticket link format: [#{task_id}](https://app.clickup.com/t/{task_id})

**Mandatory format check after PR is created:**

- PR title ends with `[fixes {ISSUE_ID}]`
- PR description contains `fixes {ISSUE_ID}` (one line)
- Commit messages do NOT contain any `fixes` lines

If any check fails, immediately correct with `gh pr edit` before continuing.

## Step 9 — Link Sentry to ClickUp via REST API

Use Bash to call the Sentry REST API directly using the local SENTRY_API_TOKEN:

curl -s -X POST \
 "https://sentry.io/api/0/sentry-app-installations/695041b9-ad61-47b5-b46d-1e18963a749f/external-issues/" \
 -H "Authorization: Bearer $SENTRY_API_TOKEN" \
 -H "Content-Type: application/json" \
 -d "{\"issueId\": \"{NUMERIC_ISSUE_ID}\", \"webUrl\": \"https://app.clickup.com/t/{task_id}\", \"project\": \"Sentry Issues\", \"identifier\": \"{task_id}\"}"

If SENTRY_API_TOKEN is not set, skip this step and log "Skipped Sentry link — SENTRY_API_TOKEN not set".

## Step 10 — Summary

✅ Sentry AI Fix — {date}

Issue: {ISSUE_ID} — {title}
Users: {N} affected
Type: {classification}
Confidence: {X}%
Effort: {N} pt

ClickUp: https://app.clickup.com/t/{task_id}
Branch: {branch_name}
PR: {pr_url}
Sentry: linked ✓

Next: review the PR and merge. Sentry auto-resolves on merge.

```

- [ ] **Step 3: Verify schedule registered**

```

/schedule list

```

Expected: entry for "every Monday at 9:00 AM" visible.

---

## Completion Checklist

- [ ] `docs/ai-specs/estimation/INDEX.md` — created, frontmatter valid
- [ ] `docs/ai-specs/estimation/rubric.md` — created with 4-dimension scoring table
- [ ] `scripts/lint/doc-governance-check.js` — runs clean on both domains locally
- [ ] `.github/workflows/doc-governance.yaml` — created, watches `docs/ai-specs/**`
- [ ] `observability-lint.yaml` — no ai-specs path, no spec governance steps
- [ ] `spec-governance.test.js` — deleted, zero CI references remaining
- [ ] Each team member has the Monday 9AM schedule set up in Claude Code
```
