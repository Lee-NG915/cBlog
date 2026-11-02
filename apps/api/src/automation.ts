import { Hono } from "hono";
import { z } from "zod";
import { hash, limitedBody } from "./security";
import type { Bindings, Note } from "./types";

type AutomationBindings = Bindings & { DRAFT_API_TOKEN_SHA256?: string };
export const automation = new Hono<{ Bindings: AutomationBindings }>();
const BODY_LIMIT = 256 * 1024;
const ASSET_LIMIT = 1024 * 1024;
const ASSET_QUOTA = 800 * 1024 * 1024;
const SOURCE_KEY = /^[a-z0-9](?:[a-z0-9_-]{0,118}[a-z0-9])?$/;
const draftInput = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string(),
  topic_id: z.string().min(1).max(100).nullable(),
  tags: z.array(z.string().max(40)).max(20),
  display_published_at: z.string().datetime({ offset: true }).nullable().optional(),
  expectedVersion: z.number().int().nonnegative(),
  clientMutationId: z.string().uuid(),
}).strict();
type SourceNote = Note & { source_key: string; protected: number };
type Mutation = { note_id: string; payload_hash: string; version: number };

// This is also included in the conditional UPDATE: a preflight check alone
// would race with a publication or editor transition between reads and writes.
const protectedSql = `(notes.deleted_at IS NOT NULL OR notes.state!='draft' OR notes.visibility!='owner'
  OR EXISTS(SELECT 1 FROM live_site l,json_each(l.notes) item WHERE json_extract(item.value,'$.id')=notes.id)
  OR EXISTS(SELECT 1 FROM publications p,json_each(p.manifest,'$.notes') item
    WHERE json_extract(item.value,'$.id')=notes.id AND (p.status='deployed' OR EXISTS(
      SELECT 1 FROM build_jobs b WHERE b.publication_id=p.id
      AND b.status IN ('dispatching','queued','building','deploying','succeeded')))))`;

