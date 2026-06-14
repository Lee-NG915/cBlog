# Document Freshness — Metadata Update Rule

**Canonical source. Loaded via AGENTS.md → @include chain (CLAUDE.md → AGENTS.md → this file). Mirrored for Cursor in .cursor/rules/doc-freshness.mdc.**

When editing any file that contains YAML frontmatter, update its metadata fields in the same edit.
No reminder needed — this applies automatically every time, for any AI tool or human editor.

---

## Required Updates on Edit

| Field           | Action                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------- |
| `last-reviewed` | Set to today's date (YYYY-MM-DD)                                                          |
| `last-modified` | Set to today's date (YYYY-MM-DD)                                                          |
| `updated_at`    | Set to today's date (YYYY-MM-DD)                                                          |
| `version`       | Increment patch (1.0.0 → 1.0.1) for content edits; minor (1.0.0 → 1.1.0) for new sections |
| `owner`         | Do NOT change unless the user explicitly asks                                             |
| `status`        | Do NOT change unless the user explicitly asks                                             |

---

## How to Apply

1. Before editing any `.md` / `.mdx` file, read the first 10 lines to check for YAML frontmatter.
2. If any of the above fields exist, update them **in the same Edit call** — not as a separate step.
3. If both `last-reviewed` and `version` exist, update both.

---

## Example

```yaml
# Before
---
status: accepted
version: 1.0.0
owner: jasper.zhang
last-reviewed: 2026-01-10
---
# After editing content
---
status: accepted
version: 1.0.1
owner: jasper.zhang
last-reviewed: 2026-04-16
---
```

---

## Scope

Applies to all documentation files committed to this repo:

- `docs/ai-specs/**/*.md`
- `docs/**/*.md`
- `.agents/**/*.md`
- Any other `.md` / `.mdx` with YAML frontmatter

Does **not** apply to:

- Source code files (`.ts`, `.tsx`, `.js`, etc.)
- Auto-generated files (`node_modules`, `.next`, `dist`)
- Files without frontmatter
