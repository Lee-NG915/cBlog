import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../src/index";
import { hash } from "../src/security";
import { database, localImages } from "../../../scripts/knowledge/local-db.mjs";
import { searchNotes } from "../../knowledge/src/search";

async function setup() {
  const { DB, sqlite } = database(":memory:");
  const dir = mkdtempSync(path.join(tmpdir(), "cblog-api-"));
  const env = {
    DB,
    IMAGES: localImages(dir),
    APP_ENV: "test",
    AI_ENABLED: "false",
  };
  const token = "test-token",
    csrf = "test-csrf";
  await DB.prepare("INSERT INTO sessions VALUES(?,?,?)")
    .bind(await hash(token), csrf, "2099-01-01T00:00:00Z")
    .run();
  sqlite.exec(
    "INSERT INTO groups(id,name,kind) VALUES('domain','领域','domain');INSERT INTO groups(id,name,kind,parent_id) VALUES('topic','主题','topic','domain');INSERT INTO groups(id,name,kind) VALUES('path','路径','path');",
  );
  async function request(
    endpoint: string,
    method = "GET",
    body?: unknown,
    extra: Record<string, string> = {},
  ) {
    return app.fetch(
      new Request("http://localhost" + endpoint, {
        method,
        headers: {
          Cookie: "cblog_local_session=" + token,
          Origin: "http://localhost",
          "X-CSRF-Token": csrf,
          "Content-Type": "application/json",
          ...extra,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      env,
    );
  }
  const create = (id = "note", overrides = {}) =>
    request("/api/v1/notes/" + id, "POST", {
      title: "测试笔记",
      body: "## 正文\n秘密资料",
      topic_id: "topic",
      state: "draft",
      visibility: "owner",
      tags: [],
      expectedVersion: 0,
      clientMutationId: crypto.randomUUID(),
      ...overrides,
    });
  return {
    request,
    create,
    sqlite,
    env,
    close() {
      sqlite.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

test("unauthenticated API denies titles, corpus, exports and assets", async () => {
  const s = await setup();
  try {
    for (const p of ["/corpus", "/groups", "/export", "/assets/x"]) {
      const r = await app.fetch(
        new Request("http://localhost/api/v1" + p),
        s.env,
      );
      assert.equal(r.status, 401);
    }
  } finally {
    s.close();
  }
});
test("production app has no local login bypass", async () => {
  const s = await setup();
  try {
    assert.equal((await s.request("/auth/local", "POST")).status, 404);
  } finally {
    s.close();
  }
});
test("cross origin and missing CSRF cannot mutate", async () => {
  const s = await setup();
  try {
    assert.equal(
      (
        await s.request(
          "/api/v1/groups",
          "POST",
          {},
          { Origin: "https://evil.invalid" },
        )
      ).status,
      403,
    );
    assert.equal(
      (await s.request("/api/v1/groups", "POST", {}, { "X-CSRF-Token": "" }))
        .status,
      403,
    );
  } finally {
    s.close();
  }
});
test("create defaults are explicit and invalid types rejected", async () => {
  const s = await setup();
  try {
    assert.equal((await s.create()).status, 201);
    const n = (await (await s.request("/api/v1/notes/note")).json()).data;
    assert.equal(n.visibility, "owner");
    assert.equal(n.version, 1);
    assert.equal((await s.create("bad", { state: "published" })).status, 422);
  } finally {
    s.close();
  }
});
test("CAS loser leaves no revision or mutation", async () => {
  const s = await setup();
  try {
    await s.create();
    const payload = {
      title: "版本 A",
      body: "A",
      topic_id: "topic",
      state: "draft",
      visibility: "owner",
      tags: [],
      expectedVersion: 1,
      clientMutationId: crypto.randomUUID(),
    };
    const a = await s.request("/api/v1/notes/note", "PATCH", payload);
    const b = await s.request("/api/v1/notes/note", "PATCH", {
      ...payload,
      body: "B",
      clientMutationId: crypto.randomUUID(),
    });
    assert.equal(a.status, 200);
    assert.equal(b.status, 409);
    assert.equal(
      s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n,
      2,
    );
    assert.equal(s.sqlite.prepare("SELECT body FROM notes").get().body, "A");
  } finally {
    s.close();
  }
});
test("retry is idempotent, changed payload rejected", async () => {
  const s = await setup();
  try {
    const id = crypto.randomUUID();
    assert.equal(
      (await s.create("note", { clientMutationId: id })).status,
      201,
    );
    assert.equal(
      (await s.create("note", { clientMutationId: id })).status,
      200,
    );
    assert.equal(
      (await s.create("note", { clientMutationId: id, body: "different" }))
        .status,
      409,
    );
    assert.equal(
      s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n,
      1,
    );
  } finally {
    s.close();
  }
});
test("invalid topic and oversized multibyte body do not save", async () => {
  const s = await setup();
  try {
    assert.equal(
      (await s.create("missing", { topic_id: "no-such-topic" })).status,
      422,
    );
    assert.equal(
      (await s.create("large", { body: "字".repeat(90000) })).status,
      413,
    );
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM notes").get().n, 0);
  } finally {
    s.close();
  }
});
test("corpus pagination uses revision and deletion is filtered", async () => {
  const s = await setup();
  try {
    await s.create();
    const c = await (await s.request("/api/v1/corpus")).json();
    await s.create("new");
    assert.equal(
      (await s.request("/api/v1/corpus?revision=" + c.revision)).status,
      409,
    );
    await s.request("/api/v1/notes/note", "DELETE", { expectedVersion: 1 });
    const next = await (await s.request("/api/v1/corpus")).json();
    assert.equal(next.data.length, 1);
    assert.equal(next.data[0].id, "new");
  } finally {
    s.close();
  }
});
test("path reorder rejects duplicates and stale versions", async () => {
  const s = await setup();
  try {
    await s.create("one");
    await s.create("two");
    assert.equal(
      (
        await s.request("/api/v1/groups/path/items", "PUT", {
          ids: ["two", "one"],
          expectedVersion: 1,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await s.request("/api/v1/groups/path/items", "PUT", {
          ids: ["one"],
          expectedVersion: 1,
        })
      ).status,
      409,
    );
    assert.deepEqual(
      s.sqlite
        .prepare("SELECT note_id FROM memberships ORDER BY position")
        .all()
        .map((x) => x.note_id),
      ["two", "one"],
    );
    assert.equal(
      (
        await s.request("/api/v1/groups/path/items", "PUT", {
          ids: ["one", "one"],
          expectedVersion: 2,
        })
      ).status,
      422,
    );
  } finally {
    s.close();
  }
});
test("image upload refuses fake HTML and MIME mismatch", async () => {
  const s = await setup();
  try {
    const req = new Request("http://localhost/api/v1/assets", {
      method: "POST",
      headers: {
        Cookie: "cblog_local_session=test-token",
        Origin: "http://localhost",
        "X-CSRF-Token": "test-csrf",
        "Content-Type": "image/png",
      },
      body: '<svg onload="evil()"/>',
    });
    assert.equal((await app.fetch(req, s.env)).status, 422);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM assets").get().n, 0);
  } finally {
    s.close();
  }
});
test("snapshot excludes private/draft and is immutable after edits", async () => {
  const s = await setup();
  try {
    await s.create("private");
    await s.create("draft", { visibility: "public" });
    await s.create("public", {
      visibility: "public",
      state: "ready",
      body: "PUBLIC_ONLY",
    });
    const revision = s.sqlite
      .prepare("SELECT corpus_revision r FROM settings")
      .get().r;
    const p = await s.request("/api/v1/publications", "POST", {
      expectedRevision: revision,
    });
    assert.equal(p.status, 201);
    const id = (await p.json()).data.id;
    const manifest = JSON.parse(
      s.sqlite.prepare("SELECT manifest FROM publications WHERE id=?").get(id)
        .manifest,
    );
    assert.equal(manifest.notes.length, 1);
    assert.equal(manifest.notes[0].body, "PUBLIC_ONLY");
    await s.request("/api/v1/notes/public", "DELETE", { expectedVersion: 1 });
    assert.equal(
      JSON.parse(
        s.sqlite.prepare("SELECT manifest FROM publications WHERE id=?").get(id)
          .manifest,
      ).notes[0].body,
      "PUBLIC_ONLY",
    );
    assert.equal(
      (
        await s.request("/api/v1/publications", "POST", {
          expectedRevision: revision,
        })
      ).status,
      409,
    );
  } finally {
    s.close();
  }
});
test("logout invalidates old cookie", async () => {
  const s = await setup();
  try {
    assert.equal((await s.request("/api/v1/session", "DELETE")).status, 200);
    assert.equal((await s.request("/api/v1/corpus")).status, 401);
  } finally {
    s.close();
  }
});
test("AI unavailable is explicit and lexical remains usable", async () => {
  const s = await setup();
  try {
    assert.equal(
      (await s.request("/api/v1/search/answer", "POST", { query: "问题" }))
        .status,
      503,
    );
    assert.equal((await s.request("/api/v1/corpus")).status, 200);
  } finally {
    s.close();
  }
});
test("Chinese aliases find body content while unrelated items do not rank", () => {
  const n = (id: string, title: string, body: string) =>
    ({ id, title, body, tags: "[]" }) as any;
  const result = searchNotes(
    [n("a", "转化优化", "购买漏斗与 paid ads"), n("b", "生活", "散步")],
    "广告有人点但没有下单",
  );
  assert.equal(result[0].note.id, "a");
  assert.equal(result.length, 1);
});
test("rename is versioned and deleting a path leaves notes intact", async () => {
  const s = await setup();
  try {
    await s.create();
    assert.equal(
      (
        await s.request("/api/v1/groups/path", "PATCH", {
          name: "新路径",
          expectedVersion: 1,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await s.request("/api/v1/groups/path/items", "PUT", {
          ids: ["note"],
          expectedVersion: 2,
        })
      ).status,
      200,
    );
    assert.equal(
      (await s.request("/api/v1/groups/path", "DELETE", { expectedVersion: 3 }))
        .status,
      200,
    );
    assert.equal((await s.request("/api/v1/notes/note")).status, 200);
    assert.equal(
      (
        await s.request("/api/v1/groups/topic", "DELETE", {
          expectedVersion: 1,
        })
      ).status,
      422,
    );
  } finally {
    s.close();
  }
});
test("body size limit rejects unbounded JSON on metadata endpoints", async () => {
  const s = await setup();
  try {
    const r = await s.request("/api/v1/groups", "POST", {
      name: "a".repeat(1100000),
    });
    assert.equal(r.status, 413);
  } finally {
    s.close();
  }
});
test("sessions and mutations are excluded from portable export", async () => {
  const s = await setup();
  try {
    await s.create();
    const response = await s.request("/api/v1/export");
    assert.equal(response.headers.get("Cache-Control"), "private, no-store");
    const backup = (await response.json()).data;
    assert.equal(backup.notes.length, 1);
    assert.equal(backup.sessions, undefined);
    assert.equal(backup.mutations, undefined);
    assert.equal(JSON.stringify(backup).includes("test-token"), false);
  } finally {
    s.close();
  }
});
test("migration rewrites actual links without touching code blocks or inline examples", async () => {
  const { rewriteLinks } =
    await import("../../../scripts/knowledge/markdown-links.mjs");
  const source =
    '[note](./a.md "title")\n\n`[example](./a.md)`\n\n```md\n[example](./a.md)\n```\n';
  const result = await rewriteLinks(source, (url) =>
    url === "./a.md" ? "/#note=one" : url,
  );
  assert.equal(
    result,
    '[note](/#note=one "title")\n\n`[example](./a.md)`\n\n```md\n[example](./a.md)\n```\n',
  );
});

test("concurrent identical mutation returns the committed result without false conflict", async () => {
  const s = await setup();
  try {
    const id = crypto.randomUUID();
    const results = await Promise.all([
      s.create("concurrent", { clientMutationId: id }),
      s.create("concurrent", { clientMutationId: id }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 201]);
    const payload = {
      title: "并发更新",
      body: "只写一次",
      topic_id: "topic",
      state: "draft",
      visibility: "owner",
      tags: [],
      expectedVersion: 1,
      clientMutationId: crypto.randomUUID(),
    };
    const saved = await Promise.all([
      s.request("/api/v1/notes/concurrent", "PATCH", payload),
      s.request("/api/v1/notes/concurrent", "PATCH", payload),
    ]);
    assert.deepEqual(
      saved.map((r) => r.status),
      [200, 200],
    );
    assert.equal(
      s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n,
      2,
    );
  } finally {
    s.close();
  }
});