function constantTimeEqual(a: string, b: string) {
  // Both inputs are validated or computed SHA-256 hex, so lengths are fixed.
  let difference = 0;
  for (let i = 0; i < 64; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

automation.use("*", async (c, next) => {
  c.header("Cache-Control", "private, no-store");
  c.header("X-Content-Type-Options", "nosniff");
  const configured = c.env.DRAFT_API_TOKEN_SHA256;
  if (!configured || !/^[a-fA-F0-9]{64}$/.test(configured))
    return c.json({ error: { code: "AUTOMATION_NOT_CONFIGURED", message: "草稿 API 尚未配置" } }, 503);
  const match = /^Bearer ([^\s]+)$/i.exec(c.req.header("Authorization") || "");
  if (!match || match[1].length > 4096 || !constantTimeEqual(await hash(match[1]), configured.toLowerCase()))
    return c.json({ error: { code: "UNAUTHORIZED", message: "草稿 API 凭据无效" } }, 401);
  await next();
});

automation.get("/capabilities", (c) => c.json({ data: {
  service: "cblog-draft-automation", version: 1, mode: "draft-only",
  limits: { asset_bytes: ASSET_LIMIT, body_bytes: BODY_LIMIT, source_key_length: 120 },
  image_types: ["image/png", "image/jpeg", "image/webp"],
  operations: ["list-groups", "list-drafts", "read-draft", "upsert-draft", "upload-asset", "read-asset"],
} }));

automation.get("/groups", async (c) => c.json({ data: (await c.env.DB.prepare(
  "SELECT id,name,kind,parent_id,position,version FROM groups ORDER BY position,id",
).all()).results }));

function adminUrl(requestUrl: string, note: Pick<Note, "id" | "topic_id">) {
  const url = new URL("/", requestUrl);
  url.hash = new URLSearchParams({ view: "library", note: note.id, ...(note.topic_id ? { group: note.topic_id } : {}) }).toString();
  return url.toString();
}
function protection(note: SourceNote) {
  if (note.deleted_at) return "trashed";
  if (note.state !== "draft" || note.visibility !== "owner") return "not-private-draft";
  return note.protected ? "published-or-publishing" : null;
}
async function sourceNote(env: AutomationBindings, sourceKey: string) {
  return env.DB.prepare(`SELECT notes.*,s.source_key,${protectedSql} AS protected
    FROM automation_sources s JOIN notes ON notes.id=s.note_id WHERE s.source_key=?`)
    .bind(sourceKey).first<SourceNote>();
}
function metadata(note: SourceNote, requestUrl: string) {
  return {
    sourceKey: note.source_key, id: note.id, title: note.title, topic_id: note.topic_id,
    state: note.state, visibility: note.visibility, version: note.version,
    updated_at: note.updated_at, display_published_at: note.display_published_at ?? null,
    admin_url: adminUrl(requestUrl, note), writable: !note.protected, protected_reason: protection(note),
  };
}
async function fullNote(note: SourceNote, requestUrl: string) {
  return { ...metadata(note, requestUrl), body: note.body, tags: JSON.parse(note.tags),
    body_sha256: await hash(note.body), content_updated_at: note.content_updated_at ?? null };
}

automation.get("/drafts", async (c) => {
  const cursor = c.req.query("cursor") || "";
  const limit = Number(c.req.query("limit") || 50);
  if ((cursor && !SOURCE_KEY.test(cursor)) || !Number.isInteger(limit) || limit < 1 || limit > 100)
    return c.json({ error: { code: "INVALID_QUERY", message: "无效的分页参数" } }, 400);
  const rows = (await c.env.DB.prepare(`SELECT notes.*,s.source_key,${protectedSql} AS protected
    FROM automation_sources s JOIN notes ON notes.id=s.note_id
    WHERE notes.deleted_at IS NULL AND s.source_key>? ORDER BY s.source_key LIMIT ?`)
    .bind(cursor, limit + 1).all<SourceNote>()).results;
  const visible = rows.slice(0, limit);
  return c.json({ data: visible.map((n) => metadata(n, c.req.url)), nextCursor: rows.length > limit ? visible.at(-1)!.source_key : null });
});

automation.get("/drafts/:sourceKey", async (c) => {
  const sourceKey = c.req.param("sourceKey");
  if (!SOURCE_KEY.test(sourceKey)) return c.json({ error: { code: "INVALID_SOURCE_KEY", message: "无效的来源标识" } }, 400);
  const note = await sourceNote(c.env, sourceKey);
  if (!note || note.deleted_at) return c.json({ error: { code: "NOT_FOUND", message: "草稿不存在" } }, 404);
  return c.json({ data: await fullNote(note, c.req.url) });
});

automation.put("/drafts/:sourceKey", async (c) => {
  const sourceKey = c.req.param("sourceKey");
  if (!SOURCE_KEY.test(sourceKey)) return c.json({ error: { code: "INVALID_SOURCE_KEY", message: "无效的来源标识" } }, 400);
  const bytes = await limitedBody(c.req.raw, 320 * 1024);
  const input = draftInput.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes)));
  if (new TextEncoder().encode(input.body).length > BODY_LIMIT)
    return c.json({ error: { code: "TOO_LARGE", message: "正文超过 256 KiB" } }, 413);
  const id = "auto-" + await hash("cblog:automation:draft:v1:" + sourceKey);
  const payloadHash = await hash(JSON.stringify({ sourceKey, ...input }));
  const mutation = () => c.env.DB.prepare("SELECT note_id,payload_hash,version FROM mutations WHERE id=?")
    .bind(input.clientMutationId).first<Mutation>();
  const stateError = (note: SourceNote) => note.deleted_at
    ? c.json({ error: { code: "NOT_FOUND", message: "草稿已在回收站，API 不会恢复它" } }, 404)
    : c.json({ error: { code: "NOT_DRAFT", message: "只能修改从未发布且仍为私有草稿的来源笔记", currentVersion: note.version, reason: protection(note) } }, 409);
  const conflict = (version?: number) => c.json({ error: { code: "CONFLICT", message: "草稿版本已变化，请重新读取后比较", ...(version === undefined ? {} : { currentVersion: version }) } }, 409);
  const receipt = async (version: number, replayed: boolean, currentVersion: number, created = false) => {
    const revision = await c.env.DB.prepare("SELECT snapshot FROM revisions WHERE note_id=? AND version=?")
      .bind(id, version).first<{ snapshot: string }>();
    if (!revision) throw new Error("MISSING_MUTATION_REVISION");
    const snapshot = JSON.parse(revision.snapshot) as Note;
    return c.json({ data: await fullNote({ ...snapshot, source_key: sourceKey, protected: 0 }, c.req.url), replayed, currentVersion }, created ? 201 : 200);
  };
  const replay = async () => {
    const previous = await mutation();
    if (!previous) return null;
    if (previous.payload_hash !== payloadHash || previous.note_id !== id)
      return c.json({ error: { code: "IDEMPOTENCY_CONFLICT", message: "同一操作不能提交不同内容或来源" } }, 409);
    const current = await sourceNote(c.env, sourceKey);
    if (!current || current.id !== id) return conflict();
    if (current.protected) return stateError(current);
    return receipt(previous.version, true, current.version);
  };
  const repeated = await replay();
  if (repeated) return repeated;
  const current = await sourceNote(c.env, sourceKey);
  if (current?.protected) return stateError(current);
  if (current && current.id !== id) return conflict(current.version);
  if ((!current && input.expectedVersion !== 0) || (current && input.expectedVersion !== current.version))
    return conflict(current?.version);
  if (input.topic_id && !(await c.env.DB.prepare("SELECT id FROM groups WHERE id=? AND kind='topic'").bind(input.topic_id).first()))
    return c.json({ error: { code: "INVALID_TOPIC", message: "请选择有效主题" } }, 422);
  const requestOrigin = new URL(c.req.url).origin;
  const assetIds = new Set([...input.body.matchAll(/(?:(?:https?:)?\/\/[^\s/"'<>?#]+)?\/api\/v1\/(?:automation\/)?assets\/([^\s)"'<>?#]+)/g)]
    .filter((match) => new URL(match[0], c.req.url).origin === requestOrigin)
    .map((match) => match[1]));
  for (const assetId of assetIds) {
    if (!/^[a-f0-9]{64}$/.test(assetId) || !(await c.env.DB.prepare(
      "SELECT assets.id FROM assets JOIN automation_assets a ON a.asset_id=assets.id WHERE assets.id=? AND assets.state='ready'",
    ).bind(assetId).first()))
      return c.json({ error: { code: "INVALID_ASSET", message: "正文只能引用已由草稿 API 上传并校验的站内图片" } }, 422);
  }
  const now = new Date().toISOString();
  const displayDate = input.display_published_at === undefined ? current?.display_published_at ?? null
    : input.display_published_at === null ? null : new Date(input.display_published_at).toISOString();
  const changed = current && (current.title !== input.title || current.body !== input.body || current.topic_id !== input.topic_id || current.tags !== JSON.stringify(input.tags));
  const editedAt = changed ? now : current?.content_updated_at ?? null;
  const values = [input.title, input.body, input.topic_id, JSON.stringify(input.tags), now, input.clientMutationId, payloadHash, displayDate, editedAt];
  try {
    if (!current) {
      // Plain INSERT (never OR REPLACE) plus the binding share a transaction.
      // Existing ordinary notes and simultaneous source claims fail atomically.
      await c.env.DB.batch([
        c.env.DB.prepare(`INSERT INTO notes(title,body,topic_id,tags,updated_at,mutation_id,mutation_hash,display_published_at,content_updated_at,id,slug,state,visibility)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,'draft','owner')`).bind(...values, id, id),
        c.env.DB.prepare("INSERT INTO automation_sources(source_key,note_id,created_at) VALUES(?,?,?)").bind(sourceKey, id, now),
      ]);
      return receipt(1, false, 1, true);
    }
    const result = await c.env.DB.prepare(`UPDATE notes SET title=?,body=?,topic_id=?,tags=?,updated_at=?,mutation_id=?,mutation_hash=?,display_published_at=?,content_updated_at=?,version=version+1
      WHERE id=? AND version=? AND NOT ${protectedSql}
      AND EXISTS(SELECT 1 FROM automation_sources s WHERE s.source_key=? AND s.note_id=notes.id)
      AND (? IS NULL OR EXISTS(SELECT 1 FROM groups WHERE id=? AND kind='topic'))`)
      .bind(...values, id, input.expectedVersion, sourceKey, input.topic_id, input.topic_id).run();
    if (result.meta.changes) return receipt(input.expectedVersion + 1, false, input.expectedVersion + 1);
  } catch (error) {
    const recovered = await replay();
    if (recovered) return recovered;
    const latest = await sourceNote(c.env, sourceKey);
    if (latest?.protected) return stateError(latest);
    if (latest) return conflict(latest.version);
    if (await c.env.DB.prepare("SELECT id FROM notes WHERE id=?").bind(id).first())
      return c.json({ error: { code: "SOURCE_COLLISION", message: "来源标识不能绑定或覆盖已有笔记" } }, 409);
    throw error;
  }
  const recovered = await replay();
  if (recovered) return recovered;
  const latest = await sourceNote(c.env, sourceKey);
  if (latest?.protected) return stateError(latest);
  return conflict(latest?.version);
});

function uint32(bytes: Uint8Array, offset: number, littleEndian = false) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, littleEndian);
}
function text(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
// Validate bounded image containers rather than trusting the supplied MIME or
// filename. This is not a pixel decoder; malformed containers never enter KV.
function imageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 45 && [...bytes.subarray(0, 8)].join() === "137,80,78,71,13,10,26,10") {
    let offset = 8, header = false, data = false;
    while (offset + 12 <= bytes.length) {
      const size = uint32(bytes, offset), end = offset + 12 + size;
      if (end > bytes.length) return null;
      const kind = text(bytes, offset + 4, offset + 8);
      if (crc32(bytes.subarray(offset + 4, end - 4)) !== uint32(bytes, end - 4)) return null;
      if (!header) {
        if (kind !== "IHDR" || size !== 13 || !uint32(bytes, offset + 8) || !uint32(bytes, offset + 12)) return null;
        header = true;
      } else if (kind === "IHDR") return null;
      if (kind === "IDAT" && size > 0) data = true;
      if (kind === "IEND") return data && size === 0 && end === bytes.length ? "image/png" : null;
      offset = end;
    }
    return null;
  }
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2, frame = false, scan = false;
    while (offset < bytes.length) {
      if (bytes[offset++] !== 0xff) return null;
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xd9) return frame && scan && offset === bytes.length ? "image/jpeg" : null;
      if (offset + 2 > bytes.length || marker === 0x00 || marker === 0xd8) return null;
      const size = (bytes[offset] << 8) | bytes[offset + 1];
      if (size < 2 || offset + size > bytes.length) return null;
      if ([0xc0, 0xc1, 0xc2].includes(marker)) {
        if (size < 8 || !(bytes[offset + 3] || bytes[offset + 4]) || !(bytes[offset + 5] || bytes[offset + 6])) return null;
        frame = true;
      }
      offset += size;
      if (marker === 0xda) {
        if (!frame) return null;
        scan = true;
        while (offset < bytes.length) {
          if (bytes[offset] !== 0xff) { offset++; continue; }
          const next = bytes[offset + 1];
          if (next === 0 || (next >= 0xd0 && next <= 0xd7)) { offset += 2; continue; }
          break;
        }
      }
    }
    return null;
  }
  if (bytes.length >= 26 && text(bytes, 0, 4) === "RIFF" && text(bytes, 8, 12) === "WEBP" && uint32(bytes, 4, true) + 8 === bytes.length) {
    let offset = 12, image = false;
    while (offset + 8 <= bytes.length) {
      const kind = text(bytes, offset, offset + 4), size = uint32(bytes, offset + 4, true);
      const end = offset + 8 + size;
      if (end > bytes.length) return null;
      if (kind === "ANIM" || kind === "ANMF" || (kind === "VP8X" && (size !== 10 || (bytes[offset + 8] & 0x02)))) return null;
      if (kind === "VP8 " && size >= 10 && bytes[offset + 11] === 0x9d && bytes[offset + 12] === 0x01 && bytes[offset + 13] === 0x2a) image = true;
      if (kind === "VP8L" && size >= 5 && bytes[offset + 8] === 0x2f) image = true;
      offset = end + (size & 1);
    }
    return image && offset === bytes.length ? "image/webp" : null;
  }
  return null;
}

