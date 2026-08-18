#!/usr/bin/env node
/**
 * Phase 5 ISR 访客视角验证链（03-test-plan §6.3 ISR P0 的可自动化子集）。
 *
 * 流程：复制 fixture 到临时可变目录 → 起 fixture server → runtime-isr 构建
 * → next start → 逐项断言（curl 页面/404/sitemap + 签名 webhook 事件）。
 * 所有断言都从访客视角发起 HTTP 请求，不以 webhook 200 代替页面验证。
 *
 * 用法：
 *   node scripts/isr-check.mjs [--skip-build] [--ttl 5] [--web-port 3311] [--api-port 3211]
 *
 * 前置：scripts/fixtures/content-api/ 已录制；@cblog/web 依赖已安装。
 */
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function argValue(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}
const SKIP_BUILD = process.argv.includes("--skip-build");
const TTL = Number.parseInt(argValue("--ttl", "5"), 10);
const WEB_PORT = Number.parseInt(argValue("--web-port", "3311"), 10);
const API_PORT = Number.parseInt(argValue("--api-port", "3211"), 10);
const WEB = `http://127.0.0.1:${WEB_PORT}`;
const API = `http://127.0.0.1:${API_PORT}`;
const FIXTURE_SRC = path.join(ROOT, "scripts", "fixtures", "content-api");
const FIXTURE_DIR = "/tmp/isr-fixtures";
const API_LOG = "/tmp/isr-api-requests.log";
const KEY_ID = "test-v1";
const SECRET = "test-secret-v1";

const results = [];
function record(id, ok, detail = "") {
  results.push({ id, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}${detail ? `  (${detail})` : ""}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(pathname) {
  const response = await fetch(`${WEB}${pathname}`, { redirect: "manual" });
  return { status: response.status, body: await response.text() };
}

/**
 * 事件后取"新鲜"内容：Next 14 对刚失效的缓存条目按 SWR 处理——
 * 首次请求返回 stale 并触发后台再生，第二次请求才是新内容（实测钉死）。
 */
async function getFresh(pathname) {
  await get(pathname);
  await sleep(400);
  return get(pathname);
}

function sign(rawBody, { keyId = KEY_ID, secret = SECRET, timestamp } = {}) {
  const ts = timestamp ?? Math.floor(Date.now() / 1000).toString();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${ts}.${keyId}.${rawBody}`, "utf8");
  return { ts, signature: `sha256=${hmac.digest("hex")}` };
}

async function sendEvent(event, options = {}) {
  const rawBody = JSON.stringify(event);
  const { ts, signature } = sign(rawBody, options);
  const response = await fetch(`${WEB}/api/revalidate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cblog-event-id": options.eventId ?? event.eventId,
      "x-cblog-timestamp": ts,
      "x-cblog-key-id": options.keyId ?? KEY_ID,
      "x-cblog-signature": signature,
    },
    body: rawBody,
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

let eventSeq = 0;
function makeEvent(entityType, extra) {
  eventSeq += 1;
  return {
    schemaVersion: 1,
    eventId: `isr-check-${Date.now()}-${eventSeq}`,
    entityType,
    operation: "update",
    occurredAt: new Date().toISOString(),
    ...extra,
  };
}

function readFixture(rel) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, rel), "utf8"));
}
function writeFixture(rel, data) {
  fs.writeFileSync(path.join(FIXTURE_DIR, rel), JSON.stringify(data, null, 2));
}
function apiLogCount(pattern) {
  if (!fs.existsSync(API_LOG)) return 0;
  return fs.readFileSync(API_LOG, "utf8").split("\n").filter((line) => line.includes(pattern)).length;
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: options.cwd ?? ROOT,
    env: { ...process.env, ...options.env },
    stdio: options.stdio ?? "inherit",
  });
  return result.status;
}

const WEB_ENV = {
  NODE_ENV: "production",
  WEB_RENDER_MODE: "runtime-isr",
  WEB_RUNTIME_REPLICAS: "1",
  WEB_CONTENT_SOURCE: "api",
  CONTENT_API_BASE_URL: API,
  CONTENT_API_REVALIDATE_TTL: String(TTL),
  PUBLICATION_DRIVER: "revalidation-webhook",
  REVALIDATION_ACTIVE_KEY_ID: KEY_ID,
  REVALIDATION_ACTIVE_SECRET: SECRET,
};

