import { test } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/index";
import { hash } from "../src/security";
import { database } from "../../../scripts/knowledge/local-db.mjs";
async function setup() {
  const { sqlite, DB } = database(":memory:");
  const env = {
    DB,
    APP_ENV: "test",
    BUILD_PIPELINE_ENABLED: "true",
    BUILD_REPOSITORY: "owner/repo",
    BUILD_WORKFLOW: "knowledge-publish.yml",
    BUILD_REF: "main",
    BUILD_DISPATCH_TOKEN: "test",
    BUILD_PIPELINE_SECRET: "ci",
    PUBLIC_ORIGIN: "https://blog.example",
  };
  sqlite
    .prepare("INSERT INTO sessions VALUES(?,?,?)")
    .run(await hash("owner"), "csrf", "2099-01-01");
  sqlite.exec(
    "INSERT INTO groups(id,name,kind) VALUES('topic','分类','topic')",
  );
  const request = (path: string, method = "GET", body?: unknown) =>
    app.fetch(
      new Request("https://admin.example" + path, {
        method,
        headers: {
          Cookie: "__Host-cblog_session=owner",
          Origin: "https://admin.example",
          "X-CSRF-Token": "csrf",
          Authorization: "Bearer ci",
          "X-Build-Run": "123",
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      env,
    );
  const note = (id: string, body = "body") => ({
    id,
    slug: id,
    title: id,
    body,
    topic_id: "topic",
    topic_name: "分类",
    version: 1,
    tags: [],
    updated_at: "2026-11-01",
  });
  for (const id of ["a", "b", "private"])
    await request("/api/v1/notes/" + id, "POST", {
      ...note(id),
      state: "draft",
      visibility: "owner",
      expectedVersion: 0,
      clientMutationId: crypto.randomUUID(),
    });
  const original = [note("a", "PUBLIC A"), note("b", "PUBLIC B")];
  sqlite
    .prepare(
      "INSERT INTO publications(created_at,manifest) VALUES('2026-01-01',?)",
    )
    .run(JSON.stringify({ notes: original, revision: 0 }));
  sqlite.exec(
    "INSERT INTO build_jobs(id,publication_id,status,created_at,updated_at) VALUES('old',1,'succeeded','2026-01-01','2026-01-01')",
  );
  const publish = (
    id = "a",
    action = "publish",
    requestId = crypto.randomUUID(),
    expectedVersion = 1,
  ) =>
    request("/api/v1/publishing", "POST", {
      noteId: id,
      action,
      requestId,
      expectedVersion,
    });
  const snapshot = () =>
    JSON.parse(
      String(
        sqlite
          .prepare("SELECT manifest FROM publications ORDER BY id DESC LIMIT 1")
          .get()!.manifest,
      ),
    );
  return { sqlite, request, publish, snapshot, original };
}
test("single-article publish preserves other live versions and ignores private drafts; replay dispatches once", async (t) => {
  const s = await setup();
  let dispatches = 0;
  t.mock.method(globalThis, "fetch", async () => {
    dispatches++;
    return new Response(null, { status: 204 });
  });
  try {
    const requestId = crypto.randomUUID();
    const first = await s.publish("a", "publish", requestId);
    assert.equal(first.status, 202);
    const job = (await first.json()).data;
    assert.equal((await s.publish("a", "publish", requestId)).status, 202);
    assert.equal(dispatches, 1);
    assert.equal((await s.publish("b", "publish", requestId)).status, 409);
    assert.deepEqual(
      s.snapshot().notes.find((n: any) => n.id === "b"),
      s.original[1],
    );
    assert.equal(
      s.snapshot().notes.some((n: any) => n.id === "private"),
      false,
    );
    assert.equal(
      s.snapshot().notes.find((n: any) => n.id === "a").body,
      "body",
    );
    assert.equal((await s.publish("b")).status, 409);
    const result = await s.request("/api/v1/publishing");
    const state = await result.json();
    assert.equal(state.live.length, 2);
    assert.equal(state.history[0].id, job.id);
    assert.equal(
      (await s.request("/api/v1/notes/a", "DELETE", { expectedVersion: 1 }))
        .status,
      409,
    );
  } finally {
    s.sqlite.close();
  }
});
test("unpublish remains live until both manifest and original URL are verified; restore never republishes", async (t) => {
  const s = await setup();
  let marker: any = {},
    pageStatus = 200;
  t.mock.method(globalThis, "fetch", async (input: any) =>
    String(input).includes("api.github.com")
      ? new Response(null, { status: 204 })
      : String(input).includes("publication.json")
        ? Response.json(marker)
        : new Response(null, { status: pageStatus }),
  );
  try {
    const job = (await (await s.publish("a", "unpublish")).json()).data;
    const m = s.snapshot();
    assert.deepEqual(m.withdrawals, [{ id: "a", route: "posts/a" }]);
    assert.deepEqual(m.notes, [s.original[1]]);
    assert.equal(m.categories[0].slug, "topic");
    await s.request(`/internal/builds/${job.id}/claim`, "POST", {
      runId: "123",
    });
    await s.request(`/internal/builds/${job.id}/status`, "POST", {
      status: "deploying",
    });
    marker = {
      jobId: job.id,
      publicationId: job.publication_id,
      publicNotes: [{ id: "b", route: "posts/b", version: 1 }],
    };
    assert.equal(
      (
        await s.request(`/internal/builds/${job.id}/status`, "POST", {
          status: "succeeded",
        })
      ).status,
      409,
    );
    assert.equal(
      (await (await s.request("/api/v1/publishing")).json()).live.length,
      2,
    );
    pageStatus = 404;
    assert.equal(
      (
        await s.request(`/internal/builds/${job.id}/status`, "POST", {
          status: "succeeded",
        })
      ).status,
      200,
    );
    assert.deepEqual(
      (await (await s.request("/api/v1/publishing")).json()).live,
      marker.publicNotes,
    );
    assert.equal(
      (await s.request("/api/v1/notes/a", "DELETE", { expectedVersion: 1 }))
        .status,
      200,
    );
    assert.equal(
      (await (await s.request("/api/v1/trash")).json()).data[0].id,
      "a",
    );
    assert.equal(
      (
        await s.request("/api/v1/notes/a/restore", "POST", {
          expectedVersion: 2,
        })
      ).status,
      200,
    );
    const restored = (await (await s.request("/api/v1/notes/a")).json()).data;
    assert.equal(restored.state, "draft");
    assert.equal(restored.visibility, "owner");
    assert.equal(restored.body, "body");
    assert.equal(
      (await (await s.request("/api/v1/publishing")).json()).live.some(
        (n: any) => n.id === "a",
      ),
      false,
    );
    const republish = await s.publish("a", "publish", crypto.randomUUID(), 3);
    assert.equal(republish.status, 202);
    assert.deepEqual(s.snapshot().withdrawals, []);
    assert.equal(
      s.snapshot().notes.find((n: any) => n.id === "a").route,
      "posts/a",
    );
  } finally {
    s.sqlite.close();
  }
});
test("stale versions and archiving a live note are refused without losing draft data", async (t) => {
  const s = await setup();
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  try {
    assert.equal(
      (await s.publish("a", "publish", crypto.randomUUID(), 2)).status,
      409,
    );
    const n = (await (await s.request("/api/v1/notes/a")).json()).data;
    assert.equal(
      (
        await s.request("/api/v1/notes/a", "PATCH", {
          ...n,
          tags: [],
          state: "archived",
          expectedVersion: 1,
          clientMutationId: crypto.randomUUID(),
        })
      ).status,
      409,
    );
    const draft = (await (await s.request("/api/v1/notes/private")).json())
      .data;
    assert.equal(
      (
        await s.request("/api/v1/notes/private", "PATCH", {
          ...draft,
          tags: [],
          state: "archived",
          expectedVersion: 1,
          clientMutationId: crypto.randomUUID(),
        })
      ).status,
      200,
    );
    assert.equal(
      (await s.publish("private", "publish", crypto.randomUUID(), 2)).status,
      422,
    );
    assert.equal(
      (await s.publish("private", "unpublish", crypto.randomUUID(), 2)).status,
      409,
    );
    assert.equal(
      s.sqlite.prepare("SELECT count(*) n FROM publications").get()!.n,
      1,
    );
  } finally {
    s.sqlite.close();
  }
});

test("display date saves persist, publication is stable through edits and withdrawal, old clients preserve overrides", async (t) => {
  const s = await setup();
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
  const get = async () => (await (await s.request('/api/v1/notes/private')).json()).data;
  const save = async (changes: any, omit = false) => {
    const n = await get();
    const payload = {...n, tags: JSON.parse(n.tags), expectedVersion:n.version, clientMutationId:crypto.randomUUID(), ...changes};
    if (omit) delete payload.display_published_at;
    const r = await s.request('/api/v1/notes/private','PATCH',payload);
    assert.equal(r.status,200);
    return get();
  };
  let tick = 0;
  const publish = async (action = 'publish') => {
    const n = await get();
    const r = await s.publish('private',action,crypto.randomUUID(),n.version);
    assert.equal(r.status,202);
    const job = (await r.json()).data;
    const manifest = s.snapshot();
    s.sqlite.prepare("UPDATE build_jobs SET status='succeeded',updated_at=? WHERE id=?").run(`2090-01-01T00:00:${String(++tick).padStart(2,'0')}Z`, job.id);
    return manifest.publicationDates.private;
  };
  try {
    let n = await save({display_published_at:'2025-03-04T20:15:00+08:00'});
    assert.equal(n.display_published_at,'2025-03-04T12:15:00.000Z');
    assert.equal(n.content_updated_at,null);
    const first = await publish();
    assert.equal(first.editedAt,null);
    n = await save({display_published_at:'2025-05-06T21:10:00+08:00'});
    assert.equal(n.content_updated_at,null);
    const dateOnly = await publish();
    assert.equal(dateOnly.publishedAt, first.publishedAt);
    assert.equal(dateOnly.editedAt,null);
    n = await save({body:'Full updated technical body'},true);
    assert.equal(n.display_published_at,'2025-05-06T13:10:00.000Z');
    assert.ok(n.content_updated_at);
    const edited = await publish();
    assert.equal(edited.publishedAt,first.publishedAt);
    assert.equal(edited.editedAt,n.content_updated_at);
    await publish('unpublish');
    const again = await publish();
    assert.equal(again.publishedAt,first.publishedAt);
    await save({display_published_at:null});
    const cleared = await publish();
    assert.equal(cleared.displayPublishedAt,null);
    assert.equal(cleared.publishedAt,first.publishedAt);
    assert.equal(cleared.editedAt,edited.editedAt);
  } finally { s.sqlite.close(); }
});

test('date-only deployment waits for matching dates and the complete public inventory', async(t)=>{
 const s=await setup(); let marker:any={};
 t.mock.method(globalThis,'fetch',async(input:any)=>String(input).includes('api.github.com')?new Response(null,{status:204}):Response.json(marker));
 try {
  const job=(await(await s.publish()).json()).data;
  const dates=Object.fromEntries(['a','b'].map(id=>[id,{route:'posts/'+id,publishedAt:'2026-01-01T00:00:00.000Z',displayPublishedAt:'2026-02-01T00:00:00.000Z',editedAt:null}]));
  const expected=['a','b'].map(id=>({id,route:'posts/'+id,version:1,contentHash:null}));
  const manifest={...s.snapshot(),publicationDates:dates,intent:{action:'dates',expectedInventory:expected}};
  s.sqlite.prepare('UPDATE publications SET manifest=? WHERE id=?').run(JSON.stringify(manifest),job.publication_id);
  await s.request(`/internal/builds/${job.id}/claim`,'POST',{runId:'123'});
  await s.request(`/internal/builds/${job.id}/status`,'POST',{status:'deploying'});
  const status=()=>s.request(`/internal/builds/${job.id}/status`,'POST',{status:'succeeded'});
  marker={jobId:job.id,publicationId:job.publication_id,publicNotes:expected.map(n=>({...n,...dates[n.id]}))};
  marker.publicNotes[0].displayPublishedAt='2026-03-01T00:00:00.000Z';
  assert.equal((await status()).status,409);
  marker.publicNotes[0].displayPublishedAt=dates.a.displayPublishedAt;
  const last=marker.publicNotes.pop();assert.equal((await status()).status,409);
  marker.publicNotes.push(last);assert.equal((await status()).status,200);
  const state=await(await s.request('/api/v1/publishing')).json();
  assert.equal(state.live[0].displayPublishedAt,dates.a.displayPublishedAt);
 }finally{s.sqlite.close();}
});
