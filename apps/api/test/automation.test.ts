import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../src/index";
import { hash } from "../src/security";
import { database, localImages } from "../../../scripts/knowledge/local-db.mjs";

const prefix = "/api/v1/automation";
// A complete 1x1 PNG fixture; its chunks and CRCs were generated with zlib.
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64");
const jpeg = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDi6KKK+ZP3E//Z", "base64");
const webp = Buffer.from("UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoBAAEAAUAmJaACdLoB+AADsAD+8ut//NgVzXPv9//S4P0uD9Lg/9KQAAA=", "base64");
const payload = (overrides = {}) => ({
  title: "自动草稿", body: "## 正文\n待审阅", topic_id: "topic", tags: ["技术"],
  expectedVersion: 0, clientMutationId: crypto.randomUUID(), ...overrides,
});
async function setup() {
  const { DB, sqlite } = database(":memory:");
  const dir = mkdtempSync(path.join(tmpdir(), "cblog-automation-"));
  const token = "test-only-draft-token";
  const env = { DB, IMAGES: localImages(dir), APP_ENV: "test", AI_ENABLED: "false", DRAFT_API_TOKEN_SHA256: await hash(token) };
  sqlite.exec("INSERT INTO groups(id,name,kind) VALUES('domain','领域','domain'); INSERT INTO groups(id,name,kind,parent_id) VALUES('topic','主题','topic','domain');");
  const request = (route: string, method = "GET", input?: unknown, headers: Record<string, string> = {}) => app.fetch(
    new Request("http://localhost" + route, { method, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...headers },
      body: input === undefined ? undefined : JSON.stringify(input) }), env,
  );
  const put = (source = "example", input = payload()) => request(prefix + "/drafts/" + source, "PUT", input);
  const upload = (bytes: Uint8Array = png, mime = "image/png") => app.fetch(new Request("http://localhost" + prefix + "/assets", {
    method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": mime }, body: bytes,
  }), env);
  const edit = (id: string, changes: Record<string, unknown>) => {
    const keys = Object.keys(changes);
    sqlite.prepare(`UPDATE notes SET ${keys.map((k) => `${k}=?`).join(",")},version=version+1,mutation_id=?,mutation_hash='manual' WHERE id=?`)
      .run(...Object.values(changes), crypto.randomUUID(), id);
  };
  const publish = (id: string, status = "succeeded") => {
    const publication = sqlite.prepare("INSERT INTO publications(created_at,manifest) VALUES(?,?)")
      .run(new Date().toISOString(), JSON.stringify({ notes: [{ id, slug: id, version: 1 }] }));
    const now = new Date().toISOString();
    sqlite.prepare("INSERT INTO build_jobs(id,publication_id,status,created_at,updated_at) VALUES(?,?,?,?,?)")
      .run(crypto.randomUUID(), Number(publication.lastInsertRowid), status, now, now);
  };
  return { env, DB, sqlite, token, request, put, upload, edit, publish, close() { sqlite.close(); rmSync(dir, { recursive: true, force: true }); } };
}

test("draft API fails closed without configuration or bearer; cookies do not authenticate it", async () => {
  const s = await setup();
  try {
    const good = s.env.DRAFT_API_TOKEN_SHA256;
    s.env.DRAFT_API_TOKEN_SHA256 = "";
    assert.equal((await s.request(prefix + "/capabilities")).status, 503);
    s.env.DRAFT_API_TOKEN_SHA256 = "not-a-hash";
    assert.equal((await s.request(prefix + "/capabilities")).status, 503);
    s.env.DRAFT_API_TOKEN_SHA256 = good;
    await s.DB.prepare("INSERT INTO sessions VALUES(?,?,?)").bind(await hash("cookie"), "csrf", "2099-01-01T00:00:00Z").run();
    for (const authorization of ["", "Bearer invalid", "Basic " + s.token]) {
      const r = await s.request(prefix + "/groups", "GET", undefined, { Authorization: authorization, Cookie: "cblog_local_session=cookie" });
      assert.equal(r.status, 401);
      assert.equal((await r.json()).data, undefined);
    }
    const capabilities = await (await s.request(prefix + "/capabilities")).json();
    assert.equal(capabilities.data.mode, "draft-only");
    assert.equal(capabilities.data.service, "cblog-draft-automation");
    assert.equal(capabilities.data.limits.asset_bytes, 1048576);
  } finally { s.close(); }
});

