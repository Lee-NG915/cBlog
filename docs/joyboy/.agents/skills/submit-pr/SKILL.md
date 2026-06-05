---
name: submit-pr
description: Use when the user requests "submit PR", "create PR", "open a PR", "raise a PR for current branch", or similar. Creates or updates a GitHub PR following conventions: parses ClickUp task ID from branch name, auto-fills "related pr & ticket" with clickable links, and generates a title in the format (feat/fix + [#<task_id>] + task title).
---

# Submit PR

Create or update a Pull Request following conventions: parse the ClickUp task ID from the branch name, generate a title with `[#<task_id>]`, include a clickable Ticket link, and fill in the complete PR body template.

## Conventions

- **ClickUp task URL**: `https://app.clickup.com/t/{task_id}` (always uses `t`).
- **Branch parsing**: extract `task_id` from the branch name using regex `CU-([a-zA-Z0-9]+)` (e.g. `jasper-zhang/CU-86ewnt3pc/xxx` → `86ewnt3pc`).
- **PR title**: `{type}: [#<task_id>] {clickup_task_title}`. Brackets contain **# + task ID**. `type` is **fix** (if Bug-type task) or **feat** (default); fall back to **feat** if task lookup fails or no task ID found.

## Steps

### 1. Get current branch

Run `git branch --show-current` to get `branch_name`.

### 2. Parse ClickUp task ID

Match `CU-([a-zA-Z0-9]+)` from `branch_name`: if matched, the capture group is `task_id`; if not matched, `task_id` is empty and the Ticket line in related section can read "(no linked ClickUp task)".

### 3. Assemble "related pr & ticket"

- With `task_id`: `- Ticket: [#<task_id>](https://app.clickup.com/t/<task_id>)`, `- Branch: \`branch_name\``.
- Without `task_id`: `- Ticket: (no linked ClickUp task or CU-xxx not found in branch name)`, `- Branch: \`branch_name\``.

See **`references/pr-template.md`** for the full body template and placeholders.

### 4. PR body template

Body must include: 🤔 what this PR does?, ✔️ how to verify it?, 💻 preview link or screenshot, 🔗 related pr & ticket (from step 3), 🗒️ Special notes for reviews, ☑️ checklist (at least `- [x] done`). See **`references/pr-template.md`** for full structure and examples.

### 5. Title: feat/fix and task title

**5a. Fetch task info**

- If `task_id` exists, call **ClickUp MCP** `clickup_get_task(task_id)` or run `node ~/.cursor/skills/clickup/query.mjs get <task_id>`.
- Use the returned task `name` as `clickup_task_title`.
- **Determine type**: use **fix** if any of the following, otherwise **feat**:
  1. Task `tags` contains an entry with `name` equal to `bug` (case-insensitive);
  2. Custom field "What Type of Request is this?" or a field containing "Type"/"Request" has value **Bug**;
  3. Task `name` contains `fix` or `bug` (case-insensitive).
- If lookup fails or no `task_id`: default `type` to **feat**, use branch name or a placeholder as `clickup_task_title`.

**5b. Final title**

- Has `task_id` and title obtained: `{type}: [#<task_id>] {clickup_task_title}` (**# is required before task_id**).
- Has `task_id` but title unavailable: `{type}: [#<task_id>]`.
- No `task_id`: `feat: <short description>`.

### 6. Create or update PR

- **Create**: `gh pr create --base <base_branch> --head <current_branch> --title "<title from 5b>" --body "<full body>"`.
- **Update**: `gh pr edit <pr_number> --title "<title>" --body "<full body>"` (omit `--title` if only updating body).

First run `gh repo view --json defaultBranchRef -q .defaultBranchRef.name` to get the default branch as `base_branch` (usually `master` or `main`).

## Summary

1. `git branch --show-current` → `branch_name`.
2. Match `CU-(\w+)` from branch name → `task_id`.
3. Task link: `https://app.clickup.com/t/{task_id}`; Ticket line: `[#<task_id>](url)`, Branch line: \`branch_name\`.
4. Fetch task name via ClickUp and determine feat/fix; title format: `{type}: [#<task_id>] {clickup_task_title}`.
5. Run `gh pr create` or `gh pr edit` with the title and fully filled body template.

## References

- **`references/pr-template.md`**: Full PR body template, both related pr & ticket formats, and section descriptions. Refer to this file when filling in the body.
