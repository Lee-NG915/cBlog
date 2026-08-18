import { describe, expect, it } from "vitest";

import {
  parseRevalidateEvent,
  planRevalidation,
  type RevalidateEvent,
} from "@/lib/revalidate/plan";

function event(partial: Record<string, unknown>): Record<string, unknown> {
  return { schemaVersion: 1, ...partial };
}

describe("planRevalidation", () => {
  it("post：文章页 + 索引 + sitemap，固定路径集合", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "post",
      slug: "hello-world",
      categorySlug: "technical",
      contentVersion: 12,
    });
    expect(plan.tags).toEqual([
      "post:hello-world",
      "post-index",
      "sitemap",
      "categories",
    ]);
    expect(plan.paths).toEqual([
      "/posts/hello-world/",
      "/",
      "/about/",
      "/categories/",
      "/categories/technical/",
      "/sitemap.xml",
    ]);
    expect(plan.layoutRefresh).toBe(false);
  });

  it("post 移动分类：追加旧分类页（分类计数经 categories 标失效）", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "post",
      slug: "hello-world",
      categorySlug: "technical",
      previousCategorySlug: "notes",
      contentVersion: 12,
    });
    expect(plan.tags).toEqual([
      "post:hello-world",
      "post-index",
      "sitemap",
      "categories",
    ]);
    expect(plan.paths).toContain("/categories/notes/");
    expect(plan.paths).toContain("/categories/technical/");
  });

  it("post previousCategorySlug 与现分类相同：不按移动处理", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "post",
      slug: "hello-world",
      categorySlug: "technical",
      previousCategorySlug: "technical",
      contentVersion: 12,
    });
    expect(plan.tags).toEqual([
      "post:hello-world",
      "post-index",
      "sitemap",
      "categories",
    ]);
    expect(plan.paths).not.toContain("/categories/technical//");
    expect(
      plan.paths.filter((p) => p === "/categories/technical/")
    ).toHaveLength(1);
  });

  it("category：分类标签 + 落地页 + layoutRefresh", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "category",
      slug: "technical",
      version: 3,
    });
    expect(plan.tags).toEqual(["categories"]);
    expect(plan.paths).toEqual(["/categories/technical/"]);
    expect(plan.layoutRefresh).toBe(true);
  });

  it("tag：只失效文章索引与首页/about", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "tag",
      name: "Next.js",
      version: 2,
    });
    expect(plan.tags).toEqual(["post-index"]);
    expect(plan.paths).toEqual(["/", "/about/"]);
    expect(plan.layoutRefresh).toBe(false);
  });

  it("collection：专栏标签 + 落地页 + layoutRefresh", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "collection",
      slug: "addx-ai",
      version: 5,
    });
    expect(plan.tags).toEqual(["collections", "collection:addx-ai"]);
    expect(plan.paths).toEqual(["/addx-ai/"]);
    expect(plan.layoutRefresh).toBe(true);
  });

  it("collection_item：文档与专栏标签 + 两个路径", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "collection_item",
      collectionSlug: "addx-ai",
      slug: "10",
      contentVersion: 7,
    });
    expect(plan.tags).toEqual([
      "collection-item:addx-ai:10",
      "collection:addx-ai",
    ]);
    expect(plan.paths).toEqual(["/addx-ai/10/", "/addx-ai/"]);
    expect(plan.layoutRefresh).toBe(false);
  });

  it("site：全部基础标签 + layoutRefresh，无具体路径", () => {
    const plan = planRevalidation({
      schemaVersion: 1,
      entityType: "site",
      version: 9,
    });
    expect(plan.tags).toEqual([
      "post-index",
      "sitemap",
      "categories",
      "collections",
    ]);
    expect(plan.paths).toEqual([]);
    expect(plan.layoutRefresh).toBe(true);
  });
});

