import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createDb, type DbHandle } from "../db/client";
import { migrateDb } from "../db/migrate";
import { seedCategories } from "../content/import";
import { parseMarkdown } from "../content/frontmatter";
import {
  createPost,
  deletePost,
  savePost,
  setPostStatus,
} from "../repo/posts-write";
import {
  createCollection,
  createCollectionItem,
  deleteCollection,
  reorderCollectionItems,
} from "../repo/collections-write";
import { createCategory, deleteCategory } from "../repo/categories-write";
import { getPostMetaById, listPostMetas } from "../repo/posts";
import { listCollectionItems, listCollections } from "../repo/collections";
import { saveAssetFile } from "../content/files";

let tmpRoot: string;
let handle: DbHandle;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-write-"));
  process.env.CBLOG_REPO_ROOT = tmpRoot;
  fs.mkdirSync(path.join(tmpRoot, "content", "posts"), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, "data"), { recursive: true });
  handle = createDb(path.join(tmpRoot, "data", "blog.db"));
  migrateDb(handle);
  seedCategories(handle);
});

afterEach(() => {
  delete process.env.CBLOG_REPO_ROOT;
  handle.sqlite.close();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function postFileRaw(filePath: string): string {
  return fs.readFileSync(path.join(tmpRoot, "content", filePath), "utf8");
}

describe("createPost（CORE-003）", () => {
  it("生成脚手架文件 + 数据库记录，初始 draft", () => {
    const id = createPost(
      { title: "新文章", slug: "new-post", categorySlug: "technical" },
      handle
    );
    const meta = getPostMetaById(id, handle)!;
    expect(meta.status).toBe("draft");
    const year = new Date().getFullYear();
    expect(meta.filePath).toBe(`posts/technical/${year}/new-post/index.md`);

    const { data } = parseMarkdown(postFileRaw(meta.filePath));
    expect(data.title).toBe("新文章");
    expect(data.status).toBe("draft");
    expect(data.category).toBe("technical");
  });

  it("slug 重复/非法被拒绝（CORE-002）", () => {
    createPost({ title: "A", slug: "dup", categorySlug: "technical" }, handle);
    expect(() =>
      createPost({ title: "B", slug: "dup", categorySlug: "life" }, handle)
    ).toThrow(/已存在/);
    expect(() =>
      createPost({ title: "C", slug: "../evil", categorySlug: "life" }, handle)
    ).toThrow(/非法 slug/);
  });
});

describe("savePost（CORE-004/005）", () => {
  it("保存后文件 frontmatter、数据库、标签三方一致", () => {
    const id = createPost(
      { title: "标题", slug: "save-me", categorySlug: "technical" },
      handle
    );
    savePost(
      id,
      {
        title: "新标题",
        excerpt: "新摘要",
        tags: ["x", "y"],
        content: "# 新正文\n",
        date: "2026-08-14",
      },
      handle
    );

    const meta = getPostMetaById(id, handle)!;
    expect(meta.title).toBe("新标题");
    expect(meta.tags).toEqual(["x", "y"]);
    expect(meta.date).toBe("2026-08-14");

    const { data, content } = parseMarkdown(postFileRaw(meta.filePath));
    expect(data.title).toBe("新标题");
    expect(data.tags).toEqual(["x", "y"]);
    expect(data.excerpt).toBe("新摘要");
    expect(content).toContain("# 新正文");
  });

  it("数据库失败时回滚文件（CORE-005）", () => {
    const id = createPost(
      { title: "回滚", slug: "rollback", categorySlug: "technical" },
      handle
    );
    const meta = getPostMetaById(id, handle)!;
    const before = postFileRaw(meta.filePath);

    handle.sqlite.exec(
      "CREATE TRIGGER fail_update BEFORE UPDATE ON posts BEGIN SELECT RAISE(ABORT, 'boom'); END;"
    );
    expect(() => savePost(id, { title: "不会生效" }, handle)).toThrow();
    handle.sqlite.exec("DROP TRIGGER fail_update");

    expect(postFileRaw(meta.filePath)).toBe(before); // 文件已回滚
    expect(getPostMetaById(id, handle)!.title).toBe("回滚"); // 库未变
  });
});

describe("状态与删除（CORE-009 / ADM-003 后端）", () => {
  it("setPostStatus 双写文件与库", () => {
    const id = createPost(
      { title: "S", slug: "status-flow", categorySlug: "technical" },
      handle
    );
    setPostStatus(id, "published", handle);
    const meta = getPostMetaById(id, handle)!;
    expect(meta.status).toBe("published");
    expect(parseMarkdown(postFileRaw(meta.filePath)).data.status).toBe(
      "published"
    );

    setPostStatus(id, "archived", handle);
    expect(getPostMetaById(id, handle)!.status).toBe("archived");
  });

  it("deletePost 移入 .trash 并删除记录", () => {
    const id = createPost(
      { title: "T", slug: "trash-me", categorySlug: "technical" },
      handle
    );
    const meta = getPostMetaById(id, handle)!;
    deletePost(id, handle);

    expect(listPostMetas(handle)).toHaveLength(0);
    expect(
      fs.existsSync(path.join(tmpRoot, "content", path.dirname(meta.filePath)))
    ).toBe(false);
    const trash = fs.readdirSync(path.join(tmpRoot, "content", ".trash"));
    expect(trash.some((name) => name.includes("trash-me"))).toBe(true);
  });
});

describe("分类/专栏写操作（CORE-007/008）", () => {
  it("createCategory 建目录；有文章的分类禁止删除", () => {
    const categoryId = createCategory(
      { slug: "new-cat", name: "新分类" },
      handle
    );
    expect(
      fs.existsSync(path.join(tmpRoot, "content", "posts", "new-cat"))
    ).toBe(true);

    createPost({ title: "P", slug: "p1", categorySlug: "new-cat" }, handle);
    expect(() => deleteCategory(categoryId, handle)).toThrow(/不可删除/);
  });

  it("专栏保留字拒绝；有文档禁止删除；排序回写 frontmatter", () => {
    expect(() =>
      createCollection({ slug: "posts", name: "冲突" }, handle)
    ).toThrow(/保留路由/);

    const collectionId = createCollection(
      { slug: "my-column", name: "我的专栏" },
      handle
    );
    const a = createCollectionItem(
      { collectionId, title: "甲", slug: "a" },
      handle
    );
    const b = createCollectionItem(
      { collectionId, title: "乙", slug: "b" },
      handle
    );
    expect(() => deleteCollection(collectionId, handle)).toThrow(/不可删除/);

    reorderCollectionItems(collectionId, [b, a], handle);
    const items = listCollectionItems("my-column", handle);
    expect(items.map((item) => item.slug)).toEqual(["b", "a"]);
    // frontmatter order 已回写
    const rawB = postFileRaw("collections/my-column/b.md");
    expect(parseMarkdown(rawB).data.order).toBe(1);
    expect(listCollections(handle).some((c) => c.slug === "my-column")).toBe(
      true
    );
  });
});

describe("图片落盘（ADM-004/005 后端）", () => {
  it("保存到 assets/，重名追加 hash 后缀", () => {
    const docDir = path.join(tmpRoot, "content", "posts", "technical", "x");
    fs.mkdirSync(docDir, { recursive: true });

    const first = saveAssetFile(docDir, "My Pic.PNG", Buffer.from("aaa"));
    expect(first.relativeSrc).toBe("./assets/my-pic.png");

    const second = saveAssetFile(docDir, "My Pic.PNG", Buffer.from("bbb"));
    expect(second.relativeSrc).toMatch(/^\.\/assets\/my-pic-[0-9a-f]{6}\.png$/);
    expect(fs.existsSync(first.absPath)).toBe(true);
    expect(fs.existsSync(second.absPath)).toBe(true);
  });
});