test("draft bearer cannot access browser notes, exports, groups, assets, publishing or builds", async () => {
  const s = await setup();
  try {
    for (const [route, method] of [
      ["/api/v1/notes/private", "GET"], ["/api/v1/notes/private", "POST"], ["/api/v1/export", "GET"],
      ["/api/v1/corpus", "GET"], ["/api/v1/groups", "GET"], ["/api/v1/groups", "POST"],
      ["/api/v1/assets/" + "a".repeat(64), "GET"], ["/api/v1/publishing", "POST"],
      ["/api/v1/builds", "POST"], ["/api/v1/publications", "POST"], ["/api/v1/automation-extra", "GET"],
    ]) assert.equal((await s.request(route, method, method === "POST" ? {} : undefined)).status, 401, route);
    for (const [route, method] of [["/publishing", "POST"], ["/builds", "POST"], ["/drafts/example", "DELETE"], ["/drafts/example/restore", "POST"]])
      assert.equal((await s.request(prefix + route, method, {})).status, 404, route);
    const groups = (await (await s.request(prefix + "/groups")).json()).data;
    assert.deepEqual(Object.keys(groups[0]).sort(), ["id", "kind", "name", "parent_id", "position", "version"]);
  } finally { s.close(); }
});

test("upsert creates only private draft and returns content hash plus a working editor route", async () => {
  const s = await setup();
  try {
    const input = payload({ display_published_at: "2025-01-02T00:00:00+08:00" });
    const result = await s.put("article-one", input);
    assert.equal(result.status, 201);
    const { data } = await result.json();
    assert.match(data.id, /^auto-[a-f0-9]{64}$/);
    assert.equal(data.state, "draft"); assert.equal(data.visibility, "owner"); assert.equal(data.version, 1);
    assert.equal(data.body_sha256, await hash(input.body));
    assert.equal(data.display_published_at, "2025-01-01T16:00:00.000Z");
    assert.equal(new URL(data.admin_url).hash, `#view=library&note=${data.id}&group=topic`);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM automation_sources").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM mutations").get().n, 1);
    const read = (await (await s.request(prefix + "/drafts/article-one")).json()).data;
    assert.equal(read.body_sha256, data.body_sha256); assert.equal(read.writable, true);
    for (const extra of [{ state: "ready" }, { visibility: "public" }, { source_path: "content/posts/x" }])
      assert.equal((await s.put("illegal", payload(extra))).status, 422);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM notes").get().n, 1);
  } finally { s.close(); }
});

test("lost-response retry and concurrent identical mutations create one revision and one source", async () => {
  const s = await setup();
  try {
    const input = payload();
    const results = await Promise.all([s.put("retry", input), s.put("retry", input), s.put("retry", input)]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 200, 201]);
    // Simulate a caller losing all successful response bodies after the commit.
    for (const r of results) await r.body?.cancel();
    const retried = await s.put("retry", input);
    assert.equal(retried.status, 200);
    const data = await retried.json();
    assert.equal(data.replayed, true); assert.equal(data.data.version, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM notes").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM automation_sources").get().n, 1);
  } finally { s.close(); }
});

test("same mutation with different body or source conflicts without a partial write", async () => {
  const s = await setup();
  try {
    const input = payload(); await s.put("first", input);
    for (const [source, changed] of [["first", { ...input, body: "other" }], ["second", input]] as const) {
      const r = await s.put(source, changed);
      assert.equal(r.status, 409); assert.equal((await r.json()).error.code, "IDEMPOTENCY_CONFLICT");
    }
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM notes").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM mutations").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT body FROM notes").get().body, input.body);
  } finally { s.close(); }
});

