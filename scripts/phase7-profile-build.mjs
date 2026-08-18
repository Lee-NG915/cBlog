#!/usr/bin/env node
/**
 * WEB-206 双 profile 预发布构建：fixture Content API 上分别构建
 * static-export 与 runtime-isr，比较页面路由集合，并扫描产物中的数据库凭证。
 * 另验证 runtime 缺少 WEB_RUNTIME_REPLICAS 时立即失败。
 *
 * 本章不改生产默认：filesystem + static-export 仍是 GitHub Pages 路径。
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_PORT = Number(process.env.PHASE7_FIXTURE_PORT || 3217);
const API = `http://127.0.0.1:${API_PORT}`;
const SECRET_NEEDLES = [
  "postgresql://",
  "postgres://",
  "AUTH_SECRET=",
  "OBJECT_STORAGE_SECRET_KEY=",
  "GITHUB_DISPATCH_TOKEN=",
  "DEPLOY_CALLBACK_SECRET=",
  "REVALIDATION_ACTIVE_SECRET=",
  "REVALIDATION_PREVIOUS_SECRET=",
];

function extractAppPageRoutes(log) {
  const lines = log.split(/\r?\n/);
  const start = lines.findIndex((line) => /Route \(app\)/.test(line));
  if (start < 0) throw new Error("构建日志缺少 Route (app)");
  const routes = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/[○●ƒλ]\s+(\/\S*)/);
    if (!match) {
      if (routes.length > 0 && !/^[├└┌│]/.test(line.trimStart())) break;
      continue;
    }
    const route = match[1].replace(/\/$/, "") || "/";
    if (route.startsWith("/api/") || route === "/_not-found") continue;
    routes.push(route);
  }
  if (routes.length === 0) throw new Error("未能从构建日志解析页面路由");
  return [...new Set(routes)].sort();
}

function assertNoSecrets(text, label) {
  for (const needle of SECRET_NEEDLES) {
    if (text.includes(needle)) {
      throw new Error(`${label} 含敏感片段 ${needle}`);
    }
  }
}

function scanBuildArtifacts(label) {
  const files = [
    path.join(ROOT, "apps/web/.next/required-server-files.json"),
    path.join(ROOT, "apps/web/out/index.html"),
    path.join(ROOT, "apps/web/out/sitemap.xml"),
  ];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    assertNoSecrets(
      fs.readFileSync(file, "utf8"),
      `${label} ${path.relative(ROOT, file)}`
    );
  }
}

function cleanedEnv(overrides) {
  const env = { ...process.env, ...overrides };
  delete env.DATABASE_URL;
  delete env.AUTH_SECRET;
  delete env.OBJECT_STORAGE_SECRET_KEY;
  delete env.OBJECT_STORAGE_ACCESS_KEY;
  delete env.GITHUB_DISPATCH_TOKEN;
  delete env.DEPLOY_CALLBACK_SECRET;
  delete env.REVALIDATION_ACTIVE_SECRET;
  delete env.REVALIDATION_PREVIOUS_SECRET;
  return env;
}

function buildWeb(label, overrides) {
  fs.rmSync(path.join(ROOT, "apps/web/.next"), { recursive: true, force: true });
  fs.rmSync(path.join(ROOT, "apps/web/out"), { recursive: true, force: true });
  const result = spawnSync("pnpm", ["--filter", "@cblog/web", "build"], {
    cwd: ROOT,
    env: cleanedEnv(overrides),
    encoding: "utf8",
  });
  const log = `${result.stdout}\n${result.stderr}`;
  if (result.status !== 0) {
    throw new Error(`${label} 构建失败:\n${log.slice(-4000)}`);
  }
  assertNoSecrets(log, `${label} 构建日志`);
  scanBuildArtifacts(label);
  return { log, routes: extractAppPageRoutes(log) };
}

async function waitFor(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      /* not ready */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`fixture API 未就绪: ${url}`);
}

async function main() {
  const negative = spawnSync(
    process.execPath,
    [
      "-e",
      [
        'process.env.WEB_RENDER_MODE="runtime-isr";',
        'process.env.PUBLICATION_DRIVER="revalidation-webhook";',
        "delete process.env.WEB_RUNTIME_REPLICAS;",
        'require("./apps/web/next.config.js");',
      ].join(""),
    ],
    { cwd: ROOT, encoding: "utf8" }
  );
  if (negative.status === 0) {
    throw new Error("runtime-isr 缺少 WEB_RUNTIME_REPLICAS 应当失败");
  }
  if (!/WEB_RUNTIME_REPLICAS/.test(`${negative.stderr}\n${negative.stdout}`)) {
    throw new Error(
      `runtime 副本护栏失败原因不符合预期:\n${negative.stderr}`
    );
  }

  const replicaOverflow = spawnSync(
    process.execPath,
    [
      "-e",
      [
        'process.env.WEB_RENDER_MODE="runtime-isr";',
        'process.env.PUBLICATION_DRIVER="revalidation-webhook";',
        'process.env.WEB_RUNTIME_REPLICAS="2";',
        'require("./apps/web/next.config.js");',
      ].join(""),
    ],
    { cwd: ROOT, encoding: "utf8" }
  );
  if (replicaOverflow.status === 0) {
    throw new Error("runtime-isr 多副本应当失败");
  }

  const fixture = spawn(
    process.execPath,
    ["scripts/fixture-content-api.mjs", "--port", String(API_PORT)],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }
  );
  try {
    await waitFor(`${API}/api/v1/public/posts`);
    const staticBuild = buildWeb("static-export/api", {
      NODE_ENV: "production",
      WEB_CONTENT_SOURCE: "api",
      WEB_RENDER_MODE: "static-export",
      PUBLICATION_DRIVER: "github-dispatch",
      CONTENT_API_BASE_URL: API,
      SITE_URL: "https://lee-ng915.github.io/cBlog",
      BASE_PATH: "/cBlog",
      NEXT_PUBLIC_BASE_PATH: "/cBlog",
    });
    const runtimeBuild = buildWeb("runtime-isr/api", {
      NODE_ENV: "production",
      WEB_CONTENT_SOURCE: "api",
      WEB_RENDER_MODE: "runtime-isr",
      WEB_RUNTIME_REPLICAS: "1",
      PUBLICATION_DRIVER: "revalidation-webhook",
      CONTENT_API_BASE_URL: API,
      SITE_URL: "https://lee-ng915.github.io/cBlog",
      BASE_PATH: "",
      NEXT_PUBLIC_BASE_PATH: "",
    });
    if (
      JSON.stringify(staticBuild.routes) !== JSON.stringify(runtimeBuild.routes)
    ) {
      throw new Error(
        `页面路由不一致\nstatic=${staticBuild.routes.join(",")}\nruntime=${runtimeBuild.routes.join(",")}`
      );
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          routes: staticBuild.routes,
          replicaGuard: true,
        },
        null,
        2
      )
    );
  } finally {
    fixture.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
