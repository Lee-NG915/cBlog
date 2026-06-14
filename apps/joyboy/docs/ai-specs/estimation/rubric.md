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
