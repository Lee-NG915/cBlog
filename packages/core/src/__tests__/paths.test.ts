import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  assertValidCollectionSlug,
  assertWritablePath,
  contentRoot,
  isValidSlug,
  repoPath,
} from "../paths";

describe("slug 校验（CORE-002/008）", () => {
  it("接受合法 slug", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("2026-review")).toBe(true);
    expect(isValidSlug("中文-slug")).toBe(true);
    expect(isValidSlug("rightCapital")).toBe(true); // 存量特例
  });

  it("拒绝路径穿越与非法字符", () => {
    for (const bad of ["../x", "a/../../b", "a/b", "a b", "A-Upper", ".hidden", "a.", "%2e%2e", ""]) {
      expect(isValidSlug(bad), bad).toBe(false);
    }
  });

  it("专栏 slug 拒绝保留路由字", () => {
    expect(() => assertValidCollectionSlug("posts")).toThrow(/保留路由/);
    expect(() => assertValidCollectionSlug("categories")).toThrow(/保留路由/);
    expect(() => assertValidCollectionSlug("my-column")).not.toThrow();
  });
});

describe("写路径白名单（CORE-002 / NFR-4）", () => {
  it("允许 content/ 与 data/ 内路径", () => {
    expect(() =>
      assertWritablePath(path.join(contentRoot(), "posts/a/index.md"))
    ).not.toThrow();
    expect(() => assertWritablePath(repoPath("data", "blog.db"))).not.toThrow();
  });

  it("拒绝白名单外与穿越路径", () => {
    expect(() => assertWritablePath(repoPath("apps/web/app/page.tsx"))).toThrow();
    expect(() =>
      assertWritablePath(path.join(contentRoot(), "../apps/web/x.ts"))
    ).toThrow();
    expect(() => assertWritablePath("/etc/passwd")).toThrow();
  });
});
