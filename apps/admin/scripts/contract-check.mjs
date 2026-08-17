#!/usr/bin/env node
/**
 * Phase 3 契约/安全断言矩阵（03-test-plan：AUTH/API/SEC P0 的可自动化子集）。
 * 前置：admin 以 production build 运行（next start），AUTH_TEST_MODE=1。
 *
 * 用法：
 *   node scripts/contract-check.mjs --base-url http://127.0.0.1:3101 \
 *     --mode postgres --allowed-id 777001 --wrong-id 888002 [--read-token t]
 *
 * postgres 模式跑全矩阵（含写路径/版本冲突/公开 API 泄漏检查）；
 * filesystem 模式只跑只读 + 鉴权负例（不弄脏仓库工作区）。
 */

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const baseUrl = argValue("--base-url") ?? "http://127.0.0.1:3101";
const mode = argValue("--mode") ?? "postgres";
const allowedId = argValue("--allowed-id") ?? "777001";
const wrongId = argValue("--wrong-id") ?? "888002";
const readToken = argValue("--read-token");

const results = [];
function record(id, ok, detail = "") {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}${detail ? `  (${detail})` : ""}`);
}

/** 极简 cookie jar */
function makeJar() {
  const cookies = new Map();
  return {
    absorb(response) {
      const headers = response.headers.getSetCookie?.() ?? [];
      for (const line of headers) {
        const [pair] = line.split(";");
        const eq = pair.indexOf("=");
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (value === "" || /expires=Thu, 01 Jan 1970/i.test(line)) {
          cookies.delete(name);
        } else {
          cookies.set(name, value);
        }
      }
    },
    header() {
      return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    clear() {
      cookies.clear();
    },
  };
}

async function request(jar, path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (jar) {
    const cookie = jar.header();
    if (cookie) headers.cookie = cookie;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    redirect: "manual",
  });
  jar?.absorb(response);
  return response;
}

/** 通过测试身份 provider 登录（Auth.js credentials 流） */
async function login(jar, githubId) {
  const csrfResponse = await request(jar, "/api/auth/csrf");
  const { csrfToken } = await csrfResponse.json();
  const body = new URLSearchParams({ csrfToken, githubId });
  await request(jar, "/api/auth/callback/test-identity", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

function authHeaders(extra = {}) {
  return readToken
    ? { authorization: `Bearer ${readToken}`, ...extra }
    : extra;
}

const anonymous = makeJar();
const wrongSession = makeJar();
const admin = makeJar();

// ---------- AUTH ----------
{
  const page = await request(anonymous, "/posts");
  record(
    "AUTH-001a 未登录页面重定向登录",
    [302, 307].includes(page.status) &&
      (page.headers.get("location") ?? "").includes("/login")
  );
  const api = await request(anonymous, "/api/v1/admin/posts");
  record("AUTH-001b 未登录 API 401", api.status === 401);

  await login(wrongSession, wrongId);
  const wrongApi = await request(wrongSession, "/api/v1/admin/posts");
  record(
    "AUTH-002 非 allowlist GitHub ID 拒绝",
    wrongApi.status === 401,
    `status=${wrongApi.status}`
  );

  const forged = await request(null, "/api/v1/admin/posts", {
    headers: { cookie: "authjs.session-token=forged-token-value" },
  });
  record("AUTH-003 伪造/失效会话拒绝", forged.status === 401);

  await login(admin, allowedId);
  const ok = await request(admin, "/api/v1/admin/posts");
  record("AUTH allowlist 登录后可访问", ok.status === 200);

  const csrf = await request(admin, "/api/v1/admin/categories", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://evil.example",
    },
    body: JSON.stringify({ slug: "evil", name: "evil" }),
  });
  record("AUTH-004 跨源写请求 403", csrf.status === 403);

  const assets = await request(anonymous, "/api/assets?doc=x&name=y");
  record("SEC-004b 资产预览接口要求登录", assets.status === 401);
}

// ---------- Public API ----------
if (mode === "postgres") {
  const posts = await request(null, "/api/v1/public/posts", {
    headers: authHeaders(),
  });
  record("API-001 公开列表 200", posts.status === 200);
  const postsBody = await posts.json();

  if (readToken) {
    const noToken = await request(null, "/api/v1/public/posts");
    record("API-005a 缺 token 401", noToken.status === 401);
    const badToken = await request(null, "/api/v1/public/posts", {
      headers: { authorization: "Bearer wrong-token" },
    });
    record("API-005b 错 token 401", badToken.status === 401);
  }

  const bypass = await request(null, "/api/v1/public/posts?status=draft", {
    headers: authHeaders(),
  });
  const bypassBody = await bypass.json();
  record(
    "API-003 status 绕过参数被忽略",
    bypass.status === 200 &&
      JSON.stringify(bypassBody.posts.map((p) => p.slug).sort()) ===
        JSON.stringify(postsBody.posts.map((p) => p.slug).sort())
  );

  // 从 admin 列表找一篇 draft，验证公开侧 404 与未知 slug 不可区分（API-002）
  const adminList = await (
    await request(admin, "/api/v1/admin/posts?status=draft")
  ).json();
  const draftSlug = adminList.posts[0]?.slug;
  if (draftSlug) {
    const draft = await request(
      null,
      `/api/v1/public/posts/${encodeURIComponent(draftSlug)}`,
      { headers: authHeaders() }
    );
    const missing = await request(null, "/api/v1/public/posts/no-such-slug", {
      headers: authHeaders(),
    });
    const draftBody = await draft.json();
    const missingBody = await missing.json();
    record(
      "API-002 draft 与不存在同样 404 且响应同构",
      draft.status === 404 &&
        missing.status === 404 &&
        draftBody.error.code === missingBody.error.code
    );
  } else {
    record("API-002 draft 与不存在同样 404 且响应同构", false, "无 draft 样本");
  }

  // SEC-006 公开 DTO 不泄漏内部字段
  const publishedSlug = postsBody.posts[0]?.slug;
  const detail = await (
    await request(
      null,
      `/api/v1/public/posts/${encodeURIComponent(publishedSlug)}`,
      { headers: authHeaders() }
    )
  ).json();
  const keys = Object.keys(detail.post);
  const forbidden = [
    "status",
    "filePath",
    "legacySourcePath",
    "actorId",
    "id",
    "categoryId",
  ];
  record(
    "SEC-006 公开 DTO 无内部字段",
    forbidden.every((key) => !keys.includes(key)),
    keys.join(",")
  );

  const noStore = await request(null, "/api/v1/public/site", {
    headers: authHeaders(),
  });
  record(
    "公开 API no-store 缓存策略",
    (noStore.headers.get("cache-control") ?? "").includes("no-store")
  );
}

// ---------- Admin 写路径（仅 postgres 模式，避免弄脏 v1 工作区）----------
if (mode === "postgres") {
  const created = await (
    await request(admin, "/api/v1/admin/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "契约测试文章",
        slug: "contract-check-post",
        categorySlug: "technical",
      }),
    })
  ).json();
  record("API 写路径：新建草稿", Boolean(created.id), JSON.stringify(created));

  const detail = await (
    await request(admin, `/api/v1/admin/posts/${created.id}`)
  ).json();
  const version = detail.post.version;
  record("PG 模式返回 version", typeof version === "number");

  const conflict = await request(admin, `/api/v1/admin/posts/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "并发覆盖",
      expectedVersion: version + 10,
    }),
  });
  const conflictBody = await conflict.json();
  record(
    "API-007 错误 expectedVersion → 409 VERSION_CONFLICT",
    conflict.status === 409 && conflictBody.error.code === "VERSION_CONFLICT"
  );

  const save = await request(admin, `/api/v1/admin/posts/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "契约测试文章（改）",
      content: "# 契约\n\n正文。\n",
      expectedVersion: version,
    }),
  });
  record("API-008 正确版本保存成功", save.status === 200);

  const afterSave = await (
    await request(admin, `/api/v1/admin/posts/${created.id}`)
  ).json();
  record(
    "保存后 version 递增",
    afterSave.post.version === version + 1,
    `v=${afterSave.post.version}`
  );

  // 草稿不出现在公开列表；发布后出现；下线后消失
  const publicBefore = await (
    await request(null, "/api/v1/public/posts", { headers: authHeaders() })
  ).json();
  const inPublicBefore = publicBefore.posts.some(
    (post) => post.slug === "contract-check-post"
  );
  record("草稿不进公开列表", !inPublicBefore);

  await request(admin, `/api/v1/admin/posts/${created.id}/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      status: "published",
      expectedVersion: afterSave.post.version,
    }),
  });
  const publicAfter = await (
    await request(null, "/api/v1/public/posts", { headers: authHeaders() })
  ).json();
  record(
    "发布后进入公开列表",
    publicAfter.posts.some((post) => post.slug === "contract-check-post")
  );

  const afterPublish = await (
    await request(admin, `/api/v1/admin/posts/${created.id}`)
  ).json();
  await request(admin, `/api/v1/admin/posts/${created.id}/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      status: "draft",
      expectedVersion: afterPublish.post.version,
    }),
  });
  const publicFinal = await request(
    null,
    "/api/v1/public/posts/contract-check-post",
    { headers: authHeaders() }
  );
  record("下线后公开侧 404", publicFinal.status === 404);

  const removed = await request(admin, `/api/v1/admin/posts/${created.id}`, {
    method: "DELETE",
  });
  record("清理契约测试数据", removed.status === 200);

  // AST-001-lite：对象存储上传（magic bytes 校验 + 内容寻址 URL）
  if (process.argv.includes("--with-upload")) {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from(`contract-upload-${Date.now()}`),
    ]);
    const form = new FormData();
    form.append("file", new Blob([png], { type: "image/png" }), "probe.png");
    const upload = await request(admin, "/api/v1/admin/images", {
      method: "POST",
      body: form,
    });
    const uploadBody = await upload.json();
    record(
      "AST-001 上传返回公开 URL",
      upload.status === 200 && /^https?:\/\//.test(uploadBody.src ?? ""),
      JSON.stringify(uploadBody)
    );
    const svgForm = new FormData();
    svgForm.append(
      "file",
      new Blob([Buffer.from("<svg><script/></svg>")], { type: "image/svg+xml" }),
      "evil.svg"
    );
    const svgUpload = await request(admin, "/api/v1/admin/images", {
      method: "POST",
      body: svgForm,
    });
    record("SEC-005 SVG/伪装文件被拒", svgUpload.status === 400);
  }
}

// ---------- filesystem 模式只读冒烟 ----------
if (mode === "filesystem") {
  const posts = await (await request(admin, "/api/v1/admin/posts")).json();
  record("FS 列表可读（28 篇）", posts.posts.length >= 28, `${posts.posts.length}`);
  const publish = await request(admin, "/api/v1/admin/publish/status");
  record("FS Git 发布状态可读", publish.status === 200);
  const publicOff = await request(null, "/api/v1/public/posts");
  record("Public flag 关闭时 404", publicOff.status === 404);
}

const failed = results.filter((result) => !result.ok);
console.log(
  `\n=== 契约断言 ${results.length - failed.length}/${results.length} 通过（mode=${mode}） ===`
);
if (failed.length > 0) {
  console.log("失败项:", failed.map((f) => f.id).join("; "));
  process.exit(1);
}
