# Confluence Export

Local mirror of Castlery EC space design docs (Confluence → Markdown).

## Structure

- `pages/` — one Markdown file per Confluence page (`{pageId}-{slug}.md`)
- `manifest.json` — machine-readable index (domain, parent, `hasBody`, Joyboy mappings)
- `INDEX.md` — hierarchical + domain-grouped navigation
- `knowledge-graph.md` — architecture layers and reading paths

## Refresh

1. Fetch pages via Atlassian MCP `getConfluencePage` (cloudId: `castlery.atlassian.net`, contentFormat: `markdown`).
2. Save responses to `.responses/batch-NNN.json` as `{ "pages": [ ... ] }`.
3. Run:

```bash
node scripts/build-confluence-export.mjs
```

## Frontmatter

Each page includes `confluence_id`, `title`, `status`, `parent_id`, `depth`, `domain`, `web_url`, optional `local_joyboy_doc` and `blog_post` when mapped.

## Skipped

Whiteboard entries (not exportable as markdown pages): IDs 3272310798, 3298361382.