test("concurrent conflicting payloads cannot share a mutation or leave a second source", async () => {
  const s = await setup();
  try {
    const input = payload();
    const responses = await Promise.all([s.put("one", input), s.put("two", { ...input, body: "other" })]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
    assert.equal((await responses.find((r) => r.status === 409)!.json()).error.code, "IDEMPOTENCY_CONFLICT");
    for (const table of ["notes", "automation_sources", "revisions", "mutations"])
      assert.equal(s.sqlite.prepare(`SELECT count(*) n FROM ${table}`).get().n, 1, table);
  } finally { s.close(); }
});

test("concurrent competing updates use CAS and the loser has no revision or mutation", async () => {
  const s = await setup();
  try {
    await s.put();
    const a = payload({ expectedVersion: 1, body: "A" });
    const b = payload({ expectedVersion: 1, body: "B" });
    const results = await Promise.all([s.put("example", a), s.put("example", b)]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    const loser = await results.find((r) => r.status === 409)!.json();
    assert.equal(loser.error.currentVersion, 2);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n, 2);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM mutations").get().n, 2);
    const current = (await (await s.request(prefix + "/drafts/example")).json()).data;
    assert.equal(current.version, 2); assert.ok(["A", "B"].includes(current.body));
  } finally { s.close(); }
});

test("retry after a newer edit returns its immutable revision and identifies current version", async () => {
  const s = await setup();
  try {
    const first = payload(); await s.put("example", first);
    await s.put("example", payload({ expectedVersion: 1, body: "new body" }));
    const replay = await (await s.put("example", first)).json();
    assert.equal(replay.data.version, 1); assert.equal(replay.currentVersion, 2);
    assert.equal(replay.data.body, first.body); assert.equal(replay.replayed, true);
    assert.equal((await (await s.request(prefix + "/drafts/example")).json()).data.body, "new body");
  } finally { s.close(); }
});

test("creation cannot claim an ordinary note, even if its deterministic ID is known", async () => {
  const s = await setup();
  try {
    const id = "auto-" + await hash("cblog:automation:draft:v1:collision");
    s.sqlite.prepare("INSERT INTO notes(id,slug,title,body,updated_at,mutation_id,mutation_hash) VALUES(?,?,?,?,?,?,?)")
      .run(id, id, "Private original", "ordinary body", new Date().toISOString(), crypto.randomUUID(), "original");
    const response = await s.put("collision");
    assert.equal(response.status, 409); assert.equal((await response.json()).error.code, "SOURCE_COLLISION");
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM automation_sources").get().n, 0);
    assert.equal(s.sqlite.prepare("SELECT body FROM notes").get().body, "ordinary body");
    assert.equal((await s.request(prefix + "/drafts/collision")).status, 404);
    assert.deepEqual((await (await s.request(prefix + "/drafts")).json()).data, []);
  } finally { s.close(); }
});

test("trashed, archived, ready and public notes cannot be restored through upsert or replay", async () => {
  for (const changes of [{ deleted_at: "2026-01-01T00:00:00Z" }, { state: "archived" }, { state: "ready" }, { visibility: "public" }]) {
    const s = await setup();
    try {
      const initial = payload(); const { data } = await (await s.put("protected", initial)).json();
      s.edit(data.id, changes);
      const expected = "deleted_at" in changes ? 404 : 409;
      assert.equal((await s.put("protected", payload({ expectedVersion: 2, body: "replace" }))).status, expected);
      assert.equal((await s.put("protected", initial)).status, expected);
      assert.equal(s.sqlite.prepare("SELECT body FROM notes").get().body, initial.body);
      assert.equal(s.sqlite.prepare("SELECT version FROM notes").get().version, 2);
      assert.equal(s.sqlite.prepare("SELECT count(*) n FROM automation_sources").get().n, 1);
    } finally { s.close(); }
  }
});

test("active, historical successful, legacy deployed and live inventory publications block draft writes", async () => {
  for (const status of ["dispatching", "queued", "building", "deploying", "succeeded", "legacy", "live-only"]) {
    const s = await setup();
    try {
      const { data } = await (await s.put()).json();
      if (status === "legacy") s.sqlite.prepare("INSERT INTO publications(created_at,manifest,status) VALUES(?,?,'deployed')").run(new Date().toISOString(), JSON.stringify({ notes: [{ id: data.id }] }));
      else if (status === "live-only") s.sqlite.prepare("INSERT INTO live_site VALUES(1,?,?,?,?)").run("legacy-job", 1, JSON.stringify([{ id: data.id }]), new Date().toISOString());
      else s.publish(data.id, status);
      const r = await s.put("example", payload({ expectedVersion: 1, body: "must not change" }));
      assert.equal(r.status, 409, status); assert.equal((await r.json()).error.code, "NOT_DRAFT");
      const read = (await (await s.request(prefix + "/drafts/example")).json()).data;
      assert.equal(read.writable, false); assert.equal(read.body, payload().body);
      assert.equal(s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n, 1);
    } finally { s.close(); }
  }
});

test("publication added after preflight is still blocked by the atomic update predicate", async () => {
  const s = await setup();
  try {
    const { data } = await (await s.put()).json();
    const prepare = s.env.DB.prepare.bind(s.env.DB);
    let injected = false;
    s.env.DB.prepare = (sql: string) => {
      const wrap = (statement: any): any => new Proxy(statement, { get(target, property) {
        if (property === "bind") return (...values: unknown[]) => wrap(target.bind(...values));
        if (property === "run") return async () => {
          if (!injected && sql.startsWith("UPDATE notes SET")) { injected = true; s.publish(data.id, "queued"); }
          return target.run();
        };
        const value = Reflect.get(target, property); return typeof value === "function" ? value.bind(target) : value;
      } });
      return wrap(prepare(sql));
    };
    const r = await s.put("example", payload({ expectedVersion: 1, body: "race" }));
    assert.equal(injected, true); assert.equal(r.status, 409);
    assert.equal(s.sqlite.prepare("SELECT body FROM notes").get().body, payload().body);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n, 1);
  } finally { s.close(); }
});

