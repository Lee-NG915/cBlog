import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createDb, type DbHandle } from "../db/client";
import { migrateDb } from "../db/migrate";
import {
  driftCheckCollections,
  importCollections,
  seedCollections,
} from "../content/collections-import";
import { listCollectionItems, listCollections } from "../repo/collections";

let tmpDir: string;
let contentDir: string;
let handle: DbHandle;

function writeNote(relPath: string, frontmatter: string, body = "第一段摘要内容。\n\n## 小节") {
  const abs = path.join(contentDir, "collections", relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `---\n${frontmatter}\n---\n\n${body}\n`);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-col-"));
  contentDir = path.join(tmpDir, "content");
  fs.mkdirSync(path.join(contentDir, "collections"), { recursive: true });
  handle = createDb(path.join(tmpDir, "test.db"));
  migrateDb(handle);
  seedCollections(handle);
});

afterEach(() => {
  handle.sqlite.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("专栏导入（FR-5, MIG-002 支撑）", () => {
  it("导入专栏文档：排序、摘要、幂等", () => {
    writeNote(
      "rightCapital/1.自我介绍.md",
      `title: 自我介绍\nslug: "01"\norder: 1\nstatus: published`
    );
    writeNote(
      "rightCapital/2.架构.md",
      `title: 架构\nslug: "02"\norder: 2\nstatus: published`
    );

    const first = importCollections(handle, contentDir);
    expect(first.created).toBe(2);

    const items = listCollectionItems("rightCapital", handle);
    expect(items.map((item) => item.slug)).toEqual(["01", "02"]);
    expect(items[0].excerpt).toBe("第一段摘要内容。");

    const second = importCollections(handle, contentDir);
    expect(second.created).toBe(0);
    expect(second.unchanged).toBe(2);

    expect(driftCheckCollections(handle, contentDir)).toHaveLength(0);
  });

  it("未登记的专栏目录自动补建默认行", () => {
    writeNote("my-column/a.md", `title: A\nslug: a\norder: 1\nstatus: published`);
    const summary = importCollections(handle, contentDir);
    expect(summary.warnings.some((w) => w.includes("my-column"))).toBe(true);
    expect(
      listCollections(handle).some((collection) => collection.slug === "my-column")
    ).toBe(true);
  });

  it("同专栏重复 slug 拒绝导入", () => {
    writeNote("rightCapital/a.md", `title: A\nslug: same\norder: 1`);
    writeNote("rightCapital/b.md", `title: B\nslug: same\norder: 2`);
    expect(() => importCollections(handle, contentDir)).toThrow(/重复 slug/);
  });

  it("order 相同按标题中文序（与原实现一致）", () => {
    writeNote("addx-ai/x.md", `title: 乙方案\nslug: x\norder: 999`);
    writeNote("addx-ai/y.md", `title: 甲方案\nslug: y\norder: 999`);
    importCollections(handle, contentDir);
    const items = listCollectionItems("addx-ai", handle);
    expect(items.map((item) => item.title)).toEqual(
      ["乙方案", "甲方案"].sort((a, b) => a.localeCompare(b, "zh-CN"))
    );
  });
});
