import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "./types";
import { builds, configured } from "./builds";
import { lastPublication, lastPublicationMetadata, liveNotes, type LiveNote, type PublicationMetadata } from "./live";
import { hash } from "./security";

type Visibility = "public" | "unlisted" | "private";
type Catalog = { slug: string; name: string; description: string; members: string; position: number };
const active = "'dispatching','queued','building','deploying'";
export async function collectionState(env: Bindings, publication?: PublicationMetadata | null) {
  const [last, catalog] = await Promise.all([
    publication === undefined ? lastPublicationMetadata(env) : publication,
    env.DB.prepare("SELECT * FROM blog_collections ORDER BY position,slug").all<Catalog>(),
  ]);
  const settings = last?.collection_visibility ? JSON.parse(last.collection_visibility) || {} : {};
  return catalog.results.map((c) => ({
    ...c,
    members: JSON.parse(c.members) as { id: string; route: string; position: number }[],
    visibility: (settings[c.slug]?.visibility || "public") as Visibility,
    retainedInventory: (settings[c.slug]?.retainedInventory || []) as LiveNote[],
  }));
}
export const blogCollections = new Hono<{ Bindings: Bindings }>();
blogCollections.get("/", async (c) => {
  const last = await lastPublicationMetadata(c.env);
  const data = await collectionState(c.env, last);
  return c.json({ data, publicationId: last?.id || 0 });
});
blogCollections.post("/:slug/visibility", async (c) => {
  const input = z.object({
    visibility: z.enum(["public", "unlisted", "private"]),
    expectedPublicationId: z.number().int().positive(),
    requestId: z.string().uuid(),
  }).parse(await c.req.json());
  if (!configured(c.env)) return c.json({ error: { message: "发布服务尚未连接，专栏内容保持不变。" } }, 503);
  const slug = c.req.param("slug");
  const payloadHash = await hash(JSON.stringify({ slug, visibility: input.visibility, publicationId: input.expectedPublicationId }));
  const replay = await c.env.DB.prepare("SELECT id,manifest FROM publications WHERE json_extract(manifest,'$.requestId')=?")
    .bind(input.requestId).first<{id:number;manifest:string}>();
  if (replay) {
    if (JSON.parse(replay.manifest).payloadHash !== payloadHash)
      return c.json({ error: { message: "请求内容已改变，请重新确认。" } }, 409);
    const job = await c.env.DB.prepare("SELECT * FROM build_jobs WHERE publication_id=? ORDER BY created_at DESC LIMIT 1").bind(replay.id).first();
    if (job) return c.json({data: job}, 202);
    return builds.fetch(new Request("https://internal/", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({publicationId:replay.id}) }), c.env);
  }
  const [last, live, catalog, settings, busy, verified] = await Promise.all([
    lastPublication(c.env), liveNotes(c.env), collectionState(c.env),
    c.env.DB.prepare("SELECT corpus_revision FROM settings WHERE id=1").first<{corpus_revision:number}>(),
    c.env.DB.prepare(`SELECT id FROM build_jobs WHERE status IN (${active}) LIMIT 1`).first(),
    c.env.DB.prepare("SELECT publication_id FROM live_site WHERE id=1").first<{publication_id:number}>(),
  ]);
  if (busy) return c.json({ error: { message: "另一项博客操作正在进行，请完成后再调整专栏。" } }, 409);
  if (!last || last.id !== input.expectedPublicationId)
    return c.json({ error: { message: "线上版本刚刚变化，请刷新专栏后重新确认。" } }, 409);
  if (verified?.publication_id !== last.id)
    return c.json({ error: { message: "线上内容清单尚未核验，请先核对最近一次发布结果。" } },409);
  const collection = catalog.find((x) => x.slug === slug);
  if (!collection) return c.notFound();
  if (collection.visibility === input.visibility)
    return c.json({ error: { message: "专栏已经是这个可见性，无需重复发布。" } }, 422);
  const previous = JSON.parse(last.manifest);
  const own = live.filter((n) => n.route.startsWith(slug + "/"));
  const retained = collection.visibility === "private" ? collection.retainedInventory : own;
  const expectedInventory = [
    ...live.filter((n) => !n.route.startsWith(slug + "/")),
    ...(input.visibility === "private" ? [] : retained),
  ];
  // Only visibility changes. Never rebuild a collection from working drafts.
  const manifest = {
    ...previous,
    collectionVisibility: {
      ...(previous.collectionVisibility || {}),
      [slug]: { visibility: input.visibility, retainedInventory: retained },
    },
    revision: settings!.corpus_revision,
    basePublicationId: last.id,
    requestId: input.requestId,
    payloadHash,
    intent: {
      action: "collection-visibility", collectionSlug: slug,
      title: collection.name, visibility: input.visibility,
      articleCount: retained.length, expectedInventory,
      verifyRoutes: [slug, ...retained.slice(0,1).map(n=>n.route), ...retained.slice(-1).map(n=>n.route)],
    },
  };
  const result = await c.env.DB.prepare(`INSERT OR IGNORE INTO publications(created_at,manifest)
    SELECT ?,? FROM settings WHERE id=1 AND corpus_revision=?
    AND NOT EXISTS(SELECT 1 FROM build_jobs WHERE status IN (${active}))
    AND (SELECT p.id FROM publications p JOIN build_jobs j ON j.publication_id=p.id
      WHERE j.status='succeeded' ORDER BY j.updated_at DESC,j.created_at DESC LIMIT 1)=?`)
    .bind(new Date().toISOString(), JSON.stringify(manifest), settings!.corpus_revision, last.id).run();
  if (!result.meta.changes)
    return c.json({ error: { message: "内容或发布状态刚刚变化，请刷新后重试。" } }, 409);
  return builds.fetch(new Request("https://internal/", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({publicationId:result.meta.last_row_id}),
  }),c.env);
});
