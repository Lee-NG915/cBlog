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
 *   pages.json  — 每页指纹：<title>、h1 列表、正文内站内链接序列（捕捉列表顺序/数据漂移）、
 *                 contentHash（剔除 <img> 后的正文 SHA-256）、images（img 引用序列，srcPath 仅保留末两段）
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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

/**
 * <head> 子元素排序归一：Next 两次构建的 head 内 meta/link 元素顺序不确定
 * （内容相同、顺序不同），排序后消除构建噪声；head 之外保持原始顺序。
 */
function normalizeHead(html) {
  const m = html.match(/<head>([\s\S]*?)<\/head>/);
  if (!m) return html;
  // 按元素起始标签切分（head 内均为 void/简单元素），排序后重组
  const parts = m[1]
    .split(/(?=<(?:meta|link|title|script|style)\b)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .sort();
  return html.replace(m[0], `<head>${parts.join("")}</head>`);
}

/**
 * 构建噪声归一（同一代码两次 next build 的产物差异，与内容无关）：
 * 1. 全部图片 URL（含 RSC payload 转义上下文）替换为归一化文件名 IMGREF:<name>；
 * 2. <head> 子元素排序（meta/link 顺序构建间不确定）；
 * 3. 剔除 self.__next_f.push RSC payload 脚本：静态导出下它只是可见 HTML 的冗余数据，
 *    其 chunk 切分点、流式顺序与 buildId 每次构建都不同，不可归一。
 */
function normalizeImageUrls(html) {
  return html.replace(
    /[^\s"'\\(,]+\.(?:png|jpe?g|gif|webp|svg|avif)(\?[^\s"'\\)]*)?/gi,
    (match) => `IMGREF:${normalizedImageName(match)}`
  );
}

function contentHashOf(html) {
  const stripped = normalizeHead(normalizeImageUrls(html))
    .replace(/<script>self\.__next_f\.push\([\s\S]*?<\/script>/g, "")
    // /_next/static 资源引用是打包产物：chunk 内容哈希与引用集合在相同代码的
    // 两次构建间也会变化（实测含 not-found chunk 漂移），与内容等价性无关
    .replace(/<script\b[^>]*src="\/_next\/static\/[^"]*"[^>]*>\s*<\/script>/g, "")
    .replace(/<link\b[^>]*\/_next\/static\/[^>]*>/g, "")
    .replace(/<img\b[\s\S]*?>/g, "")
    // og:image / twitter:image 与 JSON-LD image 同属图片引用，交由 images 维度比对
    //（精确匹配属性值，排除 og:image:width/height/alt 等派生属性）
    .replace(/<meta\b[^>]*(?:property|name)="(?:og:image|twitter:image)"[^>]*>/g, "")
    .replace(/"image"\s*:\s*"[^"]*"/g, '"image":""')
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("sha256").update(stripped).digest("hex");
}

/**
 * 图片引用归一化：只保留文件名的"语义段"——
 * - 剥 query/hash、目录前缀与扩展名（filesystem 产物经 WebP 管道改扩展名，api 产物保留原扩展名）；
 * - 剥对象存储内容寻址前缀 `<64-hex-sha>-`（api 产物 URL 形如 assets/<2hex>/<sha>-<原名>.<ext>）。
 * 两侧归一后得到同一个原始文件名（如 date-analyse-cover）。
 */
function normalizedImageName(src) {
  const clean = decodeEntities(src).split(/[?#]/)[0];
  const segs = clean.split("/").filter(Boolean);
  const file = segs[segs.length - 1] ?? "";
  const noExt = file.replace(/\.[a-z0-9]+$/i, "");
  return noExt.replace(/^[0-9a-f]{64}-/, "");
}

function extractImages(html) {
  const refs = [];
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const srcM = tag.match(/\bsrc="([^"]*)"/);
    if (!srcM) continue;
    const altM = tag.match(/\balt="([^"]*)"/);
    refs.push({
      index: m.index,
      alt: decodeEntities(altM ? altM[1] : ""),
      srcPath: normalizedImageName(srcM[1]),
    });
  }
  // og:image / twitter:image meta 与 JSON-LD image 也是图片引用（封面两种模式 URL 形态不同）
  for (const m of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = m[0];
    const nameM = tag.match(/(?:property|name)="([^"]*)"/);
    if (!nameM || !["og:image", "twitter:image"].includes(nameM[1])) continue;
    const contentM = tag.match(/\bcontent="([^"]*)"/);
    if (!contentM) continue;
    refs.push({
      index: m.index,
      alt: `meta:${nameM[1]}`,
      srcPath: normalizedImageName(contentM[1]),
    });
  }
  for (const m of html.matchAll(/"image"\s*:\s*"([^"]*)"/g)) {
    refs.push({
      index: m.index,
      alt: "jsonld:image",
      srcPath: normalizedImageName(m[1]),
    });
  }
  return refs
    .sort((a, b) => a.index - b.index)
    .map(({ alt, srcPath }) => ({ alt, srcPath }));
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
  return { title, h1s, links, contentHash: contentHashOf(html), images: extractImages(html) };
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
    // 每个 <url> 条目输出 "loc<TAB>lastmod日粒度"：lastmod 是数据等价性的重要维度
    //（adapter 的 updatedAt 映射错误主要落点）。静态路由 lastmod 是构建时刻（噪声），
    // 与快照时间可能不同日。规则：取全部条目 lastmod 日的众数为"构建日"（静态路由
    // 数量占优），等于构建日的条目仅记 loc；历史日期（数据驱动）保留日粒度。
    const entries = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => {
      const loc = (m[0].match(/<loc>([^<]+)<\/loc>/) || [])[1] ?? "";
      const lastmod = (m[0].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
      return { loc, day: lastmod ? lastmod.slice(0, 10) : "" };
    });
    const dayCounts = new Map();
    for (const { day } of entries) {
      if (day) dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    const buildDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    locs = entries
      .map(({ loc, day }) => (day && day !== buildDay ? `${loc}\t${day}` : loc))
      .sort();
    // 透明化归一基线（compare 侧跳过 # 行）
    if (buildDay) locs.push(`# buildday\t${buildDay}`);
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
    sitemap: fs
      .readFileSync(path.join(dir, "sitemap.txt"), "utf8")
      .trim()
      .split("\n")
      .filter((line) => !line.startsWith("#")),
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
  // sitemap：两侧都带 lastmod 列才比全行；任一侧是旧格式（仅 loc）则退化为 loc-only
  const hasLastmodA = a.sitemap.some((line) => line.includes("\t"));
  const hasLastmodB = b.sitemap.some((line) => line.includes("\t"));
  let sitemapA = a.sitemap;
  let sitemapB = b.sitemap;
  if (hasLastmodA !== hasLastmodB) {
    console.log("⚠ 一侧 sitemap 快照为旧格式（无 lastmod），退化为 loc-only 对比");
    sitemapA = a.sitemap.map((line) => line.split("\t")[0]);
    sitemapB = b.sitemap.map((line) => line.split("\t")[0]);
  }
  ok = diffList(dirA, sitemapA, dirB, sitemapB, "sitemap") && ok;

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

  // 新增维度：contentHash / images（旧快照无此字段时跳过）
  let hashCompared = 0,
    hashMatch = 0,
    imgCompared = 0,
    imgMatch = 0,
    skipped = 0;
  for (const [rel, fpA] of Object.entries(a.pages)) {
    const fpB = b.pages[rel];
    if (!fpB) continue; // urls diff 已报告
    if (fpA.contentHash === undefined || fpB.contentHash === undefined) {
      skipped++;
      continue;
    }
    hashCompared++;
    if (fpA.contentHash === fpB.contentHash) hashMatch++;
    else
      console.log(
        `✗ ${rel}\n    contentHash: ${fpA.contentHash.slice(0, 16)}… -> ${fpB.contentHash.slice(0, 16)}…`
      );
    imgCompared++;
    if (JSON.stringify(fpA.images) === JSON.stringify(fpB.images)) imgMatch++;
    else {
      console.log(`✗ ${rel}`);
      const max = Math.max(fpA.images.length, fpB.images.length);
      for (let i = 0; i < max; i++) {
        const ia = fpA.images[i];
        const ib = fpB.images[i];
        if (JSON.stringify(ia) !== JSON.stringify(ib))
          console.log(`    images[${i}]: ${JSON.stringify(ia)} -> ${JSON.stringify(ib)}`);
      }
    }
  }
  if (skipped > 0)
    console.log(`⚠ ${skipped} 页缺少 contentHash/images 字段（旧格式快照），已跳过新维度对比`);
  if (hashCompared > 0) {
    if (hashMatch === hashCompared) console.log(`✓ contentHash ${hashMatch}/${hashCompared} 一致`);
    else {
      console.log(`✗ contentHash ${hashMatch}/${hashCompared} 一致`);
      ok = false;
    }
  }
  if (imgCompared > 0) {
    if (imgMatch === imgCompared) console.log(`✓ images ${imgMatch}/${imgCompared} 一致`);
    else {
      console.log(`✗ images ${imgMatch}/${imgCompared} 一致`);
      ok = false;
    }
  }

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
