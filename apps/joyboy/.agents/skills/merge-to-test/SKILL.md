---
name: merge-to-test
description: >
  Merge the current feature branch into one or more test or UAT environment branches.
  Use when the user says "merge to test", "合并到测试环境", "push to test-sg", "合并 uat-us",
  "合并到 uat", or invokes /merge-to-test. Supports test-sg/uk/us/au/ca and uat-sg/uk/us/au/ca.
---

# Merge to Test

Merge the current feature branch into test or UAT environment branches, with AI-assisted conflict resolution.

## Available environments

| Branch  | Region                |
| ------- | --------------------- |
| test-sg | Singapore (test)      |
| test-uk | United Kingdom (test) |
| test-us | United States (test)  |
| test-au | Australia (test)      |
| test-ca | Canada (test)         |
| uat-sg  | Singapore (UAT)       |
| uat-uk  | United Kingdom (UAT)  |
| uat-us  | United States (UAT)   |
| uat-au  | Australia (UAT)       |
| uat-ca  | Canada (UAT)          |

## Step 1 — Pre-flight

Run in parallel:

- `git branch --show-current` → save as `FEATURE_BRANCH`
- `git status --short` → check for uncommitted changes

If uncommitted changes exist, ask the user:

> "You have uncommitted changes. What would you like to do?"

- **Stash** → `git stash push -m "merge-to-test auto-stash"`
- **Commit** → `git add -A && git commit -m "chore: save work before merge-to-test"`
- **Continue anyway** → proceed as-is
- **Abort** → stop

## Step 2 — Determine targets

If `$ARGUMENTS` is empty, print the following and stop:

```
Usage: /merge-to-test <targets>

Test environments:
  test-sg   Singapore
  test-uk   United Kingdom
  test-us   United States
  test-au   Australia
  test-ca   Canada

UAT environments:
  uat-sg    Singapore
  uat-uk    United Kingdom
  uat-us    United States
  uat-au    Australia
  uat-ca    Canada

Shortcuts:
  all       All test environments (test-sg, test-uk, test-us, test-au, test-ca)
  uat       All UAT environments  (uat-sg, uat-uk, uat-us, uat-au, uat-ca)

Examples:
  /merge-to-test test-sg
  /merge-to-test uat-us
  /merge-to-test test-sg test-us
  /merge-to-test uat
  /merge-to-test all
```

### Input normalization

Before proceeding, normalize each argument using this map:

| Input                                                     | Normalized                                                              |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `sg`                                                      | `test-sg`                                                               |
| `uk`                                                      | `test-uk`                                                               |
| `us`                                                      | `test-us`                                                               |
| `au`                                                      | `test-au`                                                               |
| `ca`                                                      | `test-ca`                                                               |
| `all`                                                     | test-sg, test-uk, test-us, test-au, test-ca (process each individually) |
| `uat`                                                     | uat-sg, uat-uk, uat-us, uat-au, uat-ca (process each individually)      |
| `test-sg` / `test-uk` / `test-us` / `test-au` / `test-ca` | unchanged                                                               |
| `uat-sg` / `uat-uk` / `uat-us` / `uat-au` / `uat-ca`      | unchanged                                                               |

### Validation

After normalization, check every target is in the allowed list:
`test-sg`, `test-uk`, `test-us`, `test-au`, `test-ca`, `uat-sg`, `uat-uk`, `uat-us`, `uat-au`, `uat-ca`.

If any target is invalid, print an error and stop:

```
Error: "<value>" is not a valid environment.
Allowed: test-sg, test-uk, test-us, test-au, test-ca, uat-sg, uat-uk, uat-us, uat-au, uat-ca
```

## Step 3 — Run shell script for each target

```bash
bash .agents/skills/merge-to-test/scripts/run.sh "$FEATURE_BRANCH" "<target>"
```

| Exit code | Meaning         | Action                            |
| --------- | --------------- | --------------------------------- |
| 0         | Success         | Record, continue                  |
| 2         | Merge conflicts | Go to Step 4                      |
| 3         | Push rejected   | Report to user, do NOT force-push |
| 4         | Git error       | Show output, skip target          |

## Step 4 — AI conflict resolution (exit code 2 only)

1. Read stdout from `run.sh` — lists conflicted file paths.
2. For each file, read full content including `<<<<<<<` / `=======` / `>>>>>>>` markers.
3. Resolve using this strategy:

| Situation                                | Action                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| New feature / bug fix code               | Take **incoming** (feature branch) side                                                  |
| Test-env config, env vars, feature flags | Keep **HEAD** (test/UAT branch) side                                                     |
| `pnpm-lock.yaml`                         | Delete the lock file, run `pnpm install` to regenerate it, then `git add pnpm-lock.yaml` |
| Both sides changed same business logic   | Ask user — show both sides, await decision                                               |

4. Write resolved content (no conflict markers), then `git add <file>`.
5. `git commit --no-edit` then `git push origin <target>`.
6. Explain what was resolved and how.

## Step 5 — Restore state

- `git checkout "$FEATURE_BRANCH"`
- If auto-stash created: `git stash pop`

## Step 6 — Summary

| Branch  | Result     | Notes                     |
| ------- | ---------- | ------------------------- |
| test-sg | ✅ pushed  | —                         |
| uat-us  | ✅ pushed  | 2 conflicts auto-resolved |
| test-uk | ⚠️ skipped | push rejected             |
