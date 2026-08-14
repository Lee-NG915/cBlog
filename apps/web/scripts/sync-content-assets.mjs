#!/usr/bin/env node
/**
 * 随文档资产同步管道（FR-6.3 / FR-10.2）：
 *   content/(posts|collections)/**（非 md）→ apps/web/public/content/<原相对路径>
 *
 * 生产构建（prebuild）：位图（png/jpg/jpeg，≥50KB）额外生成限宽 1600 的 WebP 副本，
 * 并写 manifest（public/content/asset-manifest.json），渲染层据此把引用替换为 WebP，
 * 原图保留兜底。dev（--dev）：仅镜像复制，跳过压缩。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isDev = process.argv.includes("--dev");
const webRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(webRoot));
const contentRoot = path.join(repoRoot, "content");
const targetRoot = path.join(webRoot, "public", "content");

const BITMAP_EXT = new Set([".png", ".jpg", ".jpeg"]);
const WEBP_THRESHOLD = 50 * 1024;
const MAX_WIDTH = 1600;

let sharp = null;
if (!isDev) {
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("⚠ sharp 不可用，跳过图片压缩（仅镜像复制）");
  }
}

function listAssets(dir, base, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".trash") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listAssets(full, base, acc);
    } else if (!entry.name.endsWith(".md") && !entry.name.startsWith(".")) {
      acc.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return acc;
}

fs.rmSync(targetRoot, { recursive: true, force: true });

const assets = [
  ...listAssets(path.join(contentRoot, "posts"), contentRoot),
  ...listAssets(path.join(contentRoot, "collections"), contentRoot),
];

const manifest = {};
let optimized = 0;

for (const rel of assets) {
  const src = path.join(contentRoot, ...rel.split("/"));
  const dest = path.join(targetRoot, ...rel.split("/"));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);

  const ext = path.extname(rel).toLowerCase();
  if (
    sharp &&
    BITMAP_EXT.has(ext) &&
    fs.statSync(src).size >= WEBP_THRESHOLD
  ) {
    const webpRel = rel.slice(0, -ext.length) + ".webp";
    const webpDest = path.join(targetRoot, ...webpRel.split("/"));
    try {
      await sharp(src)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpDest);
      manifest[rel] = webpRel;
      optimized += 1;
    } catch (error) {
      console.warn(`⚠ 压缩失败（保留原图）: ${rel}: ${error.message}`);
    }
  }
}

fs.mkdirSync(targetRoot, { recursive: true });
fs.writeFileSync(
  path.join(targetRoot, "asset-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);

console.log(
  `内容资产同步完成: ${assets.length} 个文件${
    sharp ? `，其中 ${optimized} 个生成 WebP 优化副本` : ""
  }${isDev ? "（dev 模式，未压缩）" : ""}`
);
