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
