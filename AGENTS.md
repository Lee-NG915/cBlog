# AGENTS.md

## Cursor Cloud specific instructions

**cBlog** is a Next.js 14 static blog (TypeScript + Tailwind CSS). It reads Markdown files from `content/posts/` and exports static HTML via `output: "export"`. No backend, database, or external services are required.

### Commands

Standard commands are in `package.json`:

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (port 3000) |
| Build | `pnpm build` (outputs to `out/`) |
| Lint | `pnpm lint` |

### Notes

- There is no test framework configured (no jest/vitest/playwright). `pnpm lint` is the only automated check.
- Lint produces two `@next/next/no-img-element` warnings in `MobileDrawer.tsx` and `Sidebar.tsx`; these are expected and non-blocking.
- `BASE_PATH` env var is only needed for GitHub Pages subpath deployments, not for local dev.
- `pnpm install` may warn about ignored build scripts for `unrs-resolver`; this is safe to ignore.
