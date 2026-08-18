import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseMarkdown } from "../content/frontmatter";
import { createReadonlyDb, defaultDbPath, type DbHandle } from "../db/client";
import {
  closePostgresDb,
  createPostgresDb,
  type PostgresDbHandle,
} from "../db/postgres/client";
import { migratePostgres } from "../db/postgres/migrate";
import { contentRevisions, posts } from "../db/postgres/schema";
import { repoPath } from "../paths";
import { FileSystemMigrationAssetStore } from "./assets";
import { exportMarkdownBackup } from "./export";
import {
  applyMigrationSnapshot,
  assertConfirmedMigrationTarget,
  migrationTargetName,
  verifyMigrationSnapshot,
} from "./runner";
import { buildMigrationSnapshot } from "./source";
import type { MigrationSnapshot } from "./types";

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

function assertSafeTestDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "54329" ||
    url.pathname !== "/cblog"
  ) {
    throw new Error("迁移集成测试只允许 127.0.0.1:54329/cblog");
  }
}

function fileHash(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

describe.skipIf(!testDatabaseUrl)("content migration integration", () => {
  let source: DbHandle;
  let target: PostgresDbHandle;
  let snapshot: MigrationSnapshot;
  let assetDir: string;
  let exportDir: string;
  let assetStore: FileSystemMigrationAssetStore;

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    source = createReadonlyDb(defaultDbPath());
    target = createPostgresDb(testDatabaseUrl!, { max: 4 });
    await target.client.unsafe("drop schema if exists public cascade");
    await target.client.unsafe("drop schema if exists drizzle cascade");
    await target.client.unsafe("create schema public");
    await migratePostgres(target);
    assetDir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-migration-assets-"));
    exportDir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-markdown-backup-"));
    snapshot = buildMigrationSnapshot(source, {
      contentDir: repoPath("content"),
      publicDir: repoPath("apps", "web", "public"),
      publicBaseUrl: "https://assets.example.test/cblog",
    });
    assetStore = new FileSystemMigrationAssetStore(assetDir, {
      contentDir: repoPath("content"),
      publicDir: repoPath("apps", "web", "public"),
    });
  }, 30_000);

  afterAll(async () => {
    source?.sqlite.close();
    if (target) await closePostgresDb(target);
    if (assetDir) fs.rmSync(assetDir, { recursive: true, force: true });
    if (exportDir) fs.rmSync(exportDir, { recursive: true, force: true });
  });

  it("plan 只读扫描完整数据集并按 AST 改写本地资产", () => {
    const count = (table: string) =>
      Number(
        (
          source.sqlite
            .prepare(`select count(*) as count from ${table}`)
            .get() as { count: number }
        ).count
      );
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.categories).toHaveLength(count("categories"));
    expect(snapshot.posts).toHaveLength(count("posts"));
    expect(snapshot.tags).toHaveLength(count("tags"));
    expect(snapshot.collections).toHaveLength(count("collections"));
    expect(snapshot.collectionItems).toHaveLength(count("collection_items"));
    expect(snapshot.assets.length).toBeGreaterThan(0);
    expect(snapshot.unresolvedAssets).toEqual([]);
    const imagePost = snapshot.posts.find(
      (post) => post.slug === "consumption-scene-segmentation"
    );
    expect(imagePost?.contentMarkdown).toContain("asset://");
    expect(imagePost?.contentMarkdown).not.toContain("/images/covers/study/CDP-1.png");
    expect(
      snapshot.posts.find((post) => post.slug === "nextjs-blog-setup")
        ?.coverExternalUrl
    ).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(snapshot.sourceDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(
      snapshot.posts.every((post) =>
        post.status === "published"
          ? post.publishedAt === post.editorialDate
          : post.publishedAt === null
      )
    ).toBe(true);
    // 只读源库守卫：任何写入被 SQLite readonly 模式直接拒绝
    expect(() =>
      source.sqlite.prepare("insert into tags(name) values('readonly-probe')").run()
    ).toThrow(/readonly/i);
  });

  it("事务中途失败全量回滚，不留半条内容/revision（DATA-008 迁移路径）", async () => {
    const poisoned: MigrationSnapshot = {
      ...snapshot,
      collectionItems: [
        { ...snapshot.collectionItems[0], collectionSlug: "ghost-collection" },
      ],
    };
    await expect(
      applyMigrationSnapshot(target, poisoned, {
        runId: "phase2-rollback",
        assetStore,
      })
    ).rejects.toThrow("迁移专栏不存在");

    // 事务内先写入的 categories/collections/assets/posts/revision 必须全部回滚
    const count = async (table: string) =>
      Number(
        (
          await target.client.unsafe(
            `select count(*)::int as count from ${table}`
          )
        )[0].count
      );
    expect(await count("categories")).toBe(0);
    expect(await count("collections")).toBe(0);
    expect(await count("assets")).toBe(0);
    expect(await count("tags")).toBe(0);
    expect(await count("posts")).toBe(0);
    expect(await count("post_tags")).toBe(0);
    expect(await count("content_revisions")).toBe(0);
    expect(await count("content_migration_runs")).toBe(0);
  }, 30_000);

  it("apply 全量写入、verify 零差异且相同 run id 重试不新增 revision", async () => {
    const confirmation = migrationTargetName(testDatabaseUrl!);
    expect(() =>
      assertConfirmedMigrationTarget(testDatabaseUrl!, confirmation)
    ).not.toThrow();
    expect(() =>
      assertConfirmedMigrationTarget(testDatabaseUrl!, "wrong-target")
    ).toThrow("显式确认目标");

    const first = await applyMigrationSnapshot(target, snapshot, {
      runId: "phase2-integration",
      assetStore,
    });
    expect(first).toMatchObject({
      replayed: false,
      counts: {
        posts: snapshot.posts.length,
        collectionItems: snapshot.collectionItems.length,
        assets: snapshot.assets.length,
        revisions: snapshot.posts.length + snapshot.collectionItems.length,
      },
    });
    const replay = await applyMigrationSnapshot(target, snapshot, {
      runId: "phase2-integration",
      assetStore,
    });
    expect(replay.replayed).toBe(true);
    const [revisionCount] = await target.db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentRevisions);
    expect(revisionCount.count).toBe(
      snapshot.posts.length + snapshot.collectionItems.length
    );

    const verified = await verifyMigrationSnapshot(target, snapshot);
    expect(verified.ok).toBe(true);
    expect(verified.differences).toEqual([]);
    const [remoteCover, localCover] = await Promise.all([
      target.db
        .select()
        .from(posts)
        .where(eq(posts.slug, "nextjs-blog-setup"))
        .limit(1),
      target.db
        .select()
        .from(posts)
        .where(eq(posts.slug, "consumption-scene-segmentation"))
        .limit(1),
    ]);
    expect(remoteCover[0]).toMatchObject({
      coverAssetId: null,
      coverExternalUrl: expect.stringMatching(/^https:\/\//),
    });
    expect(localCover[0].coverAssetId).toBeTruthy();
    expect(localCover[0].coverExternalUrl).toBeNull();
  }, 30_000);

  it("目标已有同 slug 但不同来源的文章时拒绝并回滚", async () => {
    const conflicting: MigrationSnapshot = {
      ...snapshot,
      posts: [
        {
          ...snapshot.posts[0],
          legacySourcePath: "posts/fake/other-source/index.md",
        },
      ],
      collectionItems: [],
    };
    await expect(
      applyMigrationSnapshot(target, conflicting, {
        runId: "phase2-slug-conflict",
        assetStore,
      })
    ).rejects.toThrow("slug 冲突");
    // 冲突批次整体回滚：revision 数量保持首次 apply 的结果
    const [revisionCount] = await target.db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentRevisions);
    expect(revisionCount.count).toBe(
      snapshot.posts.length + snapshot.collectionItems.length
    );
  });

  it("同一 run id 不允许绑定不同 source digest", async () => {
    await expect(
      applyMigrationSnapshot(
        target,
        { ...snapshot, sourceDigest: "f".repeat(64) },
        { runId: "phase2-integration", assetStore }
      )
    ).rejects.toThrow("已用于不同 source digest");
  });

  it("存在 unresolved 资产时 apply 在任何数据库写入前失败", async () => {
    await expect(
      applyMigrationSnapshot(
        target,
        {
          ...snapshot,
          unresolvedAssets: [
            {
              documentPath: "posts/demo/index.md",
              url: "./assets/missing.png",
              reason: "fixture",
            },
          ],
        },
        { runId: "phase2-unresolved", assetStore }
      )
    ).rejects.toThrow("未解析本地资产");
  });

  it("verify 会拒绝不同 source digest 和资产公开 URL", async () => {
    const changedConfigSnapshot = buildMigrationSnapshot(source, {
      contentDir: repoPath("content"),
      publicDir: repoPath("apps", "web", "public"),
      publicBaseUrl: "https://wrong-assets.example.test/cblog",
    });
    const report = await verifyMigrationSnapshot(target, changedConfigSnapshot);
    expect(report.ok).toBe(false);
    expect(report.differences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity: "migration_run",
          field: "matched",
        }),
        expect.objectContaining({ entity: "asset", field: "publicUrl" }),
      ])
    );
  });

  it("Markdown 备份恢复相对资产并生成可校验 manifest", async () => {
    const manifest = await exportMarkdownBackup(target, assetStore, exportDir);
    expect(manifest.counts).toEqual({
      posts: snapshot.posts.length,
      collectionItems: snapshot.collectionItems.length,
      assets: snapshot.assets.length,
    });
    expect(manifest.files).toHaveLength(
      snapshot.posts.length + snapshot.collectionItems.length
    );
    expect(manifest.categories).toHaveLength(snapshot.categories.length);
    expect(manifest.collections).toHaveLength(snapshot.collections.length);
    const exportedPost = path.join(
      exportDir,
      "posts/learning/2026/consumption-scene-segmentation/index.md"
    );
    const raw = fs.readFileSync(exportedPost, "utf8");
    const parsed = parseMarkdown(raw);
    expect(parsed.content).toContain("./assets/");
    expect(parsed.content).not.toContain("asset://");
    const assetReference = parsed.content.match(/\.\/assets\/([^\s)]+)/)?.[1];
    expect(assetReference).toBeTruthy();
    const exportedAsset = path.join(path.dirname(exportedPost), "assets", assetReference!);
    const manifestAsset = manifest.assets.find(
      (asset) => asset.sha256 === fileHash(exportedAsset)
    );
    expect(manifestAsset).toBeTruthy();

    const externalCoverRaw = fs.readFileSync(
      path.join(exportDir, "posts/technical/2025/nextjs-blog-setup/index.md"),
      "utf8"
    );
    expect(parseMarkdown(externalCoverRaw).data.coverImage).toMatch(
      /^https:\/\/images\.unsplash\.com\//
    );
    const exportedItem = parseMarkdown(
      fs.readFileSync(
        path.join(exportDir, snapshot.collectionItems[0].legacySourcePath),
        "utf8"
      )
    );
    expect(exportedItem.data.excerpt).toBe(snapshot.collectionItems[0].excerpt);

    // manifest 承载 frontmatter 不含的审计字段（灾备回填 createdAt/publishedAt）
    const publishedEntry = manifest.files.find(
      (file) => file.entityType === "post" && file.publishedAt !== null
    );
    expect(publishedEntry?.createdAt).toBeTruthy();
    expect(manifest.files.every((file) => file.createdAt)).toBe(true);

    // DATA-009：导出是纯读操作，运行库在导出后保持与快照零差异
    const afterExport = await verifyMigrationSnapshot(target, snapshot);
    expect(afterExport.ok).toBe(true);
  }, 30_000);

  it("verify 对人为 content hash 漂移非零判定并定位 slug/字段", async () => {
    const expected = snapshot.posts[0];
    await target.db
      .update(posts)
      .set({ contentHash: "0".repeat(64) })
      .where(eq(posts.slug, expected.slug));
    const report = await verifyMigrationSnapshot(target, snapshot);
    expect(report.ok).toBe(false);
    expect(report.differences).toContainEqual(
      expect.objectContaining({
        entity: "post",
        key: expected.slug,
        field: "contentHash",
      })
    );
  });

  it("verify 重算正文 SHA-256：hash 字段未动但正文被改也能检出", async () => {
    const expected = snapshot.posts[1];
    await target.db
      .update(posts)
      .set({ contentMarkdown: `${expected.contentMarkdown}\n<!-- tampered -->\n` })
      .where(eq(posts.slug, expected.slug));
    const report = await verifyMigrationSnapshot(target, snapshot);
    expect(report.ok).toBe(false);
    expect(report.differences).toContainEqual(
      expect.objectContaining({
        entity: "post",
        key: expected.slug,
        field: "contentMarkdownSha256",
      })
    );
  });
});
