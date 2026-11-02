import { Hono } from "hono";
import { z } from "zod";
import type { Bindings, Note } from "./types";
import { builds, configured } from "./builds";
import { liveNotes, lastPublication } from "./live";
import { collectionState } from "./blog-collections";
import { hash } from "./security";

export const publishing = new Hono<{ Bindings: Bindings }>();
const active = "'dispatching','queued','building','deploying'";
publishing.get("/", async (c) => {
  const [live, collections, last, history] = await Promise.all([
    liveNotes(c.env),
    collectionState(c.env),
    lastPublication(c.env),
    c.env.DB.prepare(
      `SELECT j.*,
    json_extract(p.manifest,'$.intent') AS intent FROM build_jobs j JOIN publications p ON p.id=j.publication_id
    ORDER BY j.created_at DESC LIMIT 50`,
    ).all(),
  ]);
  return c.json({
    live,
    collections,
    publicationId: last?.id || 0,
    history: history.results.map((j) => ({
      ...j,
      intent: j.intent ? JSON.parse(String(j.intent)) : null,
    })),
    enabled: configured(c.env),
    siteUrl: c.env.PUBLIC_ORIGIN || "",
    repository: c.env.BUILD_REPOSITORY || "",
  });
});
publishing.post("/", async (c) => {
  const input = z
    .object({
      noteId: z.string().regex(/^[\w-]{1,100}$/),
      action: z.enum(["publish", "unpublish"]),
      expectedVersion: z.number().int().positive(),
      requestId: z.string().uuid(),
    })
    .parse(await c.req.json());
  if (!configured(c.env))
    return c.json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "发布服务尚未连接，草稿仍安全保存在后台。",
        },
      },
      503,
    );
  const payloadHash = await hash(
    JSON.stringify({
      noteId: input.noteId,
      action: input.action,
      expectedVersion: input.expectedVersion,
    }),
  );
  const replay = await c.env.DB.prepare(
    "SELECT id,manifest FROM publications WHERE json_extract(manifest,'$.requestId')=?",
  )
    .bind(input.requestId)
    .first<{ id: number; manifest: string }>();
  if (replay) {
    if (JSON.parse(replay.manifest).payloadHash !== payloadHash)
      return c.json({ error: { message: "请求已变化，请重新确认。" } }, 409);
    const job = await c.env.DB.prepare(
      "SELECT * FROM build_jobs WHERE publication_id=? ORDER BY created_at DESC LIMIT 1",
    )
      .bind(replay.id)
      .first();
    if (job) return c.json({ data: job }, 202);
  }
  const busy = await c.env.DB.prepare(
    `SELECT id FROM build_jobs WHERE status IN (${active}) LIMIT 1`,
  ).first();
  if (busy)
    return c.json(
      {
        error: {
          code: "BUILD_BUSY",
          message: "另一项博客操作正在进行，请等它完成后再试。草稿可继续编辑。",
        },
      },
      409,
    );
  const note = await c.env.DB.prepare(
    "SELECT * FROM notes WHERE id=? AND deleted_at IS NULL",
  )
    .bind(input.noteId)
    .first<Note & { source_path: string | null; source_metadata: string }>();
  if (!note) return c.notFound();
  if (note.version !== input.expectedVersion)
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: "这篇文章已有新版本，请重新打开并确认后操作。",
        },
      },
      409,
    );
  if (
    input.action === "publish" &&
    (!note.topic_id || note.state === "archived" || !note.body.trim())
  )
    return c.json(
      {
        error: {
          code: "NOT_READY",
          message:
            note.state === "archived"
              ? "请先恢复为草稿，再发布。"
              : !note.topic_id
                ? "请先在文章设置中选择分类。"
                : "请先写入正文并保存。",
        },
      },
      422,
    );
  const [last, live, settings] = await Promise.all([
    lastPublication(c.env),
    liveNotes(c.env),
    c.env.DB.prepare("SELECT corpus_revision FROM settings WHERE id=1").first<{
      corpus_revision: number;
    }>(),
  ]);
  const currentLive = live.find((n) => n.id === note.id);
  if (input.action === "unpublish" && !currentLive)
    return c.json(
      {
        error: {
          code: "NOT_LIVE",
          message: "这篇文章当前未在博客上线，无需下线。",
        },
      },
      409,
    );
  const previous = last
    ? JSON.parse(last.manifest)
    : { notes: [], withdrawals: [] };
  let notes = previous.notes.filter((n: { id: string }) => n.id !== note.id);
  let withdrawals = (previous.withdrawals || []).filter(
    (n: { id: string }) => n.id !== note.id,
  );
  const collection = (await collectionState(c.env)).find(c=>c.members.some(m=>m.id===note.id));
  if (input.action === "publish" && collection?.visibility === "private")
    return c.json({error:{message:"所属专栏仅后台可见。请先在“博客专栏”恢复可见性，再更新文章。"}},409);
  const metadata = JSON.parse(note.source_metadata || "{}");
  const slug = note.source_path?.startsWith("content/posts/")
    ? metadata.slug || note.slug
    : note.slug;
  const route =
    currentLive?.route ||
    (previous.withdrawals || []).find((n: { id: string }) => n.id === note.id)
      ?.route ||
    collection?.members.find(m=>m.id===note.id)?.route ||
    `posts/${slug}`;
  const publicationDates = { ...(previous.publicationDates || {}) };
  const priorNote = previous.notes.find((n: { id: string }) => n.id === note.id);
  const priorDate = publicationDates[note.id];
  const contentHash = await hash(JSON.stringify([note.title, note.body, note.topic_id, JSON.parse(note.tags)]));
  const priorHash = currentLive?.contentHash || (priorNote && await hash(JSON.stringify([
    priorNote.title, priorNote.body, priorNote.topic_id,
    Array.isArray(priorNote.tags) ? priorNote.tags : JSON.parse(priorNote.tags),
  ])));
  const firstPublished = new Date(priorDate?.publishedAt || currentLive?.publishedAt ||
    priorNote?.published_at || metadata.date || priorNote?.updated_at || new Date().toISOString()).toISOString();
  // Keep the original publication date even after withdrawal and later republishing.
  publicationDates[note.id] = {
    route,
    publishedAt: firstPublished,
    displayPublishedAt: input.action === "publish" ? note.display_published_at ?? null : priorDate?.displayPublishedAt ?? currentLive?.displayPublishedAt ?? null,
    editedAt: input.action === "publish" && (currentLive || priorDate) &&
      (priorHash ? priorHash !== contentHash : !!note.content_updated_at)
        ? note.content_updated_at || note.updated_at
        : priorDate?.editedAt ?? currentLive?.editedAt ?? null,
  };
  if (input.action === "publish") {
    const topic = await c.env.DB.prepare("SELECT name FROM groups WHERE id=?")
      .bind(note.topic_id)
      .first<{ name: string }>();
    notes.push({
      id: note.id,
      slug: route.split("/").at(-1),
      route,
      title: note.title,
      body: note.body,
      topic_id: note.topic_id,
      topic_name: topic?.name,
      tags: JSON.parse(note.tags),
      version: note.version,
      updated_at: note.updated_at,
      published_at: firstPublished,
      display_published_at: note.display_published_at ?? null,
      content_updated_at: publicationDates[note.id].editedAt,
    });
  } else withdrawals.push({ id: note.id, route: currentLive!.route });
  const categories = [
    ...new Map(
      [
        ...(previous.categories || []),
        ...previous.notes.map(
          (n: { topic_id: string; topic_name?: string }) => ({
            slug: n.topic_id,
            name: n.topic_name || n.topic_id,
            description: "",
          }),
        ),
      ].map((c) => [c.slug, c]),
    ).values(),
  ];
  const references = live
    .filter((n) => !withdrawals.some((w: { id: string }) => w.id === n.id))
    .map(({ id, route }) => ({ id, route }));
  const manifest = {
    collectionVisibility: previous.collectionVisibility || {},
    notes,
    publicationDates,
    withdrawals,
    categories,
    references,
    revision: settings!.corpus_revision,
    basePublicationId: last?.id || 0,
    requestId: input.requestId,
    payloadHash,
    intent: {
      action: input.action,
      noteId: note.id,
      title: note.title,
      version: note.version,
      route,
    },
  };
  let publicationId = replay?.id;
  if (!publicationId) {
    const result = await c.env.DB.prepare(
      `INSERT OR IGNORE INTO publications(created_at,manifest)
      SELECT ?,? FROM settings WHERE id=1 AND corpus_revision=?
      AND EXISTS(SELECT 1 FROM notes WHERE id=? AND version=? AND deleted_at IS NULL)
      AND NOT EXISTS(SELECT 1 FROM build_jobs WHERE status IN (${active}))
      AND COALESCE((SELECT p.id FROM publications p JOIN build_jobs j ON j.publication_id=p.id
        WHERE j.status='succeeded' ORDER BY j.updated_at DESC,j.created_at DESC LIMIT 1),0)=?`,
    )
      .bind(
        new Date().toISOString(),
        JSON.stringify(manifest),
        settings!.corpus_revision,
        note.id,
        note.version,
        last?.id || 0,
      )
      .run();
    if (!result.meta.changes)
      return c.json(
        {
          error: {
            code: "CONFLICT",
            message: "内容或发布状态刚刚变化，请刷新后重试。",
          },
        },
        409,
      );
    publicationId = result.meta.last_row_id;
  }
  return builds.fetch(
    new Request("https://internal/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicationId }),
    }),
    c.env,
  );
});
