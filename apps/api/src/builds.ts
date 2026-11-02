import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "./types";
import { hash, limitedBody } from "./security";
import { bodyLimit } from "hono/body-limit";
import { lastPublication, type LiveNote } from "./live";

type Job = {
  id: string;
  publication_id: number;
  status: string;
  run_id: string | null;
  detail: string;
};
const active = "'dispatching','queued','building','deploying'";
const now = () => new Date().toISOString();
export const builds = new Hono<{ Bindings: Bindings }>();
export const buildInternal = new Hono<{ Bindings: Bindings }>();
buildInternal.use(
  "*",
  bodyLimit({
    maxSize: 4096,
    onError: (c) => c.json({ error: "TOO_LARGE" }, 413),
  }),
);
export function configured(e: Bindings) {
  return !!(
    e.BUILD_PIPELINE_ENABLED === "true" &&
    e.BUILD_DISPATCH_TOKEN &&
    e.BUILD_PIPELINE_SECRET &&
    e.BUILD_REPOSITORY &&
    e.BUILD_REF &&
    e.BUILD_WORKFLOW &&
    e.PUBLIC_ORIGIN
  );
}
async function github(e: Bindings, suffix: string, body?: unknown) {
  return fetch(
    `https://api.github.com/repos/${e.BUILD_REPOSITORY}/actions/${suffix}`,
    {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${e.BUILD_DISPATCH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "color-notes-publisher",
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    },
  );
}
builds.get("/", async (c) =>
  c.json({
    data: (
      await c.env.DB.prepare(
        "SELECT * FROM build_jobs ORDER BY created_at DESC LIMIT 30",
      ).all()
    ).results,
    enabled: configured(c.env),
    repository: c.env.BUILD_REPOSITORY,
  }),
);
builds.post("/", async (c) => {
  if (!configured(c.env))
    return c.json(
      {
        error: {
          code: "BUILD_NOT_CONFIGURED",
          message: "线上发布尚未配置完整，请先连接 GitHub 构建流程",
        },
      },
      503,
    );
  const { publicationId } = z
    .object({ publicationId: z.number().int().positive() })
    .parse(await c.req.json());
  const p = await c.env.DB.prepare(
    "SELECT manifest FROM publications WHERE id=?",
  )
    .bind(publicationId)
    .first<{ manifest: string }>();
  if (!p) return c.notFound();
  const manifest = JSON.parse(p.manifest);
  const last = await lastPublication(c.env);
  if (!manifest.intent && last && JSON.parse(last.manifest).intent)
    return c.json(
      {
        error: {
          message: "请刷新后台，通过文章操作重新提交。旧快照不能覆盖当前博客。",
        },
      },
      409,
    );
  const articleAction = ["publish", "unpublish"].includes(manifest.intent?.action);
  if (manifest.intent) {
    const target = articleAction ? await c.env.DB.prepare(
      "SELECT version FROM notes WHERE id=? AND deleted_at IS NULL",
    )
      .bind(manifest.intent.noteId)
      .first<{ version: number }>() : null;
    if (
      (last?.id || 0) !== manifest.basePublicationId ||
      (articleAction && (!target || target.version !== manifest.intent.version))
    )
      return c.json(
        {
          error: {
            code: "STALE_SNAPSHOT",
            message: "文章或线上版本已变化，请重新确认这篇文章的操作。",
          },
        },
        409,
      );
  }
  const id = crypto.randomUUID(),
    date = now();
  try {
    const r = await c.env.DB.prepare(
      `INSERT INTO build_jobs(id,publication_id,status,created_at,updated_at) SELECT ?,?,'dispatching',?,? FROM settings WHERE id=1 AND (corpus_revision=? OR ?=1) AND NOT EXISTS(SELECT 1 FROM build_jobs WHERE publication_id=? AND status='succeeded')
      AND (?=0 OR ((?=0 OR EXISTS(SELECT 1 FROM notes WHERE id=? AND version=? AND deleted_at IS NULL))
        AND COALESCE((SELECT publication_id FROM build_jobs WHERE status='succeeded' ORDER BY updated_at DESC,created_at DESC LIMIT 1),0)=?))`,
    )
      .bind(
        id,
        publicationId,
        date,
        date,
        manifest.revision,
        manifest.intent ? 1 : 0,
        publicationId,
        manifest.intent ? 1 : 0,
        articleAction ? 1 : 0,
        manifest.intent?.noteId || "",
        manifest.intent?.version || 0,
        manifest.basePublicationId || 0,
      )
      .run();
    if (!r.meta.changes)
      return c.json(
        {
          error: {
            code: "STALE_SNAPSHOT",
            message: "快照已过期或已上线，请刷新发布范围并生成新快照",
          },
        },
        409,
      );
  } catch (e) {
    if (String(e).includes("UNIQUE"))
      return c.json(
        {
          error: {
            code: "BUILD_BUSY",
            message: "已有发布任务，请等待完成；失败后可重试",
          },
        },
        409,
      );
    throw e;
  }
  try {
    const r = await github(
      c.env,
      `workflows/${encodeURIComponent(c.env.BUILD_WORKFLOW)}/dispatches`,
      { ref: c.env.BUILD_REF, inputs: { job_id: id } },
    );
    if (!r.ok) {
      // Definite rejection is safe to retry. Ambiguous server failures keep the lock.
      if (r.status >= 400 && r.status < 500)
        await c.env.DB.prepare(
          "UPDATE build_jobs SET status='failed',detail=?,updated_at=? WHERE id=? AND status='dispatching'",
        )
          .bind(
            r.status === 403
              ? "GitHub 拒绝触发（HTTP 403）：请检查专用令牌是否可访问本仓库，并具备 Actions 读写权限。Workflows 写权限不能代替 Actions 写权限。"
              : `GitHub 拒绝触发（HTTP ${r.status}），请检查工作流和令牌权限`,
            now(),
            id,
          )
          .run();
      else throw new Error("dispatch uncertain");
    } else
      await c.env.DB.prepare(
        "UPDATE build_jobs SET status='queued',updated_at=? WHERE id=? AND status='dispatching'",
      )
        .bind(now(), id)
        .run();
  } catch {
    await c.env.DB.prepare(
      "UPDATE build_jobs SET detail=?,updated_at=? WHERE id=? AND status IN ('dispatching','queued')",
    )
      .bind(
        "触发结果待确认，请查看 GitHub 或检查任务状态，不要重复发布",
        now(),
        id,
      )
      .run();
  }
  return c.json(
    {
      data: await c.env.DB.prepare("SELECT * FROM build_jobs WHERE id=?")
        .bind(id)
        .first(),
    },
    202,
  );
});
// Manual recovery never releases a deployment in progress. An unclaimed job can be
// cancelled atomically; any delayed workflow must claim it before reading/building.
builds.post("/:id/reconcile", async (c) => {
  const j = await c.env.DB.prepare("SELECT * FROM build_jobs WHERE id=?")
    .bind(c.req.param("id"))
    .first<Job>();
  if (!j) return c.notFound();
  if (!j.run_id) {
    await c.env.DB.prepare(
      "UPDATE build_jobs SET status='failed',detail='已取消尚未领取的任务，可重试',updated_at=? WHERE id=? AND run_id IS NULL AND status IN ('dispatching','queued')",
    )
      .bind(now(), j.id)
      .run();
  } else if (["building", "deploying"].includes(j.status)) {
    const r = await github(c.env, `runs/${j.run_id}`);
    if (!r.ok)
      return c.json(
        {
          error: {
            code: "GITHUB_UNAVAILABLE",
            message: "无法核验任务状态，保留发布锁，请稍后重试",
          },
        },
        502,
      );
    const run = (await r.json()) as { status: string };
    if (run.status === "completed") {
      const success = await verifyLive(c.env, j);
      if (success) await saveInventory(c.env, j, success);
      await c.env.DB.prepare(
        `UPDATE build_jobs SET status=?,detail=?,updated_at=?,site_url=? WHERE id=? AND status IN ('building','deploying')`,
      )
        .bind(
          success
            ? "succeeded"
            : j.status === "deploying"
              ? "deploying"
              : "failed",
          success
            ? "已核验线上版本"
            : j.status === "deploying"
              ? "部署结果未确认，保留发布锁；请核验 Pages 部署状态后再恢复"
              : "构建已结束，请检查日志后重试",
          now(),
          success ? c.env.PUBLIC_ORIGIN : null,
          j.id,
        )
        .run();
    }
  }
  return c.json({
    data: await c.env.DB.prepare("SELECT * FROM build_jobs WHERE id=?")
      .bind(j.id)
      .first(),
  });
});
async function verifyLive(e: Bindings, j: Job) {
  try {
    const r = await fetch(
      `${e.PUBLIC_ORIGIN.replace(/\/$/, "")}/publication.json?job=${j.id}`,
      {
        // workerd only accepts "manual" or "follow". A redirect cannot attest
        // to a marker at the configured Pages origin.
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      },
    );
    if (r.status !== 200) return false;
    const body = new TextDecoder().decode(
      await limitedBody(r as unknown as Request, 256 * 1024),
    );
    const v = JSON.parse(body);
    if (v.jobId !== j.id || v.publicationId !== j.publication_id) return false;
    const p = await e.DB.prepare("SELECT manifest FROM publications WHERE id=?")
      .bind(j.publication_id)
      .first<{ manifest: string }>();
    const manifest = JSON.parse(p!.manifest);
    if (manifest.intent) {
      const entries = z
        .array(
          z.object({
            id: z.string().regex(/^[\w-]+$/),
            route: z
              .string()
              .regex(/^[-\w\u4e00-\u9fff]+\/[-\w\u4e00-\u9fff]+$/),
            version: z.number().int().nullable(),
            contentHash: z.string().nullable().optional(),
            publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
            displayPublishedAt: z.string().datetime({ offset: true }).nullable().optional(),
            editedAt: z.string().datetime({ offset: true }).nullable().optional(),
          }),
        )
        .max(2000)
        .safeParse(v.publicNotes);
      if (!entries.success) return false;
      v.publicNotes = entries.data;
      const target = entries.data.find((n) => n.id === manifest.intent.noteId);
      if (
        new Set(entries.data.map((n) => n.id)).size !== entries.data.length ||
        new Set(entries.data.map((n) => n.route)).size !== entries.data.length
      )
        return false;
      if (manifest.intent.action === "dates") {
        const expected = manifest.intent.expectedInventory;
        if (!Array.isArray(expected) || entries.data.length !== expected.length) return false;
        for (const old of expected) {
          const entry = entries.data.find((n) => n.id === old.id);
          const date = manifest.publicationDates?.[old.id];
          if (!entry || !date || entry.route !== old.route ||
              entry.contentHash !== old.contentHash ||
              entry.publishedAt !== date.publishedAt ||
              entry.displayPublishedAt !== date.displayPublishedAt ||
              entry.editedAt !== date.editedAt) return false;
        }
      }
      if (manifest.intent.action === "collection-visibility") {
        const expected = manifest.intent.expectedInventory;
        if (!Array.isArray(expected) || entries.data.length !== expected.length) return false;
        const keys = ["route", "version", "contentHash", "publishedAt", "displayPublishedAt", "editedAt"] as const;
        for (const old of expected) {
          const entry = entries.data.find(n => n.id === old.id);
          if (!entry || keys.some(key => (entry[key] ?? null) !== (old[key] ?? null))) return false;
        }
        const slug = manifest.intent.collectionSlug;
        const visibility = manifest.intent.visibility;
        if (!/^[\w-]+$/.test(slug) || !["public","unlisted","private"].includes(visibility) || !Array.isArray(v.publicCollections)) return false;
        const collection = v.publicCollections.find((c: {slug: string}) => c.slug === slug);
        if (visibility === "private" ? !!collection : !collection || collection.visibility !== visibility || collection.articleCount !== manifest.intent.articleCount) return false;
        for (const route of new Set<string>(manifest.intent.verifyRoutes || [])) {
          if (route !== slug && !route.startsWith(slug + "/")) return false;
          if (!/^[-\w\u4e00-\u9fff]+(?:\/[-\w\u4e00-\u9fff]+)?$/.test(route)) return false;
          const page = await fetch(`${e.PUBLIC_ORIGIN.replace(/\/$/, "")}/${route}/?verify=${j.id}`, {
            redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(10000),
          });
          if (visibility === "private" ? ![404,410].includes(page.status) : page.status !== 200) return false;
        }
      }
      if (manifest.intent.action === "publish") {
        if (
          !target ||
          target.route !== manifest.intent.route ||
          target.version !== manifest.intent.version
        )
          return false;
        const page = await fetch(
          `${e.PUBLIC_ORIGIN.replace(/\/$/, "")}/${target.route}/?verify=${j.id}`,
          {
            redirect: "manual",
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          },
        );
        if (page.status !== 200) return false;
      }
      if (manifest.intent.action === "unpublish") {
        if (entries.data.some((n) => n.id === manifest.intent.noteId))
          return false;
        const removed = await fetch(
          `${e.PUBLIC_ORIGIN.replace(/\/$/, "")}/${manifest.intent.route}/?verify=${j.id}`,
          {
            redirect: "manual",
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          },
        );
        if (![404, 410].includes(removed.status)) return false;
      }
    }
    return v as { publicNotes?: LiveNote[] };
  } catch {
    return false;
  }
}
async function saveInventory(
  e: Bindings,
  j: Job,
  marker: { publicNotes?: LiveNote[] },
) {
  if (!marker.publicNotes) return;
  await e.DB.prepare(
    `INSERT INTO live_site(id,job_id,publication_id,notes,verified_at) VALUES(1,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET job_id=excluded.job_id,publication_id=excluded.publication_id,notes=excluded.notes,verified_at=excluded.verified_at`,
  )
    .bind(j.id, j.publication_id, JSON.stringify(marker.publicNotes), now())
    .run();
}
buildInternal.use("*", async (c, next) => {
  const secret = c.env.BUILD_PIPELINE_SECRET,
    token = c.req.header("Authorization")?.replace(/^Bearer /, "");
  if (!secret || !token || (await hash(secret)) !== (await hash(token)))
    return c.json({ error: "UNAUTHORIZED" }, 401);
  c.header("Cache-Control", "no-store");
  await next();
});
buildInternal.post("/:id/claim", async (c) => {
  const { runId } = z
    .object({ runId: z.string().regex(/^\d+$/) })
    .parse(await c.req.json());
  const r = await c.env.DB.prepare(
    "UPDATE build_jobs SET status='building',run_id=?,detail='',updated_at=? WHERE id=? AND status IN ('dispatching','queued') AND run_id IS NULL",
  )
    .bind(runId, now(), c.req.param("id"))
    .run();
  if (!r.meta.changes) return c.json({ error: "JOB_NOT_CLAIMABLE" }, 409);
  return c.json({ ok: true });
});
buildInternal.use("/:id/*", async (c, next) => {
  const j = await c.env.DB.prepare("SELECT * FROM build_jobs WHERE id=?")
    .bind(c.req.param("id"))
    .first<Job>();
  if (
    !j ||
    j.run_id !== c.req.header("X-Build-Run") ||
    !["building", "deploying"].includes(j.status)
  )
    return c.json({ error: "JOB_NOT_ACTIVE" }, 409);
  await next();
});
buildInternal.get("/:id/snapshot", async (c) => {
  const j = await c.env.DB.prepare("SELECT * FROM build_jobs WHERE id=?")
    .bind(c.req.param("id"))
    .first<Job>();
  const p = await c.env.DB.prepare(
    "SELECT manifest FROM publications WHERE id=?",
  )
    .bind(j!.publication_id)
    .first<{ manifest: string }>();
  return c.json({
    jobId: j!.id,
    publicationId: j!.publication_id,
    manifest: JSON.parse(p!.manifest),
  });
});
buildInternal.get("/:id/assets/:asset", async (c) => {
  const asset = c.req.param("asset");
  if (!/^[a-f0-9]{64}$/.test(asset)) return c.notFound();
  const p = await c.env.DB.prepare(
    "SELECT p.manifest FROM publications p JOIN build_jobs j ON j.publication_id=p.id WHERE j.id=?",
  )
    .bind(c.req.param("id"))
    .first<{ manifest: string }>();
  if (
    !JSON.parse(p!.manifest).notes.some((n: { body: string }) =>
      n.body.includes("/api/v1/assets/" + asset),
    )
  )
    return c.notFound();
  const meta = await c.env.DB.prepare(
    "SELECT mime FROM assets WHERE id=? AND state='ready'",
  )
    .bind(asset)
    .first<{ mime: string }>();
  const bytes = meta && (await c.env.IMAGES.get(asset, "arrayBuffer"));
  if (!bytes) return c.notFound();
  return new Response(bytes, {
    headers: { "Content-Type": meta!.mime, "Cache-Control": "no-store" },
  });
});
buildInternal.post("/:id/status", async (c) => {
  const { status, reason } = z
    .object({
      status: z.enum(["deploying", "succeeded", "failed"]),
      reason: z
        .enum([
          "private-link",
          "internal-link",
          "image",
          "preservation",
          "build",
        ])
        .optional(),
    })
    .parse(await c.req.json());
  const j = await c.env.DB.prepare("SELECT * FROM build_jobs WHERE id=?")
    .bind(c.req.param("id"))
    .first<Job>();
  const verified = status === "succeeded" ? await verifyLive(c.env, j!) : false;
  if (status === "succeeded" && (j!.status !== "deploying" || !verified))
    return c.json({ error: "LIVE_VERSION_NOT_VERIFIED" }, 409);
  if (status === "deploying" && j!.status !== "building")
    return c.json({ error: "INVALID_TRANSITION" }, 409);
  if (verified) await saveInventory(c.env, j!, verified);
  await c.env.DB.prepare(
    `UPDATE build_jobs SET status=?,updated_at=?,detail=?,site_url=? WHERE id=? AND status=?`,
  )
    .bind(
      status === "failed" && j!.status === "deploying" ? "deploying" : status,
      now(),
      status === "failed"
        ? j!.status === "deploying"
          ? "部署结果未确认，保留发布锁，请核验任务状态"
          : {
              "private-link":
                "文章引用了尚未公开的笔记，请先调整引用链接，再重试发布。",
              "internal-link":
                "文章包含尚未迁移的相对链接，请在编辑器检查链接后重试。",
              image: "文章图片校验未通过，请检查图片是否已上传并保存后重试。",
              preservation:
                "此次操作会影响其他已上线内容，已停止发布；请查看运行日志核对范围。",
              build: "页面生成失败，线上内容保持原样。可查看运行日志后重试。",
            }[reason || "build"]
        : "",
      status === "succeeded" ? c.env.PUBLIC_ORIGIN : null,
      j!.id,
      j!.status,
    )
    .run();
  return c.json({ ok: true });
});