const children = [];
function startBackground(cmd, args, env, logFile) {
  const out = fs.openSync(logFile, "a");
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: ["ignore", out, out],
    detached: false,
  });
  children.push(child);
  return child;
}

async function waitFor(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return true;
    } catch { /* not ready */ }
    await sleep(500);
  }
  return false;
}

function cleanup() {
  for (const child of children) {
    try { child.kill("SIGTERM"); } catch { /* already dead */ }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(130); });

// ---------------------------------------------------------------------------
// 环境准备
// ---------------------------------------------------------------------------

fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
fs.cpSync(FIXTURE_SRC, FIXTURE_DIR, { recursive: true });
fs.rmSync(API_LOG, { force: true });

let apiServer = startBackground(
  "node",
  [path.join(ROOT, "scripts", "fixture-content-api.mjs")],
  { PORT: String(API_PORT), FIXTURE_DIR },
  API_LOG
);
if (!(await waitFor(`${API}/api/v1/public/posts`))) {
  console.error("fixture server 启动失败");
  process.exit(1);
}

if (!SKIP_BUILD) {
  console.log("== runtime-isr 构建 ==");
  const code = run("pnpm", ["--filter", "@cblog/web", "build"], { env: WEB_ENV });
  if (code !== 0) {
    console.error("runtime-isr 构建失败");
    process.exit(1);
  }
}

startBackground(
  "pnpm",
  ["--filter", "@cblog/web", "exec", "next", "start", "-p", String(WEB_PORT)],
  WEB_ENV,
  "/tmp/isr-web.log"
);
if (!(await waitFor(`${WEB}/`))) {
  console.error("next start 启动失败");
  process.exit(1);
}
console.log("== 环境就绪，开始断言 ==");

// ---------------------------------------------------------------------------
// 基线
// ---------------------------------------------------------------------------

const home = await get("/");
record("基线 首页 200", home.status === 200);
const postPage = await get("/posts/product-learning-4/");
record("基线 文章页 200", postPage.status === 200);
const notFoundPage = await get("/posts/definitely-not-exists/");
record("基线 不存在 slug 404", notFoundPage.status === 404);

// ---------------------------------------------------------------------------
// ISR-001：修改已发布正文 → 详情更新，不全量重建
// ---------------------------------------------------------------------------
{
  const rel = "posts/product-learning-4.json";
  const detail = readFixture(rel);
  const marker = "ISR001-NEW-MARKER";
  detail.post.contentMarkdown += `\n\n${marker}\n`;
  detail.post.contentVersion += 1;
  writeFixture(rel, detail);
  const before = apiLogCount("GET /api/v1/public");
  const res = await sendEvent(makeEvent("post", {
    slug: "product-learning-4",
    categorySlug: "learning",
    contentVersion: detail.post.contentVersion,
  }));
  const page = await getFresh("/posts/product-learning-4/");
  const other = await get("/posts/growth-strategy-basics/");
  record(
    "ISR-001 改正文→详情更新",
    res.status === 200 && page.body.includes(marker) && other.status === 200 && !other.body.includes(marker),
    `webhook=${res.status} 请求数+${apiLogCount("GET /api/v1/public") - before}`
  );
}

// ---------------------------------------------------------------------------
// ISR-002：新 slug 首次访问生成，第二次命中缓存（ISR-010 并发合并在后面）
// ---------------------------------------------------------------------------
{
  const list = readFixture("posts.json");
  const newPost = {
    slug: "isr-new-post",
    title: "ISR 新文章",
    excerpt: "首次访问按需生成",
    categorySlug: "technical",
    categoryName: "工程札记",
    tags: [],
    editorialDate: "2026-08-18 00:00:00+00",
    readingMinutes: 1,
    coverUrl: null,
    contentVersion: 1,
  };
  list.posts.unshift(newPost);
  writeFixture("posts.json", list);
  writeFixture("posts/isr-new-post.json", {
    post: {
      ...newPost,
      contentMarkdown: "# ISR 新文章\n\nISR002-MARKER 正文。\n",
      publishedAt: "2026-08-18 00:00:00+00",
      updatedAt: null,
    },
  });
  const sitemap = readFixture("sitemap.json");
  sitemap.sitemap.posts.unshift({ slug: "isr-new-post", editorialDate: "2026-08-18 00:00:00+00", updatedAt: null });
  writeFixture("sitemap.json", sitemap);
  await sendEvent(makeEvent("post", { slug: "isr-new-post", categorySlug: "technical", contentVersion: 1 }));
  const first = await get("/posts/isr-new-post/");
  const second = await get("/posts/isr-new-post/");
  record(
    "ISR-002 新 slug 首次访问生成",
    first.status === 200 && first.body.includes("ISR002-MARKER") && second.status === 200,
    `status=${first.status}`
  );
}

