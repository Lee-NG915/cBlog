import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it } from "vitest";
import {
  assetIdFromSha256,
  FileSystemMigrationAssetStore,
  resolveS3ForcePathStyle,
  rewriteMarkdownAssets,
  S3MigrationAssetStore,
  type AssetScanContext,
} from "./assets";
import { assertConfirmedMigrationTarget, migrationTargetName } from "./runner";

const tempRoots: string[] = [];

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-asset-scan-"));
  tempRoots.push(root);
  const contentDir = path.join(root, "content");
  const publicDir = path.join(root, "public");
  const documentPath = "posts/demo/index.md";
  fs.mkdirSync(path.join(contentDir, "posts/demo/assets"), { recursive: true });
  fs.mkdirSync(path.join(publicDir, "images"), { recursive: true });
  fs.writeFileSync(path.join(contentDir, "posts/demo/assets/local.png"), "local");
  fs.writeFileSync(path.join(publicDir, "images/global.png"), "global");
  const context: AssetScanContext = {
    contentDir,
    publicDir,
    publicBaseUrl: "https://assets.test",
    assetsByHash: new Map(),
    unresolved: [],
    remote: [],
  };
  return { root, contentDir, publicDir, documentPath, context };
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("migration asset AST", () => {
  it("改写 inline/reference 图片并按内容去重，远程 URL 保持原样", () => {
    const { documentPath, context } = fixture();
    const markdown = [
      "![local](./assets/local.png)",
      "![same][local-ref]",
      "![global](/images/global.png)",
      "![remote](https://example.com/image.png)",
      "",
      "[local-ref]: ./assets/local.png",
    ].join("\n");
    const result = rewriteMarkdownAssets(documentPath, markdown, context);
    expect(result.localReferenceCount).toBe(3);
    expect(result.markdown.match(/asset:\/\//g)).toHaveLength(3);
    expect(result.markdown).toContain("https://example.com/image.png");
    expect(context.assetsByHash.size).toBe(2);
    expect([...context.assetsByHash.values()].map((asset) => asset.referenceCount).sort()).toEqual([
      1,
      2,
    ]);
    expect(context.remote).toHaveLength(1);
    expect(context.unresolved).toEqual([]);
  });

  it("alt 文本与 URL 相同时只替换 destination", () => {
    const { documentPath, context } = fixture();
    const result = rewriteMarkdownAssets(
      documentPath,
      "![./assets/local.png](./assets/local.png)",
      context
    );
    expect(result.markdown).toMatch(
      /^!\[\.\/assets\/local\.png\]\(asset:\/\/[0-9a-f-]{36}\)$/
    );
  });

  it("拒绝不受支持或越界的本地引用", () => {
    const { documentPath, context } = fixture();
    const result = rewriteMarkdownAssets(
      documentPath,
      "![escape](../secret.png)\n![missing](./assets/missing.png)",
      context
    );
    expect(result.localReferenceCount).toBe(0);
    expect(context.unresolved).toHaveLength(2);
  });

  it("普通链接和 HTML 本地资源会显式进入 unresolved", () => {
    const { documentPath, context } = fixture();
    rewriteMarkdownAssets(
      documentPath,
      '[download](./assets/local.png)\n<img src="/images/global.png">',
      context
    );
    expect(context.unresolved).toHaveLength(2);
    expect(context.unresolved.map((item) => item.url)).toEqual([
      "./assets/local.png",
      "/images/global.png",
    ]);
  });

  it("filesystem store 使用 object key 写入并复核 hash", async () => {
    const { root, contentDir, publicDir, documentPath, context } = fixture();
    rewriteMarkdownAssets(documentPath, "![local](./assets/local.png)", context);
    const [asset] = [...context.assetsByHash.values()];
    const store = new FileSystemMigrationAssetStore(path.join(root, "objects"), {
      contentDir,
      publicDir,
    });
    await store.put(asset);
    await store.put(asset);
    expect((await store.read(asset.objectKey)).toString("utf8")).toBe("local");
  });

  it("S3 store 幂等上传并在回读后复核 hash", async () => {
    const { contentDir, publicDir, documentPath, context } = fixture();
    rewriteMarkdownAssets(documentPath, "![local](./assets/local.png)", context);
    const [asset] = [...context.assetsByHash.values()];
    const objects = new Map<string, Buffer>();
    let putCount = 0;
    const client = {
      async send(command: GetObjectCommand | PutObjectCommand) {
        if (command instanceof GetObjectCommand) {
          const value = objects.get(command.input.Key!);
          if (!value) {
            throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
          }
          return {
            Body: {
              transformToByteArray: async () => Uint8Array.from(value),
            },
          };
        }
        putCount += 1;
        objects.set(command.input.Key!, Buffer.from(command.input.Body as Buffer));
        return {};
      },
    };
    const store = new S3MigrationAssetStore({
      contentDir,
      publicDir,
      bucket: "migration-test",
      region: "us-east-1",
      accessKeyId: "test",
      secretAccessKey: "test",
      client,
    });

    await store.put(asset);
    await store.put(asset);
    expect(putCount).toBe(1);
    expect((await store.read(asset.objectKey)).toString("utf8")).toBe("local");
  });

  it("S3 store 拒绝不安全 object key", async () => {
    const { contentDir, publicDir } = fixture();
    const store = new S3MigrationAssetStore({
      contentDir,
      publicDir,
      bucket: "migration-test",
      region: "us-east-1",
      accessKeyId: "test",
      secretAccessKey: "test",
      client: { send: async () => ({}) },
    });
    await expect(store.read("../escape")).rejects.toThrow("object key 越界");
  });

  it("S3 custom endpoint 默认启用 path-style，显式配置可覆盖", () => {
    expect(resolveS3ForcePathStyle("http://127.0.0.1:9000", undefined)).toBe(
      true
    );
    expect(resolveS3ForcePathStyle(undefined, undefined)).toBe(false);
    expect(resolveS3ForcePathStyle("http://127.0.0.1:9000", false)).toBe(
      false
    );
  });

  it("linkReference 定义引用本地资产时进入 unresolved 而非静默残留", () => {
    const { documentPath, context } = fixture();
    const markdown = [
      "下载[报告][report]与图片：",
      "![shared][shared-ref]",
      "[shared-link][shared-ref]",
      "",
      "[report]: ./assets/local.png",
      "[shared-ref]: /images/global.png",
    ].join("\n");
    rewriteMarkdownAssets(documentPath, markdown, context);
    const urls = context.unresolved.map((item) => item.url).sort();
    // report 仅被 linkReference 引用；shared-ref 同时被 image/link 引用也必须显式暴露
    expect(urls).toEqual(["./assets/local.png", "/images/global.png"]);
    expect(
      context.unresolved.every((item) => item.reason.includes("linkReference"))
    ).toBe(true);
  });

  it("store.put 直接拒绝 symlink 指向源根目录之外（真实路径越界）", async () => {
    if (process.platform === "win32") return;
    const { root, contentDir, publicDir } = fixture();
    const outside = path.join(root, "outside-secret.png");
    fs.writeFileSync(outside, "secret");
    fs.symlinkSync(
      outside,
      path.join(contentDir, "posts/demo/assets/linked.png")
    );
    // 手工构造 asset 绕过 scan 层防护，直接验证 put 的 realpath 纵深防御分支
    const store = new FileSystemMigrationAssetStore(path.join(root, "objects"), {
      contentDir,
      publicDir,
    });
    await expect(
      store.put({
        id: "00000000-0000-4000-8000-000000000000",
        objectKey: "sha256/aa/fake.png",
        originalName: "linked.png",
        mimeType: "image/png",
        byteSize: 6,
        sha256: "a".repeat(64),
        sourcePath: "posts/demo/assets/linked.png",
        publicUrl: "https://assets.test/sha256/aa/fake.png",
        referenceCount: 1,
      })
    ).rejects.toThrow("资产源真实路径越界");
  });

  it("assetIdFromSha256 确定性生成合法 UUID", () => {
    const hash = "a".repeat(64);
    const first = assetIdFromSha256(hash);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(assetIdFromSha256(hash)).toBe(first);
    expect(assetIdFromSha256("b".repeat(64))).not.toBe(first);
  });
});

describe("migration target 确认门禁", () => {
  it("migrationTargetName 补默认端口 5432", () => {
    expect(migrationTargetName("postgresql://u:p@db.example.com/cblog")).toBe(
      "db.example.com:5432/cblog"
    );
    expect(
      migrationTargetName("postgresql://u:p@127.0.0.1:54329/cblog")
    ).toBe("127.0.0.1:54329/cblog");
  });

  it("确认值缺失或不精确匹配时拒绝 apply", () => {
    const url = "postgresql://u:p@127.0.0.1:54329/cblog";
    expect(() => assertConfirmedMigrationTarget(url, undefined)).toThrow(
      "显式确认目标"
    );
    expect(() =>
      assertConfirmedMigrationTarget(url, "127.0.0.1:54329/other")
    ).toThrow("显式确认目标");
    expect(() =>
      assertConfirmedMigrationTarget(url, "127.0.0.1:54329/cblog")
    ).not.toThrow();
  });
});
