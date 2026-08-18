#!/usr/bin/env node
/**
 * Phase 6 staging 全链路验证（REL/OBS/E2E + STATIC 合批）。
 *
 * 拓扑 A（runtime-isr）：PG@54329 + MinIO + admin:3101（postgres, revalidation-webhook）
 *   + outbox worker + web runtime-isr:3311（CONTENT_API_BASE_URL=3101）。
 * 拓扑 B（static）：admin/worker 切 PUBLICATION_DRIVER=github-dispatch，
 *   GITHUB_API_BASE_URL 指向 mock stub:3203，callback 用 send-deploy-callback.mjs。
 *
 * 用法：node scripts/phase6-e2e.mjs [--skip-build]
 * 前置：staging DB 有迁移数据（28 posts）；MinIO 在跑；admin/web 均已构建。
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_BUILD = process.argv.includes("--skip-build");
const DB_URL = "postgresql://cblog:cblog@127.0.0.1:54329/cblog";
const ADMIN = "http://127.0.0.1:3101";
const WEB = "http://127.0.0.1:3311";
const FAULT = "http://127.0.0.1:3202";
const MOCK_GH = "http://127.0.0.1:3203";
const KEY_ID = "test-v1";
const SECRET = "test-secret-v1";
const WORKER_LOG = "/tmp/p6-worker.log";
const WEB_LOG = "/tmp/p6-web.log";
const ADMIN_LOG = "/tmp/p6-admin.log";
const FAULT_LOG = "/tmp/p6-fault.log";
const FAULT2_LOG = "/tmp/p6-fault2.log";
const MOCK_GH_LOG = "/tmp/p6-mockgh.log";
const FIXTURE_SLUG = "p6-e2e-post";

const results = [];
function record(id, ok, detail = "") {
  results.push({ id, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}${detail ? `  (${detail})` : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const children = [];
function startBg(name, cmd, args, env, logFile, cwd) {
  const out = fs.openSync(logFile, "a");
  const child = spawn(cmd, args, {
    cwd: cwd ?? ROOT,
    env: { ...process.env, ...env },
    stdio: ["ignore", out, out],
  });
  children.push({ name, child });
  return child;
}
function stopBg(name) {
  for (const entry of children.filter((c) => c.name === name)) {
    try { entry.child.kill("SIGTERM"); } catch { /* dead */ }
  }
}
function cleanup() {
  for (const { child } of children) {
    try { child.kill("SIGTERM"); } catch { /* dead */ }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(130); });

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return true;
    } catch { /* not ready */ }
    await sleep(500);
  }
  return false;
}

function psql(sql) {
  const r = spawnSync(
    "docker",
    ["exec", "infra-postgres-1", "psql", "-U", "cblog", "-d", "cblog", "-t", "-A", "-c", sql],
    { encoding: "utf8" }
  );
  return r.stdout.trim();
}

