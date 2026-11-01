import { test } from "node:test";
import assert from "node:assert/strict";
import { loadLegacyContent, mergePublicContent, assertPublicContentPreserved, publicRoutes } from "./legacy-content.mjs";
import { validateSource } from "./published-source.mjs";

const old = {
  posts: [{ slug: "old", title: "Original", categorySlug: "technical", contentMarkdown: "Original body" }],
  categories: [{ slug: "technical", name: "工程札记", description: "Keep me" }],
  collections: [{ slug: "legacy", noindex: true, items: [{ slug: "chapter", contentMarkdown: "Keep chapter" }] }],
};
const empty = { posts: [], categories: [], assets: new Map() };

test("a one-note or empty D1 snapshot retains old posts, categories and noindex collections", () => {
  const merged = mergePublicContent(old, { ...empty, posts: [{ slug: "new", categorySlug: "architecture" }], categories: [{ slug: "architecture", name: "架构" }] });
  assert.equal(merged.posts.length, 2);
  assert.deepEqual(merged.posts[0], old.posts[0]);
  assert.deepEqual(merged.collections, old.collections);
  assert.equal(merged.collections[0].noindex, true);
  assert.equal(merged.categories[0].publishedCount, 1);
  assert.equal(merged.categories[1].publishedCount, 1);
  assert.doesNotThrow(() => assertPublicContentPreserved(mergePublicContent(old, empty), merged));
  assert.deepEqual(mergePublicContent(old, empty).posts, old.posts);
});

test("an explicit D1 edit updates the same route without duplicates", () => {
  const merged = mergePublicContent(old, { ...empty, posts: [{ ...old.posts[0], contentMarkdown: "Edited" }] });
  assert.equal(merged.posts.length, 1);
  assert.equal(merged.posts[0].contentMarkdown, "Edited");
  assert.equal(merged.categories[0].publishedCount, 1);
});

test("losing an earlier Cloudflare article or legacy collection blocks publication", () => {
  const previous = mergePublicContent(old, { ...empty, posts: [{ slug: "cloud", categorySlug: "technical" }] });
  assert.throws(() => assertPublicContentPreserved(previous, mergePublicContent(old, empty)), /posts\/cloud/);
  assert.throws(() => assertPublicContentPreserved(mergePublicContent(old, empty), { ...old, collections: [] }), /legacy\/chapter/);
  assert.ok(publicRoutes(previous).includes("legacy/chapter"));
});

test("legacy sources require an immutable commit in archived inputs", async () => {
  await assert.rejects(loadLegacyContent("main"), /Invalid legacy/);
  const snapshot = { jobId: "job", publicationId: 1, manifest: { revision: 2 } };
  assert.throws(() => validateSource({ version: 1, kind: "snapshot", siteUrl: "https://test", snapshot, legacyContentRef: "main" }, "https://test", { jobId: "job", publicationId: 1, revision: 2 }), /legacy content commit/);
});
