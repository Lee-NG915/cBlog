import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../src/index";
import { CORPUS_PAGE_BYTES } from "../src/corpus";
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
    assert.deepEqual(next.deletedIds, ["note"]);
    const stale = await s.request("/api/v1/corpus?revision=" + next.revision);
    assert.equal(stale.status, 200);
    assert.equal((await s.request("/api/v1/notes/note/restore", "POST", {expectedVersion: 2})).status, 200);
    const restored = await (await s.request("/api/v1/corpus")).json();
    assert.deepEqual(restored.deletedIds, []);
    assert.equal(restored.data.length, 2);
    assert.equal((await s.request("/api/v1/corpus?revision=" + next.revision)).status, 409);
  } finally {
    s.close();
  }
});
test("corpus bounds multibyte and escaped payloads without fetching lookahead bodies or losing rows", async (t) => {
  const s = await setup();
  try {
    const insert = s.sqlite.prepare(`INSERT INTO notes
      (id,slug,title,body,tags,source_metadata,updated_at,mutation_id,mutation_hash,deleted_at)
      VALUES(?,?,?,?,?,?,'2026-01-01',?,?,?)`);
    for (let i = 0; i < 40; i++) {
      const id = "note-" + String(i).padStart(2, "0");
      insert.run(id, id, i === 3 ? "长标题".repeat(15000) : id,
        i === 7 ? "大".repeat(100000) : i === 10 ? "\0".repeat(40000) : "字🙂\n\"\\".repeat(7000),
        JSON.stringify(i === 12 ? ["标签".repeat(25000)] : []),
        JSON.stringify(i === 15 ? { imported: "资料".repeat(30000) } : {}),
        crypto.randomUUID(), id, [4, 37].includes(i) ? "2026-01-02" : null);
    }
    const expected = s.sqlite.prepare("SELECT * FROM notes WHERE deleted_at IS NULL ORDER BY id").all();
    const fetched: any[] = [];
    const prepare = s.env.DB.prepare.bind(s.env.DB);
    t.mock.method(s.env.DB, "prepare", (sql: string) => {
      const track = (statement: any): any => new Proxy(statement, {
        get(target, key) {
          if (key === "bind") return (...values: any[]) => track(target.bind(...values));
          if (key === "all") return async (...args: any[]) => {
            const result = await target.all(...args);
            fetched.push(...result.results.filter((row: any) => "body" in row));
            return result;
          };
          return typeof target[key] === "function" ? target[key].bind(target) : target[key];
        },
      });
      return track(prepare(sql));
    });
    const received: any[] = [];
    let cursor = "", revision: number | undefined, pages = 0, largestBoundedPage = 0, oversizedPages = 0;
    do {
      fetched.length = 0;
      const response = await s.request("/api/v1/corpus?cursor=" + cursor +
        (revision === undefined ? "" : "&revision=" + revision));
      assert.equal(response.status, 200);
      const page = await response.json();
      assert.ok(page.data.length > 0 && page.data.length <= 30);
      const pageBytes = Buffer.byteLength(JSON.stringify(page.data));
      assert.ok(pageBytes <= CORPUS_PAGE_BYTES || page.data.length === 1);
      if (pageBytes > CORPUS_PAGE_BYTES) oversizedPages++;
      else largestBoundedPage = Math.max(largestBoundedPage, pageBytes);
      assert.deepEqual(JSON.parse(JSON.stringify(fetched)), page.data, "no unused full-body lookahead");
      assert.deepEqual(page.deletedIds, cursor ? [] : ["note-04", "note-37"]);
      if (page.nextCursor) assert.equal(page.nextCursor, page.data.at(-1).id);
      received.push(...page.data);
      cursor = page.nextCursor || "";
      revision = page.revision;
      assert.ok(++pages <= expected.length, "every page advances the cursor");
    } while (cursor);
    assert.deepEqual(received, JSON.parse(JSON.stringify(expected)));
    assert.equal(new Set(received.map((n) => n.id)).size, expected.length);
    t.diagnostic(`fixture: ${expected.length} notes in ${pages} pages; largest bounded page: ${largestBoundedPage} bytes; oversized single-note pages: ${oversizedPages}; former 31-row read: ${Buffer.byteLength(JSON.stringify(expected.slice(0, 31)))} bytes`);
  } finally { s.close(); }
});
test("corpus item boundary and terminal cursor handle empty, exact and partial pages", async () => {
  for (const count of [0, 1, 30, 31, 60, 61]) {
    const s = await setup();
    try {
      const insert = s.sqlite.prepare("INSERT INTO notes(id,slug,title,updated_at,mutation_id,mutation_hash) VALUES(?,?,?,'2026-01-01',?,?)");
      for (let i = 0; i < count; i++) {
        const id = "n" + String(i).padStart(3, "0");
        insert.run(id, id, id, crypto.randomUUID(), id);
      }
      let cursor = "", seen = 0, pages = 0;
      do {
        const response = await s.request("/api/v1/corpus?cursor=" + cursor);
        assert.equal(response.status, 200);
        const page = await response.json();
        assert.equal(page.data.length, Math.min(30, count - seen));
        seen += page.data.length;
        assert.equal(page.nextCursor, seen < count ? page.data.at(-1).id : null);
        cursor = page.nextCursor || "";
        pages++;
      } while (cursor);
      assert.equal(seen, count);
      assert.equal(pages, Math.max(1, Math.ceil(count / 30)));
    } finally { s.close(); }
  }
});
test("corpus refuses a page changed between sizing and fetching", async (t) => {
  const s = await setup();
  try {
    await s.create();
    const prepare = s.env.DB.prepare.bind(s.env.DB);
    let changed = false;
    t.mock.method(s.env.DB, "prepare", (sql: string) => {
      if (!changed && sql.startsWith("SELECT * FROM notes WHERE deleted_at IS NULL AND id>")) {
        changed = true;
        s.sqlite.prepare("UPDATE notes SET body=?,version=version+1,mutation_id=?,mutation_hash=? WHERE id='note'")
          .run("changed while reading", crypto.randomUUID(), "concurrent-update");
      }
      return prepare(sql);
    });
    const response = await s.request("/api/v1/corpus");
    assert.equal(changed, true);
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error.code, "CORPUS_CHANGED");
    const retry = await s.request("/api/v1/corpus");
    assert.equal(retry.status, 200);
    const page = await retry.json();
    assert.equal(page.data[0].body, "changed while reading");
    assert.equal(page.nextCursor, null);
  } finally { s.close(); }
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

test("selected publication includes only chosen eligible notes and never exposes a private or unselected note", async () => {
  const s = await setup();
  try {
    await s.create("chosen", { state: "ready", visibility: "public" });
    await s.create("unselected", { state: "ready", visibility: "public" });
    await s.create("private", { state: "ready", visibility: "owner" });
    const revision = s.sqlite.prepare("SELECT corpus_revision FROM settings").get().corpus_revision;
    const result = await s.request("/api/v1/publications", "POST", { expectedRevision: revision, noteIds: ["chosen", "private"] });
    assert.equal(result.status, 201);
    const manifest = JSON.parse(s.sqlite.prepare("SELECT manifest FROM publications").get().manifest);
    assert.deepEqual(manifest.notes.map((n: { id: string }) => n.id), ["chosen"]);
    const id = (await result.json()).data.id;
    assert.deepEqual(await (await s.request(`/api/v1/publications/${id}/scope`)).json(), {noteIds: ["chosen"]});
    assert.equal((await s.request("/api/v1/publications/9999/scope")).status, 404);
  } finally { s.close(); }
});

test("publishing a new selection keeps unselected live note versions and excludes unreviewed edits", async () => {
  const s = await setup();
  try {
    await s.create("old", { state: "ready", visibility: "public", body: "live version" });
    const rev = () => s.sqlite.prepare("SELECT corpus_revision FROM settings").get().corpus_revision;
    const initial = await s.request("/api/v1/publications", "POST", { expectedRevision: rev(), noteIds: ["old"] });
    const publication = (await initial.json()).data.id;
    s.sqlite.prepare("INSERT INTO build_jobs(id,publication_id,status,created_at,updated_at) VALUES('test',?,'succeeded','now','now')").run(publication);
    await s.request("/api/v1/notes/old", "PATCH", { title: "old", body: "unreviewed", topic_id:"topic", state:"ready",visibility:"public",tags:[],expectedVersion:1,clientMutationId:crypto.randomUUID() });
    await s.create("new", { state: "ready", visibility: "public" });
    const next = await s.request("/api/v1/publications", "POST", { expectedRevision: rev(), noteIds: ["new"] });
    assert.equal(next.status, 201);
    const manifest=JSON.parse(s.sqlite.prepare("SELECT manifest FROM publications ORDER BY id DESC LIMIT 1").get().manifest);
    assert.deepEqual(manifest.notes.map((n: {id: string})=>n.id).sort(), ["new", "old"]);
    assert.equal(manifest.notes.find((n: {id: string})=>n.id === "old").body, "live version");
  } finally { s.close(); }
});

test("snapshot history reports the latest job even outside the recent 30 build jobs", async () => {
  const s = await setup();
  try {
    const insert = s.sqlite.prepare("INSERT INTO publications(id,created_at,manifest,status) VALUES(?,?,'{}',?)");
    for (const id of [1,2,3]) insert.run(id, "2026-11-01", id === 3 ? "deployed" : "snapshot");
    const job = s.sqlite.prepare("INSERT INTO build_jobs(id,publication_id,status,created_at,updated_at) VALUES(?,?,?,?,?)");
    job.run("failed-first",1,"failed","2026-11-01T01:00:00Z","2026-11-01T01:00:00Z");
    job.run("succeeded-next",1,"succeeded","2026-11-01T02:00:00Z","2026-11-01T02:00:00Z");
    // Repeated failures of another snapshot must not hide an older success.
    for (let i=0;i<31;i++) job.run("retry-"+i,2,"failed","2026-11-01T03:00:00Z","2026-11-01T03:00:00Z");
    let rows = (await (await s.request("/api/v1/publications")).json()).data;
    assert.deepEqual(rows.map((p: any) => [p.id,p.status,p.build_status]), [
      [3,"deployed",null],[2,"snapshot","failed"],[1,"snapshot","succeeded"],
    ]);
    job.run("active-retry",2,"queued","2026-11-01T04:00:00Z","2026-11-01T04:00:00Z");
    rows = (await (await s.request("/api/v1/publications")).json()).data;
    assert.equal(rows.find((p: any) => p.id === 2).build_status,"queued");
    assert.equal(rows.some((p: any) => "manifest" in p),false);
  } finally { s.close(); }
});
