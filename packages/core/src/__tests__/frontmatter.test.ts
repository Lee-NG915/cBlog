import { describe, expect, it } from "vitest";
import {
  buildOrderedFrontmatter,
  parseMarkdown,
  serializeMarkdown,
} from "../content/frontmatter";
import { computePostFileMeta } from "../content/scan";

const SAMPLE = `---
title: 测试文章
slug: test-post
date: "2026-01-05"
category: technical
tags:
  - Next.js
  - 架构
excerpt: 一段摘要
coverCard: /images/covers/test.png
status: draft
customKey: keep-me
---

正文第一段。

## 标题二
`;

describe("frontmatter 序列化（CORE-001）", () => {
  it("round-trip 语义不变，coverCard 归一为 coverImage", () => {
    const meta = computePostFileMeta("technical/2026/test-post/index.md", SAMPLE);
    expect(meta.slug).toBe("test-post");
    expect(meta.coverImage).toBe("/images/covers/test.png");
    expect(meta.status).toBe("draft");
    expect(meta.tags).toEqual(["Next.js", "架构"]);

    const { data, content } = parseMarkdown(SAMPLE);
    const ordered = buildOrderedFrontmatter(
      {
        title: meta.title,
        slug: meta.slug,
        date: meta.date,
        updatedAt: meta.updatedAt ?? undefined,
        category: "technical",
        tags: meta.tags,
        excerpt: meta.excerpt,
        coverImage: meta.coverImage ?? undefined,
        status: meta.status,
      },
      data
    );
    const serialized = serializeMarkdown(ordered, content);

    const reparsed = computePostFileMeta(
      "technical/2026/test-post/index.md",
      serialized
    );
    expect(reparsed.title).toBe(meta.title);
    expect(reparsed.slug).toBe(meta.slug);
    expect(reparsed.date).toBe(meta.date);
    expect(reparsed.tags).toEqual(meta.tags);
    expect(reparsed.excerpt).toBe(meta.excerpt);
    expect(reparsed.status).toBe(meta.status);
    expect(reparsed.coverImage).toBe(meta.coverImage);
    expect(reparsed.content.trim()).toBe(meta.content.trim());

    // 未知字段保留
    expect(serialized).toContain("customKey: keep-me");
    // 归一后不再出现 coverCard 字段
    expect(serialized).not.toContain("coverCard:");
    expect(serialized).toContain("coverImage: /images/covers/test.png");
  });

  it("重复序列化输出字节级稳定", () => {
    const { data, content } = parseMarkdown(SAMPLE);
    const meta = computePostFileMeta("technical/2026/test-post/index.md", SAMPLE);
    const fm = {
      title: meta.title,
      slug: meta.slug,
      date: meta.date,
      category: "technical",
      tags: meta.tags,
      excerpt: meta.excerpt,
      coverImage: meta.coverImage ?? undefined,
      status: meta.status,
    };
    const first = serializeMarkdown(buildOrderedFrontmatter(fm, data), content);
    const reparsed = parseMarkdown(first);
    const second = serializeMarkdown(
      buildOrderedFrontmatter(fm, reparsed.data),
      reparsed.content
    );
    expect(second).toBe(first);
  });

  it("已知字段顺序固定", () => {
    const ordered = buildOrderedFrontmatter({
      title: "t",
      slug: "s",
      date: "2026-01-01",
      category: "life",
      tags: [],
      excerpt: "e",
      status: "published",
    });
    expect(Object.keys(ordered)).toEqual([
      "title",
      "slug",
      "date",
      "category",
      "tags",
      "excerpt",
      "status",
    ]);
  });
});
