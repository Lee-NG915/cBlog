#!/usr/bin/env node
/**
 * Build docs/confluence-export from manifest + getConfluencePage responses.
 *
 * Usage:
 *   node scripts/build-confluence-export.mjs [--responses-dir docs/confluence-export/.responses]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST_SRC = path.join(ROOT, 'scripts/confluence-manifest.json');
const EXPORT_DIR = path.join(ROOT, 'docs/confluence-export');
const PAGES_DIR = path.join(EXPORT_DIR, 'pages');

const SKIP_WHITEBOARDS = new Set(['3272310798', '3298361382']);
const ROOT_PAGE_ID = '2583822375';

const DOMAIN_RULES = [
  { domain: 'architecture', patterns: [/Joyboy架构/i, /Client Side Architecture/i, /多市场/i, /Multi-Region/i, /ENV合并/i, /Feature Flag/i, /功能特性管理/i, /Business Features/i] },
  { domain: 'migration', patterns: [/迁移/i, /Onepiece/i, /PLA页面迁移/i] },
  { domain: 'rendering', patterns: [/ISR/i, /Redis/i, /cache/i, /PLA-v1/i, /\bPLA\b/i, /onepiece server side cache/i] },
  { domain: 'design-system', patterns: [/Fortress/i, /Joy UI/i, /Tailwind/i, /ADR/i] },
  { domain: 'transaction', patterns: [/Checkout/i, /Payment/i, /Transaction Observability/i] },
  { domain: 'cms', patterns: [/CMS/i, /Storyblok/i, /Sale Page/i] },
  { domain: 'observability', patterns: [/Sentry/i, /Datadog/i, /Log Management/i, /Minitor/i, /Monitor/i] },
  { domain: 'product', patterns: [/PLP/i, /PDP/i, /Promotion/i, /Account/i, /O2O/i, /POS/i, /UMS/i, /Blog Page/i, /Other Pages/i, /Teaser/i, /隐私合规/i] },
  { domain: 'platform', patterns: [/i18n/i, /Internationalization/i, /Dynamic Yield/i, /WAF/i, /CookieYes/i, /时区/i, /A\/B/i, /域名/i, /数字资产/i, /CloudFront/i] },
  { domain: 'template', patterns: [/模板/i, /Preview/i, /Global/i, /设计文档汇总/i] },
];

const LOCAL_DOC_MAP = {
  '2748448779': 'docs/joyboy/docs/web-checkout-spl-payment-tech-design.md',
  '3936616449': 'docs/joyboy/docs/transaction-related/transaction-observability/README.md',
  '3347021873': 'docs/joyboy/docs/PLP技术方案.md',
  '3489300950': 'docs/joyboy/docs/salepage-prd.md',
  '2950070275': 'docs/joyboy/docs/observability/error-handling-flow.md',
};

const BLOG_POST_MAP = {
  '2748448779': 'http-error-handling-strategy',
};

function slugify(title) {
  return title
    .replace(/[【】（）()]/g, '')
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

function assignDomain(title) {
  for (const { domain, patterns } of DOMAIN_RULES) {
    if (patterns.some((p) => p.test(title))) return domain;
  }
  return 'architecture';
}

function escapeYaml(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function frontmatter({ id, title, status, parentId, depth, domain, webUrl, localJoyboyDoc, blogPost }) {
  return [
    '---',
    `confluence_id: "${id}"`,
    `title: "${escapeYaml(title)}"`,
    `status: ${status}`,
    `parent_id: "${parentId || ''}"`,
    `depth: ${depth ?? 0}`,
    `domain: ${domain}`,
    `web_url: ${webUrl}`,
    `local_joyboy_doc: ${localJoyboyDoc ? `"${localJoyboyDoc}"` : 'null'}`,
    `blog_post: ${blogPost ? `"${blogPost}"` : 'null'}`,
    '---',
    '',
  ].join('\n');
}

function loadResponses(responsesDir) {
  const pages = new Map();
  if (!fs.existsSync(responsesDir)) return pages;

  const pagesSubdir = path.join(responsesDir, 'pages');
  if (fs.existsSync(pagesSubdir)) {
    for (const file of fs.readdirSync(pagesSubdir).filter((f) => f.endsWith('.json'))) {
      const p = JSON.parse(fs.readFileSync(path.join(pagesSubdir, file), 'utf8'));
      if (p?.id) pages.set(String(p.id), p);
    }
  }

  for (const file of fs.readdirSync(responsesDir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(responsesDir, file), 'utf8'));
    const list = data.pages || (Array.isArray(data) ? data : [data]);
    for (const p of list) {
      if (p?.id) pages.set(String(p.id), p);
    }
  }
  return pages;
}

function buildTree(entries) {
  const byParent = new Map();
  for (const e of entries) {
    const pid = e.parentId || 'root';
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid).push(e);
  }
  for (const [, children] of byParent) {
    children.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  }
  return byParent;
}

function renderTree(byParent, parentId, indent = 0) {
  const children = byParent.get(parentId) || [];
  return children
    .map((e) => {
      const prefix = '  '.repeat(indent);
      const link = e.skipped
        ? `${prefix}- ~~${e.title}~~ _(whiteboard, skipped)_ — [Confluence](${e.webUrl})`
        : `${prefix}- [${e.title}](${e.file}) — [Confluence](${e.webUrl})${e.localJoyboyDoc ? ` · [Joyboy doc](../../${e.localJoyboyDoc})` : ''}`;
      return link + '\n' + renderTree(byParent, e.id, indent + 1);
    })
    .join('');
}

function main() {
  const args = process.argv.slice(2);
  const respIdx = args.indexOf('--responses-dir');
  const responsesDir = respIdx >= 0 ? path.resolve(args[respIdx + 1]) : path.join(EXPORT_DIR, '.responses');

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_SRC, 'utf8'));
  const fetched = loadResponses(responsesDir);

  fs.mkdirSync(PAGES_DIR, { recursive: true });

  const metaById = new Map();
  const entries = [];

  // Root page metadata
  const rootMeta = {
    id: ROOT_PAGE_ID,
    title: manifest.rootTitle,
    parentId: '',
    depth: 0,
    status: 'current',
    type: 'page',
    webUrl: manifest.rootUrl,
  };
  entries.push(rootMeta);

  for (const p of manifest.pages) {
    if (SKIP_WHITEBOARDS.has(p.id)) {
      entries.push({
        ...p,
        skipped: true,
        webUrl: `https://castlery.atlassian.net/wiki/spaces/EC/pages/${p.id}`,
        domain: assignDomain(p.title),
      });
      continue;
    }
    entries.push({
      ...p,
      webUrl: `https://castlery.atlassian.net/wiki/spaces/EC/pages/${p.id}`,
      domain: assignDomain(p.title),
    });
  }

  let saved = 0;
  let empty = 0;
  const domainCounts = {};

  for (const entry of entries) {
    if (entry.skipped) {
      metaById.set(entry.id, { ...entry, hasBody: false, file: null });
      domainCounts[entry.domain] = (domainCounts[entry.domain] || 0) + 1;
      continue;
    }

    const page = fetched.get(entry.id);
    const title = page?.title || entry.title;
    const domain = assignDomain(title);
    const slug = slugify(title);
    const filename = `${entry.id}-${slug}.md`;
    const filepath = path.join(PAGES_DIR, filename);
    const relFile = `pages/${filename}`;

    const body = page?.body?.trim() || '';
    const hasBody = body.length > 0;
    if (!hasBody) empty++;

    const localJoyboyDoc = LOCAL_DOC_MAP[entry.id] || null;
    const blogPost = BLOG_POST_MAP[entry.id] || null;

    if (page) {
      fs.writeFileSync(
        filepath,
        frontmatter({
          id: entry.id,
          title,
          status: page.status || entry.status,
          parentId: entry.parentId || page.parentId || '',
          depth: entry.depth ?? 0,
          domain,
          webUrl: page.webUrl || entry.webUrl,
          localJoyboyDoc,
          blogPost,
        }) + (body || '_（Confluence 页面正文为空）_\n'),
        'utf8'
      );
      saved++;
    }

    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    metaById.set(entry.id, {
      id: entry.id,
      title,
      parentId: entry.parentId || '',
      depth: entry.depth ?? 0,
      status: page?.status || entry.status,
      type: entry.type,
      domain,
      file: page ? relFile : null,
      webUrl: page?.webUrl || entry.webUrl,
      localJoyboyDoc,
      blogPost,
      hasBody: page ? hasBody : false,
      skipped: false,
    });
  }

  const exportManifest = {
    rootPageId: ROOT_PAGE_ID,
    rootTitle: manifest.rootTitle,
    exportedAt: new Date().toISOString().slice(0, 10),
    skippedWhiteboards: [...SKIP_WHITEBOARDS],
    stats: { saved, empty, total: entries.filter((e) => !e.skipped).length, domainCounts },
    pages: [...metaById.values()].sort((a, b) => String(a.id).localeCompare(String(b.id))),
  };
  fs.writeFileSync(path.join(EXPORT_DIR, 'manifest.json'), JSON.stringify(exportManifest, null, 2) + '\n');

  const byDomain = {};
  for (const p of exportManifest.pages.filter((x) => !x.skipped && x.file)) {
    if (!byDomain[p.domain]) byDomain[p.domain] = [];
    byDomain[p.domain].push(p);
  }

  const indexLines = [
    '# Confluence Export Index',
    '',
    `> Root: [${manifest.rootTitle}](${manifest.rootUrl}) · Exported ${exportManifest.exportedAt}`,
    '',
    '## Skipped (whiteboard)',
    '',
    ...exportManifest.pages
      .filter((p) => p.skipped)
      .map((p) => `- **${p.title}** (${p.id}) — [Confluence](${p.webUrl})`),
    '',
    '## Hierarchy',
    '',
    renderTree(buildTree(exportManifest.pages.filter((p) => !p.skipped)), ROOT_PAGE_ID),
    '',
    '## By Domain',
    '',
  ];

  for (const domain of Object.keys(byDomain).sort()) {
    indexLines.push(`### ${domain}`, '');
    for (const p of byDomain[domain].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))) {
      indexLines.push(`- [${p.title}](${p.file}) — [Confluence](${p.webUrl})${p.localJoyboyDoc ? ` · [Joyboy](../../${p.localJoyboyDoc})` : ''}`);
    }
    indexLines.push('');
  }

  fs.writeFileSync(path.join(EXPORT_DIR, 'INDEX.md'), indexLines.join('\n'));

  fs.writeFileSync(
    path.join(EXPORT_DIR, 'README.md'),
    `# Confluence Export

Local mirror of Castlery EC space design docs (Confluence → Markdown).

## Structure

- \`pages/\` — one Markdown file per Confluence page (\`{pageId}-{slug}.md\`)
- \`manifest.json\` — machine-readable index (domain, parent, \`hasBody\`, Joyboy mappings)
- \`INDEX.md\` — hierarchical + domain-grouped navigation
- \`knowledge-graph.md\` — architecture layers and reading paths

## Refresh

1. Fetch pages via Atlassian MCP \`getConfluencePage\` (cloudId: \`castlery.atlassian.net\`, contentFormat: \`markdown\`).
2. Save responses to \`.responses/batch-NNN.json\` as \`{ "pages": [ ... ] }\`.
3. Run:

\`\`\`bash
node scripts/build-confluence-export.mjs
\`\`\`

## Frontmatter

Each page includes \`confluence_id\`, \`title\`, \`status\`, \`parent_id\`, \`depth\`, \`domain\`, \`web_url\`, optional \`local_joyboy_doc\` and \`blog_post\` when mapped.

## Skipped

Whiteboard entries (not exportable as markdown pages): IDs ${[...SKIP_WHITEBOARDS].join(', ')}.
`
  );

  const kg = `# Knowledge Graph

## Graph 1: Architecture Layers

\`\`\`mermaid
flowchart TB
  subgraph L1["架构层"]
    A1[设计文档汇总]
    A2[Joyboy 架构实现]
    A3[Client Side Architecture]
    A4[Multi-Region / ENV 合并]
  end
  subgraph L2["模块层"]
    M1[迁移计划]
    M2[CMS / Storyblok]
    M3[i18n / DY / Feature Flag]
    M4[Observability]
    M5[Design System]
  end
  subgraph L3["业务域"]
    B1[PLA / PLP / PDP]
    B2[Checkout / Transaction]
    B3[Account / O2O / POS]
    B4[CMS Sale Pages]
  end
  subgraph L4["实现细节"]
    I1[ISR + Redis 缓存]
    I2[Sentry / Datadog]
    I3[Fortress / Tailwind ADR]
    I4[月度迁移计划]
  end
  A1 --> M1 & M2 & M3 & M4 & M5
  A2 --> B1 & B2
  A3 --> M5
  A4 --> M3
  M1 --> I4
  M2 --> B4
  M3 --> B1
  M4 --> I2
  M5 --> I3
  B1 --> I1
\`\`\`

## Graph 2: Domain Module Relationships

\`\`\`mermaid
flowchart LR
  architecture --> migration
  architecture --> rendering
  migration --> product
  cms --> product
  platform --> product
  design-system --> product
  rendering --> product
  transaction --> observability
  product --> transaction
  platform --> observability
\`\`\`

## Graph 3: Onboarding Reading Path

\`\`\`mermaid
flowchart TD
  Start([新同学入职]) --> R1[设计文档汇总]
  R1 --> R2[Joyboy 架构实现]
  R2 --> R3[Client Side Architecture]
  R3 --> R4{角色}
  R4 -->|前端基础| R5[Joyboy Web 开发指引]
  R4 -->|迁移| R6[Web 迁移计划]
  R4 -->|业务页| R7[PLA / Checkout 方案]
  R5 --> R8[Fortress / Tailwind ADR]
  R6 --> R9[月度迁移计划]
  R7 --> R10[Observability 集成]
\`\`\`
`;
  fs.writeFileSync(path.join(EXPORT_DIR, 'knowledge-graph.md'), kg);

  console.log(JSON.stringify({ saved, empty, domainCounts, responsesLoaded: fetched.size }, null, 2));
}

main();
