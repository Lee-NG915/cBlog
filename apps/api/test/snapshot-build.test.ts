import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prepareSnapshot } from "../../../scripts/knowledge/snapshot-build.mjs";
const note = (id: string, body: string) => ({
  id,
  slug: id,
  title: id,
  body,
  topic_id: "engineering",
  topic_name: "工程",
  tags: [],
  updated_at: "2026-09-23T00:00:00Z",
});
const snap = (notes: unknown[]) => ({
  jobId: "test-job",
  publicationId: 1,
  manifest: { revision: 4, notes },
});
test("snapshot adapter rewrites real links, preserves code and checks image hashes", async () => {
  const bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]),
    id = createHash("sha256").update(bytes).digest("hex");
  const model = await prepareSnapshot(
    snap([
      note(
        "a",
        `[B](/#note=b&section=heading)\n![image](/api/v1/assets/${id})\n\n\`/#note=private\``,
      ),
      note("b", "target"),
    ]),
    { basePath: "/cBlog", assetLoader: async () => bytes },
  );
  assert.match(model.posts[0].contentMarkdown, /\/cBlog\/posts\/b\/#heading/);
  assert.match(model.posts[0].contentMarkdown, /`\/#note=private`/);
  assert.equal(model.categories[0].publishedCount, 2);
  assert.match(
    model.posts[0].contentMarkdown,
    /\/knowledge-media\/[a-f0-9]+\.png/,
  );
  assert.equal(model.assets.size, 1);
  await assert.rejects(
    prepareSnapshot(snap([note("a", `![image](/api/v1/assets/${id})`)]), {
      assetLoader: async () => Buffer.from("wrong"),
    }),
    /checksum/,
  );
});
test("private links, unmigrated links and duplicate routes stop the build", async () => {
  await assert.rejects(
    prepareSnapshot(snap([note("a", "[private](/#note=secret)")])),
    /private/,
  );
  await assert.rejects(
    prepareSnapshot(snap([note("a", "[old](./old.md)")])),
    /Unmigrated/,
  );
  await assert.rejects(
    prepareSnapshot(snap([note("a", "x"), note("a", "y")])),
    /duplicate/,
  );
  const model = await prepareSnapshot(snap([]));
  assert.equal(model.posts.length, 0); // full withdrawal can build an empty site
});

test("public references resolve legacy links, retained categories survive an empty snapshot, and excerpts omit tables", async () => {
  const s: any = snap([
    note(
      "a",
      "A useful paragraph.\n\n| Header | Count |\n| --- | --- |\n| Row | 2 |\n\n[Legacy](/#note=legacy)",
    ),
  ]);
  s.manifest.references = [{ id: "legacy", route: "legacy/chapter" }];
  s.manifest.categories = [{ slug: "old-category", name: "Old category" }];
  const m = await prepareSnapshot(s, { basePath: "/cBlog" });
  assert.match(m.posts[0].contentMarkdown, /\/cBlog\/legacy\/chapter/);
  assert.ok(
    m.categories.some(
      (c: any) => c.slug === "old-category" && c.publishedCount === 0,
    ),
  );
  assert.equal(m.posts[0].excerpt.includes("|"), false);
  s.manifest.withdrawals = [{ id: "legacy", route: "legacy/chapter" }];
  await assert.rejects(prepareSnapshot(s), /private or missing/);
});
