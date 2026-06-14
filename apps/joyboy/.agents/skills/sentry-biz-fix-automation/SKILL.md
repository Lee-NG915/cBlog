---
name: sentry-biz-fix-automation
description: >
  Use when an EC-FE team member wants to set up their personal weekly Sentry
  business-issue auto-fix scheduled task, or asks how to initialize the
  sentry-biz-fix routine. Outputs a personalized prompt ready to paste into
  Claude Code Routines — does not create anything automatically.
---

# sentry-biz-fix-automation

Generates a personalized routine prompt for the requesting team member and
provides step-by-step instructions to register it as a Local routine in Claude
Code.

## Hard Constraints

- **Do NOT create project files** — no docs, no SKILL.md, no config files in the repo
- **Do NOT run `/schedule`** — that creates a remote routine; this routine must be Local
- **Do NOT execute CronCreate** — the user registers the routine manually in the UI
- Writing to system env files (`~/.zshrc`, `~/.bashrc`) is allowed in Step 1b

Safe to invoke from any agent (Codex, Cursor, Claude Code).

Background spec: `docs/superpowers/specs/2026-06-02-sentry-ai-fix-routine-design.md`

---

## Step 1 — Read GitHub username from local config

Run:

```bash
gh api user --jq .login
```

This is the only value needed for personalization — it goes into the branch name.
Sentry auth is handled by the MCP token (`assigned:me` query); no email needed.

## Step 1b — Set up SENTRY_API_TOKEN (if not already set)

Check if the token is already configured:

```bash
echo $SENTRY_API_TOKEN
```

If **empty**, ask the user:

> "Do you have a Sentry user auth token to set up? (paste it, or press Enter to skip)"

If the user provides a token:

1. Detect the shell and write the token (avoid duplicates):

   **macOS (zsh):**

   ```bash
   grep -q "SENTRY_API_TOKEN" ~/.zshenv \
     || echo 'export SENTRY_API_TOKEN=<provided_token>' >> ~/.zshenv
   source ~/.zshenv
   ```

   **Linux (bash):**

   ```bash
   grep -q "SENTRY_API_TOKEN" ~/.bash_profile \
     || echo 'export SENTRY_API_TOKEN=<provided_token>' >> ~/.bash_profile
   source ~/.bash_profile
   ```

   **Windows (PowerShell):**

   ```powershell
   if (-not (Select-String -Path $PROFILE -Pattern "SENTRY_API_TOKEN" -Quiet 2>$null)) {
     Add-Content $PROFILE "`$env:SENTRY_API_TOKEN='<provided_token>'"
   }
   . $PROFILE
   ```

2. Confirm: `echo "✓ SENTRY_API_TOKEN set"` (Windows: `Write-Host "✓ SENTRY_API_TOKEN set"`)

If the user skips, continue — Step 9 of the routine will self-skip when the var is unset.

## Step 1c — Set up CLICKUP_API_TOKEN (if not already set)

Sprint points cannot be set via ClickUp MCP or `cup` CLI — a direct REST API call is required.

Check if the token is already configured:

```bash
echo $CLICKUP_API_TOKEN
```

If **empty**, ask the user:

> "Do you have a ClickUp API token? It's needed to set sprint points on tasks. (paste it, or press Enter to skip)"

If the user provides a token:

1. Detect the shell and write the token (avoid duplicates):

   **macOS (zsh):**

   ```bash
   grep -q "CLICKUP_API_TOKEN" ~/.zshenv \
     || echo 'export CLICKUP_API_TOKEN=<provided_token>' >> ~/.zshenv
   source ~/.zshenv
   ```

   **Linux (bash):**

   ```bash
   grep -q "CLICKUP_API_TOKEN" ~/.bash_profile \
     || echo 'export CLICKUP_API_TOKEN=<provided_token>' >> ~/.bash_profile
   source ~/.bash_profile
   ```

   **Windows (PowerShell):**

   ```powershell
   if (-not (Select-String -Path $PROFILE -Pattern "CLICKUP_API_TOKEN" -Quiet 2>$null)) {
     Add-Content $PROFILE "`$env:CLICKUP_API_TOKEN='<provided_token>'"
   }
   . $PROFILE
   ```

2. Confirm: `echo "✓ CLICKUP_API_TOKEN set"` (Windows: `Write-Host "✓ CLICKUP_API_TOKEN set"`)

If the user skips, continue — sprint points will be skipped in Step 5, all other steps run normally.

## Step 2 — Generate personalized prompt

Read `references/prompt-template.md` (relative to this skill's directory).

No pre-substitution needed — GitHub username and Sentry credentials are resolved at runtime inside the prompt itself.

Working directory is set in the Routines panel — do not add it to the prompt.

**Branch naming convention (for awareness):**
Branches follow `{github_username}/CU-{task_id}/Auto-fix-Sentry-{ISSUE_ID}` so the PR-merged automation routine can detect them and auto-update ClickUp status to `ready for release`.

## Step 3 — Output setup instructions

Print the following, then append the fully substituted prompt:

```
Open Claude Code → Routines panel → New routine → Local

Fill in:
  Name:        sentry-biz-fix-{username}
  Description: Weekly Sentry Biz Fix — {username}
  Schedule:    Every Monday at 9:03 AM

Prompt: (copy everything below)
─────────────────────────────────────
{personalized prompt here}
─────────────────────────────────────
```

## Step 4 — Confirm ready

Print a summary of what was set up:

```
✓ GitHub username: {username}
✓ SENTRY_API_TOKEN: {set / not set — Step 9 will be skipped}
✓ CLICKUP_API_TOKEN: {set / not set — sprint points in Step 5 will be skipped}

Routine is ready to register. See instructions above.
```
