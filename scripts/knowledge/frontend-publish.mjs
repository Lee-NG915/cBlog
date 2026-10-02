import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readSource, saveSource, validateSource } from "./published-source.mjs";

const stateFile = ".frontend/baseline.json";
const sourceDir = ".frontend/source";
const supported = new Set([
  ".github/workflows/deploy.yml",
  ".github/workflows/knowledge-publish.yml",
  ".github/workflows/frontend-publish.yml",
]);
function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", ...options });
}
function api(repository, suffix) {
  return JSON.parse(run("gh", ["api", `repos/${repository}/${suffix}`]));
}

export async function deployedBaseline(repository, currentRun, request) {
  // Ignore the environment deployment created for this running frontend job.
  for (let page = 1; page <= 5; page++) {
    const deployments = await request(`deployments?environment=github-pages&per_page=100&page=${page}`);
    for (const d of deployments) {
      const statuses = await request(`deployments/${d.id}/statuses?per_page=100`);
      const s = statuses[0];
      if (!s) continue;
      const prefix = `https://github.com/${repository}/actions/runs/`;
      const runId = s.log_url?.startsWith(prefix)
        ? s.log_url.slice(prefix.length).match(/^(\d+)(?:\/|$)/)?.[1] : null;
      if (runId === String(currentRun)) continue;
      if (s.state === "in_progress") throw new Error("Another Pages deployment is in progress");
      if (s.state !== "success") continue;
      if (!runId) throw new Error("Cannot identify the active deployment's workflow run");
      const workflow = await request(`actions/runs/${runId}`);
      if (!supported.has(workflow.path) || workflow.head_sha !== d.sha)
        throw new Error("Unrecognized live publication workflow or commit");
      if (workflow.status !== "completed")
        throw new Error("Live publication is still completing; retry after it finishes");
      return { deploymentId: d.id, sha: d.sha, runId, workflow: workflow.path };
    }
    if (deployments.length < 100) break;
  }
  throw new Error("No active successful Pages publication found");
}

export function legacyBootstrap(baseline, explicitSha, siteUrl, publication) {
  if (baseline.workflow !== ".github/workflows/deploy.yml" ||
      explicitSha !== baseline.sha || !/^[a-f0-9]{40}$/.test(explicitSha) || publication !== null)
    throw new Error("Missing content archive: legacy bootstrap requires the exact live legacy commit and no database publication");
  return { version: 1, kind: "legacy", siteUrl, contentRef: explicitSha };
}

export function assertUnchanged(before, after) {
  if (before.deploymentId !== after.deploymentId ||
      JSON.stringify(before.publication) !== JSON.stringify(after.publication) ||
      JSON.stringify(before.frontend) !== JSON.stringify(after.frontend))
    throw new Error("Live content changed during the build; refusing to overwrite it");
}

async function main(command) {
  const repository = process.env.GITHUB_REPOSITORY;
  const currentRun = process.env.GITHUB_RUN_ID;
  const codeSha = process.env.GITHUB_SHA;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || "") ||
      !/^\d+$/.test(currentRun || "") || !/^[a-f0-9]{40}$/.test(codeSha || ""))
    throw new Error("Run this command in its GitHub Actions workflow");
  const siteUrl = (process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const site = new URL(siteUrl);
  if (site.protocol !== "https:" || site.username || site.password || site.search || site.hash)
    throw new Error("PUBLIC_SITE_URL must be a clean HTTPS URL");
  const request = (suffix) => api(repository, suffix);
  async function marker(name) {
    const response = await fetch(`${siteUrl}/${name}?frontend-check=${currentRun}`, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Cannot read live ${name}: HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 16384) throw new Error("Unexpected publication marker size");
    return JSON.parse(text);
  }
  async function liveBaseline() {
    const deployment = await deployedBaseline(repository, currentRun, request);
    return { ...deployment, publication: await marker("publication.json"), frontend: await marker("frontend.json") };
  }
  if (command === "resolve") {
    const baseline = await liveBaseline();
    mkdirSync(".frontend", { recursive: true });
    rmSync(sourceDir, { recursive: true, force: true });
    const artifacts = request(`actions/runs/${baseline.runId}/artifacts?per_page=100`).artifacts;
    const archive = artifacts.find((a) => a.name === "published-content");
    if (archive) {
      if (archive.expired) throw new Error("Published content archive expired; republish content through the admin first");
      run("gh", ["run", "download", baseline.runId, "--repo", repository,
        "--name", "published-content", "--dir", sourceDir], { stdio: "inherit" });
    } else {
      saveSource(sourceDir, legacyBootstrap(baseline, process.env.LEGACY_CONTENT_SHA, siteUrl, baseline.publication));
    }
    validateSource(readSource(sourceDir), siteUrl, baseline.publication);
    writeFileSync(stateFile, JSON.stringify(baseline));
    console.log(`Using published content from deployment ${baseline.deploymentId}, run ${baseline.runId}`);
  } else if (command === "build") {
    const baseline = JSON.parse(readFileSync(stateFile, "utf8"));
    const source = validateSource(readSource(sourceDir), siteUrl, baseline.publication);
    if (source.kind === "snapshot") {
      const { buildSnapshot } = await import("./snapshot-build.mjs");
      await buildSnapshot(source.snapshot, {
        siteUrl, basePath: site.pathname.replace(/\/$/, ""),
        assetLoader: (id) => readFileSync(path.join(sourceDir, "assets", id)),
      });
    } else {
      // Only modify the disposable Actions checkout, never a developer's content.
      if (process.env.GITHUB_ACTIONS !== "true") throw new Error("Legacy restoration requires a disposable Actions checkout");
      run("git", ["restore", "--source", source.contentRef, "--worktree", "--",
        "content", "data/blog.db", "apps/web/public/images"]);
      for (const dir of ["apps/web/.next", "apps/web/out", "apps/web/public/content", "apps/web/public/knowledge-media"])
        rmSync(dir, { recursive: true, force: true });
      run("pnpm", ["--filter", "@cblog/web", "build"], { stdio: "inherit", env: {
        ...process.env, NODE_ENV: "production", WEB_CONTENT_SOURCE: "filesystem",
        WEB_RENDER_MODE: "static-export", PUBLICATION_DRIVER: "github-dispatch",
        BASE_PATH: site.pathname.replace(/\/$/, ""), NEXT_PUBLIC_BASE_PATH: site.pathname.replace(/\/$/, ""), SITE_URL: siteUrl,
      } });
    }
    writeFileSync("apps/web/out/frontend.json", JSON.stringify({
      version: 1, commit: codeSha, runId: currentRun, contentDeploymentId: baseline.deploymentId,
    }));
  } else if (command === "guard") {
    assertUnchanged(JSON.parse(readFileSync(stateFile, "utf8")), await liveBaseline());
    console.log("Live content identity is unchanged");
  } else if (command === "verify") {
    const baseline = JSON.parse(readFileSync(stateFile, "utf8"));
    let last;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const frontend = await marker("frontend.json");
        if (frontend?.commit !== codeSha || frontend?.runId !== currentRun)
          throw new Error("New frontend is not live yet");
        if (JSON.stringify(await marker("publication.json")) !== JSON.stringify(baseline.publication))
          throw new Error("Live publication identity changed");
        console.log(`Verified live frontend ${codeSha} with unchanged content publication`);
        return;
      } catch (e) { last = e; }
      if (attempt < 7) await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    throw last;
  } else throw new Error("Unknown frontend publication command");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  await main(process.argv[2]);