describe("parseRevalidateEvent", () => {
  it("合法 post 事件：返回规范化对象", () => {
    const parsed = parseRevalidateEvent(
      event({
        entityType: "post",
        slug: "hello-world",
        categorySlug: "technical",
        previousCategorySlug: "notes",
        contentVersion: 12,
        operation: "update",
        occurredAt: "2026-08-17T10:00:00.000Z",
      })
    );
    expect(parsed).toEqual({
      schemaVersion: 1,
      entityType: "post",
      slug: "hello-world",
      categorySlug: "technical",
      previousCategorySlug: "notes",
      contentVersion: 12,
    });
  });

  it("合法事件可不带可选字段", () => {
    const parsed = parseRevalidateEvent(
      event({ entityType: "site", version: 1 })
    );
    expect(parsed).toEqual({ schemaVersion: 1, entityType: "site", version: 1 });
  });

  it("中文 slug 合法", () => {
    const parsed = parseRevalidateEvent(
      event({
        entityType: "post",
        slug: "手记-2026",
        categorySlug: "随笔",
        contentVersion: 1,
      })
    );
    expect(parsed.entityType).toBe("post");
  });

  it("缺必填字段：抛错", () => {
    expect(() =>
      parseRevalidateEvent(
        event({ entityType: "post", categorySlug: "technical", contentVersion: 1 })
      )
    ).toThrow(/slug/);
    expect(() =>
      parseRevalidateEvent(
        event({ entityType: "post", slug: "a", contentVersion: 1 })
      )
    ).toThrow(/categorySlug/);
    expect(() =>
      parseRevalidateEvent(
        event({ entityType: "post", slug: "a", categorySlug: "technical" })
      )
    ).toThrow(/contentVersion/);
    expect(() =>
      parseRevalidateEvent(event({ entityType: "site" }))
    ).toThrow(/version/);
    expect(() =>
      parseRevalidateEvent(event({ entityType: "tag", version: 1 }))
    ).toThrow(/name/);
    expect(() =>
      parseRevalidateEvent(
        event({ entityType: "collection_item", slug: "1", contentVersion: 1 })
      )
    ).toThrow(/collectionSlug/);
  });

  it("未知 entityType：抛错", () => {
    expect(() =>
      parseRevalidateEvent(event({ entityType: "author", slug: "x", version: 1 }))
    ).toThrow(/unknown entityType/);
  });

  it("schemaVersion ≠ 1 或缺失：抛错", () => {
    expect(() =>
      parseRevalidateEvent(event({ schemaVersion: 2, entityType: "site", version: 1 }))
    ).toThrow(/schemaVersion/);
    expect(() =>
      parseRevalidateEvent({ entityType: "site", version: 1 })
    ).toThrow(/schemaVersion/);
    expect(() =>
      parseRevalidateEvent(
        event({ schemaVersion: "1", entityType: "site", version: 1 })
      )
    ).toThrow(/schemaVersion/);
  });

  it("非对象 body：抛错", () => {
    for (const body of [null, undefined, "x", 42, []]) {
      expect(() => parseRevalidateEvent(body)).toThrow(/JSON object/);
    }
  });

  it("slug 路径注入：../、a/b、空白全部拒绝", () => {
    const base = {
      entityType: "post",
      categorySlug: "technical",
      contentVersion: 1,
    };
    for (const slug of ["../etc", "a/b", "a b", "a\tb", "..", "a//b"]) {
      expect(() =>
        parseRevalidateEvent(event({ ...base, slug }))
      ).toThrow(/slug/);
    }
    // 注入尝试出现在 categorySlug / collectionSlug 同样拒绝
    expect(() =>
      parseRevalidateEvent(event({ ...base, slug: "ok", categorySlug: "../x" }))
    ).toThrow(/categorySlug/);
    expect(() =>
      parseRevalidateEvent(
        event({
          entityType: "collection_item",
          collectionSlug: "a b",
          slug: "1",
          contentVersion: 1,
        })
      )
    ).toThrow(/collectionSlug/);
    // previousCategorySlug 也要过同样的校验
    expect(() =>
      parseRevalidateEvent(
        event({ ...base, slug: "ok", previousCategorySlug: "a/b" })
      )
    ).toThrow(/previousCategorySlug/);
  });

  it("version 字段类型非法：抛错", () => {
    expect(() =>
      parseRevalidateEvent(
        event({ entityType: "site", version: "1" })
      )
    ).toThrow(/version/);
    expect(() =>
      parseRevalidateEvent(
        event({ entityType: "site", version: Number.NaN })
      )
    ).toThrow(/version/);
  });

  it("parse 结果可直接交给 planRevalidation", () => {
    const parsed: RevalidateEvent = parseRevalidateEvent(
      event({
        entityType: "collection_item",
        collectionSlug: "addx-ai",
        slug: "04",
        contentVersion: 3,
      })
    );
    expect(planRevalidation(parsed).tags).toContain(
      "collection-item:addx-ai:04"
    );
  });
});