// ---- admin 会话（AUTH_TEST_MODE 登录，复用 contract-check 流程） ----
const jar = new Map();
function absorb(res) {
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (pair.slice(eq + 1).trim()) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}
async function adminFetch(pathname, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  const cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${ADMIN}${pathname}`, { ...options, headers, redirect: "manual" });
  absorb(res);
  return res;
}
async function adminLogin() {
  const csrf = await (await adminFetch("/api/auth/csrf")).json();
  await adminFetch("/api/auth/callback/test-identity", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, githubId: "777001" }).toString(),
  });
}
async function adminJson(pathname, options = {}) {
  const res = await adminFetch(pathname, options);
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function webGet(pathname) {
  const res = await fetch(`${WEB}${pathname}`, { redirect: "manual" });
  return { status: res.status, body: await res.text() };
}
/** 事件后取新鲜内容（SWR：首访 stale 触发再生，次访 fresh） */
async function webGetFresh(pathname) {
  await webGet(pathname);
  await sleep(400);
  return webGet(pathname);
}
async function webWaitFor(pathname, predicate, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let latest = await webGet(pathname);
  while (Date.now() < deadline) {
    if (predicate(latest)) return latest;
    await sleep(500);
    latest = await webGet(pathname);
  }
  return latest;
}

// ---- 环境装配 ----
const ADMIN_ENV = {
  DATABASE_URL: DB_URL,
  ADMIN_STORAGE: "postgres",
  PUBLIC_CONTENT_API_ENABLED: "true",
  GIT_PUBLISH_ENABLED: "false",
  AUTH_TEST_MODE: "1",
  ADMIN_ALLOWED_GITHUB_ID: "777001",
  AUTH_SECRET: "contract-test-secret",
  CONTENT_API_READ_TOKEN: "test-read-token",
  OBJECT_STORAGE_ENDPOINT: "http://127.0.0.1:19000",
  OBJECT_STORAGE_BUCKET: "cblog",
  OBJECT_STORAGE_ACCESS_KEY: "minioadmin",
  OBJECT_STORAGE_SECRET_KEY: "minioadmin",
  OBJECT_STORAGE_PUBLIC_BASE_URL: "http://127.0.0.1:19000/cblog",
  DEPLOY_CALLBACK_SECRET: "test-callback-secret",
  PUBLICATION_DRIVER: "revalidation-webhook",
  REVALIDATION_WEBHOOK_URL: `${WEB}/api/revalidate`,
  REVALIDATION_ACTIVE_KEY_ID: KEY_ID,
  REVALIDATION_ACTIVE_SECRET: SECRET,
};
const WORKER_ENV = {
  DATABASE_URL: DB_URL,
  PUBLICATION_DRIVER: "revalidation-webhook",
  REVALIDATION_WEBHOOK_URL: `${WEB}/api/revalidate`,
  REVALIDATION_ACTIVE_KEY_ID: KEY_ID,
  REVALIDATION_ACTIVE_SECRET: SECRET,
  OUTBOX_POLL_INTERVAL_MS: "1000",
  OUTBOX_CLAIM_TIMEOUT_SECONDS: "5",
  OUTBOX_REQUEST_TIMEOUT_MS: "2000",
  OUTBOX_BACKOFF_MS: "1000,2000,3000,4000",
};
const WEB_ENV = {
  NODE_ENV: "production",
  WEB_RENDER_MODE: "runtime-isr",
  WEB_RUNTIME_REPLICAS: "1",
  WEB_CONTENT_SOURCE: "api",
  CONTENT_API_BASE_URL: ADMIN,
  CONTENT_API_READ_TOKEN: "test-read-token",
  CONTENT_API_REVALIDATE_TTL: "30",
  PUBLICATION_DRIVER: "revalidation-webhook",
  REVALIDATION_ACTIVE_KEY_ID: KEY_ID,
  REVALIDATION_ACTIVE_SECRET: SECRET,
};

function startAdmin(extraEnv = {}) {
  startBg("admin", "pnpm", ["--filter", "@cblog/admin", "exec", "next", "start", "-p", "3101"], { ...ADMIN_ENV, ...extraEnv }, ADMIN_LOG);
}
function startWorker(extraEnv = {}) {
  return startBg("worker", "pnpm", ["--filter", "@cblog/admin", "worker"], { ...WORKER_ENV, ...extraEnv }, WORKER_LOG);
}
function startWeb() {
  startBg("web", "pnpm", ["--filter", "@cblog/web", "exec", "next", "start", "-p", "3311"], WEB_ENV, WEB_LOG);
}

async function waitEventStatus(eventId, want, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const row = psql(`select status, attempt_count from publication_events where id='${eventId}'`);
    const [status, attempts] = row.split("|");
    if (status === want) return { status, attempts: Number(attempts) };
    await sleep(500);
  }
  return null;
}

async function latestEventFor(slug) {
  const row = psql(`select id, status, operation from publication_events where payload_json->>'slug'='${slug}' order by created_at desc limit 1`);
  const [id, status, operation] = row.split("|");
  return { id, status, operation };
}

async function createDraftAndPublish(slug, title) {
  const created = await adminJson("/api/v1/admin/posts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title, slug, categorySlug: "technical" }),
  });
  const id = created.body.id;
  const detail = await adminJson(`/api/v1/admin/posts/${id}`);
  const post = detail.body.post ?? detail.body;
  const pub = await adminJson(`/api/v1/admin/posts/${id}/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "published", expectedVersion: post.version }),
  });
  return { id, publishStatus: pub.status };
}

async function savePostContent(id, content, marker) {
  const detail = await adminJson(`/api/v1/admin/posts/${id}`);
  const post = detail.body.post ?? detail.body;
  return adminJson(`/api/v1/admin/posts/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: `# ${post.title}\n\n${content}\n\n${marker}\n`, expectedVersion: post.version }),
  });
}

