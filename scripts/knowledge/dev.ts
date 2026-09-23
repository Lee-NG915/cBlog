import http from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { app } from "../../apps/api/src/index";
import { issueSession, session } from "../../apps/api/src/security";
import { publishLocal } from "./publish.mjs";
import { Hono } from "../../apps/api/node_modules/hono/dist/index.js";
import { database, localImages, root } from "./local-db.mjs";
const { DB } = database();
const env = {
  DB,
  IMAGES: localImages(),
  APP_ENV: "local",
  AI_ENABLED: "false",
  GITHUB_CLIENT_ID: "",
  OWNER_GITHUB_ID: "",
  PUBLIC_ORIGIN: "",
};
const local = new Hono();
// Only this loopback-only development server registers local authentication.
local.post("/auth/local", async (c) => {
  const origin = c.req.header("Origin");
  if (origin !== "http://127.0.0.1:5173" && origin !== "http://127.0.0.1:8787")
    return c.text("Forbidden", 403);
  await issueSession(c);
  return c.json({ data: { ok: true } });
});
local.post("/api/v1/local/publish/:id", async (c) => {
  const auth = await session(c);
  if (!auth) return c.json({ error: { message: "请先登录" } }, 401);
  if (
    c.req.header("Origin") !== new URL(c.req.url).origin ||
    c.req.header("X-CSRF-Token") !== auth.csrf
  )
    return c.json({ error: { message: "来源验证失败" } }, 403);
  const id = Number(c.req.param("id"));
  if (!Number.isSafeInteger(id) || id < 1)
    return c.json({ error: { message: "快照 ID 错误" } }, 400);
  try {
    return c.json({ data: await publishLocal(id) });
  } catch (e) {
    return c.json({ error: { message: (e as Error).message } }, 422);
  }
});
local.get("/published/*", (c) => {
  const url = decodeURIComponent(new URL(c.req.url).pathname).slice(
    "/published/".length,
  );
  if (url.includes("..")) return c.notFound();
  const file = path.join(root, ".knowledge/public", url || "index.html");
  if (!existsSync(file) || !requireFile(file)) return c.notFound();
  let mime = url.endsWith(".css")
    ? "text/css"
    : url.endsWith(".json")
      ? "application/json"
      : "text/html; charset=utf-8";
  if (url.startsWith("media/")) {
    const manifest = JSON.parse(
      readFileSync(path.join(root, ".knowledge/public/manifest.json"), "utf8"),
    );
    mime =
      manifest.assets.find((a: { id: string }) => a.id === url.slice(6))
        ?.mime || "application/octet-stream";
  }
  return new Response(readFileSync(file), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
local.all("/api/*", (c) => app.fetch(c.req.raw, c.env));
local.all("/auth/*", (c) => app.fetch(c.req.raw, c.env));
local.get("*", (c) => {
  const dist = path.join(root, "apps/knowledge/dist");
  let requestPath = decodeURIComponent(new URL(c.req.url).pathname);
  if (requestPath.includes("..")) return c.notFound();
  let file = path.join(dist, requestPath);
  if (!existsSync(file) || !path.extname(file))
    file = path.join(dist, "index.html");
  if (!existsSync(file))
    return c.text(
      "请先运行 pnpm knowledge:build，或打开 http://127.0.0.1:5173",
      503,
    );
  const mime =
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".svg": "image/svg+xml",
    }[path.extname(file)] || "application/octet-stream";
  return new Response(readFileSync(file), {
    headers: { "Content-Type": mime, "Cache-Control": "no-store" },
  });
});
function requireFile(file: string) {
  return statSync(file).isFile();
}
const server = http.createServer(async (req, res) => {
  try {
    if (
      req.headers.host !== "127.0.0.1:8787" &&
      req.headers.host !== "127.0.0.1:5173"
    ) {
      res.writeHead(403);
      res.end("Loopback only");
      return;
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 1100000) {
        res.writeHead(413);
        res.end();
        return;
      }
      chunks.push(chunk);
    }
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: ["GET", "HEAD"].includes(req.method!)
        ? undefined
        : Buffer.concat(chunks),
    });
    const response = await local.fetch(request, env);
    const headers = Object.fromEntries(response.headers);
    headers["X-Content-Type-Options"] = "nosniff";
    headers["Referrer-Policy"] = "same-origin";
    headers["Content-Security-Policy"] =
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
    res.writeHead(response.status, headers);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end("Local server error");
  }
});
server.listen(8787, "127.0.0.1", () =>
  console.log("Color 手记本地验收：http://127.0.0.1:8787（仅本机）"),
);
