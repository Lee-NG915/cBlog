#!/usr/bin/env node
/**
 * 本地 mock GitHub dispatches 端点（Phase 6 static driver 合批验证用）。
 * 记录每次 POST /repos/<owner>/<repo>/dispatches 请求（event_type、client_payload、Authorization），
 * 返回 204；提供 GET /__requests 供 harness 断言 dispatch 次数与 payload。
 *
 * 用法：
 *   node scripts/mock-github-dispatch.mjs --port 3203
 */
import http from "node:http";

function argValue(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}
const PORT = Number.parseInt(argValue("--port", "3203"), 10);

const requests = [];
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (req.method === "GET" && url.pathname === "/__requests") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ requests }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/__reset") {
    requests.length = 0;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "POST" && url.pathname.endsWith("/dispatches")) {
    const body = await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    requests.push({
      path: url.pathname,
      authorization: req.headers.authorization ?? null,
      body: JSON.parse(body || "{}"),
      receivedAt: new Date().toISOString(),
    });
    process.stderr.write(`dispatch #${requests.length} ${url.pathname}\n`);
    res.writeHead(204);
    res.end();
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});
server.listen(PORT, "127.0.0.1", () => {
  process.stderr.write(`mock-github-dispatch on http://127.0.0.1:${PORT}\n`);
});
