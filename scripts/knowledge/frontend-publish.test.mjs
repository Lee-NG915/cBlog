import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { deployedBaseline, legacyBootstrap, assertUnchanged } from "./frontend-publish.mjs";
import { saveSource, readSource, validateSource } from "./published-source.mjs";

const sha = "a".repeat(40);
const site = "https://example.github.io/blog";
const publication = { jobId: "public-job", publicationId: 7, revision: 9 };
const snapshot = { jobId: "public-job", publicationId: 7, manifest: { revision: 9, notes: [] } };
const source = { version: 1, kind: "snapshot", siteUrl: site, snapshot };

test("resolve the actually deployed run, ignoring this job and failed newer builds", async () => {
  const data = {
    "deployments?environment=github-pages&per_page=100&page=1": [{ id: 4, sha }, { id: 3, sha }, { id: 2, sha }],
    "deployments/4/statuses?per_page=100": [{ state: "in_progress", log_url: "https://github.com/owner/repo/actions/runs/400/job/4" }],
    "deployments/3/statuses?per_page=100": [{ state: "failure", log_url: "https://github.com/owner/repo/actions/runs/300/job/3" }],
    "deployments/2/statuses?per_page=100": [{ state: "success", log_url: "https://github.com/owner/repo/actions/runs/200/job/2" }],
    "actions/runs/200": { path: ".github/workflows/knowledge-publish.yml", head_sha: sha, status: "completed" },
  };
  const result = await deployedBaseline("owner/repo", "400", async (q) => data[q]);
  assert.equal(result.runId, "200");
  assert.equal(result.deploymentId, 2);
});

test("an in-progress unrelated deployment blocks frontend publication", async () => {
  await assert.rejects(deployedBaseline("owner/repo", "400", async (q) =>
    q.startsWith("deployments?") ? [{ id: 2, sha }] : [{ state: "in_progress", log_url: "https://github.com/owner/repo/actions/runs/200/job/2" }]), /in progress/);
});

test("bootstrap cannot revert a database publication or select an arbitrary commit", () => {
  const b = { workflow: ".github/workflows/deploy.yml", sha };
  assert.equal(legacyBootstrap(b, sha, site, null).contentRef, sha);
  assert.throws(() => legacyBootstrap(b, "b".repeat(40), site, null));
  assert.throws(() => legacyBootstrap(b, sha, site, publication));
  assert.throws(() => legacyBootstrap({ ...b, workflow: ".github/workflows/knowledge-publish.yml" }, sha, site, null));
});

test("archive must match all live publication identifiers, including an empty snapshot", () => {
  assert.equal(validateSource(source, site, publication), source);
  for (const p of [null, { ...publication, jobId: "other" }, { ...publication, publicationId: 8 }, { ...publication, revision: 10 }])
    assert.throws(() => validateSource(source, site, p));
  assert.throws(() => validateSource(source, "https://other.example", publication));
  assert.throws(() => validateSource({ version: 1, kind: "legacy", siteUrl: site, contentRef: sha }, site, publication));
});

test("snapshot and original image bytes survive archive roundtrip", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "published-source-"));
  try {
    const id = "f".repeat(64), bytes = Buffer.from("original image bytes");
    saveSource(dir, source, new Map([[id, bytes]]));
    assert.deepEqual(readSource(dir), source);
    assert.deepEqual(readFileSync(path.join(dir, "assets", id)), bytes);
    assert.throws(() => saveSource(dir, source, new Map([["../escape", bytes]])), /asset ID/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("deployment, frontend or publication changes fail the pre-deploy guard", () => {
  const b = { deploymentId: 2, publication, frontend: null };
  assert.doesNotThrow(() => assertUnchanged(b, structuredClone(b)));
  for (const other of [{ ...b, deploymentId: 3 }, { ...b, publication: null }, { ...b, frontend: { runId: "300" } }])
    assert.throws(() => assertUnchanged(b, other), /changed/);
});
