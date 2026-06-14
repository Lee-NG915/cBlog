---
name: harness-guide
description: >
  Guide developers through the 8-component Harness Engineering Paradigm for setting up
  governance in a new codebase domain. Use when: creating governance for module boundary,
  design system, performance budget, i18n, or test coverage; understanding the existing
  Observability harness as reference; or auditing whether a domain's governance is complete.
  Triggers on: "harness", "governance", "治理", "工程范式", "set up linting for X",
  "add compliance for X", "harness guide".
version: 1.0.0
---

# Harness Engineering Guide — 8-Component Governance Framework

A harness is a multi-layered system that enforces architectural correctness across a codebase domain. It
prevents violations at every stage: coding → committing → PR → production.

---

## The 8 Components

| #   | Component      | Question it answers                     | Observability example                                                                             |
| --- | -------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | **Spec**       | What does correct look like?            | `docs/ai-specs/observability/INDEX.md` + 5 spec files                                             |
| 2   | **Static**     | Can the machine catch it at write time? | `tools/eslint-plugin-observability/` — 8 AST-level rules                                          |
| 3   | **Dynamic**    | Can tests verify it at runtime?         | `hooks/web/client-before-send.spec.ts` + `apps/web-e2e/src/sentry/` E2E                           |
| 4   | **Gate**       | Can we block violations before merge?   | lint-staged + `.github/workflows/observability-lint.yaml` + CODEOWNERS                            |
| 5   | **Feedback**   | Does the right person know?             | ESLint IDE red underlines + CI PR comments (upsert) + AI remediation loop (if skill has auto-fix) |
| 6   | **Evaluation** | How compliant are we, quantitatively?   | `coverage-scan.sh` + `metrics/baseline.json` + PR comment delta                                   |
| 7   | **Knowledge**  | Can someone new maintain this?          | CLAUDE.md + AGENTS.md + README + CONTRIBUTING + CHANGELOG + INDEX                                 |
| 8   | **Evolution**  | How do we change the rules safely?      | CONTRIBUTING checklist + CI version bump + Change Protocol                                        |

---

## Interactive Flow

When a user asks to set up harness for domain X, follow these steps:

### Step 1 — Assess current state

Ask: "Which domain are you harnessing?" (e.g., module-boundary, design-system, performance, i18n, test-coverage)

Then scan the codebase:

```bash
rg "eslint-plugin-{domain}" .
ls .github/workflows/{domain}* 2>/dev/null
ls docs/ai-specs/{domain}/ 2>/dev/null
rg -i "{domain}" CLAUDE.md AGENTS.md
```

Report which of the 8 components exist vs missing. Use the checklist in Step 5.

### Step 2 — Phase 1: Minimal Loop (Spec + Static + Gate)

These 3 components form the minimum viable harness — enough to **stop new violations**.

Guide the user to create:

**Spec:**

```
docs/ai-specs/{domain}/
├── INDEX.md         ← Spec registry + status definitions + change protocol
└── {rule-name}.md   ← At least one rule definition ("what is correct")
```

Template INDEX.md frontmatter:

```yaml
---
status: accepted
owner: { github-username }
last-reviewed: { today's date YYYY-MM-DD }
---
```

**Static:**

- If rules are simple (pattern ban, import restriction): use no-restricted-syntax or no-restricted-imports in `.eslintrc.json`
- If rules need AST analysis: create `tools/eslint-plugin-{domain}/` following the observability plugin structure
- Each rule needs: `rules/{name}.js` + `tests/rules.test.js` entries + `.eslintrc.json` config

**Gate:**

- Create `.github/workflows/{domain}-lint.yaml` — copy structure from observability-lint.yaml
- Add to lint-staged if not already
- Add CODEOWNERS entry for spec files

### Step 3 — Phase 2: Sustainability (Knowledge + Evolution)

These make the harness maintainable by others.

`tools/eslint-plugin-{domain}/CONTRIBUTING.md` ← Change checklist (copy from observability)  
`tools/eslint-plugin-{domain}/CHANGELOG.md` ← Version history  
`AGENTS.md` § {Domain} ← Hard rules + pointers (all agents; CLAUDE.md delegates via `@AGENTS.md`)

### Step 4 — Phase 3: Quantification (Dynamic + Evaluation + Feedback)

These produce numbers for management.

- Coverage scan script → `scripts/{domain}/coverage-scan.sh`
- Baseline → `tools/eslint-plugin-{domain}/metrics/baseline.json`
- CI PR comment (upsert) → add step in workflow yaml
- Tests if applicable → unit tests + E2E

### Step 5 — Validate completeness

Run this checklist and report status:

[ ] 1. Spec: docs/ai-specs/{domain}/INDEX.md exists  
[ ] 2. Spec: ≥1 rule definition file exists  
[ ] 3. Static: ESLint rules or config active  
[ ] 4. Gate: CI workflow blocks violations on PR  
[ ] 5. Gate: lint-staged runs on commit  
[ ] 6. Knowledge: CONTRIBUTING.md with change checklist  
[ ] 7. Knowledge: CHANGELOG.md with version history  
[ ] 8. Evolution: CI checks version bump on spec changes  
[ ] 9. AGENTS.md: has {domain} hard rules or pointers (CLAUDE.md delegates via `@AGENTS.md`)  
[ ] 10. AGENTS.md: has {domain} automated enforcement section  
[ ] 11. Dynamic: coverage scan or test suite exists  
[ ] 12. Evaluation: baseline.json + CI PR comment with delta  
[ ] 13. Feedback: IDE real-time + CI PR comment  
[ ] 14. CODEOWNERS: reviewer assigned for spec files

Score: {count}/14

---

Candidate Domains

| Domain                   | Existing basis                                      | Missing                        | Effort |
| ------------------------ | --------------------------------------------------- | ------------------------------ | ------ |
| Module Boundary          | @nx/enforce-module-boundaries (Static ✅ + Gate ✅) | Spec, Knowledge, Evaluation    | Low    |
| Design System (Fortress) | None                                                | All 8                          | Medium |
| Performance Budget       | web:analyze command exists                          | Static, Gate, Evaluation       | Medium |
| Test Coverage            | Jest exists                                         | Gate (threshold), Evaluation   | Low    |
| i18n                     | i18n package exists                                 | Static (hardcode detect), Gate | Low    |

Recommended next: Module Boundary — already has Static + Gate, only needs Spec + Knowledge + Evaluation.

---

## AI Remediation Loop (for skills with auto-fix)

If a domain skill includes automatic code fix capability, it must implement a bounded remediation loop. Reference pattern: `.agents/skills/alert-harness/SKILL.md` § Remediation Loop.

Required elements:

- **Batch first**: apply all fixes before any verification runs
- **Bounded**: max 3 attempts; each attempt must produce a non-empty diff
- **Verify gate**: lint (always) → runtime test (only if fix affects observable output)
- **ESCALATE exit**: after max attempts, output a structured failure report — never silently claim success

Always-on general development self-check (outside skill context) goes in `.agents/rules/` and is loaded via AGENTS.md @include (CLAUDE.md delegates via `@AGENTS.md`). Reference: `.agents/rules/observability-self-check.md`.

---

Anti-patterns

- Do NOT duplicate spec content across multiple files — single source of truth + pointers
- Do NOT create error-level rules for code under active migration — use warn first
- Do NOT add coverage gates that block PRs — use informational PR comments
- Do NOT skip Phase 1 for Phase 3 — you need rules before you can measure compliance
- Do NOT implement auto-fix in a skill without a remediation loop — fix without verify is incomplete