function assetMetadata(id: string, mime: string, bytes: number) {
  return { id, sha256: id, mime, bytes, url: `/api/v1/assets/${id}`, readback_url: `/api/v1/automation/assets/${id}` };
}
automation.post("/assets", async (c) => {
  const bytes = await limitedBody(c.req.raw, ASSET_LIMIT);
  const mime = imageMime(bytes);
  if (!mime) return c.json({ error: { code: "IMAGE_TYPE", message: "仅支持完整的 PNG、JPEG 或静态 WebP 图片" } }, 422);
  const declared = c.req.header("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (declared && declared !== "application/octet-stream" && declared !== mime)
    return c.json({ error: { code: "IMAGE_TYPE", message: "图片内容与声明格式不一致" } }, 422);
  const id = await hash(bytes.buffer as ArrayBuffer);
  const existing = await c.env.DB.prepare("SELECT state FROM assets WHERE id=?").bind(id).first<{ state: string }>();
  const register = () => c.env.DB.prepare("INSERT OR IGNORE INTO automation_assets(asset_id,created_at) VALUES(?,?)")
    .bind(id, new Date().toISOString()).run();
  if (existing?.state === "ready") {
    const prior = await c.env.IMAGES.get(id, "arrayBuffer");
    if (prior && await hash(prior) === id) {
      await register();
      return c.json({ data: assetMetadata(id, mime, bytes.length) });
    }
  }
  if (!existing) {
    await c.env.DB.prepare(`INSERT OR IGNORE INTO assets(id,mime,bytes,state,created_at)
      SELECT ?,?,?,'pending',? WHERE (SELECT COALESCE(SUM(bytes),0) FROM assets)+?<=?`)
      .bind(id, mime, bytes.length, new Date().toISOString(), bytes.length, ASSET_QUOTA).run();
    if (!(await c.env.DB.prepare("SELECT id FROM assets WHERE id=?").bind(id).first()))
      return c.json({ error: { code: "IMAGE_QUOTA", message: "图片容量保护已启用" } }, 429);
  }
  await c.env.IMAGES.put(id, bytes);
  const stored = await c.env.IMAGES.get(id, "arrayBuffer");
  if (!stored || await hash(stored) !== id)
    return c.json({ error: { code: "ASSET_PENDING", message: "图片尚未完成存储校验，请重试相同文件" } }, 503);
  await c.env.DB.prepare("UPDATE assets SET state='ready' WHERE id=?").bind(id).run();
  await register();
  return c.json({ data: assetMetadata(id, mime, bytes.length) }, existing?.state === "ready" ? 200 : 201);
});

automation.get("/assets/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^[a-f0-9]{64}$/.test(id)) return c.json({ error: { code: "NOT_FOUND", message: "图片不存在" } }, 404);
  const asset = await c.env.DB.prepare("SELECT assets.mime,assets.bytes,assets.state FROM assets JOIN automation_assets a ON a.asset_id=assets.id WHERE assets.id=?")
    .bind(id).first<{ mime: string; bytes: number; state: string }>();
  if (!asset) return c.json({ error: { code: "NOT_FOUND", message: "图片不存在" } }, 404);
  const bytes = await c.env.IMAGES.get(id, "arrayBuffer");
  if (asset.state !== "ready" || !bytes || bytes.byteLength !== asset.bytes || await hash(bytes) !== id)
    return c.json({ error: { code: "ASSET_PENDING", message: "图片尚未通过存储校验" } }, 503);
  return new Response(bytes, { headers: { "Content-Type": asset.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Content-SHA256": id } });
});

automation.onError((error, c) => {
  if (error instanceof z.ZodError)
    return c.json({ error: { code: "VALIDATION", message: "草稿字段无效", details: error.flatten() } }, 422);
  if (error.message === "BODY_TOO_LARGE") return c.json({ error: { code: "TOO_LARGE", message: "请求超过大小限制" } }, 413);
  if (error instanceof SyntaxError || (error instanceof TypeError && /encoded data/.test(error.message)))
    return c.json({ error: { code: "INVALID_JSON", message: "请求必须为有效的 UTF-8 JSON" } }, 400);
  return c.json({ error: { code: "DEPENDENCY_UNAVAILABLE", message: "草稿服务暂不可用，请使用相同操作标识重试" } }, 503);
});
