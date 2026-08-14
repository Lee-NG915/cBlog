#!/usr/bin/env node
/**
 * 构建产物等价校验工具（测试计划 MIG-001）。
 *
 * 用法：
 *   node scripts/parity-snapshot.mjs snapshot <outDir> <snapshotDir>   # 抓取快照
 *   node scripts/parity-snapshot.mjs compare <snapshotA> <snapshotB>   # 对比两个快照
 *
 * 快照内容：
 *   urls.txt    — out/ 下全部 HTML 页面路径（排序）
 *   sitemap.txt — sitemap.xml 中的 <loc> 列表（排序）
 *   pages.json  — 每页指纹：<title>、h1 列表、正文内站内链接序列（捕捉列表顺序/数据漂移）
 */
import fs from "node:fs";
import path from "node:path";

function listHtmlFiles(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_next") continue;
      listHtmlFiles(full, base, acc);
    } else if (entry.name.endsWith(".html")) {
      acc.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return acc.sort();
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function fingerprint(html) {
  const title = decodeEntities((html.match(/<title>([\s\S]*?)<\/title>/) || [, ""])[1].trim());
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    decodeEntities(m[1].replace(/<[^>]+>/g, "").trim())
  );
  const links = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter(
      (href) =>
        href.startsWith("/") &&
        !href.startsWith("/_next") &&
        !href.startsWith("//")
    )
    .map((href) => decodeEntities(href));
  return { title, h1s, links };
}

function snapshot(outDir, snapDir) {
  if (!fs.existsSync(outDir)) throw new Error(`out 目录不存在: ${outDir}`);
  fs.mkdirSync(snapDir, { recursive: true });

  const htmlFiles = listHtmlFiles(outDir);
  fs.writeFileSync(path.join(snapDir, "urls.txt"), htmlFiles.join("\n") + "\n");

  const sitemapPath = path.join(outDir, "sitemap.xml");
  let locs = [];
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, "utf8");
    locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  }
  fs.writeFileSync(path.join(snapDir, "sitemap.txt"), locs.join("\n") + "\n");

  const pages = {};
  for (const rel of htmlFiles) {
    if (rel === "404.html" || rel === "404/index.html") continue;
    pages[rel] = fingerprint(fs.readFileSync(path.join(outDir, rel), "utf8"));
  }
  fs.writeFileSync(path.join(snapDir, "pages.json"), JSON.stringify(pages, null, 2) + "\n");
  console.log(`快照完成: ${htmlFiles.length} 个页面 -> ${snapDir}`);
}

function readSnap(dir) {
  return {
    urls: fs.readFileSync(path.join(dir, "urls.txt"), "utf8").trim().split("\n"),
    sitemap: fs.readFileSync(path.join(dir, "sitemap.txt"), "utf8").trim().split("\n"),
    pages: JSON.parse(fs.readFileSync(path.join(dir, "pages.json"), "utf8")),
  };
}

function diffList(labelA, a, labelB, b, name) {
  const setA = new Set(a);
  const setB = new Set(b);
  const missing = a.filter((x) => !setB.has(x));
  const added = b.filter((x) => !setA.has(x));
  if (missing.length || added.length) {
    console.log(`✗ ${name} 不一致:`);
    missing.forEach((x) => console.log(`  - 仅在 ${labelA}: ${x}`));
    added.forEach((x) => console.log(`  + 仅在 ${labelB}: ${x}`));
    return false;
  }
  console.log(`✓ ${name} 一致 (${a.length} 项)`);
  return true;
}

function compare(dirA, dirB) {
  const a = readSnap(dirA);
  const b = readSnap(dirB);
  let ok = true;
  ok = diffList(dirA, a.urls, dirB, b.urls, "页面 URL 清单") && ok;
  ok = diffList(dirA, a.sitemap, dirB, b.sitemap, "sitemap") && ok;

  let pageDiffs = 0;
  for (const [rel, fpA] of Object.entries(a.pages)) {
    const fpB = b.pages[rel];
    if (!fpB) continue; // urls diff 已报告
    const diffs = [];
    if (fpA.title !== fpB.title) diffs.push(`title: "${fpA.title}" -> "${fpB.title}"`);
    if (JSON.stringify(fpA.h1s) !== JSON.stringify(fpB.h1s))
      diffs.push(`h1: ${JSON.stringify(fpA.h1s)} -> ${JSON.stringify(fpB.h1s)}`);
    if (JSON.stringify(fpA.links) !== JSON.stringify(fpB.links))
      diffs.push(`链接序列变化 (${fpA.links.length} -> ${fpB.links.length})`);
    if (diffs.length) {
      pageDiffs++;
      console.log(`✗ ${rel}`);
      diffs.forEach((d) => console.log(`    ${d}`));
    }
  }
  if (pageDiffs === 0) console.log(`✓ 全部页面指纹一致`);
  else ok = false;

  console.log(ok ? "\n== 等价校验通过 ==" : "\n== 等价校验失败 ==");
  process.exit(ok ? 0 : 1);
}

const [, , cmd, arg1, arg2] = process.argv;
if (cmd === "snapshot") snapshot(arg1, arg2);
else if (cmd === "compare") compare(arg1, arg2);
else {
  console.error("用法: parity-snapshot.mjs snapshot|compare <dirA> <dirB>");
  process.exit(1);
}
