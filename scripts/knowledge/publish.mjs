import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  cpSync,
  rmSync,
  renameSync,
} from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { database, root, stateDir } from "./local-db.mjs";
import { rewriteLinks } from "./markdown-links.mjs";
const require = createRequire(path.join(root, "packages/core/package.json"));
const { remark } = await import(pathToFileURL(require.resolve("remark")).href);
const { default: gfm } = await import(
  pathToFileURL(require.resolve("remark-gfm")).href
);
const { default: html } = await import(
  pathToFileURL(require.resolve("remark-html")).href
);
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export async function publishLocal(publicationId) {
  const { sqlite } = database();
  const p = sqlite
    .prepare("SELECT * FROM publications WHERE id=?")
    .get(publicationId);
  if (!p) {
    sqlite.close();
    throw new Error("快照不存在");
  }
  const manifest = JSON.parse(p.manifest);
  const now = sqlite
    .prepare("SELECT corpus_revision FROM settings WHERE id=1")
    .get();
  if (now.corpus_revision !== manifest.revision) {
    sqlite.close();
    throw new Error("快照创建后有内容变化，请重新生成快照再构建");
  }
  const notes = manifest.notes,
    allowed = new Set(notes.map((n) => n.id));
  const staging = path.join(stateDir, "public-staging-" + publicationId),
    target = path.join(stateDir, "public");
  mkdirSync(staging, { recursive: true });
  const assets = new Map();
  const pages = [];
  try {
    for (const n of notes) {
      const body = await rewriteLinks(n.body, (url) => {
        const note = url.match(/^\/#note=([\w-]+)(?:&section=(.*))?$/);
        if (note) {
          if (!allowed.has(note[1]))
            throw new Error(
              `「${n.title}」引用未公开笔记，请修改链接后重新生成快照`,
            );
          return `/published/notes/${note[1]}.html`;
        }
        const image = url.match(/^\/api\/v1\/assets\/([a-f0-9]{64})$/);
        if (image) {
          const id = image[1],
            a = sqlite
              .prepare("SELECT * FROM assets WHERE id=? AND state='ready'")
              .get(id);
          if (!a || !existsSync(path.join(stateDir, "images", id)))
            throw new Error("公开图片尚未就绪");
          assets.set(id, a);
          return "/published/media/" + id;
        }
        if (/^(?:\.\.?\/|\/posts\/|\/collections\/|\/cBlog\/)/.test(url))
          throw new Error(`「${n.title}」有尚未迁移的站内链接，请修正后重试`);
        return url;
      });
      const rendered = String(
        await remark().use(gfm).use(html, { sanitize: true }).process(body),
      );
      pages.push({ n, rendered });
    }
    const wrap = (title, content) =>
      `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Color 手记</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/published/style.css"></head><body><header><a href="/published/">Color 手记</a><span>慢慢写，慢慢读</span></header><main>${content}</main><footer>Color 手记 · 本地公开快照 #${publicationId}</footer></body></html>`;
    mkdirSync(path.join(staging, "notes"), { recursive: true });
    mkdirSync(path.join(staging, "media"), { recursive: true });
    for (const { n, rendered } of pages)
      writeFileSync(
        path.join(staging, "notes", n.id + ".html"),
        wrap(
          n.title,
          `<nav><a href="/published/">← 知识库</a></nav><h1>${escape(n.title)}</h1><article>${rendered}</article>`,
        ),
      );
    for (const [id] of assets)
      cpSync(
        path.join(stateDir, "images", id),
        path.join(staging, "media", id),
      );
    writeFileSync(
      path.join(staging, "index.html"),
      wrap(
        "知识库",
        `<p class="eyebrow">记录，是理解的开始</p><h1>我的知识库</h1><p>按主题归档，沿路径学习。</p>${notes.length ? notes.map((n) => `<a class="note" href="/published/notes/${n.id}.html">${escape(n.title)} <span>→</span></a>`).join("") : "<p>还没有公开的笔记。</p>"}`,
      ),
    );
    writeFileSync(
      path.join(staging, "style.css"),
      `*{box-sizing:border-box}body{margin:0;background:#faf8f4;color:#292b27;font-family:system-ui,-apple-system,'PingFang SC',sans-serif;font-size:18px;line-height:1.85}header,footer{max-width:1050px;margin:auto;padding:24px;display:flex;justify-content:space-between;font-size:14px;color:#686c63}header{border-bottom:1px solid #e4e2d9}main{max-width:808px;margin:40px auto;padding:0 24px}a{color:#526847}h1{font-size:32px;line-height:1.5}h2{margin-top:2em;font-size:25px}h3{margin-top:1.7em}p,ul,ol{margin-bottom:1.4em}pre{overflow:auto;padding:20px;background:#efeee8;border-radius:8px;font-size:14px}code{font-family:ui-monospace,monospace}img{max-width:100%}table{display:block;overflow:auto;border-collapse:collapse;font-size:16px}th,td{padding:12px;border:1px solid #e4e2d9;min-width:120px}th{background:#e8eddf}blockquote{border-left:3px solid #526847;margin-left:0;padding-left:24px;color:#686c63}.note{display:flex;justify-content:space-between;padding:22px 0;border-bottom:1px solid #e4e2d9;text-decoration:none}.eyebrow{font-size:13px;color:#526847}nav{font-size:13px}@media(max-width:600px){body{font-size:17px}main{padding:0 20px}h1{font-size:27px}header span{display:none}}`,
    );
    writeFileSync(
      path.join(staging, "manifest.json"),
      JSON.stringify({
        id: publicationId,
        revision: manifest.revision,
        notes: notes.map((n) => ({ id: n.id, version: n.version })),
        assets: [...assets].map(([id, a]) => ({ id, mime: a.mime })),
      }),
    );
    // Only replace the public tree once every page and asset has been validated.
    const latest = sqlite.prepare("SELECT MAX(id) id FROM publications").get();
    const current = sqlite
      .prepare("SELECT corpus_revision FROM settings WHERE id=1")
      .get();
    if (
      latest.id !== publicationId ||
      current.corpus_revision !== manifest.revision
    )
      throw new Error("有更新的内容或发布任务，请使用最新快照重新构建");
    const previous = path.join(stateDir, "public-previous");
    rmSync(previous, { recursive: true, force: true });
    if (existsSync(target)) renameSync(target, previous);
    renameSync(staging, target);
    rmSync(previous, { recursive: true, force: true });
    sqlite
      .prepare("UPDATE publications SET status='deployed' WHERE id=?")
      .run(publicationId);
    return {
      id: publicationId,
      url: "/published/",
      noteCount: notes.length,
      local: true,
    };
  } catch (e) {
    rmSync(staging, { recursive: true, force: true });
    throw e;
  } finally {
    sqlite.close();
  }
}