async function deletePost(id) {
  const detail = await adminJson(`/api/v1/admin/posts/${id}`);
  const post = detail.body.post ?? detail.body;
  await adminJson(`/api/v1/admin/posts/${id}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ expectedVersion: post.version }),
  });
}

// ---------------------------------------------------------------------------
// 预检
// ---------------------------------------------------------------------------
const postCount = psql("select count(*) from posts");
if (postCount !== "28") {
  console.error(`staging DB posts=${postCount}，预期 28——先重建迁移数据`);
  process.exit(1);
}
const existingOutboxRows = psql(`
  select
    (select count(*) from publication_events) + 
    (select count(*) from publication_deployments)
`);
if (existingOutboxRows !== "0") {
  console.error(
    `staging outbox 非空（events + deployments=${existingOutboxRows}），` +
      "为避免 worker 投递非 fixture 数据，拒绝在共享/脏环境运行"
  );
  process.exit(1);
}
fs.rmSync(WORKER_LOG, { force: true });
fs.rmSync(WEB_LOG, { force: true });
fs.rmSync(ADMIN_LOG, { force: true });
fs.rmSync(FAULT_LOG, { force: true });
fs.rmSync(FAULT2_LOG, { force: true });
fs.rmSync(MOCK_GH_LOG, { force: true });

if (!SKIP_BUILD) {
  console.log("== 构建 admin ==");
  if (spawnSync("pnpm", ["--filter", "@cblog/admin", "build"], { cwd: ROOT, stdio: "inherit" }).status !== 0) process.exit(1);
  // Web 的 generateStaticParams 在 production build 期间读取 Content API，
  // 因此必须先启动刚构建好的 Admin，不能等到两个 build 都结束后再装配运行拓扑。
  startAdmin();
  if (!(await waitFor(`${ADMIN}/login`))) {
    console.error("供 Web build 使用的 admin 启动失败");
    process.exit(1);
  }
  console.log("== 构建 web（runtime-isr） ==");
  if (spawnSync("pnpm", ["--filter", "@cblog/web", "build"], { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...WEB_ENV } }).status !== 0) process.exit(1);
  stopBg("admin");
  await sleep(1500);
}

startAdmin();
startWeb();
if (!(await waitFor(`${ADMIN}/login`)) || !(await waitFor(`${WEB}/`))) {
  console.error("admin/web 启动失败");
  process.exit(1);
}
await adminLogin();
console.log("== 环境就绪（拓扑 A：runtime-isr） ==");

// ---------------------------------------------------------------------------
// E2E-202/203 + REL-006/007 + OBS-001：发布→投递→访客可见
// ---------------------------------------------------------------------------
const E2E_SLUG = FIXTURE_SLUG;
let e2ePostId;
{
  // 先确保无残留
  const existing = psql(`select id from posts where slug='${E2E_SLUG}'`);
  psql(`delete from publication_events where payload_json->>'slug'='${E2E_SLUG}'`);
  if (existing) psql(`delete from posts where slug='${E2E_SLUG}'`);

  const created = await createDraftAndPublish(E2E_SLUG, "Phase6 端到端验证");
  e2ePostId = created.id;
  record("E2E-202a 建 draft 并发布（API）", created.publishStatus === 200, `publish=${created.publishStatus}`);

  const draftEvents = psql(`select count(*) from publication_events where payload_json->>'slug'='${E2E_SLUG}'`);
  const event = await latestEventFor(E2E_SLUG);
  record("E2E-202b draft 无事件+publish 事件产生", draftEvents === "1" && event.operation === "publish", `events=${draftEvents} op=${event.operation}`);

  startWorker();
  const delivered = await waitEventStatus(event.id, "delivered", 30000);
  record("E2E-202c 事件 delivered", delivered !== null, delivered ? `attempts=${delivered.attempts}` : "超时");

  const page = await webWaitFor(
    `/posts/${E2E_SLUG}/`,
    (response) =>
      response.status === 200 &&
      response.body.includes("Phase6 端到端验证")
  );
  const home = await webWaitFor(
    "/",
    (response) => response.body.includes("Phase6 端到端验证")
  );
  const category = await webWaitFor(
    "/categories/technical/",
    (response) => response.body.includes("Phase6 端到端验证")
  );
  const sitemap = await webWaitFor(
    "/sitemap.xml",
    (response) => response.body.includes(E2E_SLUG),
    60000
  );
  const visitorVisible =
    page.status === 200 &&
    page.body.includes("Phase6 端到端验证") &&
    home.body.includes("Phase6 端到端验证") &&
    category.body.includes("Phase6 端到端验证") &&
    sitemap.body.includes(E2E_SLUG);
  record(
    "E2E-202d 访客视角：文章/首页/分类/sitemap 可见（无全站部署）",
    visitorVisible,
    `page=${page.status} page/home/category/sitemap=${[
      page.body.includes("Phase6 端到端验证"),
      home.body.includes("Phase6 端到端验证"),
      category.body.includes("Phase6 端到端验证"),
      sitemap.body.includes(E2E_SLUG),
    ].join("/")}`
  );

  // REL-006：状态流经 API 可观察（保存成功→同步中→已上线）
  const adminPublishLog = fs.readFileSync(ADMIN_LOG, "utf8");
  const pubs = await adminJson("/api/v1/admin/publications");
  const ev = (pubs.body.events ?? []).find((e) => e.id === event.id);
  record(
    "REL-006 发布动态 API 呈现已上线状态",
    pubs.status === 200 && ev?.status === "delivered" && !!ev?.deliveredAt,
    `status=${ev?.status}`
  );

  // OBS-001：同一 eventId 贯穿 worker 日志与 web 日志
  const workerLog = fs.readFileSync(WORKER_LOG, "utf8");
  const webLog = fs.readFileSync(WEB_LOG, "utf8");
  record(
    "OBS-001 eventId 四处串联（Admin/DB/worker/web）",
    adminPublishLog.includes(event.id) &&
      psql(`select count(*) from publication_events where id='${event.id}'`) === "1" &&
      workerLog.includes(event.id) &&
      webLog.includes(event.id)
  );
}

// ---------------------------------------------------------------------------
// E2E-203 + REL-007：编辑再发布→只展示新版本；连续编辑→最高版本
// ---------------------------------------------------------------------------
{
  await savePostContent(e2ePostId, "第二版正文", "P6-V2-MARKER");
  const event = await latestEventFor(E2E_SLUG);
  const delivered = await waitEventStatus(event.id, "delivered", 30000);
  const page = await webGetFresh(`/posts/${E2E_SLUG}/`);
  record(
    "E2E-203 编辑再发布→前台只展示新版本",
    delivered !== null && page.body.includes("P6-V2-MARKER") && event.operation === "update",
    `op=${event.operation}`
  );

  let lastVersion = 0;
  for (let v = 3; v <= 7; v++) {
    await savePostContent(e2ePostId, `第 ${v} 版`, `P6-V${v}-MARKER`);
    lastVersion = v;
  }
  const finalEvent = await latestEventFor(E2E_SLUG);
  await waitEventStatus(finalEvent.id, "delivered", 60000);
  // 等所有 pending 清空
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline && psql(`select count(*) from publication_events where payload_json->>'slug'='${E2E_SLUG}' and status in ('pending','delivering')`) !== "0") {
    await sleep(1000);
  }
  const finalPage = await webGetFresh(`/posts/${E2E_SLUG}/`);
  record(
    "REL-007 连续 5 次编辑→最终页面=最高版本",
    finalPage.body.includes(`P6-V${lastVersion}-MARKER`) && !finalPage.body.includes("P6-V3-MARKER")
  );
}

// ---------------------------------------------------------------------------
// REL-001：worker 停止时发布 → pending 保留 → 重启自动投递
// ---------------------------------------------------------------------------
{
  stopBg("worker");
  await sleep(1500);
  await savePostContent(e2ePostId, "REL-001 版本", "P6-REL001-MARKER");
  const event = await latestEventFor(E2E_SLUG);
  const early = psql(`select status from publication_events where id='${event.id}'`);
  startWorker();
  const delivered = await waitEventStatus(event.id, "delivered", 30000);
  record(
    "REL-001 worker 停止→事件 pending→恢复后投递成功",
    early === "pending" && delivered !== null,
    `kill 时=${early}`
  );
}

// ---------------------------------------------------------------------------
// REL-002：webhook 连续 500×3 → 指数退避 → delivered
// ---------------------------------------------------------------------------
{
  startBg("fault", "node", [path.join(ROOT, "scripts/fault-webhook-stub.mjs"), "--port", "3202", "--fail", "3", "--target", WEB], {}, FAULT_LOG);
  if (!(await waitFor(`${FAULT}/__health`, 20))) {
    console.error("fault webhook stub 启动失败");
    process.exit(1);
  }
  stopBg("worker");
  await sleep(1500);
  startWorker({ REVALIDATION_WEBHOOK_URL: `${FAULT}/api/revalidate` });
  await savePostContent(e2ePostId, "REL-002 版本", "P6-REL002-MARKER");
  const event = await latestEventFor(E2E_SLUG);
  const delivered = await waitEventStatus(event.id, "delivered", 60000);
  const faultLog = fs.readFileSync(FAULT_LOG, "utf8");
  const failures = (faultLog.match(/ 500 /g) ?? []).length;
  record(
    "REL-002 500×3→退避重试→delivered",
    delivered !== null && Number(delivered.attempts) >= 4 && failures >= 3,
    `attempts=${delivered?.attempts} 500次数=${failures}`
  );
  stopBg("fault");
  stopBg("worker");
  await sleep(1500);
  startWorker();
}

// ---------------------------------------------------------------------------
// REL-003：收到 200 后、mark delivered 前真实崩溃 → 超时回收 → 重投安全
// ---------------------------------------------------------------------------
{
  stopBg("worker");
  await sleep(1500);
  const crashWorker = startWorker({ WORKER_CRASH_AFTER_RESPONSE: "1" });
  await savePostContent(e2ePostId, "REL-003 版本", "P6-REL003-MARKER");
  const event = await latestEventFor(E2E_SLUG);
  const crashDeadline = Date.now() + 15000;
  while (Date.now() < crashDeadline && crashWorker.exitCode === null) {
    await sleep(250);
  }
  const crashedAfterResponse =
    crashWorker.exitCode === 86 &&
    psql(`select status from publication_events where id='${event.id}'`) === "delivering" &&
    fs.readFileSync(WEB_LOG, "utf8").includes(event.id);
  await sleep(6000);
  startWorker();
  const delivered = await waitEventStatus(event.id, "delivered", 30000);
  record(
    "REL-003 200 后真实崩溃→回收重投安全→delivered",
    crashedAfterResponse && delivered !== null,
    delivered
      ? `crash=${crashWorker.exitCode} attempts=${delivered.attempts}`
      : "超时"
  );
}

// ---------------------------------------------------------------------------
// E2E-205：Web 暂停→发布→Admin 显示同步中→Web 恢复→自动上线
// ---------------------------------------------------------------------------
{
  stopBg("web");
  await sleep(2000);
  await savePostContent(e2ePostId, "E2E-205 版本", "P6-E205-MARKER");
  const event = await latestEventFor(E2E_SLUG);
  await sleep(6000); // 让 worker 失败重试几轮
  const midStatus = psql(`select status from publication_events where id='${event.id}'`);
  const pubs = await adminJson("/api/v1/admin/publications");
  const ev = (pubs.body.events ?? []).find((e) => e.id === event.id);
  const visibleAsPending = ev && ev.status !== "delivered";
  startWeb();
  await waitFor(`${WEB}/`);
  const delivered = await waitEventStatus(event.id, "delivered", 60000);
  const page = await webGetFresh(`/posts/${E2E_SLUG}/`);
  record(
    "E2E-205 Web 暂停→同步中→恢复自动上线",
    midStatus !== "delivered" && visibleAsPending && delivered !== null && page.body.includes("P6-E205-MARKER"),
    `暂停时=${midStatus}`
  );
}

// ---------------------------------------------------------------------------
// REL-005：耗尽转 failed → Admin 手动重试 → delivered
// ---------------------------------------------------------------------------
{
  stopBg("worker");
  await sleep(1500);
  startBg("fault", "node", [path.join(ROOT, "scripts/fault-webhook-stub.mjs"), "--port", "3202", "--fail", "99", "--target", WEB], {}, FAULT2_LOG);
  startWorker({ REVALIDATION_WEBHOOK_URL: `${FAULT}/api/revalidate`, OUTBOX_MAX_ATTEMPTS: "2" });
  await savePostContent(e2ePostId, "REL-005 版本", "P6-REL005-MARKER");
  const event = await latestEventFor(E2E_SLUG);
  const failed = await waitEventStatus(event.id, "failed", 30000);
  const pubs = await adminJson("/api/v1/admin/publications");
  const ev = (pubs.body.events ?? []).find((e) => e.id === event.id);
  const retry = await adminJson(`/api/v1/admin/publications/${event.id}/retry`, { method: "POST" });
  stopBg("fault");
  stopBg("worker");
  await sleep(1500);
  startWorker();
  const delivered = await waitEventStatus(event.id, "delivered", 30000);
  record(
    "REL-005 耗尽 failed→Admin 可见→手动重试→delivered",
    failed !== null && ev?.status === "failed" && !!ev?.lastError && retry.status === 200 && delivered !== null,
    `retry=${retry.status}`
  );
}

// ---------------------------------------------------------------------------
// OBS-002：积压告警（停 web 造 >5 pending）
// ---------------------------------------------------------------------------
{
  stopBg("web");
  await sleep(2000);
  for (let i = 1; i <= 6; i++) {
    await savePostContent(e2ePostId, `OBS-002 版本 ${i}`, `P6-OBS002-V${i}`);
  }
  await sleep(3000);
  const pubs = await adminJson("/api/v1/admin/publications");
  const workerLog = fs.readFileSync(WORKER_LOG, "utf8");
  const backlogMetric = workerLog
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .find(
      (line) =>
        line?.metric === "outbox_tick" &&
        Number(line.pending) >= 6 &&
        Number(line.oldest_pending_age_seconds) > 0
    );
  record(
    "OBS-002 积压告警可见+pending/age 指标",
    pubs.body.stats?.backlogWarning === true && !!backlogMetric,
    `backlog=${pubs.body.stats?.backlogWarning} metricPending=${backlogMetric?.pending}`
  );
  startWeb();
  await waitFor(`${WEB}/`);
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline && psql(`select count(*) from publication_events where status in ('pending','delivering')`) !== "0") {
    await sleep(1000);
  }
  record("OBS-002 恢复后积压自动清空", psql(`select count(*) from publication_events where status in ('pending','delivering')`) === "0");
}

// ---------------------------------------------------------------------------
// 拓扑 B：static driver 合批 + callback 联动（STATIC-004/005/006）
// ---------------------------------------------------------------------------
{
  console.log("== 拓扑 B：github-dispatch 合批验证 ==");
  stopBg("worker");
  stopBg("admin");
  await sleep(2000);
  startBg("mockgh", "node", [path.join(ROOT, "scripts/mock-github-dispatch.mjs"), "--port", "3203"], {}, MOCK_GH_LOG);
  await fetch(`${MOCK_GH}/__reset`, { method: "POST" }).catch(() => {});
  startAdmin({
    PUBLICATION_DRIVER: "github-dispatch",
    GITHUB_REPOSITORY: "owner/repo",
    GITHUB_DISPATCH_TOKEN: "fake-token",
  });
  await waitFor(`${ADMIN}/login`);
  jar.clear();
  await adminLogin();
  startWorker({
    PUBLICATION_DRIVER: "github-dispatch",
    GITHUB_API_BASE_URL: MOCK_GH,
    GITHUB_REPOSITORY: "owner/repo",
    GITHUB_DISPATCH_TOKEN: "fake-token",
    OUTBOX_BATCH_WINDOW_SECONDS: "2",
  });

  // STATIC-004：连续两事件 → 一次 dispatch（合批）
  await savePostContent(e2ePostId, "STATIC-004 A", "P6-S4A-MARKER");
  await savePostContent(e2ePostId, "STATIC-004 B", "P6-S4B-MARKER");
  await sleep(6000);
  const ghRequests = await (await fetch(`${MOCK_GH}/__requests`)).json();
  const dispatchCount = ghRequests.requests.length;
  const awaiting = psql(`select count(*) from publication_events where payload_json->>'slug'='${E2E_SLUG}' and status='awaiting_deploy'`);
  record(
    "STATIC-004 连续事件合并为一次部署批次",
    dispatchCount === 1 && Number(awaiting) >= 2,
    `dispatch=${dispatchCount} awaiting=${awaiting}`
  );

  // STATIC-006/联动：callback succeeded → 关联事件 delivered；重复 callback 幂等
  const deploymentExternalId = ghRequests.requests[0]?.body?.client_payload?.batchId;
  const cb = (status) =>
    spawnSync("node", [path.join(ROOT, "scripts/send-deploy-callback.mjs"), "--batch-id", deploymentExternalId, "--status", status], {
      cwd: ROOT,
      env: { ...process.env, DEPLOY_CALLBACK_URL: `${ADMIN}/api/v1/internal/deployments/callback`, DEPLOY_CALLBACK_SECRET: "test-callback-secret" },
      encoding: "utf8",
    });
  let r = cb("succeeded");
  const deliveredCount = psql(`select count(*) from publication_events where payload_json->>'slug'='${E2E_SLUG}' and status='delivered' and deployment_id is not null`);
  const r2 = cb("succeeded");
  record(
    "STATIC-006 callback→事件 delivered；重复 callback 幂等",
    r.status === 0 && Number(deliveredCount) >= 2 && r2.status === 0 && (r2.stdout + r2.stderr).includes('"linkedEvents":0'),
    `delivered=${deliveredCount} 重发linked=${(r2.stdout + r2.stderr).includes('"linkedEvents":0')}`
  );

  // STATIC-005：下一批 callback failed → 事件 failed 不误报已上线；手动重试恢复
  await savePostContent(e2ePostId, "STATIC-005 版本", "P6-S5-MARKER");
  await sleep(6000);
  const gh2 = await (await fetch(`${MOCK_GH}/__requests`)).json();
  const batchId2 = gh2.requests[gh2.requests.length - 1]?.body?.client_payload?.batchId;
  const failEvent = await latestEventFor(E2E_SLUG);
  const cbFail = spawnSync("node", [path.join(ROOT, "scripts/send-deploy-callback.mjs"), "--batch-id", batchId2, "--status", "failed", "--detail", "deploy exploded"], {
    cwd: ROOT,
    env: { ...process.env, DEPLOY_CALLBACK_URL: `${ADMIN}/api/v1/internal/deployments/callback`, DEPLOY_CALLBACK_SECRET: "test-callback-secret" },
    encoding: "utf8",
  });
  const failedStatus = psql(`select status from publication_events where id='${failEvent.id}'`);
  const retry = await adminJson(`/api/v1/admin/publications/${failEvent.id}/retry`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  await sleep(6000);
  const gh3 = await (await fetch(`${MOCK_GH}/__requests`)).json();
  record(
    "STATIC-005 部署失败→事件 failed 不误报→手动重试重新投递",
    cbFail.status === 0 && failedStatus === "failed" && retry.status === 200 && gh3.requests.length === 3,
    `失败后=${failedStatus} dispatch总数=${gh3.requests.length}`
  );

  // 清理 static 拓扑：恢复 runtime 配置
  stopBg("worker");
  stopBg("admin");
  stopBg("mockgh");
  await sleep(2000);
  startAdmin();
  await waitFor(`${ADMIN}/login`);
  jar.clear();
  await adminLogin();
  startWorker();
}

// ---------------------------------------------------------------------------
// 清理测试文章
// ---------------------------------------------------------------------------
{
  await deletePost(e2ePostId);
  const deleteEvent = await latestEventFor(E2E_SLUG);
  const deleteDelivered = await waitEventStatus(deleteEvent.id, "delivered", 30000);
  const gone = psql(`select count(*) from posts where slug='${E2E_SLUG}'`);
  record("清理：测试文章已删除且 delete 事件完成", gone === "0" && deleteDelivered !== null);
  psql(`
    delete from publication_deployments
    where id in (
      select distinct pde.deployment_id
      from publication_deployment_events pde
      join publication_events e on e.id = pde.event_id
      where e.payload_json->>'slug'='${E2E_SLUG}'
    )
  `);
  psql(`delete from publication_events where payload_json->>'slug'='${E2E_SLUG}'`);
}

// ---------------------------------------------------------------------------
// 汇总
// ---------------------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log(`\n=== Phase 6 断言 ${results.length - failed.length}/${results.length} 通过 ===`);
if (failed.length) console.log("失败项:", failed.map((r) => r.id).join("；"));
cleanup();
process.exit(failed.length ? 1 : 0);
