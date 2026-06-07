#!/usr/bin/env node
/**
 * 将 MCP 拉取的 Confluence 页面 JSON 写入 docs/confluence-export/pages/
 *
 * 用法：
 *   node scripts/sync-confluence-export.mjs < responses/batch-001.json
 *   node scripts/sync-confluence-export.mjs --file responses/batch-001.json
 *
 * 输入 JSON 格式：{ "pages": [ { getConfluencePage 响应 }, ... ] }
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'docs/confluence-export');
const PAGES_DIR = path.join(EXPORT_DIR, 'pages');
const MANIFEST_PATH = path.join(EXPORT_DIR, 'manifest.json');

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[【】（）()]/g, '')
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

function frontmatter(page) {
  const lines = [
    '---',
    `confluence_id: "${page.id}"`,
    `title: "${page.title.replace(/"/g, '\\"')}"`,
    `status: ${page.status}`,
    `web_url: ${page.webUrl}`,
    `parent_id: "${page.parentId || ''}"`,
    `exported_at: ${new Date().toISOString().slice(0, 10)}`,
    '---',
    '',
  ];
  return lines.join('\n');
}

function writePage(page) {
  if (!page?.id) return null;
  const slug = slugify(page.title);
  const filename = `${page.id}-${slug}.md`;
  const filepath = path.join(PAGES_DIR, filename);
  const body = page.body?.trim() || '_（Confluence 页面正文为空，或为白板/附件类型）_';
  fs.writeFileSync(filepath, frontmatter(page) + body + '\n', 'utf8');
  return { id: page.id, title: page.title, file: `pages/${filename}`, webUrl: page.webUrl };
}

async function main() {
  const args = process.argv.slice(2);
  let raw = '';
  if (args[0] === '--file' && args[1]) {
    raw = fs.readFileSync(path.resolve(args[1]), 'utf8');
  } else {
    raw = fs.readFileSync(0, 'utf8');
  }
  const input = JSON.parse(raw);
  const pages = input.pages || (Array.isArray(input) ? input : [input]);

  fs.mkdirSync(PAGES_DIR, { recursive: true });

  let manifest = { pages: [] };
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }
  const byId = new Map(manifest.pages.map((p) => [p.id, p]));

  const written = [];
  for (const page of pages) {
    const meta = writePage(page);
    if (meta) {
      byId.set(meta.id, { ...byId.get(meta.id), ...meta, exported: true });
      written.push(meta);
    }
  }

  manifest.pages = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  manifest.lastSync = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Wrote ${written.length} pages to ${PAGES_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
