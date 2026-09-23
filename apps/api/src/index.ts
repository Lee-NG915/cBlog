import { Hono } from "hono";
import { builds, buildInternal } from "./builds";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  hash,
  session,
  issueSession,
  cookieName,
  limitedBody,
} from "./security";
import type { Bindings, Note, Group } from "./types";

export const app = new Hono<{ Bindings: Bindings }>();
const noteInput = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(262144),
  topic_id: z.string().nullable(),
  state: z.enum(["draft", "ready", "archived"]),
  visibility: z.enum(["owner", "public"]),
  tags: z.array(z.string().max(40)).max(20),
  expectedVersion: z.number().int().nonnegative(),
  clientMutationId: z.string().uuid(),
});
// Separate factories/adapters may wrap this app locally, but there is no production login bypass.
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "same-origin");
  c.header("Cache-Control", "private, no-store");
  await next();
});
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) =>
      c.json(
        { error: { code: "TOO_LARGE", message: "请求超过大小限制" } },
        413,
      ),
  }),
);
app.use("/api/*", async (c, next) => {
  const auth = await session(c);
  if (!auth)
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "请先登录" } },
      401,
    );
  if (!["GET", "HEAD"].includes(c.req.method)) {
    if (
      c.req.header("Origin") !== new URL(c.req.url).origin ||
      c.req.header("X-CSRF-Token") !== auth.csrf
    )
      return c.json(
        {
          error: {
            code: "CSRF",
            message: "请求来源或会话校验失败，请刷新后重试",
          },
        },
        403,
      );
  }
  await next();
});
app.route("/api/v1/builds", builds);
app.route("/internal/builds", buildInternal);
app.get("/auth/github", async (c) => {
  if (
    !c.env.GITHUB_CLIENT_ID ||
    !c.env.GITHUB_CLIENT_SECRET ||
    !c.env.OWNER_GITHUB_ID
  )
    return c.json(
      {
        error: {
          code: "AUTH_NOT_CONFIGURED",
          message: "后台登录尚未配置完成，请联系站点所有者",
        },
      },
      503,
    );
  const state = crypto.randomUUID(),
    verifier = crypto.randomUUID() + crypto.randomUUID();
  setCookie(c, "oauth_state", state, {
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 300,
  });
  setCookie(c, "oauth_verifier", verifier, {
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 300,
  });
  const challenge = btoa(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        ),
      ),
    ),
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const q = new URLSearchParams({
    client_id: c.env.GITHUB_CLIENT_ID,
    state,
    redirect_uri: new URL("/auth/callback", c.req.url).href,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return c.redirect("https://github.com/login/oauth/authorize?" + q);
});
app.get("/auth/callback", async (c) => {
  const state = getCookie(c, "oauth_state"),
    verifier = getCookie(c, "oauth_verifier");
  deleteCookie(c, "oauth_state", { path: "/" });
  deleteCookie(c, "oauth_verifier", { path: "/" });
  if (
    !state ||
    !verifier ||
    state !== c.req.query("state") ||
    !c.req.query("code")
  )
    return c.text("登录验证失败，请重新开始", 403);
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code: c.req.query("code"),
        code_verifier: verifier,
        redirect_uri: new URL("/auth/callback", c.req.url).href,
      }),
    },
  );
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return c.text("登录失败", 403);
  const identity = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "User-Agent": "color-notes",
    },
  });
  const user = (await identity.json()) as { id?: number };
  if (String(user.id) !== c.env.OWNER_GITHUB_ID)
    return c.text("此工作台仅供所有者使用", 403);
  await issueSession(c);
  return c.redirect("/?view=admin");
});
app.get("/api/v1/session", async (c) =>
  c.json({
    data: {
      owner: true,
      csrf: (await session(c))!.csrf,
      environment: c.env.APP_ENV,
      aiEnabled: c.env.AI_ENABLED === "true",
    },
  }),
);
app.delete("/api/v1/session", async (c) => {
  const token = getCookie(c, cookieName(c));
  if (token)
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?")
      .bind(await hash(token))
      .run();
  deleteCookie(c, cookieName(c), { path: "/" });
  return c.json({ data: { ok: true } });
});
app.get("/api/v1/corpus", async (c) => {
  const cursor = c.req.query("cursor") || "";
  const revision = await c.env.DB.prepare(
    "SELECT corpus_revision FROM settings WHERE id=1",
  ).first<{ corpus_revision: number }>();
  if (
    c.req.query("revision") &&
    Number(c.req.query("revision")) !== revision!.corpus_revision
  )
    return c.json(
      {
        error: { code: "CORPUS_CHANGED", message: "笔记已更新，正在重新加载" },
      },
      409,
    );
  const notes = await c.env.DB.prepare(
    "SELECT * FROM notes WHERE deleted_at IS NULL AND id>? ORDER BY id LIMIT 31",
  )
    .bind(cursor)
    .all<Note>();
  const items = notes.results.slice(0, 30);
  return c.json({
    data: items,
    revision: revision!.corpus_revision,
    nextCursor: notes.results.length > 30 ? items.at(-1)!.id : null,
  });
});
app.get("/api/v1/groups", async (c) =>
  c.json({
    data: (
      await c.env.DB.prepare(
        "SELECT * FROM groups ORDER BY position,name",
      ).all<Group>()
    ).results,
    memberships: (
      await c.env.DB.prepare(
        "SELECT * FROM memberships ORDER BY position",
      ).all()
    ).results,
  }),
);
app.post("/api/v1/groups", async (c) => {
  const value = z
    .object({
      name: z.string().trim().min(1).max(80),
      kind: z.enum(["domain", "topic", "path", "project"]),
      parent_id: z.string().nullable(),
    })
    .parse(await c.req.json());
  if (value.kind === "topic") {
    let parent = value.parent_id,
      depth = 1;
    if (!parent)
      return c.json(
        { error: { code: "PARENT_REQUIRED", message: "主题需要选择所属领域" } },
        422,
      );
    while (parent) {
      const g: Group | null = await c.env.DB.prepare(
        "SELECT * FROM groups WHERE id=?",
      )
        .bind(parent)
        .first<Group>();
      if (!g || !["domain", "topic"].includes(g.kind))
        return c.json(
          { error: { code: "INVALID_PARENT", message: "父级不存在" } },
          422,
        );
      parent = g.parent_id;
      depth++;
      if (depth > 4)
        return c.json(
          { error: { code: "DEPTH", message: "主题最多四层" } },
          422,
        );
    }
  } else if (value.parent_id)
    return c.json(
      { error: { code: "INVALID_PARENT", message: "此类型不支持父级" } },
      422,
    );
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO groups(id,name,kind,parent_id) VALUES(?,?,?,?)",
  )
    .bind(id, value.name, value.kind, value.parent_id)
    .run();
  return c.json({ data: { id } }, 201);
});
app.patch("/api/v1/groups/:id", async (c) => {
  const { name, expectedVersion } = z
    .object({
      name: z.string().trim().min(1).max(80),
      expectedVersion: z.number().int().positive(),
    })
    .parse(await c.req.json());
  const result = await c.env.DB.prepare(
    "UPDATE groups SET name=?,version=version+1 WHERE id=? AND version=?",
  )
    .bind(name, c.req.param("id"), expectedVersion)
    .run();
  return result.meta.changes
    ? c.json({ data: { version: expectedVersion + 1 } })
    : c.json(
        { error: { code: "CONFLICT", message: "目录已变化，请刷新" } },
        409,
      );
});
app.delete("/api/v1/groups/:id", async (c) => {
  const { expectedVersion } = z
    .object({ expectedVersion: z.number().int().positive() })
    .parse(await c.req.json());
  const id = c.req.param("id");
  if (
    await c.env.DB.prepare(
      "SELECT id FROM groups WHERE parent_id=? UNION ALL SELECT id FROM notes WHERE topic_id=? LIMIT 1",
    )
      .bind(id, id)
      .first()
  )
    return c.json(
      { error: { code: "NOT_EMPTY", message: "请先移动此目录下的主题与笔记" } },
      422,
    );
  const batch = await c.env.DB.batch([
    c.env.DB.prepare(
      "DELETE FROM group_locks WHERE id=? AND EXISTS(SELECT 1 FROM groups WHERE id=? AND version=?)",
    ).bind(id, id, expectedVersion),
    c.env.DB.prepare("DELETE FROM groups WHERE id=? AND version=?").bind(
      id,
      expectedVersion,
    ),
  ]);
  const result = batch[1];
  return result.meta.changes
    ? c.json({ data: { ok: true } })
    : c.json(
        { error: { code: "CONFLICT", message: "目录已变化，请刷新" } },
        409,
      );
});
app.put("/api/v1/groups/:id/items", async (c) => {
  const { ids, expectedVersion } = z
    .object({
      ids: z.array(z.string()).max(200),
      expectedVersion: z.number().int(),
    })
    .parse(await c.req.json());
  if (new Set(ids).size !== ids.length)
    return c.json(
      { error: { code: "DUPLICATE", message: "笔记不能重复" } },
      422,
    );
  const g = await c.env.DB.prepare("SELECT * FROM groups WHERE id=?")
    .bind(c.req.param("id"))
    .first<Group>();
  if (!g || !["path", "project"].includes(g.kind))
    return c.json(
      { error: { code: "NOT_FOUND", message: "路径或项目不存在" } },
      404,
    );
  if (g.version !== expectedVersion)
    return c.json(
      { error: { code: "CONFLICT", message: "顺序已变化，请刷新" } },
      409,
    );
  for (const id of ids) {
    if (
      !(await c.env.DB.prepare(
        "SELECT id FROM notes WHERE id=? AND deleted_at IS NULL",
      )
        .bind(id)
        .first())
    )
      return c.json(
        { error: { code: "NOT_FOUND", message: "有笔记已被删除" } },
        422,
      );
  }
  // Guard every statement with a unique mutation marker, so a failed CAS cannot replace items.
  const marker = crypto.randomUUID();
  const result = await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE groups SET version=version+1 WHERE id=? AND version=?",
    ).bind(g.id, expectedVersion),
    c.env.DB.prepare(
      "INSERT INTO group_locks(id,marker) SELECT ?,? WHERE changes()=1 ON CONFLICT(id) DO UPDATE SET marker=excluded.marker",
    ).bind(g.id, marker),
    c.env.DB.prepare(
      "DELETE FROM memberships WHERE group_id=? AND EXISTS(SELECT 1 FROM group_locks WHERE id=? AND marker=?)",
    ).bind(g.id, g.id, marker),
    ...ids.map((id, i) =>
      c.env.DB.prepare(
        "INSERT INTO memberships SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM group_locks WHERE id=? AND marker=?)",
      ).bind(g.id, id, i, g.id, marker),
    ),
  ]);
  if (!result[0].meta.changes)
    return c.json(
      { error: { code: "CONFLICT", message: "顺序已变化，请刷新" } },
      409,
    );
  return c.json({ data: { version: expectedVersion + 1 } });
});
app.get("/api/v1/notes/:id", async (c) => {
  const n = await c.env.DB.prepare(
    "SELECT * FROM notes WHERE id=? AND deleted_at IS NULL",
  )
    .bind(c.req.param("id"))
    .first<Note>();
  return n
    ? c.json({ data: n })
    : c.json({ error: { code: "NOT_FOUND", message: "笔记不存在" } }, 404);
});
app.on(["POST", "PATCH"], "/api/v1/notes/:id", async (c) => {
  const bytes = await limitedBody(c.req.raw, 320 * 1024);
  const input = noteInput.parse(JSON.parse(new TextDecoder().decode(bytes)));
  if (new TextEncoder().encode(input.body).length > 262144)
    return c.json(
      { error: { code: "TOO_LARGE", message: "正文超过 256 KiB，请拆分笔记" } },
      413,
    );
  const id = c.req.param("id");
  if (!/^[\w-]{1,100}$/.test(id))
    return c.json(
      { error: { code: "INVALID_ID", message: "无效的笔记 ID" } },
      400,
    );
  const payloadHash = await hash(JSON.stringify({ id, ...input }));
  const replay = async () => {
    const row = await c.env.DB.prepare("SELECT * FROM mutations WHERE id=?")
      .bind(input.clientMutationId)
      .first<{ payload_hash: string; version: number }>();
    if (!row) return null;
    return row.payload_hash === payloadHash
      ? c.json({ data: { id, version: row.version } })
      : c.json(
          {
            error: {
              code: "IDEMPOTENCY_CONFLICT",
              message: "同一操作不能提交不同内容",
            },
          },
          409,
        );
  };
  const previous = await c.env.DB.prepare("SELECT * FROM mutations WHERE id=?")
    .bind(input.clientMutationId)
    .first<{ payload_hash: string; version: number }>();
  if (previous)
    return previous.payload_hash === payloadHash
      ? c.json({ data: { id, version: previous.version } })
      : c.json(
          {
            error: {
              code: "IDEMPOTENCY_CONFLICT",
              message: "同一操作不能提交不同内容",
            },
          },
          409,
        );
  if (
    input.topic_id &&
    !(await c.env.DB.prepare(
      "SELECT id FROM groups WHERE id=? AND kind='topic'",
    )
      .bind(input.topic_id)
      .first())
  )
    return c.json(
      { error: { code: "INVALID_TOPIC", message: "请选择有效主题" } },
      422,
    );
  const values = [
    input.title,
    input.body,
    input.topic_id,
    input.state,
    input.visibility,
    JSON.stringify(input.tags),
    new Date().toISOString(),
    input.clientMutationId,
    payloadHash,
  ];
  if (c.req.method === "POST") {
    if (input.expectedVersion !== 0)
      return c.json(
        { error: { code: "CONFLICT", message: "新笔记版本应为 0" } },
        409,
      );
    if (
      await c.env.DB.prepare("SELECT id FROM notes WHERE id=?").bind(id).first()
    ) {
      const existing = await replay();
      if (existing) return existing;
      return c.json(
        { error: { code: "CONFLICT", message: "笔记已存在" } },
        409,
      );
    }
    try {
      await c.env.DB.prepare(
        "INSERT INTO notes(title,body,topic_id,state,visibility,tags,updated_at,mutation_id,mutation_hash,id,slug) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      )
        .bind(...values, id, id)
        .run();
    } catch (error) {
      const existing = await replay();
      if (existing) return existing;
      throw error;
    }
    return c.json({ data: { id, version: 1 } }, 201);
  }
  const result = await c.env.DB.prepare(
    "UPDATE notes SET title=?,body=?,topic_id=?,state=?,visibility=?,tags=?,updated_at=?,mutation_id=?,mutation_hash=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL",
  )
    .bind(...values, id, input.expectedVersion)
    .run();
  if (!result.meta.changes) {
    const existing = await replay();
    if (existing) return existing;
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: "另一处修改了这篇笔记。你的本机内容已保留，请比较后合并。",
        },
      },
      409,
    );
  }
  return c.json({ data: { id, version: input.expectedVersion + 1 } });
});
app.delete("/api/v1/notes/:id", async (c) => {
  const { expectedVersion } = z
    .object({ expectedVersion: z.number().int() })
    .parse(await c.req.json());
  const now = new Date().toISOString();
  const r = await c.env.DB.prepare(
    "UPDATE notes SET deleted_at=?,updated_at=?,version=version+1,mutation_id=?,mutation_hash=? WHERE id=? AND version=? AND deleted_at IS NULL",
  )
    .bind(
      now,
      now,
      crypto.randomUUID(),
      "delete",
      c.req.param("id"),
      expectedVersion,
    )
    .run();
  return r.meta.changes
    ? c.json({ data: { ok: true } })
    : c.json(
        { error: { code: "CONFLICT", message: "笔记已变化，请刷新后删除" } },
        409,
      );
});
app.get("/api/v1/notes/:id/revisions", async (c) =>
  c.json({
    data: (
      await c.env.DB.prepare(
        "SELECT version,created_at,snapshot FROM revisions WHERE note_id=? ORDER BY version DESC LIMIT 20",
      )
        .bind(c.req.param("id"))
        .all()
    ).results,
  }),
);
app.post("/api/v1/assets", async (c) => {
  const bytes = await limitedBody(c.req.raw, 1024 * 1024);
  let mime = "";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    mime = "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    mime = "image/jpeg";
  if (
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  )
    mime = "image/webp";
  if (!mime || mime !== c.req.header("Content-Type"))
    return c.json(
      {
        error: {
          code: "IMAGE_TYPE",
          message: "仅支持真实 PNG、JPEG、WebP 图片",
        },
      },
      422,
    );
  const id = await hash(bytes.buffer as ArrayBuffer);
  const existing = await c.env.DB.prepare("SELECT state FROM assets WHERE id=?")
    .bind(id)
    .first<{ state: string }>();
  if (existing?.state === "ready") return c.json({ data: { id } });
  const total = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(bytes),0) AS bytes FROM assets",
  ).first<{ bytes: number }>();
  if (total!.bytes + bytes.length > 800 * 1024 * 1024)
    return c.json(
      {
        error: {
          code: "IMAGE_QUOTA",
          message: "图片容量保护已启用，仍可写纯文本",
        },
      },
      429,
    );
  await c.env.DB.prepare(
    "INSERT OR IGNORE INTO assets VALUES(?,?,?,'pending',?)",
  )
    .bind(id, mime, bytes.length, new Date().toISOString())
    .run();
  await c.env.IMAGES.put(id, bytes);
  await c.env.DB.prepare("UPDATE assets SET state='ready' WHERE id=?")
    .bind(id)
    .run();
  return c.json({ data: { id } }, 201);
});
app.get("/api/v1/assets/:id", async (c) => {
  const a = await c.env.DB.prepare("SELECT mime FROM assets WHERE id=?")
    .bind(c.req.param("id"))
    .first<{ mime: string }>();
  if (!a) return c.notFound();
  const bytes = await c.env.IMAGES.get(c.req.param("id"), "arrayBuffer");
  if (!bytes)
    return c.json(
      { error: { code: "ASSET_PENDING", message: "图片同步中，请稍后重试" } },
      503,
    );
  return new Response(bytes, {
    headers: {
      "Content-Type": a.mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
app.get("/api/v1/publications", async (c) =>
  c.json({
    data: (
      await c.env.DB.prepare(
        "SELECT id,created_at,status FROM publications ORDER BY id DESC LIMIT 30",
      ).all()
    ).results,
  }),
);
app.post("/api/v1/publications", async (c) => {
  const { expectedRevision } = z
    .object({ expectedRevision: z.number().int() })
    .parse(await c.req.json());
  // One SQL statement creates an immutable snapshot from the same database state.
  const result = await c.env.DB.prepare(
    `INSERT INTO publications(created_at,manifest) SELECT ?, json_object('notes',json((SELECT COALESCE(json_group_array(json_object('id',id,'slug',CASE WHEN source_path LIKE 'content/posts/%' THEN COALESCE(json_extract(source_metadata,'$.slug'),slug) ELSE slug END,'title',title,'body',body,'topic_id',topic_id,'topic_name',(SELECT name FROM groups WHERE id=notes.topic_id),'tags',json(tags),'version',version,'updated_at',updated_at)),'[]') FROM notes WHERE deleted_at IS NULL AND state='ready' AND visibility='public' AND topic_id IS NOT NULL)),'revision',corpus_revision) FROM settings WHERE id=1 AND corpus_revision=?`,
  )
    .bind(new Date().toISOString(), expectedRevision)
    .run();
  if (!result.meta.changes)
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: "内容发生变化，请重新查看发布范围",
        },
      },
      409,
    );
  return c.json(
    {
      data: {
        id: result.meta.last_row_id,
        status: "snapshot",
        message: "已生成发布快照，尚未部署线上",
      },
    },
    201,
  );
});
app.get("/api/v1/publications/:id", async (c) => {
  const p = await c.env.DB.prepare("SELECT * FROM publications WHERE id=?")
    .bind(c.req.param("id"))
    .first();
  return p ? c.json({ data: p }) : c.notFound();
});
app.get("/api/v1/export", async (c) =>
  c.json({
    data: {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      notes: (await c.env.DB.prepare("SELECT * FROM notes").all()).results,
      groups: (await c.env.DB.prepare("SELECT * FROM groups").all()).results,
      memberships: (await c.env.DB.prepare("SELECT * FROM memberships").all())
        .results,
      assets: (await c.env.DB.prepare("SELECT * FROM assets").all()).results,
    },
  }),
);
app.post("/api/v1/search/answer", (c) =>
  c.json(
    {
      error: {
        code: "AI_UNAVAILABLE",
        message:
          "本地版本未连接模型。你仍可使用全文与同义词检索；回答生成将在免费模型验证后开放。",
      },
    },
    503,
  ),
);
app.notFound((c) =>
  c.json({ error: { code: "NOT_FOUND", message: "接口不存在" } }, 404),
);
app.onError((err, c) => {
  if (err instanceof z.ZodError)
    return c.json(
      {
        error: {
          code: "VALIDATION",
          message: "请检查输入格式",
          details: err.flatten(),
        },
      },
      422,
    );
  if (err.message === "BODY_TOO_LARGE")
    return c.json(
      { error: { code: "TOO_LARGE", message: "内容超过大小限制" } },
      413,
    );
  if (err instanceof SyntaxError)
    return c.json(
      { error: { code: "INVALID_JSON", message: "请求格式错误" } },
      400,
    );
  // Never log note contents or SQL values.
  console.error(
    JSON.stringify({ event: "api_error", path: c.req.path, name: err.name }),
  );
  return c.json(
    {
      error: {
        code: "DEPENDENCY_UNAVAILABLE",
        message: "保存服务暂不可用，本机内容已保留，请稍后重试",
      },
    },
    503,
  );
});
export default { fetch: app.fetch };
