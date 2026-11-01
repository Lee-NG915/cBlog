import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSnapshot } from "./snapshot-build.mjs";

const source = readFileSync("docs/knowledge-platform/examples/storefront-monorepo-architecture.md", "utf8");
const [heading, ...lines] = source.split("\n");
const slug = "storefront-monorepo-architecture";
const note = { id: slug, slug, title: heading.replace(/^# /, ""), body: lines.join("\n").trim(),
  topic_id: "architecture", topic_name: "架构与工程实践", tags: ["Monorepo"], updated_at: "2026-11-01T00:00:00Z" };
const siteUrl = "https://example.invalid/cBlog";
const legacyContentRef = process.env.TEST_BASE_SHA;
assert.match(legacyContentRef ?? "", /^[a-f0-9]{40}$/);
await buildSnapshot({ jobId: "ci-check", publicationId: 1, manifest: { revision: 1, notes: [note] } }, {
  siteUrl, basePath: "/cBlog", legacyContentRef,
  previousSource: { version: 1, kind: "legacy", siteUrl, contentRef: legacyContentRef },
});
const inventory = JSON.parse(readFileSync(".frontend/content-inventory.json", "utf8"));
assert.ok(inventory.posts.length > 1 && inventory.collections.some((c) => c.noindex && c.items.length));
assert.ok(readFileSync(`apps/web/out/posts/${slug}/index.html`, "utf8").includes(note.title));
