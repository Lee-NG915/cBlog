import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteLinks } from "./markdown-links.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(path.join(root, "packages/core/package.json"));
const matter = require("gray-matter");

// Read only the commit recorded by the live publication's archive. Never use
// HEAD, the working tree, private D1 notes, or the latest repository contents.
export async function loadLegacyContent(ref, { basePath = "" } = {}) {
  if (!/^[a-f0-9]{40}$/.test(ref))
    throw new Error("Invalid legacy content commit");
  mkdirSync(path.join(root, ".knowledge"), { recursive: true });
  const directory = mkdtempSync(path.join(root, ".knowledge/legacy-build-"));
  let db;
  try {
    const archive = execFileSync(
      "git",
      [
        "archive",
        ref,
        "--",
        "content",
        "data/blog.db",
        "apps/web/public/images",
      ],
      { cwd: root, maxBuffer: 128 * 1024 * 1024 },
    );
    execFileSync("tar", ["-xf", "-", "-C", directory], { input: archive });
    db = new DatabaseSync(path.join(directory, "data/blog.db"), {
      readOnly: true,
    });
    const body = async (file) => {
      const markdown = matter(
        readFileSync(path.join(directory, "content", file), "utf8"),
      ).content;
      return rewriteLinks(markdown, (url, image) =>
        image && url.startsWith("./")
          ? `/content/${path.posix.join(path.posix.dirname(file), url.slice(2))}`
          : url,
      );
    };
    const cover = (url, file) =>
      !url
        ? null
        : url.startsWith("./")
          ? `${basePath}/content/${path.posix.join(path.posix.dirname(file), url.slice(2))}`
          : url.startsWith("/")
            ? basePath + url
            : url;
    const categories = db
      .prepare(
        "SELECT slug,name,description,sort_order AS sortOrder FROM categories ORDER BY sort_order",
      )
      .all();
    const posts = [];
    for (const p of db
      .prepare(
        "SELECT p.*,c.slug AS category_slug,c.name AS category_name FROM posts p JOIN categories c ON c.id=p.category_id WHERE p.status='published'",
      )
      .all()) {
      const markdown = await body(p.file_path);
      const words =
        (markdown.match(/[一-龥]/g) || []).length +
        markdown.split(/\s+/).filter((w) => /^[a-zA-Z]+$/.test(w)).length;
      posts.push({
        sourceId: createHash("sha256")
          .update("content/" + p.file_path)
          .digest("hex")
          .slice(0, 24),
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        editorialDate: p.date,
        updatedAt: p.updated_at,
        categorySlug: p.category_slug,
        categoryName: p.category_name,
        tags: db
          .prepare(
            "SELECT t.name FROM tags t JOIN post_tags pt ON pt.tag_id=t.id WHERE pt.post_id=? ORDER BY pt.position",
          )
          .all(p.id)
          .map((t) => t.name),
        readingMinutes: Math.max(1, Math.ceil(words / 250)),
        coverUrl: cover(p.cover_image, p.file_path),
        contentMarkdown: markdown,
      });
    }
    const collections = [];
    for (const c of db
      .prepare("SELECT * FROM collections ORDER BY sort_order")
      .all()) {
      const items = [];
      for (const n of db
        .prepare(
          "SELECT * FROM collection_items WHERE collection_id=? AND status='published' ORDER BY sort_order",
        )
        .all(c.id)) {
        const markdown = await body(n.file_path);
        const words =
          markdown.trim().split(/\s+/).filter(Boolean).length +
          Math.ceil((markdown.match(/[一-鿿]/g) || []).length / 2);
        items.push({
          sourceId: createHash("sha256")
            .update("content/" + n.file_path)
            .digest("hex")
            .slice(0, 24),
          slug: n.slug,
          title: n.title,
          excerpt: n.excerpt,
          sortOrder: n.sort_order,
          readingMinutes: Math.max(1, Math.ceil(words / 250)),
          contentMarkdown: markdown,
          updatedAt: n.updated_at,
        });
      }
      collections.push({
        slug: c.slug,
        name: c.name,
        description: c.description,
        label: c.label,
        badge: c.badge,
        noindex: !!c.noindex,
        sortOrder: c.sort_order,
        publishedItemCount: items.length,
        items,
      });
    }
    return {
      posts,
      categories,
      collections,
      directory,
      copyAssets(output) {
        const images = path.join(directory, "apps/web/public/images");
        if (existsSync(images))
          cpSync(images, path.join(output, "images"), { recursive: true });
        cpSync(path.join(directory, "content"), path.join(output, "content"), {
          recursive: true,
          filter: (source) =>
            !path.basename(source).startsWith(".") && !source.endsWith(".md"),
        });
      },
      cleanup() {
        rmSync(directory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  } finally {
    db?.close();
  }
}

export function mergePublicContent(legacy, snapshot, withdrawals = []) {
  const posts = new Map((legacy?.posts || []).map((p) => [p.slug, p]));
  for (const post of snapshot.posts) posts.set(post.slug, post);
  const removed = new Set(withdrawals.map((n) => n.route));
  for (const slug of posts.keys())
    if (removed.has(`posts/${slug}`)) posts.delete(slug);
  const collections = (legacy?.collections || []).map((c) => {
    const overrides = (snapshot.collectionEntries || []).filter(
      (n) => n.collectionSlug === c.slug,
    );
    const items = c.items
      .filter((n) => !removed.has(`${c.slug}/${n.slug}`))
      .map((n) => {
        const edit = overrides.find((o) => o.slug === n.slug);
        return edit ? { ...n, ...edit } : n;
      });
    return {
      ...c,
      items,
      ...(c.publishedItemCount !== undefined
        ? { publishedItemCount: items.length }
        : {}),
    };
  });
  const categories = new Map(
    (legacy?.categories || []).map((c) => [c.slug, { ...c }]),
  );
  for (const category of snapshot.categories)
    if (!categories.has(category.slug))
      categories.set(category.slug, { ...category });
  for (const c of categories.values())
    c.publishedCount = [...posts.values()].filter(
      (p) => p.categorySlug === c.slug,
    ).length;
  return {
    ...snapshot,
    posts: [...posts.values()],
    categories: [...categories.values()],
    collections,
  };
}

export function publicInventory(model) {
  return [
    ...model.posts.map((p) => ({
      id: p.sourceId,
      route: `posts/${p.slug}`,
      version: p.sourceVersion ?? null,
      contentHash: p.sourceContentHash ?? null,
    })),
    ...(model.collections || []).flatMap((c) =>
      c.items.map((n) => ({
        id: n.sourceId,
        route: `${c.slug}/${n.slug}`,
        version: n.sourceVersion ?? null,
        contentHash: n.sourceContentHash ?? null,
      })),
    ),
  ].filter((n) => n.id);
}

export function publicRoutes(model) {
  return [
    ...model.posts.map((p) => `posts/${p.slug}`),
    ...model.categories
      .filter((c) => c.slug !== "uncategorized" || c.publishedCount > 0)
      .map((c) => `categories/${c.slug}`),
    ...(model.collections || []).flatMap((c) => [
      c.slug,
      ...c.items.map((i) => `${c.slug}/${i.slug}`),
    ]),
  ].sort();
}

export function assertPublicContentPreserved(
  previous,
  next,
  authorizedWithdrawals = [],
) {
  const routes = new Set(publicRoutes(next));
  const inventory = publicInventory(previous);
  for (const w of authorizedWithdrawals)
    if (!inventory.some((n) => n.id === w.id && n.route === w.route))
      throw new Error("Withdrawal does not match the published article");
  const allowed = new Set(authorizedWithdrawals.map((n) => n.route));
  const removed = publicRoutes(previous).filter(
    (r) => !routes.has(r) && !allowed.has(r),
  );
  if (removed.length)
    throw new Error(
      `Publication would remove existing public routes: ${removed.join(", ")}. Review withdrawals before publishing.`,
    );
}
