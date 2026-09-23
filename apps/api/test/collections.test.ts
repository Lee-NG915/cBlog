import { test } from "node:test";
import assert from "node:assert/strict";
import { database } from "../../../scripts/knowledge/local-db.mjs";
import {
  collectionSeeds,
  collectionTopic,
  seedCollections,
} from "../../../scripts/knowledge/collection-seeds.mjs";

test("collection migration preserves source order, references and owner changes on repeat import", () => {
  const { sqlite } = database(":memory:");
  try {
    const notes = [
      {
        id: "addx-arch",
        slug: "01",
        title: "架构",
        metadata: { order: 1 },
        source: "content/collections/addx-ai/01.md",
      },
      {
        id: "addx-index",
        slug: "index",
        title: "复习索引",
        metadata: { order: 0 },
        source: "content/collections/addx-ai/index.md",
      },
      {
        id: "rc-intro",
        slug: "01",
        title: "自我介绍",
        metadata: { order: 1 },
        source: "content/collections/rightCapital/01.md",
      },
    ];
    for (const n of notes)
      sqlite
        .prepare(
          "INSERT INTO notes(id,slug,title,updated_at,mutation_id,mutation_hash) VALUES(?,?,?,'2026-09-23',?,?)",
        )
        .run(n.id, n.id, n.title, n.id, n.id);
    seedCollections(sqlite, notes);
    const ids = (group: string) =>
      sqlite
        .prepare(
          "SELECT note_id FROM memberships WHERE group_id=? ORDER BY position",
        )
        .all(group)
        .map((r: any) => r.note_id);
    assert.deepEqual(ids("addx-ai-project"), ["addx-index", "addx-arch"]);
    assert.deepEqual(ids("rightCapital-project"), ["rc-intro"]); // identical legacy slug does not collide
    assert.equal(sqlite.prepare("SELECT count(*) AS n FROM notes").get().n, 3);
    assert.equal(
      sqlite
        .prepare("SELECT count(*) AS n FROM notes WHERE visibility='owner'")
        .get().n,
      3,
    );
    sqlite.exec(
      "UPDATE memberships SET position=10-position WHERE group_id='addx-ai-project'; DELETE FROM memberships WHERE group_id='addx-ai-path'; UPDATE groups SET name='我的路径' WHERE id='addx-ai-path';",
    );
    seedCollections(sqlite, notes);
    assert.deepEqual(ids("addx-ai-project"), ["addx-arch", "addx-index"]);
    assert.deepEqual(ids("addx-ai-path"), []);
    assert.equal(
      sqlite.prepare("SELECT name FROM groups WHERE id='addx-ai-path'").get()
        .name,
      "我的路径",
    );
  } finally {
    sqlite.close();
  }
});

test("collection topic overrides are scoped to source; personal growth is not marketing", () => {
  assert.equal(
    collectionTopic("content/collections/addx-ai/14.md", "growth"),
    "learning",
  );
  assert.equal(
    collectionTopic("content/collections/rightCapital/08.md", "08"),
    "observability",
  );
  assert.equal(
    collectionTopic("content/collections/another/14.md", "growth"),
    undefined,
  );
  for (const seed of collectionSeeds)
    assert.equal(new Set(seed.sequence).size, seed.sequence.length);
});
