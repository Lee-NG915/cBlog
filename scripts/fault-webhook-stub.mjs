#!/usr/bin/env node
/**
 * 故障注入 webhook stub（Phase 6 REL-002 用）。
 * 前 --fail N 次请求返回 500，之后把请求原样转发到目标 webhook（默认 127.0.0.1:3311），
 * 并把目标响应回传给调用方。每请求向 stderr 打一行 "<seq> <status> <eventId>"。
 *
 * 用法：
 *   node scripts/fault-webhook-stub.mjs --port 3202 --fail 3 --target http://127.0.0.1:3311
 */
import http from "node:http";

function argValue(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}
const PORT = Number.parseInt(argValue("--port", "3202"), 10);
const FAIL_COUNT = Number.parseInt(argValue("--fail", "3"), 10);
const TARGET = argValue("--target", "http://127.0.0.1:3311");

let seq = 0;
const server = http.createServer(async (req, res) => {
  if (req.url === "/__health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, requests: seq }));
    return;
  }

  seq += 1;
  const eventId = req.headers["x-cblog-event-id"] ?? "-";
  if (seq <= FAIL_COUNT) {
    process.stderr.write(`${seq} 500 ${eventId}\n`);
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "injected_failure" }));
    return;
  }
  const body = await new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
  try {
    const upstream = await fetch(`${TARGET}${req.url}`, {
      method: req.method,
      headers: {
        "content-type": req.headers["content-type"] ?? "application/json",
        "x-cblog-event-id": req.headers["x-cblog-event-id"] ?? "",
        "x-cblog-timestamp": req.headers["x-cblog-timestamp"] ?? "",
        "x-cblog-key-id": req.headers["x-cblog-key-id"] ?? "",
        "x-cblog-signature": req.headers["x-cblog-signature"] ?? "",
      },
      // JSON webhook 使用 UTF-8 文本转发；避免当前 Node/Undici 将 Buffer /
      // Uint8Array 的底层 ArrayBuffer 转移后再 slice 引发 detached ArrayBuffer。
      // Buffer→string→UTF-8 不会改变合法 JSON 的签名字节。
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : body.toString("utf8"),
    });
    process.stderr.write(`${seq} ${upstream.status} ${eventId}\n`);
    res.writeHead(upstream.status, { "content-type": "application/json" });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    const cause =
      error instanceof Error && error.cause ? ` cause=${String(error.cause)}` : "";
    process.stderr.write(`${seq} 502 ${eventId} ${error}${cause}\n`);
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "upstream_unreachable" }));
  }
});
server.listen(PORT, "127.0.0.1", () => {
  process.stderr.write(
    `fault-webhook-stub on http://127.0.0.1:${PORT} (fail ${FAIL_COUNT} then -> ${TARGET})\n`
  );
});
