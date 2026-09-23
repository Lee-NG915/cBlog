import { createServer } from "node:http";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteLinks } from "./markdown-links.mjs";
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
    categories = new Map(),
    assets = new Map();
  for (const n of snapshot.manifest.notes) {
    if (
      !/^[\w-]+$/.test(n.id) ||
      !/^[-\w\u4e00-\u9fff]+$/.test(n.slug) ||
      !n.topic_id ||
      slugs.has(n.slug)
    )
      throw new Error("Invalid or duplicate note route");
    ids.set(n.id, n.slug);
    slugs.add(n.slug);
  }
  const posts = [];
  for (const n of snapshot.manifest.notes) {
    const markdown = await rewriteLinks(n.body, (url, isImage) => {
      const link = url.match(/^\/#note=([\w-]+)(?:&section=(.*))?$/);
      if (link) {
        if (!ids.has(link[1]))
          throw new Error("Note links to a private or missing note");
        return `${basePath}/posts/${encodeURIComponent(ids.get(link[1]))}/${link[2] ? "#" + link[2] : ""}`;
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
      slug: n.slug,
      title: n.title,
      editorialDate: n.updated_at,
      updatedAt: n.updated_at,
      categorySlug: n.topic_id,
      categoryName: category.name,
      tags: Array.isArray(n.tags) ? n.tags : JSON.parse(n.tags),
      excerpt: n.body.replace(/[#*`>\n]/g, " ").slice(0, 160),
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
  return { posts, categories: [...categories.values()], assets };
}
export async function buildSnapshot(snapshot, options = {}) {
  const model = await prepareSnapshot(snapshot, options);
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
      result = { collections: [] };
    else if (url.pathname === "/api/v1/public/sitemap")
      result = {
        sitemap: {
          posts: model.posts.map((n) => ({
            slug: n.slug,
            updatedAt: n.updatedAt,
          })),
          collections: [],
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
    writeFileSync(
      path.join(root, "apps/web/out/publication.json"),
      JSON.stringify({
        jobId: snapshot.jobId,
        publicationId: snapshot.publicationId,
        revision: snapshot.manifest.revision,
      }),
    );
  } finally {
    server.close();
    rmSync(media, { recursive: true, force: true });
  }
}
