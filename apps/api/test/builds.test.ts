import { test } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/index";
import { hash } from "../src/security";
import { database, localImages } from "../../../scripts/knowledge/local-db.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
async function setup() {
  const { sqlite, DB } = database(":memory:");
  const dir = mkdtempSync(path.join(tmpdir(), "build-test-"));
  const env = {
    DB,
    IMAGES: localImages(dir),
    APP_ENV: "test",
    AI_ENABLED: "false",
    BUILD_PIPELINE_ENABLED: "true",
    BUILD_REPOSITORY: "owner/repo",
    BUILD_WORKFLOW: "knowledge-publish.yml",
    BUILD_REF: "main",
    BUILD_DISPATCH_TOKEN: "test-dispatch",
    BUILD_PIPELINE_SECRET: "test-ci",
    PUBLIC_ORIGIN: "https://blog.example",
  };
  sqlite
    .prepare("INSERT INTO sessions VALUES(?,?,?)")
    .run(await hash("owner"), "csrf", "2099-01-01");
  sqlite
    .prepare("INSERT INTO publications(created_at,manifest) VALUES('now',?)")
    .run(
      JSON.stringify({
        revision: 0,
        notes: [
          {
            id: "a",
            slug: "a",
            title: "PUBLIC",
            body: "A",
            topic_id: "topic",
            tags: [],
          },
        ],
      }),
    );
  const request = (
    url: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ) =>
    app.fetch(
      new Request("https://admin.example" + url, {
        method: body ? "POST" : "GET",
        headers: {
          Cookie: "__Host-cblog_session=owner",
          Origin: "https://admin.example",
          "X-CSRF-Token": "csrf",
          Authorization: "Bearer test-ci",
          "X-Build-Run": "123",
          "Content-Type": "application/json",
          ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
      env,
    );
  const job = async () => {
    const r = await request("/api/v1/builds", { publicationId: 1 });
    assert.equal(r.status, 202);
    return (await r.json()).data.id;
  };
  return {
    sqlite,
    env,
    request,
    job,
    close: () => {
      sqlite.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
test("immutable job, exclusive dispatch, authenticated claim, verified live acknowledgement", async (t) => {
  const s = await setup();
  let marker: any = {};
  t.mock.method(globalThis, "fetch", async (input: any) =>
    String(input).startsWith("https://api.github.com")
      ? new Response(null, { status: 204 })
      : Response.json(marker),
  );
  try {
    const id = await s.job();
    assert.equal(
      (await s.request("/api/v1/builds", { publicationId: 1 })).status,
      409,
    );
    assert.equal(
      (
        await s.request(`/internal/builds/${id}/snapshot`, undefined, {
          Authorization: "Bearer wrong",
        })
      ).status,
      401,
    );
    assert.equal(
      (await s.request(`/internal/builds/${id}/claim`, { runId: "123" }))
        .status,
      200,
    );
    assert.equal(
      (await s.request(`/internal/builds/${id}/claim`, { runId: "456" }))
        .status,
      409,
    );
    s.sqlite.exec("UPDATE settings SET corpus_revision=10"); // later saves cannot change the selected snapshot
    const snap = await s.request(`/internal/builds/${id}/snapshot`);
    assert.equal((await snap.json()).manifest.revision, 0);
    assert.equal(
      (
        await s.request(
          `/internal/builds/${id}/status`,
          { status: "deploying" },
          { "X-Build-Run": "456" },
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await s.request(`/internal/builds/${id}/status`, {
          status: "succeeded",
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await s.request(`/internal/builds/${id}/status`, {
          status: "deploying",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await s.request(`/internal/builds/${id}/status`, {
          status: "succeeded",
        })
      ).status,
      409,
    );
    marker = { jobId: id, publicationId: 1 };
    assert.equal(
      (
        await s.request(`/internal/builds/${id}/status`, {
          status: "succeeded",
        })
      ).status,
      200,
    );
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "succeeded",
    );
    assert.equal(
      (await s.request(`/internal/builds/${id}/status`, { status: "failed" }))
        .status,
      409,
    );
  } finally {
    s.close();
  }
});
test("stale snapshot, missing configuration and unauthenticated dispatch fail closed", async () => {
  const s = await setup();
  try {
    assert.equal(
      (await s.request("/api/v1/builds", { publicationId: 1 }, { Cookie: "" }))
        .status,
      401,
    );
    s.sqlite.exec("UPDATE settings SET corpus_revision=1");
    assert.equal(
      (await s.request("/api/v1/builds", { publicationId: 1 })).status,
      409,
    );
    s.env.BUILD_DISPATCH_TOKEN = "";
    assert.equal(
      (await s.request("/api/v1/builds", { publicationId: 1 })).status,
      503,
    );
    assert.equal(
      s.sqlite.prepare("SELECT count(*) n FROM build_jobs").get().n,
      0,
    );
  } finally {
    s.close();
  }
});
test("ambiguous dispatch holds lock; cancelling unclaimed job prevents delayed deployment", async (t) => {
  const s = await setup();
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("timeout");
  });
  try {
    const id = await s.job();
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "dispatching",
    );
    await s.request(`/api/v1/builds/${id}/reconcile`, {});
    assert.equal(
      (await s.request(`/internal/builds/${id}/claim`, { runId: "123" }))
        .status,
      409,
    );
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "failed",
    );
  } finally {
    s.close();
  }
});
test("reconcile cannot release running deploy, but verifies completed deployment with lost callback", async (t) => {
  const s = await setup();
  let completed = false,
    jobId = "";
  t.mock.method(globalThis, "fetch", async (input: any) => {
    const u = String(input);
    if (u.endsWith("/dispatches")) return new Response(null, { status: 204 });
    if (u.includes("api.github.com"))
      return Response.json({ status: completed ? "completed" : "in_progress" });
    return Response.json({ jobId, publicationId: 1 });
  });
  try {
    jobId = await s.job();
    await s.request(`/internal/builds/${jobId}/claim`, { runId: "123" });
    await s.request(`/internal/builds/${jobId}/status`, {
      status: "deploying",
    });
    await s.request(`/api/v1/builds/${jobId}/reconcile`, {});
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "deploying",
    );
    completed = true;
    await s.request(`/api/v1/builds/${jobId}/reconcile`, {});
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "succeeded",
    );
  } finally {
    s.close();
  }
});
test("definite GitHub rejection can retry, terminal run cannot read image or snapshot", async (t) => {
  const s = await setup();
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 403 }),
  );
  try {
    const id = await s.job();
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "failed",
    );
    assert.equal(
      (await s.request(`/internal/builds/${id}/snapshot`)).status,
      409,
    );
    const next = await s.job();
    assert.notEqual(next, id);
  } finally {
    s.close();
  }
});

test("unknown deployment failure does not release lock for a potentially delayed deployment", async (t) => {
  const s = await setup();
  t.mock.method(globalThis, "fetch", async (input: any) =>
    String(input).endsWith("/dispatches")
      ? new Response(null, { status: 204 })
      : String(input).includes("api.github.com")
        ? Response.json({ status: "completed" })
        : Response.json({ jobId: "old", publicationId: 0 }),
  );
  try {
    const id = await s.job();
    await s.request(`/internal/builds/${id}/claim`, { runId: "123" });
    await s.request(`/internal/builds/${id}/status`, { status: "deploying" });
    await s.request(`/internal/builds/${id}/status`, { status: "failed" });
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "deploying",
    );
    await s.request(`/api/v1/builds/${id}/reconcile`, {});
    assert.equal(
      s.sqlite.prepare("SELECT status FROM build_jobs").get().status,
      "deploying",
    );
    assert.equal(
      (await s.request("/api/v1/builds", { publicationId: 1 })).status,
      409,
    );
  } finally {
    s.close();
  }
});