test("pagination lists only machine sources and excludes trash without leaking bodies", async () => {
  const s = await setup();
  try {
    for (const source of ["a", "b", "c"]) await s.put(source);
    const c = (await (await s.request(prefix + "/drafts/c")).json()).data;
    s.edit(c.id, { deleted_at: new Date().toISOString() });
    const first = await (await s.request(prefix + "/drafts?limit=1")).json();
    assert.equal(first.data[0].sourceKey, "a"); assert.equal(first.nextCursor, "a"); assert.equal(first.data[0].body, undefined);
    const second = await (await s.request(prefix + "/drafts?limit=1&cursor=a")).json();
    assert.equal(second.data[0].sourceKey, "b"); assert.equal(second.nextCursor, null);
    assert.equal((await s.request(prefix + "/drafts?limit=101")).status, 400);
  } finally { s.close(); }
});

test("input size, UTF-8 bytes, topic, source and creation version are validated", async () => {
  const s = await setup();
  try {
    assert.equal((await s.put("Uppercase")).status, 400);
    assert.equal((await s.put("x".repeat(121))).status, 400);
    assert.equal((await s.put("end-")).status, 400);
    assert.equal((await s.put("version", payload({ expectedVersion: 1 }))).status, 409);
    assert.equal((await s.put("topic", payload({ topic_id: "domain" }))).status, 422);
    assert.equal((await s.put("large", payload({ body: "字".repeat(90000) }))).status, 413);
    assert.equal((await s.put("extra", payload({ body: "x".repeat(400000) }))).status, 413);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM notes").get().n, 0);
  } finally { s.close(); }
});

test("display date omission preserves it, explicit null clears it, revisions keep both", async () => {
  const s = await setup();
  try {
    await s.put("date", payload({ display_published_at: "2024-03-04T00:00:00Z" }));
    const update = await (await s.put("date", payload({ expectedVersion: 1 }))).json();
    assert.equal(update.data.display_published_at, "2024-03-04T00:00:00.000Z");
    const clear = await (await s.put("date", payload({ expectedVersion: 2, display_published_at: null }))).json();
    assert.equal(clear.data.display_published_at, null);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM revisions").get().n, 3);
  } finally { s.close(); }
});

test("image upload validates bytes, reads back hash, and avoids rewriting a verified KV asset", async () => {
  const s = await setup();
  try {
    let writes = 0;
    const originalPut = s.env.IMAGES.put.bind(s.env.IMAGES);
    s.env.IMAGES.put = async (...args: any[]) => { writes++; return originalPut(...args); };
    const uploaded = await s.upload(); assert.equal(uploaded.status, 201);
    const { data } = await uploaded.json();
    assert.equal(data.id, await hash(png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength)));
    assert.equal(data.mime, "image/png"); assert.equal(data.bytes, png.byteLength);
    const read = await s.request(data.readback_url);
    assert.equal(read.status, 200); assert.equal(read.headers.get("Content-Type"), "image/png");
    assert.equal(await hash(await read.arrayBuffer()), data.sha256);
    assert.equal((await s.upload()).status, 200); assert.equal(writes, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM assets").get().n, 1);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM automation_assets").get().n, 1);
    assert.equal((await s.put("with-image", payload({ body: `![image](${data.url})` }))).status, 201);
  } finally { s.close(); }
});

