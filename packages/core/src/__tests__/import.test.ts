import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createDb, type DbHandle } from "../db/client";
import { migrateDb } from "../db/migrate";
import {
  driftCheckPosts,
  importPosts,
  seedCategories,
} from "../content/import";
import { posts } from "../db/schema";
import { listPostMetas } from "../repo/posts";

let tmpDir: string;
let contentDir: string;
let handle: DbHandle;

function writePost(relPath: string, frontmatter: string, body = "正文内容。") {
  const abs = path.join(contentDir, "posts", relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `---\n${frontmatter}\n---\n\n${body}\n`);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-test-"));
  contentDir = path.join(tmpDir, "content");
  fs.mkdirSync(path.join(contentDir, "posts"), { recursive: true });
  handle = createDb(path.join(tmpDir, "test.db"));
  migrateDb(handle);
  seedCategories(handle);
});

afterEach(() => {
  handle.sqlite.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("内容导入（MIG-003/004, CORE-010）", () => {
  it("导入文章并解析元数据", () => {
    writePost(
      "technical/2026/hello/index.md",
      `title: Hello\nslug: hello\ndate: "2026-02-01"\ncategory: technical\ntags: [a, b]\nexcerpt: hi\nstatus: published`
    );
    writePost(
      "unknown-dir/2026/orphan/index.md",
      `title: Orphan\nslug: orphan\ndate: "2026-01-01"\nstatus: draft`
    );

    const summary = importPosts(handle, contentDir);
    expect(summary.created).toBe(2);

    const rows = handle.db.select().from(posts).all();
    expect(rows).toHaveLength(2);

    const metas = listPostMetas(handle);
    expect(metas[0].slug).toBe("hello"); // date 降序
    expect(metas[0].tags).toEqual(["a", "b"]);
    expect(metas[1].categorySlug).toBe("uncategorized"); // 未知目录兜底
    expect(metas[1].status).toBe("draft");
  });

  it("重复导入幂等（MIG-004）", () => {
    writePost(
      "technical/2026/hello/index.md",
      `title: Hello\nslug: hello\ndate: "2026-02-01"\ncategory: technical\ntags: []\nstatus: published`
    );
    importPosts(handle, contentDir);
    const second = importPosts(handle, contentDir);
    expect(second.created).toBe(0);
    expect(second.updated).toBe(0);
    expect(second.unchanged).toBe(1);
    expect(second.deleted).toBe(0);
  });

  it("文件修改与删除会同步（FR-2.2）", () => {
    writePost(
      "technical/2026/a/index.md",
      `title: A\nslug: a\ndate: "2026-02-01"\ncategory: technical\ntags: []\nstatus: published`
    );
    writePost(
      "technical/2026/b/index.md",
      `title: B\nslug: b\ndate: "2026-02-02"\ncategory: technical\ntags: []\nstatus: published`
    );
    importPosts(handle, contentDir);

    writePost(
      "technical/2026/a/index.md",
      `title: A2\nslug: a\ndate: "2026-02-01"\ncategory: technical\ntags: [x]\nstatus: draft`
    );
    fs.rmSync(path.join(contentDir, "posts/technical/2026/b"), {
      recursive: true,
    });

    const summary = importPosts(handle, contentDir);
    expect(summary.updated).toBe(1);
    expect(summary.deleted).toBe(1);

    const metas = listPostMetas(handle);
    expect(metas).toHaveLength(1);
    expect(metas[0].title).toBe("A2");
    expect(metas[0].status).toBe("draft");
    expect(metas[0].tags).toEqual(["x"]);
  });

  it("重复 slug 拒绝导入", () => {
    writePost(
      "technical/2026/a/index.md",
      `title: A\nslug: same\ndate: "2026-02-01"\nstatus: published`
    );
    writePost(
      "life/2026/b/index.md",
      `title: B\nslug: same\ndate: "2026-02-02"\nstatus: published`
    );
    expect(() => importPosts(handle, contentDir)).toThrow(/重复 slug/);
  });

  it("archived 状态解析（D9）", () => {
    writePost(
      "technical/2026/old/index.md",
      `title: Old\nslug: old\ndate: "2020-01-01"\ncategory: technical\nstatus: archived`
    );
    importPosts(handle, contentDir);
    const metas = listPostMetas(handle);
    expect(metas[0].status).toBe("archived");
  });
});

describe("漂移检测（CORE-006 / FR-2.5）", () => {
  it("一致时无漂移，手改文件后报告差异", () => {
    writePost(
      "technical/2026/hello/index.md",
      `title: Hello\nslug: hello\ndate: "2026-02-01"\ncategory: technical\ntags: []\nstatus: published`
    );
    importPosts(handle, contentDir);
    expect(driftCheckPosts(handle, contentDir)).toHaveLength(0);

    writePost(
      "technical/2026/hello/index.md",
      `title: Hello 改\nslug: hello\ndate: "2026-02-01"\ncategory: technical\ntags: []\nstatus: draft`
    );
    const items = driftCheckPosts(handle, contentDir);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("field-diff");
    expect(items[0].detail).toContain("title");
    expect(items[0].detail).toContain("status");
  });

  it("数据库缺记录 / 文件缺失均被发现", () => {
    writePost(
      "technical/2026/hello/index.md",
      `title: Hello\nslug: hello\ndate: "2026-02-01"\nstatus: published`
    );
    const items = driftCheckPosts(handle, contentDir);
    expect(items.some((item) => item.kind === "missing-in-db")).toBe(true);
  });
});
