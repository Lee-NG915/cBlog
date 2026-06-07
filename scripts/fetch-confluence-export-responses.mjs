#!/usr/bin/env node
/**
 * Fetch Confluence pages via REST API and save MCP-compatible batch JSON files.
 * Reads credentials from ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN env vars.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST = path.join(ROOT, 'scripts/confluence-manifest.json');
const OUT_DIR = path.join(ROOT, 'docs/confluence-export/.responses');
const ROOT_PAGE_ID = '2583822375';
const SKIP_IDS = new Set(['3088515313']);
const BATCH_SIZE = 10;

const BASE = 'https://castlery.atlassian.net/wiki';
const EMAIL = process.env.ATLASSIAN_EMAIL || 'color.li@castlery.com';
const TOKEN = process.env.ATLASSIAN_API_TOKEN;

if (!TOKEN) {
  console.error('Set ATLASSIAN_API_TOKEN (and optionally ATLASSIAN_EMAIL)');
  process.exit(1);
}

const auth = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

async function apiGet(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function htmlToMarkdown(html) {
  if (!html) return '';
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<li><p>(.*?)<\/p><\/li>/gi, '* $1\n')
    .replace(/<li>(.*?)<\/li>/gi, '* $1\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchPage(pageId) {
  const v2 = await apiGet(`${BASE}/api/v2/pages/${pageId}?body-format=atlas_doc_format`);
  let body = '';
  if (v2.body?.atlas_doc_format?.value) {
    try {
      const adf = JSON.parse(v2.body.atlas_doc_format.value);
      body = adfToMarkdown(adf);
    } catch {
      body = v2.body.atlas_doc_format.value;
    }
  }
  if (!body) {
    const v1 = await apiGet(
      `${BASE}/rest/api/content/${pageId}?expand=body.export_view,version,space`
    );
    body = htmlToMarkdown(v1.body?.export_view?.value || '');
  }

  const webUrl = `${BASE}/spaces/EC/pages/${pageId}`;
  return {
    id: String(v2.id),
    type: 'page',
    status: v2.status,
    title: v2.title,
    spaceId: String(v2.spaceId),
    parentId: v2.parentId ? String(v2.parentId) : undefined,
    parentType: v2.parentType,
    authorId: v2.authorId,
    ownerId: v2.ownerId,
    lastOwnerId: v2.lastOwnerId,
    createdAt: v2.createdAt,
    version: v2.version,
    body,
    webUrl,
  };
}

function adfToMarkdown(node, depth = 0) {
  if (!node) return '';
  const type = node.type;
  const content = node.content || [];

  if (type === 'text') {
    let text = node.text || '';
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'strong') text = `**${text}**`;
        if (mark.type === 'em') text = `*${text}*`;
        if (mark.type === 'code') text = `\`${text}\``;
        if (mark.type === 'link') text = `[${text}](${mark.attrs?.href || ''})`;
      }
    }
    return text;
  }

  const inner = content.map((c) => adfToMarkdown(c, depth + 1)).join('');

  switch (type) {
    case 'doc':
    case 'paragraph':
      return `${inner}\n\n`;
    case 'heading': {
      const level = '#'.repeat(node.attrs?.level || 1);
      return `${level} ${inner.trim()}\n\n`;
    }
    case 'bulletList':
      return content.map((c) => adfToMarkdown(c, depth + 1)).join('');
    case 'orderedList':
      return content.map((c, i) => adfToMarkdown(c, depth + 1).replace(/^/, `${i + 1}. `)).join('');
    case 'listItem':
      return `- ${inner.trim()}\n`;
    case 'codeBlock':
      return `\`\`\`\n${inner.trim()}\n\`\`\`\n\n`;
    case 'table':
      return `${inner}\n\n`;
    case 'tableRow':
      return `| ${content.map((c) => adfToMarkdown(c).trim()).join(' | ')} |\n`;
    case 'tableHeader':
    case 'tableCell':
      return inner.trim();
    case 'hardBreak':
      return '\n';
    case 'rule':
      return '---\n\n';
    case 'mediaSingle':
    case 'media':
      return `![](${node.attrs?.url || 'attachment'})\n\n`;
    case 'panel':
      return `> ${inner.trim()}\n\n`;
    case 'blockquote':
      return `> ${inner.trim()}\n\n`;
    default:
      return inner;
  }
}

function loadPageIds() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const ids = [ROOT_PAGE_ID];
  for (const p of manifest.pages) {
    if (p.type !== 'page') continue;
    if (SKIP_IDS.has(p.id)) continue;
    if (!ids.includes(p.id)) ids.push(p.id);
  }
  return ids;
}

async function main() {
  const pageIds = loadPageIds();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const failed = [];
  const allPages = [];

  for (const id of pageIds) {
    try {
      process.stderr.write(`Fetching ${id}...\n`);
      const page = await fetchPage(id);
      allPages.push(page);
    } catch (err) {
      failed.push({ id, error: err.message });
      process.stderr.write(`FAILED ${id}: ${err.message}\n`);
    }
  }

  for (let i = 0; i < allPages.length; i += BATCH_SIZE) {
    const batch = allPages.slice(i, i + BATCH_SIZE);
    const batchNum = String(Math.floor(i / BATCH_SIZE) + 1).padStart(3, '0');
    const outPath = path.join(OUT_DIR, `batch-${batchNum}.json`);
    fs.writeFileSync(outPath, JSON.stringify({ pages: batch }, null, 2) + '\n');
    console.log(`Wrote ${batch.length} pages -> ${outPath}`);
  }

  const empty = allPages.filter((p) => !p.body?.trim()).length;
  console.log(
    JSON.stringify(
      {
        fetched: allPages.length,
        empty,
        failed: failed.length,
        failedIds: failed,
        batches: Math.ceil(allPages.length / BATCH_SIZE),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
