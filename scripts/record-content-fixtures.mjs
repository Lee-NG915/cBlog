#!/usr/bin/env node
/**
 * 从真实 Content API（staging admin）录制静态 fixture（测试计划 WEB-201/203/204 前置）。
 *
 * 用法：
 *   CONTENT_API_BASE_URL=http://127.0.0.1:3101 CONTENT_API_READ_TOKEN=test-read-token \
 *     node scripts/record-content-fixtures.mjs
 *
 * 行为：
 *   - 拉取 8 类端点：posts 列表 + 逐 slug 详情、categories、collections 列表 +
 *     逐 slug 详情、每个 collection 详情里 items 的逐 itemSlug 详情、site、sitemap；
 *   - 写入 scripts/fixtures/content-api/ 对应路径（中文 slug 文件名用 encodeURIComponent）；
 *   - 任何请求失败即非零退出；结束打印各类型条数统计。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(ROOT, "fixtures", "content-api");
const BASE_URL = (
  process.env.CONTENT_API_BASE_URL || "http://127.0.0.1:3101"
).replace(/\/+$/, "");
const READ_TOKEN = process.env.CONTENT_API_READ_TOKEN || "";

async function fetchJson(endpoint) {
  const headers = { accept: "application/json" };
  if (READ_TOKEN) headers.authorization = `Bearer ${READ_TOKEN}`;
  const res = await fetch(`${BASE_URL}/api/v1/public${endpoint}`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${endpoint} -> ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function writeFixture(endpoint, data) {
  const segments = endpoint
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((seg) => encodeURIComponent(seg));
  const file = path.join(FIXTURE_DIR, ...segments) + ".json";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return file;
}

async function main() {
  const stats = {};

  // 1. posts 列表 + 逐 slug 详情
  const postsList = await fetchJson("/posts");
  writeFixture("/posts", postsList);
  const posts = postsList.posts ?? [];
  stats["posts 列表"] = posts.length;
  for (const post of posts) {
    writeFixture(`/posts/${post.slug}`, await fetchJson(`/posts/${post.slug}`));
  }
  stats["post 详情"] = posts.length;

  // 2. categories
  const categories = await fetchJson("/categories");
  writeFixture("/categories", categories);
  stats["categories"] = (categories.categories ?? []).length;

  // 3. collections 列表 + 逐 slug 详情 + item 详情
  const collectionsList = await fetchJson("/collections");
  writeFixture("/collections", collectionsList);
  const collections = collectionsList.collections ?? [];
  stats["collections 列表"] = collections.length;
  let itemCount = 0;
  for (const col of collections) {
    const detail = await fetchJson(`/collections/${col.slug}`);
    writeFixture(`/collections/${col.slug}`, detail);
    const items = detail.collection?.items ?? [];
    for (const item of items) {
      writeFixture(
        `/collections/${col.slug}/items/${item.slug}`,
        await fetchJson(`/collections/${col.slug}/items/${item.slug}`)
      );
      itemCount += 1;
    }
  }
  stats["collection 详情"] = collections.length;
  stats["item 详情"] = itemCount;

  // 4. site / sitemap
  writeFixture("/site", await fetchJson("/site"));
  stats["site"] = 1;
  writeFixture("/sitemap", await fetchJson("/sitemap"));
  stats["sitemap"] = 1;

  console.log("fixture 录制完成，输出目录:", FIXTURE_DIR);
  for (const [label, count] of Object.entries(stats)) {
    console.log(`  ${label}: ${count}`);
  }
}

main().catch((err) => {
  console.error("录制失败:", err.message ?? err);
  process.exit(1);
});
