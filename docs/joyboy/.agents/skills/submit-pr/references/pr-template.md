# PR Body Template (Submit PR)

When creating or updating a PR, the body must include the following sections. Fill in `## 🔗 related pr & ticket` according to the conventions below (two formats).

## Full Template (with placeholders)

```markdown
## 🤔 what this PR does？

<Summary of changes in this PR, derived from commits or ClickUp task description>

## ✔️ how to verify it?

<Verification steps: 1. 2. 3. …>

## 💻 preview link or screenshot

(Optional: staging preview link or screenshot)

## 🔗 related pr & ticket

<Use one of the two formats below depending on whether task_id is available>

## 🗒️ Special notes for reviews

<Optional notes for reviewers>

## ☑️ checklist

⚠️ Please self-review and check all items. ⚠️

- [x] Self-tested; verified in local or preview environment
- [x] No new console errors or lint errors
- [x] Follows existing code style and PR conventions
- [x] done
```

## related pr & ticket Formats

### With task_id (CU-xxx found in branch name)

- Ticket link uses **# + task_id**, consistent with `[#<task_id>]` in the title.
- Example: `[#86ewnt3pc](https://app.clickup.com/t/86ewnt3pc)`.

```markdown
## 🔗 related pr & ticket

- Ticket: [#<task_id>](https://app.clickup.com/t/<task_id>)
- Branch: `<branch_name>` (current branch name, wrapped in backticks)
```

### Without task_id (no CU-xxx in branch name)

```markdown
## 🔗 related pr & ticket

- Ticket: (no linked ClickUp task or CU-xxx not found in branch name)
- Branch: `<branch_name>` (current branch name, wrapped in backticks)
```

## Section Reference

| Section                    | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| what this PR does          | One sentence or bullet points summarizing what this PR does |
| how to verify it           | How to verify (environment, steps, expected result)         |
| preview link or screenshot | Optional: staging link or screenshot                        |
| related pr & ticket        | Required: use one of the two formats above                  |
| Special notes for reviews  | Optional: special notes for reviewers                       |
| checklist                  | Self-review items, all must be checked                      |
