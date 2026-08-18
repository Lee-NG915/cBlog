#!/usr/bin/env node
/**
 * Content API 静态 fixture mock server（测试计划 WEB-201/203/204 依赖）。
 *
 * 用法：
 *   node scripts/fixture-content-api.mjs [--port 3201]
 *   PORT=3201 CONTENT_API_READ_TOKEN=test-read-token node scripts/fixture-content-api.mjs
 *
 * 行为：
 *   - 将 /api/v1/public/** 请求路径映射到 scripts/fixtures/content-api/** 下的 JSON 文件
 *     （目录结构与 URL 路径一致，如 /api/v1/public/posts → scripts/fixtures/content-api/posts.json，
 *      /api/v1/public/posts/<slug> → .../posts/<slug>.json）；
 *   - slug 含中文时文件名为 encodeURIComponent 后的形式；server 侧对每个路径段
 *     decodeURIComponent 后再 encodeURIComponent 查找（同时尝试原始段名，两种命名都支持）；
 *   - 命中：200 + content-type: application/json + Cache-Control: private, no-store；
 *   - 未命中：404 同构 envelope {"error":{"code":"NOT_FOUND","message":"内容不存在"}}；
 *   - 每个请求向 stderr 打一行 "<method> <path>"（WEB-205 用请求计数验证 memo 生效）；
 *   - 设置 CONTENT_API_READ_TOKEN 时，缺/错 Bearer 返回 401 envelope（模拟真实行为）。
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(ROOT, "fixtures", "content-api");
const PREFIX = "/api/v1/public";

function parsePort() {
  const idx = process.argv.indexOf("--port");
  if (idx !== -1 && process.argv[idx + 1]) {
    const p = Number.parseInt(process.argv[idx + 1], 10);
    if (Number.isFinite(p) && p > 0) return p;
  }
  const envPort = Number.parseInt(process.env.PORT ?? "", 10);
  if (Number.isFinite(envPort) && envPort > 0) return envPort;
  return 3201;
}

const NOT_FOUND_BODY = JSON.stringify({
  error: { code: "NOT_FOUND", message: "内容不存在" },
});
const UNAUTHORIZED_BODY = JSON.stringify({
  error: { code: "UNAUTHORIZED", message: "缺少或无效的访问令牌" },
});

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "private, no-store",
  });
  res.end(body);
}

/** 将请求路径映射为 fixture 文件候选路径（encoded 段名优先，原始段名兜底）。 */
function fixtureCandidates(requestPath) {
  const rel = requestPath.slice(PREFIX.length).replace(/^\/+|\/+$/g, "");
  if (!rel) return [];
  const segments = rel.split("/");
  const encoded = segments.map((seg) => {
    let decoded = seg;
    try {
      decoded = decodeURIComponent(seg);
    } catch {
      /* 保留原始段 */
    }
    return encodeURIComponent(decoded);
  });
  const candidates = [path.join(FIXTURE_DIR, ...encoded) + ".json"];
  const raw = path.join(FIXTURE_DIR, ...segments) + ".json";
  if (raw !== candidates[0]) candidates.push(raw);
  return candidates;
}

const readToken = process.env.CONTENT_API_READ_TOKEN || "";
const port = parsePort();

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname;
  process.stderr.write(`${req.method} ${pathname}\n`);

  if (req.method !== "GET" || !pathname.startsWith(PREFIX)) {
    sendJson(res, 404, NOT_FOUND_BODY);
    return;
  }

  if (readToken) {
    const auth = req.headers.authorization ?? "";
    if (auth !== `Bearer ${readToken}`) {
      sendJson(res, 401, UNAUTHORIZED_BODY);
      return;
    }
  }

  for (const candidate of fixtureCandidates(pathname)) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      sendJson(res, 200, fs.readFileSync(candidate, "utf8"));
      return;
    }
  }
  sendJson(res, 404, NOT_FOUND_BODY);
});

server.listen(port, "127.0.0.1", () => {
  process.stderr.write(
    `fixture content api listening on http://127.0.0.1:${port} (fixtures: ${FIXTURE_DIR})\n`
  );
});
