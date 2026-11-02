import { createServer } from "node:http";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteLinks } from "./markdown-links.mjs";
import { applyPublicationDates, assertDateOnlyChange } from "./publication-dates.mjs";
import { applyCollectionVisibility, publicCollections, assertCollectionOnlyChange } from "./collection-visibility.mjs";
import { saveSource } from "./published-source.mjs";
import {
  loadLegacyContent,
  mergePublicContent,
  assertPublicContentPreserved,
  publicRoutes,
  publicInventory,
} from "./legacy-content.mjs";
const root = fileURLToPath(new URL("../../", import.meta.url));
export async function prepareSnapshot(
  snapshot,
  { basePath = "", assetLoader } = {},
) {
  if (
    !Number.isInteger(snapshot.publicationId) ||
    !snapshot.jobId ||
    !Array.isArray(snapshot.manifest?.notes)
  )
    throw new Error("Invalid snapshot");
  const ids = new Map(),
    slugs = new Set(),
    categories = new Map(
      (snapshot.manifest.categories || []).map((c) => [
        c.slug,
        { ...c, publishedCount: 0 },
      ]),
    ),
    assets = new Map();
  for (const r of snapshot.manifest.references || []) {
    if (
      !/^[\w-]+$/.test(r.id) ||
      !/^[-\w\u4e00-\u9fff]+\/[-\w\u4e00-\u9fff]+$/.test(r.route)
    )
      throw new Error("Invalid public reference");
    if (!(snapshot.manifest.withdrawals || []).some((w) => w.id === r.id))
      ids.set(r.id, r.route);
  }
  for (const n of snapshot.manifest.notes) {
    const route = n.route || `posts/${n.slug}`;
    if (
      !/^[\w-]+$/.test(n.id) ||
      !/^[-\w\u4e00-\u9fff]+$/.test(n.slug) ||
      !n.topic_id ||
      slugs.has(route)
    )
      throw new Error("Invalid or duplicate note route");
    if (!/^[-\w\u4e00-\u9fff]+\/[-\w\u4e00-\u9fff]+$/.test(route))
      throw new Error("Invalid note route");
    ids.set(n.id, route);
    slugs.add(route);
  }
  const posts = [];
  for (const n of snapshot.manifest.notes) {
    const markdown = await rewriteLinks(n.body, (url, isImage) => {
      const link = url.match(/^\/#note=([\w-]+)(?:&section=(.*))?$/);
      if (link) {
        if (!ids.has(link[1]))
          throw new Error("Note links to a private or missing note");
        return `${basePath}/${ids.get(link[1]).split("/").map(encodeURIComponent).join("/")}/${link[2] ? "#" + link[2] : ""}`;
      }
      const image = url.match(/^\/api\/v1\/assets\/([a-f0-9]{64})$/);
      if (image) {
        assets.set(image[1], null);
        return `${isImage ? "" : basePath}/knowledge-media/${image[1]}`;
      }
      if (/^(?:\.\.?\/|\/api\/|\/posts\/|\/collections\/|\/cBlog\/)/.test(url))
        throw new Error("Unmigrated internal link");
      return url;
    });
    const category = categories.get(n.topic_id) || {
      slug: n.topic_id,
      name: n.topic_name || n.topic_id,
      description: "",
      publishedCount: 0,
    };
    category.publishedCount++;
    categories.set(n.topic_id, category);
    posts.push({
      sourceId: n.id,
      sourceVersion: n.version ?? null,
      sourceContentHash: createHash("sha256")
        .update(
          JSON.stringify([
            n.title,
            n.body,
            n.topic_id,
            Array.isArray(n.tags) ? n.tags : JSON.parse(n.tags),
          ]),
        )
        .digest("hex"),
      ...(n.route && !n.route.startsWith("posts/")
        ? { collectionSlug: n.route.split("/")[0] }
        : {}),
      slug: n.slug,
      title: n.title,
      publishedAt: n.published_at || n.updated_at,
      displayPublishedAt: n.display_published_at ?? null,
      editorialDate: n.display_published_at || n.published_at || n.updated_at,
      updatedAt: n.content_updated_at ?? null,
      categorySlug: n.topic_id,
      categoryName: category.name,
      tags: Array.isArray(n.tags) ? n.tags : JSON.parse(n.tags),
      excerpt: n.body
        .replace(/```[\s\S]*?```/g, "")
        .split("\n")
        .filter((line) => !/^\s*(?:#|\||>|!\[)/.test(line) && line.trim())
        .join(" ")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*`_]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 160),
      readingMinutes: Math.max(1, Math.ceil(n.body.length / 450)),
      coverUrl: null,
      contentMarkdown: markdown,
    });
  }
  for (const id of [...assets.keys()]) {
    if (!assetLoader) throw new Error("Asset loader is required");
    const bytes = Buffer.from(await assetLoader(id));
    if (createHash("sha256").update(bytes).digest("hex") !== id)
      throw new Error("Image checksum mismatch");
    const extension = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "png"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        ? "jpg"
        : bytes.toString("ascii", 0, 4) === "RIFF" &&
            bytes.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : null;
    if (!extension) throw new Error("Unsupported image signature");
    assets.delete(id);
    assets.set(`${id}.${extension}`, bytes);
    for (const post of posts)
      post.contentMarkdown = await rewriteLinks(post.contentMarkdown, (url) =>
        url.endsWith(`/knowledge-media/${id}`) ? `${url}.${extension}` : url,
      );
  }
  return {
    posts: posts.filter((p) => !p.collectionSlug),
    collectionEntries: posts.filter((p) => p.collectionSlug),
    categories: [...categories.values()],
    assets,
  };
}
export async function buildSnapshot(snapshot, options = {}) {
  const originalAssets = new Map();
  const prepared = await prepareSnapshot(snapshot, {
    ...options,
    assetLoader:
      options.assetLoader &&
      (async (id) => {
        const bytes = Buffer.from(await options.assetLoader(id));
        originalAssets.set(id, bytes);
        return bytes;
      }),
  });
  const legacy = options.legacyContentRef
    ? await loadLegacyContent(options.legacyContentRef, options)
    : null;
  const model = mergePublicContent(
    legacy,
    prepared,
    snapshot.manifest.withdrawals || [],
  );
  applyPublicationDates(model, snapshot.manifest.publicationDates);
  applyCollectionVisibility(model, snapshot.manifest.collectionVisibility);
  try {
    if (options.previousSource) {
      const previous = options.previousSource;
      if (
        (previous.kind === "legacy" &&
          previous.contentRef !== options.legacyContentRef) ||
        (previous.kind === "snapshot" &&
          previous.legacyContentRef !== options.legacyContentRef)
      )
        throw new Error("Published legacy content baseline changed");
      const previousModel =
        previous.kind === "legacy"
          ? mergePublicContent(legacy, { posts: [], categories: [] })
          : mergePublicContent(
              legacy,
              await prepareSnapshot(previous.snapshot, {
                ...options,
                assetLoader: options.previousAssetLoader,
              }),
              previous.snapshot.manifest.withdrawals || [],
            );
      if (previous.kind === "snapshot") {
        applyPublicationDates(previousModel, previous.snapshot.manifest.publicationDates);
        applyCollectionVisibility(previousModel, previous.snapshot.manifest.collectionVisibility);
      }
      const collectionAction = snapshot.manifest.intent?.action === "collection-visibility";
      if (collectionAction) {
        if (previous.kind !== "snapshot") throw new Error("Collection action requires a published baseline");
        assertCollectionOnlyChange(previous.snapshot.manifest, snapshot.manifest);
      }
      const priorWithdrawals =
        previous.kind === "snapshot"
          ? previous.snapshot.manifest.withdrawals || []
          : [];
      const newlyWithdrawn = (snapshot.manifest.withdrawals || []).filter(
        (w) =>
          !priorWithdrawals.some(
            (old) => old.id === w.id && old.route === w.route,
          ),
      );
      if (
        newlyWithdrawn.some(
          (w) =>
            snapshot.manifest.intent?.action !== "unpublish" ||
            snapshot.manifest.intent.noteId !== w.id ||
            snapshot.manifest.intent.route !== w.route,
        )
      )
        throw new Error(
          "Withdrawal requires an explicit single-article action",
        );
      assertPublicContentPreserved(previousModel, model, newlyWithdrawn,
        collectionAction && snapshot.manifest.intent.visibility === "private" ? snapshot.manifest.intent.collectionSlug : null);
      if (snapshot.manifest.intent?.action === "dates") assertDateOnlyChange(previousModel, model);
      if (previous.kind === "snapshot") {
        const nextIds = new Set(snapshot.manifest.notes.map((n) => n.id));
        if (
          previous.snapshot.manifest.notes.some(
            (n) =>
              !nextIds.has(n.id) && !newlyWithdrawn.some((w) => w.id === n.id),
          )
        )
          throw new Error(
            "Publication would withdraw an existing Cloudflare note; review the withdrawal before deploying",
          );
      }
    }
    const media = path.join(root, "apps/web/public/knowledge-media");
    // Remove previous generated content/assets, never the source notes.
    for (const dir of [
      "apps/web/.next",
      "apps/web/out",
      "apps/web/public/content",
      "apps/web/public/knowledge-media",
    ])
      rmSync(path.join(root, dir), { recursive: true, force: true });
    mkdirSync(media, { recursive: true });
    for (const [id, bytes] of model.assets)
      writeFileSync(path.join(media, id), bytes);
    const server = createServer((req, res) => {
      let result;
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/api/v1/public/posts")
        result = { posts: model.posts };
      else if (url.pathname.startsWith("/api/v1/public/posts/")) {
        const post = model.posts.find(
          (n) =>
            n.slug ===
            decodeURIComponent(
              url.pathname.slice("/api/v1/public/posts/".length),
            ),
        );
        if (post) result = { post };
      } else if (url.pathname === "/api/v1/public/categories")
        result = { categories: model.categories };
      else if (url.pathname === "/api/v1/public/collections")
        result = { collections: model.collections };
      else if (url.pathname.startsWith("/api/v1/public/collections/")) {
        const parts = url.pathname
          .slice("/api/v1/public/collections/".length)
          .split("/")
          .map(decodeURIComponent);
        const collection = model.collections.find((c) => c.slug === parts[0]);
        if (collection && parts.length === 1) result = { collection };
        else if (collection && parts.length === 3 && parts[1] === "items") {
          const item = collection.items.find((i) => i.slug === parts[2]);
          if (item) result = { item };
        }
      } else if (url.pathname === "/api/v1/public/sitemap")
        result = {
          sitemap: {
            posts: model.posts.map((n) => ({
              slug: n.slug,
              updatedAt: n.updatedAt,
            })),
            categories: model.categories.map((c) => ({ slug: c.slug })),
            collections: model.collections.map((c) => ({
              slug: c.slug,
              noindex: c.noindex,
              items: c.items.map((i) => ({ slug: i.slug })),
            })),
          },
        };
      res.writeHead(result ? 200 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result || { error: "Not found" }));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const port = server.address().port;
      await new Promise((resolve, reject) => {
        const child = spawn("pnpm", ["--filter", "@cblog/web", "build"], {
          cwd: root,
          stdio: "inherit",
          env: {
            ...process.env,
            WEB_CONTENT_SOURCE: "api",
            CONTENT_API_BASE_URL: `http://127.0.0.1:${port}`,
            CONTENT_API_READ_TOKEN: "",
            WEB_RENDER_MODE: "static-export",
            PUBLICATION_DRIVER: "github-dispatch",
            BASE_PATH: options.basePath || "",
            NEXT_PUBLIC_BASE_PATH: options.basePath || "",
            SITE_URL: options.siteUrl,
          },
        });
        child.on("error", reject);
        child.on("exit", (code) =>
          code === 0
            ? resolve()
            : reject(new Error(`Blog build failed (${code})`)),
        );
      });
      const output = path.join(root, "apps/web/out");
      legacy?.copyAssets(output);
      for (const route of publicRoutes(model)) {
        if (!existsSync(path.join(output, route, "index.html")))
          throw new Error(`Built site is missing public route: ${route}`);
      }
      mkdirSync(path.join(root, ".frontend"), { recursive: true });
      console.log(
        `Verified ${publicRoutes(model).length} public content routes (${model.posts.length} posts, ${model.collections.length} collections)`,
      );
      writeFileSync(
        path.join(root, ".frontend/content-inventory.json"),
        JSON.stringify({
          legacyContentRef: options.legacyContentRef || null,
          posts: model.posts.map((p) => p.slug),
          collections: model.collections.map((c) => ({
            slug: c.slug,
            noindex: c.noindex,
            items: c.items.map((i) => i.slug),
          })),
        }),
      );
      writeFileSync(
        path.join(root, "apps/web/out/publication.json"),
        JSON.stringify({
          jobId: snapshot.jobId,
          publicationId: snapshot.publicationId,
          revision: snapshot.manifest.revision,
          publicNotes: publicInventory(model),
          publicCollections: publicCollections(model),
        }),
      );
      if (options.archivePath)
        saveSource(
          options.archivePath,
          {
            version: 1,
            kind: "snapshot",
            siteUrl: options.siteUrl,
            snapshot,
            ...(options.legacyContentRef
              ? { legacyContentRef: options.legacyContentRef }
              : {}),
          },
          originalAssets,
        );
    } finally {
      server.close();
      rmSync(media, { recursive: true, force: true });
    }
  } finally {
    legacy?.cleanup();
  }
}
