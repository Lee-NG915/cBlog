import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertValidCollectionSlug,
  assertWritablePath,
  contentRoot,
  isValidSlug,
  repoPath,
  resolveDocumentAssetPath,
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

describe("文档资产读取边界（SEC-004）", () => {
  it("只允许文档同级 assets 目录内的既有文件", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-assets-"));
    const previousRoot = process.env.CBLOG_REPO_ROOT;
    process.env.CBLOG_REPO_ROOT = root;

    try {
      const documentDir = path.join(
        root,
        "content/posts/technical/2026/example"
      );
      const assetsDir = path.join(documentDir, "assets");
      fs.mkdirSync(assetsDir, { recursive: true });
      fs.writeFileSync(path.join(documentDir, "index.md"), "# Example\n");
      fs.writeFileSync(path.join(assetsDir, "cover.png"), "png");

      expect(
        resolveDocumentAssetPath(
          "posts/technical/2026/example/index.md",
          "assets/cover.png"
        )
      ).toBe(fs.realpathSync(path.join(assetsDir, "cover.png")));
    } finally {
      if (previousRoot === undefined) delete process.env.CBLOG_REPO_ROOT;
      else process.env.CBLOG_REPO_ROOT = previousRoot;
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("拒绝读取其他内容文件、绝对路径和非 Markdown 文档", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-assets-"));
    const previousRoot = process.env.CBLOG_REPO_ROOT;
    process.env.CBLOG_REPO_ROOT = root;

    try {
      const documentDir = path.join(
        root,
        "content/posts/technical/2026/example"
      );
      const otherDir = path.join(root, "content/collections/private");
      fs.mkdirSync(path.join(documentDir, "assets"), { recursive: true });
      fs.mkdirSync(otherDir, { recursive: true });
      fs.writeFileSync(path.join(documentDir, "index.md"), "# Example\n");
      fs.writeFileSync(path.join(otherDir, "secret.md"), "private\n");
      fs.symlinkSync(
        path.join(otherDir, "secret.md"),
        path.join(documentDir, "assets/linked.png")
      );

      const document = "posts/technical/2026/example/index.md";
      expect(() =>
        resolveDocumentAssetPath(
          document,
          "../../../../collections/private/secret.md"
        )
      ).toThrow(/assets/);
      expect(() =>
        resolveDocumentAssetPath(document, path.parse(root).root)
      ).toThrow(/非法资产路径/);
      expect(() =>
        resolveDocumentAssetPath(
          "posts/technical/2026/example/not-markdown.txt",
          "assets/cover.png"
        )
      ).toThrow(/非法文档路径/);
      expect(() =>
        resolveDocumentAssetPath(document, "assets/linked.png")
      ).toThrow(/真实路径越界/);
    } finally {
      if (previousRoot === undefined) delete process.env.CBLOG_REPO_ROOT;
      else process.env.CBLOG_REPO_ROOT = previousRoot;
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("拒绝 assets 目录通过 symlink 指向文档目录之外", () => {
    if (process.platform === "win32") return;

    const root = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-assets-"));
    const previousRoot = process.env.CBLOG_REPO_ROOT;
    process.env.CBLOG_REPO_ROOT = root;

    try {
      const documentDir = path.join(
        root,
        "content/posts/technical/2026/example"
      );
      const outsideAssets = path.join(root, "outside-assets");
      fs.mkdirSync(documentDir, { recursive: true });
      fs.mkdirSync(outsideAssets, { recursive: true });
      fs.writeFileSync(path.join(documentDir, "index.md"), "# Example\n");
      fs.writeFileSync(path.join(outsideAssets, "secret.png"), "private\n");
      fs.symlinkSync(outsideAssets, path.join(documentDir, "assets"), "dir");

      expect(() =>
        resolveDocumentAssetPath(
          "posts/technical/2026/example/index.md",
          "assets/secret.png"
        )
      ).toThrow(/真实路径越界/);
    } finally {
      if (previousRoot === undefined) delete process.env.CBLOG_REPO_ROOT;
      else process.env.CBLOG_REPO_ROOT = previousRoot;
      fs.rmSync(root, { recursive: true, force: true });
    }
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