// ---------------------------------------------------------------------------
// ISR-010：20 并发首访新 slug，内置去重只生成一次
// ---------------------------------------------------------------------------
{
  const list = readFixture("posts.json");
  const newPost = { ...list.posts[0], slug: "isr-concurrent-post", title: "并发首访文章" };
  list.posts.unshift(newPost);
  writeFixture("posts.json", list);
  writeFixture("posts/isr-concurrent-post.json", {
    post: { ...newPost, contentMarkdown: "# 并发\n\nISR010-MARKER。\n", publishedAt: "2026-08-18 00:00:00+00", updatedAt: null },
  });
  await sendEvent(makeEvent("post", { slug: "isr-concurrent-post", categorySlug: newPost.categorySlug, contentVersion: 1 }));
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => get("/posts/isr-concurrent-post/"))
  );
  const ok = responses.every((r) => r.status === 200 && r.body.includes("ISR010-MARKER"));
  const fetches = apiLogCount("posts/isr-concurrent-post");
  // Next 内置 Batcher 去重（response-cache/index.js）：并发生成共享同一 Promise；
  // 20 并发下详情请求 1~2 次属平台预期（ISR-010 口径），错误风暴才是失败
  record("ISR-010 并发首访去重", ok && fetches >= 1 && fetches <= 2, `20×200=${ok} 详情请求=${fetches}`);
}

// ---------------------------------------------------------------------------
// ISR-003：下线 → 旧 URL 404，列表/sitemap 无入口
// ---------------------------------------------------------------------------
{
  const list = readFixture("posts.json");
  const idx = list.posts.findIndex((p) => p.slug === "growth-strategy-basics");
  list.posts.splice(idx, 1);
  writeFixture("posts.json", list);
  const sitemap = readFixture("sitemap.json");
  sitemap.sitemap.posts = sitemap.sitemap.posts.filter((p) => p.slug !== "growth-strategy-basics");
  writeFixture("sitemap.json", sitemap);
  fs.rmSync(path.join(FIXTURE_DIR, "posts", "growth-strategy-basics.json"));
  // ISR-004 联动：分类计数同步 -1（categories 标必须随 post 事件失效）
  const categories = readFixture("categories.json");
  const learning = categories.categories.find((c) => c.slug === "learning");
  learning.publishedCount -= 1;
  writeFixture("categories.json", categories);
  await sendEvent(makeEvent("post", { slug: "growth-strategy-basics", categorySlug: "learning", contentVersion: 99, operation: "unpublish" }));
  const gone = await get("/posts/growth-strategy-basics/");
  const homeAfter = await getFresh("/");
  const sitemapAfter = await getFresh("/sitemap.xml");
  record("ISR-003a 下线→旧 URL 404", gone.status === 404, `status=${gone.status}`);
  record(
    "ISR-003b 列表无入口",
    !homeAfter.body.includes("/posts/growth-strategy-basics/")
  );
  record(
    "ISR-003c sitemap 无入口",
    !sitemapAfter.body.includes("growth-strategy-basics")
  );
  const categoryPage = await getFresh("/categories/learning/");
  const categoriesIndex = await getFresh("/categories/");
  record(
    "ISR-004 分类页与计数同步",
    // SSR 中文本表达式之间有 <!-- --> 注释节点："共 <!-- -->6<!-- --> 篇手记"
    /共\s*(?:<!-- -->)?\s*6\s*(?:<!-- -->)?\s*篇手记/.test(categoryPage.body) &&
      !categoryPage.body.includes("/posts/growth-strategy-basics/") &&
      new RegExp("学习记录[\\s\\S]{0,600}?rounded-full[^>]*>\\s*6\\s*<\\/span>").test(
        categoriesIndex.body
      )
  );
}