test("existing private assets are unreadable and unreferenceable until their exact bytes are uploaded", async () => {
  const s = await setup();
  try {
    const id = await hash(png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength));
    await s.DB.prepare("INSERT INTO assets VALUES(?,?,?,'ready',?)").bind(id, "image/png", png.byteLength, new Date().toISOString()).run();
    await s.env.IMAGES.put(id, png);
    assert.equal((await s.request(prefix + "/assets/" + id)).status, 404);
    assert.equal((await s.put("old-image", payload({ body: `![private](/api/v1/assets/${id})` }))).status, 422);
    assert.equal((await s.put("same-origin", payload({ body: `![private](http://localhost/api/v1/assets/${id})` }))).status, 422);
    assert.equal((await s.put("external", payload({ body: `![remote](https://images.example/api/v1/assets/${id})` }))).status, 201);
    assert.equal((await s.upload()).status, 200);
    assert.equal((await s.request(prefix + "/assets/" + id)).status, 200);
    assert.equal((await s.put("old-image", payload({ body: `![explicit-upload](/api/v1/assets/${id})` }))).status, 201);
  } finally { s.close(); }
});

test("real JPEG and static WebP containers pass while animation flags and chunks are rejected", async () => {
  const s = await setup();
  try {
    assert.equal((await s.upload(jpeg, "image/jpeg")).status, 201);
    assert.equal((await s.upload(webp, "image/webp")).status, 201);
    const riff = (chunks: Buffer[]) => {
      const content = Buffer.concat([Buffer.from("WEBP"), ...chunks]);
      const header = Buffer.alloc(8); header.write("RIFF"); header.writeUInt32LE(content.length, 4);
      return Buffer.concat([header, content]);
    };
    const extended = Buffer.alloc(18); extended.write("VP8X"); extended.writeUInt32LE(10, 4); extended[8] = 0x02;
    assert.equal((await s.upload(riff([extended, webp.subarray(12)]), "image/webp")).status, 422);
    for (const kind of ["ANIM", "ANMF"]) {
      const chunk = Buffer.alloc(8); chunk.write(kind);
      assert.equal((await s.upload(riff([chunk, webp.subarray(12)]), "image/webp")).status, 422);
    }
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM assets").get().n, 2);
  } finally { s.close(); }
});

test("oversized, forged, truncated, mismatched and SVG images never enter storage", async () => {
  const s = await setup();
  try {
    assert.equal((await s.upload(new Uint8Array(1024 * 1024 + 1))).status, 413);
    assert.equal((await s.upload(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"), "image/svg+xml")).status, 422);
    assert.equal((await s.upload(png.subarray(0, 20))).status, 422);
    const badCrc = Buffer.from(png); badCrc[badCrc.length - 1] ^= 1;
    assert.equal((await s.upload(badCrc)).status, 422);
    assert.equal((await s.upload(png, "image/jpeg")).status, 422);
    assert.equal((await s.upload(Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "image/jpeg")).status, 422);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM assets").get().n, 0);
  } finally { s.close(); }
});

test("KV readback failure stays pending and retry repairs without duplicate metadata", async () => {
  const s = await setup();
  try {
    const originalGet = s.env.IMAGES.get.bind(s.env.IMAGES);
    s.env.IMAGES.get = async () => null;
    assert.equal((await s.upload()).status, 503);
    assert.equal(s.sqlite.prepare("SELECT state FROM assets").get().state, "pending");
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM automation_assets").get().n, 0);
    s.env.IMAGES.get = originalGet;
    assert.equal((await s.upload()).status, 201);
    const id = s.sqlite.prepare("SELECT id FROM assets").get().id;
    await s.env.IMAGES.put(id, new Uint8Array([1, 2, 3]));
    assert.equal((await s.request(prefix + "/assets/" + id)).status, 503);
    assert.equal((await s.upload()).status, 200);
    assert.equal((await s.request(prefix + "/assets/" + id)).status, 200);
    assert.equal(s.sqlite.prepare("SELECT count(*) n FROM assets").get().n, 1);
  } finally { s.close(); }
});

test("draft source and note creation roll back together when binding insert fails", async () => {
  const s = await setup();
  try {
    s.sqlite.exec("CREATE TRIGGER reject_automation_source BEFORE INSERT ON automation_sources BEGIN SELECT RAISE(ABORT,'test failure'); END;");
    assert.equal((await s.put()).status, 503);
    for (const table of ["notes", "automation_sources", "revisions", "mutations"])
      assert.equal(s.sqlite.prepare(`SELECT count(*) n FROM ${table}`).get().n, 0, table);
  } finally { s.close(); }
});
