import {
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { root, stateDir, database } from "./local-db.mjs";
import { rewriteLinks } from "./markdown-links.mjs";
import { collectionTopic, seedCollections } from "./collection-seeds.mjs";
const require = createRequire(path.join(root, "packages/core/package.json"));
const matter = require("gray-matter");
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });
}
const groups = [
  ["engineering", "技术与工程", "domain", null],
  ["business", "商业与增长", "domain", null],
  ["methods", "学习与工作方法", "domain", null],
  ["life", "阅读与生活", "domain", null],
  ["frontend", "前端基础", "topic", "engineering"],
  ["architecture", "架构与工程实践", "topic", "engineering"],
  ["design-system", "组件与设计系统", "topic", "engineering"],
  ["performance", "性能与缓存", "topic", "engineering"],
  ["commerce", "交易与鉴权", "topic", "engineering"],
  ["observability", "可观测性与数据", "topic", "engineering"],
  ["ai-engineering", "AI 工程实践", "topic", "engineering"],
  ["growth", "营销与增长", "topic", "business"],
  ["learning", "学习记录", "topic", "methods"],
  ["living", "生活手记", "topic", "life"],
  ["engineering-path", "建立工程知识全景", "path", null],
  ["growth-path", "从零理解商业化", "path", null],
  ["business-project", "商业化研究", "project", null],
];
const notes = walk(path.join(root, "content"))
  .filter((f) => !path.basename(f).startsWith("_"))
  .map((file) => {
    const raw = readFileSync(file, "utf8"),
      { data, content } = matter(raw);
    if (!data.title) return null;
    const source = path.relative(root, file);
    const id = createHash("sha256").update(source).digest("hex").slice(0, 24);
    const isCollection = source.startsWith("content/collections/");
    const category = data.category;
    const label =
      String(data.title) +
      " " +
      String(data.slug || "") +
      " " +
      path.basename(file);
    const topic =
      collectionTopic(source, data.slug) ??
      (/marketing|growth|dtc|广告|营销/i.test(label)
        ? "growth"
        : category === "life"
          ? "living"
          : category === "learning" ||
              /复习索引|面试|学习|手记|复盘/.test(label)
            ? "learning"
            : /观测|observability|埋点|tracking|监控|feature.?flag/i.test(label)
              ? "observability"
              : /组件|设计系统|design.system|tailwind|UI组件/i.test(label)
                ? "design-system"
                : /缓存|性能|redis|ISR|cache/i.test(label)
                  ? "performance"
                  : /交易|支付|鉴权|payment|auth|checkout/i.test(label)
                    ? "commerce"
                    : /\bAI\b|harness|LLM|模型|智能/i.test(label)
                      ? "ai-engineering"
                      : /架构|工程|迁移|重构|Monorepo|DDD|系统|规范|战略/i.test(
                            label,
                          )
                        ? "architecture"
                        : "frontend");
    return {
      id,
      slug: data.slug || id,
      title: String(data.title),
      body: content,
      topic,
      state: data.status === "published" ? "ready" : "draft",
      visibility: "owner",
      source,
      sourceHash: createHash("sha256").update(raw).digest("hex"),
      reason: isCollection
        ? "专栏/noindex 待确认，保持私有"
        : "迁移默认私有，公开前由所有者确认",
      metadata: data,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  })
  .filter(Boolean);
mkdirSync(stateDir, { recursive: true });
writeFileSync(
  path.join(stateDir, "migration-plan.json"),
  JSON.stringify(
    { sourceCount: notes.length, notes: notes.map(({ body, ...n }: any) => n) },
    null,
    2,
  ),
);
if (process.argv.includes("--plan")) {
  console.log(
    `只读迁移计划：${notes.length} 篇，全部默认私有；.knowledge/migration-plan.json`,
  );
  process.exit(0);
}
const missingLinks: string[] = [];
const assets = new Map<string, { bytes: Buffer; mime: string }>();
const bySource = new Map((notes as any[]).map((n) => [n.source, n.id]));
const bySlug = new Map(
  (notes as any[])
    .filter((n) => n.source.startsWith("content/posts/"))
    .map((n) => [n.slug, n.id]),
);
for (const n of notes as any[]) {
  n.body = await rewriteLinks(n.body, (url: string, image: boolean) => {
    if (/^(https?:|mailto:|#|data:)/i.test(url)) return url;
    let decoded: string;
    try {
      decoded = decodeURIComponent(url);
    } catch {
      return url;
    }
    if (image) {
      const candidates = decoded.startsWith("/")
        ? [path.join(root, "apps/web/public", decoded.replace(/^\/cBlog/, ""))]
        : [path.resolve(root, path.dirname(n.source), decoded)];
      const file = candidates.find(
        (f) => f.startsWith(root) && existsSync(f) && statSync(f).isFile(),
      );
      if (!file) {
        missingLinks.push(n.source + ": " + url);
        return url;
      }
      const mime = (
        {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".webp": "image/webp",
        } as Record<string, string>
      )[path.extname(file).toLowerCase()];
      if (!mime) {
        missingLinks.push(n.source + ": unsupported image " + url);
        return url;
      }
      const bytes = readFileSync(file),
        id = createHash("sha256").update(bytes).digest("hex");
      assets.set(id, { bytes, mime });
      return `/api/v1/assets/${id}`;
    }
    const [base, anchor] = decoded.split("#");
    const relative = path.relative(
      root,
      path.resolve(root, path.dirname(n.source), base),
    );
    const id =
      bySource.get(relative) ||
      bySlug.get(
        base
          .replace(/^\/cBlog/, "")
          .replace(/^\/posts\//, "")
          .replace(/\/$/, ""),
      );
    if (
      !id &&
      (/\.md$/.test(base) || /^\/(cBlog\/)?(posts|collections)\//.test(base))
    )
      missingLinks.push(n.source + ": " + url);
    return id
      ? `/#note=${id}${anchor ? "&section=" + encodeURIComponent(anchor) : ""}`
      : url;
  });
}
const { sqlite } = database();
sqlite.exec("BEGIN");
try {
  mkdirSync(path.join(stateDir, "images"), { recursive: true });
  for (const [id, a] of assets) {
    writeFileSync(path.join(stateDir, "images", id), a.bytes);
    sqlite
      .prepare("INSERT OR IGNORE INTO assets VALUES(?,?,?,'ready',?)")
      .run(id, a.mime, a.bytes.length, new Date().toISOString());
  }

  for (const [i, g] of groups.entries())
    sqlite
      .prepare(
        "INSERT OR IGNORE INTO groups(id,name,kind,parent_id,position) VALUES(?,?,?,?,?)",
      )
      .run(...g, i);
  for (const n of notes as any[]) {
    const existing = sqlite
      .prepare(
        "SELECT id,body,topic_id,mutation_hash,version,source_metadata FROM notes WHERE source_path=?",
      )
      .get(n.source) as any;
    if (existing) {
      if (
        existing.mutation_hash === n.sourceHash &&
        (existing.body !== n.body ||
          existing.topic_id !== n.topic ||
          existing.source_metadata === "{}")
      )
        sqlite
          .prepare(
            "UPDATE notes SET body=?,topic_id=?,source_metadata=?,version=version+1,mutation_id=?,updated_at=? WHERE id=?",
          )
          .run(
            n.body,
            n.topic,
            JSON.stringify(n.metadata),
            "import-links-" + n.id + "-" + existing.version,
            new Date().toISOString(),
            n.id,
          );
      continue;
    }
    sqlite
      .prepare(
        "INSERT INTO notes(id,slug,title,body,topic_id,state,visibility,tags,updated_at,mutation_id,mutation_hash,source_path,source_metadata) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        n.id,
        n.id,
        n.title,
        n.body,
        n.topic,
        n.state,
        n.visibility,
        JSON.stringify(n.tags),
        new Date().toISOString(),
        "import-" + n.id,
        n.sourceHash,
        n.source,
        JSON.stringify(n.metadata),
      );
  }
  seedCollections(sqlite, notes);
  const paths: Record<string, string[]> = {
    "engineering-path": [
      "engineering-practice-hub",
      "ecommerce-knowledge-map",
      "ecommerce-architecture-redesign",
      "design-system-cdd-practice",
      "edge-middleware-auth-design",
      "payment-pipeline-architecture",
      "nextjs-isr-redis-shared-cache",
      "observability-platform-harness",
      "tracking-events-book-contract",
      "ai-engineering-harness-practice",
    ],
    "growth-path": ["growth-strategy-basics", "dtc-marketing-team-breakdown"],
    "business-project": [
      "growth-strategy-basics",
      "dtc-marketing-team-breakdown",
    ],
  };
  for (const [group, slugs] of Object.entries(paths)) {
    // Never reset an owner's reordered path when importing a second time.
    if (
      sqlite
        .prepare("SELECT count(*) AS n FROM memberships WHERE group_id=?")
        .get(group).n
    )
      continue;
    slugs.forEach((slug, i) => {
      const id = bySlug.get(slug);
      if (id)
        sqlite
          .prepare("INSERT OR IGNORE INTO memberships VALUES(?,?,?)")
          .run(group, id, i);
    });
  }
  sqlite.exec("COMMIT");
  writeFileSync(
    path.join(stateDir, "migration-link-report.json"),
    JSON.stringify(
      { assetCount: assets.size, unresolved: missingLinks },
      null,
      2,
    ),
  );
  console.log(
    `迁移完成：${notes.length} 篇源笔记；独立数据库 .knowledge/notes.db；原数据未修改。`,
  );
} catch (e) {
  sqlite.exec("ROLLBACK");
  throw e;
} finally {
  sqlite.close();
}