// ---------------------------------------------------------------------------
// ISR-007：重复 eventId 幂等
// ---------------------------------------------------------------------------
{
  const event = makeEvent("post", { slug: "product-learning-4", categorySlug: "learning", contentVersion: 100 });
  const first = await sendEvent(event);
  const second = await sendEvent(event);
  record(
    "ISR-007 重复 eventId 幂等",
    first.status === 200 && second.status === 200 && second.body.idempotent === true,
    `second.idempotent=${second.body.idempotent}`
  );
}

// ---------------------------------------------------------------------------
// ISR-006：修改专栏文档 → 文档页与专栏页更新，普通文章缓存不失效
// ---------------------------------------------------------------------------
{
  const rel = "collections/rightCapital/items/01.json";
  const item = readFixture(rel);
  const marker = "ISR006-COLLECTION-MARKER";
  const payload = item.item ?? item;
  payload.contentMarkdown += `\n\n${marker}\n`;
  payload.contentVersion = (payload.contentVersion ?? 1) + 1;
  writeFixture(rel, item);
  const before = apiLogCount("GET /api/v1/public/posts/");
  await sendEvent(makeEvent("collection_item", { collectionSlug: "rightCapital", slug: "01", contentVersion: payload.contentVersion }));
  const itemPage = await getFresh("/rightCapital/01/");
  const collectionPage = await get("/rightCapital/");
  const postFetches = apiLogCount("GET /api/v1/public/posts/") - before;
  record(
    "ISR-006 专栏文档精确失效",
    itemPage.body.includes(marker) && collectionPage.status === 200 && postFetches === 0,
    `post 详情请求+${postFetches}`
  );
}

// ---------------------------------------------------------------------------
// ISR-009：TTL 兜底路径下 API 故障 → 保留最后成功页面；恢复后再次生成成功
//（Next 14 实测：时间触发的 stale 访问走 SWR 保留旧页；revalidateTag 强制再生
// 遇渲染抛错则 500、无 stale 兜底、恢复即再生——后者记录在 phase-05 日志）
// ---------------------------------------------------------------------------
{
  // 先预热出新鲜缓存条目（ISR-007 的 revalidateTag 已把旧条目失效，
  // 被失效的条目没有 stale 可服务——SWR 场景必须是"过期但未被失效"的条目）
  await get("/posts/product-learning-4/");
  apiServer.kill("SIGTERM");
  await sleep((TTL + 2) * 1000);
  const stale = await get("/posts/product-learning-4/");
  // 旧页 = 最后一次成功生成的内容（ISR-001 的标记仍在）
  const staleOk = stale.status === 200 && stale.body.includes("ISR001-NEW-MARKER");
  apiServer = startBackground(
    "node",
    [path.join(ROOT, "scripts", "fixture-content-api.mjs")],
    { PORT: String(API_PORT), FIXTURE_DIR },
    API_LOG
  );
  await waitFor(`${API}/api/v1/public/posts`);
  await sleep((TTL + 1) * 1000);
  const recovered = await get("/posts/product-learning-4/");
  record(
    "ISR-009 API 故障保留旧页+恢复再生",
    staleOk && recovered.status === 200,
    `故障期=${stale.status} 恢复后=${recovered.status}`
  );
}

// ---------------------------------------------------------------------------
// ISR-014：webhook 阻断 → TTL 兜底懒更新（不发事件，等 TTL 过期）
// ---------------------------------------------------------------------------
{
  const rel = "posts/product-learning-4.json";
  const detail = readFixture(rel);
  const marker = "ISR014-TTL-MARKER";
  detail.post.contentMarkdown += `\n\n${marker}\n`;
  detail.post.contentVersion += 1;
  writeFixture(rel, detail);
  await sleep((TTL + 2) * 1000);
  // SWR 语义：首个请求返回 stale 并触发后台再生，第二个请求才拿到新内容
  await get("/posts/product-learning-4/");
  await sleep(500);
  const page = await get("/posts/product-learning-4/");
  record("ISR-014 TTL 兜底懒更新", page.body.includes(marker), `ttl=${TTL}s`);
}

