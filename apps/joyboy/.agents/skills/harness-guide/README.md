# Harness Guide — Governance Framework Setup & Audit

Interactive guide for applying the 8-component Harness Engineering Paradigm to any codebase domain.

## Usage

/harness-guide # Interactive — asks which domain
/harness-guide audit observability # Audit existing domain
/harness-guide setup module-boundary # Start new harness for module boundary
/harness-guide checklist # Print 14-item checklist

## The 8 Components

1. **Spec** — What does correct look like?
2. **Static** — Machine catches it at write time (ESLint)
3. **Dynamic** — Tests verify at runtime
4. **Gate** — Block violations before merge (CI + pre-commit)
5. **Feedback** — Right person knows about violations
6. **Evaluation** — Quantitative compliance metrics
7. **Knowledge** — Documentation for maintainers
8. **Evolution** — Safe rule change process

## Reference Implementation

Observability module (v2.2) is the canonical 8/8 example. See `docs/ai-specs/observability/INDEX.md`.

## Related

- Observability harness: `.agents/skills/alert-harness/`
- ESLint plugin: `tools/eslint-plugin-observability/`
- Confluence: [Observability Harness 工程范式](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914072196)