// ---------------------------------------------------------------------------
// ISR-015：404 缓存后重新发布 → 恢复 200 且为最新版本
// ---------------------------------------------------------------------------
{
  const list = readFixture("posts.json");
  const restored = {
    slug: "growth-strategy-basics",
    title: "增长策略基础",
    excerpt: "恢复发布",
    categorySlug: "learning",
    categoryName: "学习记录",
    tags: [],
    editorialDate: "2026-04-12 00:00:00+00",
    readingMinutes: 5,
    coverUrl: null,
    contentVersion: 102,
  };
  list.posts.push(restored);
  writeFixture("posts.json", list);
  writeFixture("posts/growth-strategy-basics.json", {
    post: { ...restored, contentMarkdown: "# 增长策略基础\n\nISR015-RESTORED-MARKER。\n", publishedAt: "2026-04-12 00:00:00+00", updatedAt: null },
  });
  const sitemap = readFixture("sitemap.json");
  sitemap.sitemap.posts.push({ slug: "growth-strategy-basics", editorialDate: "2026-04-12 00:00:00+00", updatedAt: null });
  writeFixture("sitemap.json", sitemap);
  const categories = readFixture("categories.json");
  categories.categories.find((c) => c.slug === "learning").publishedCount += 1;
  writeFixture("categories.json", categories);
  await sendEvent(makeEvent("post", { slug: "growth-strategy-basics", categorySlug: "learning", contentVersion: 102, operation: "publish" }));
  const page = await getFresh("/posts/growth-strategy-basics/");
  record(
    "ISR-015 404 后重发布恢复",
    page.status === 200 && page.body.includes("ISR015-RESTORED-MARKER"),
    `status=${page.status}`
  );
}

// ---------------------------------------------------------------------------
// ISR-005：无任何事件时页面保持稳定（draft 修改不产生公开事件，Phase 6 范围）
// ---------------------------------------------------------------------------
{
  const before = (await get("/")).body;
  await sleep((TTL + 1) * 1000);
  const after = (await get("/")).body;
  record("ISR-005 无事件页面不变化", before === after);
}

// ---------------------------------------------------------------------------
// PERF-201：缓存热时普通请求不调用 Content API
//（先预热吸收 TTL 重取，再在 TTL 窗口内复访，断言零新增请求）
// ---------------------------------------------------------------------------
{
  await get("/");
  await get("/posts/product-learning-4/");
  await get("/rightCapital/01/");
  await get("/categories/technical/");
  const markerLine = apiLogCount("GET /api/v1/public");
  await get("/");
  await get("/posts/product-learning-4/");
  await get("/rightCapital/01/");
  await get("/categories/technical/");
  const after = apiLogCount("GET /api/v1/public");
  record("PERF-201 热请求零 API 调用", after === markerLine, `+${after - markerLine} 次`);
}

// ---------------------------------------------------------------------------
// 验签/白名单负例
// ---------------------------------------------------------------------------
{
  const event = makeEvent("post", { slug: "product-learning-4", categorySlug: "learning", contentVersion: 103 });
  const wrongSig = await sendEvent(event, { secret: "wrong-secret" });
  record("负例 错签名 401", wrongSig.status === 401, `status=${wrongSig.status}`);

  const stale = await sendEvent(event, {
    timestamp: (Math.floor(Date.now() / 1000) - 600).toString(),
  });
  record("负例 超时间窗 401", stale.status === 401, `status=${stale.status}`);

  const unknownKey = await sendEvent(event, { keyId: "no-such-key" });
  record("负例 未知 keyId 401", unknownKey.status === 401, `status=${unknownKey.status}`);

  const badSchema = await sendEvent({ schemaVersion: 1, eventId: `isr-check-bad-${Date.now()}`, entityType: "bogus", operation: "update", occurredAt: new Date().toISOString() });
  record("负例 未知 entityType 400", badSchema.status === 400, `status=${badSchema.status}`);

  const injection = await sendEvent(makeEvent("post", { slug: "../../../etc/passwd", categorySlug: "learning", contentVersion: 1 }));
  record("负例 slug 路径注入 400", injection.status === 400, `status=${injection.status}`);
}

// ---------------------------------------------------------------------------
// 汇总
// ---------------------------------------------------------------------------

const failed = results.filter((r) => !r.ok);
console.log(`\n=== ISR 断言 ${results.length - failed.length}/${results.length} 通过 ===`);
if (failed.length) {
  console.log("失败项:", failed.map((r) => r.id).join("；"));
}
// 显式清理并退出：spawn 的子进程会让事件循环存活，依赖 'exit' 钩子会悬挂
cleanup();
process.exit(failed.length ? 1 : 0);
