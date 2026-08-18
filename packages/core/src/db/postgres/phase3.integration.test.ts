import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  closePostgresDb,
  createPostgresDb,
  type PostgresDbHandle,
} from "./client";
import { migratePostgres } from "./migrate";
import {
  PostgresAdminContentStore,
  PostgresCategoryRepository,
  PostgresCollectionRepository,
} from "./admin-repos";
import { PostgresPublicContentReader } from "./public-reader";
import {
  PostgresCollectionItemRepository,
  PostgresPostRepository,
} from "./repositories";
import { assets } from "./schema";

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

function assertSafeTestDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "54329" ||
    url.pathname !== "/cblog"
  ) {
    throw new Error("集成测试只允许 127.0.0.1:54329/cblog");
  }
}

describe.skipIf(!testDatabaseUrl)("phase 3 public reader / admin repos", () => {
  let handle: PostgresDbHandle;
  let reader: PostgresPublicContentReader;
  let categoryRepo: PostgresCategoryRepository;
  let collectionRepo: PostgresCollectionRepository;
  let postRepo: PostgresPostRepository;
  let itemRepo: PostgresCollectionItemRepository;
  let store: PostgresAdminContentStore;
  let technicalId: string;
  let collectionId: string;
  let assetId: string;
  let assetUrl: string;

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    handle = createPostgresDb(testDatabaseUrl!, { max: 4 });
    await handle.client.unsafe("drop schema if exists public cascade");
    await handle.client.unsafe("drop schema if exists drizzle cascade");
    await handle.client.unsafe("create schema public");
    await migratePostgres(handle);

    reader = new PostgresPublicContentReader(handle);
    categoryRepo = new PostgresCategoryRepository(handle);
    collectionRepo = new PostgresCollectionRepository(handle);
    postRepo = new PostgresPostRepository(handle);
    itemRepo = new PostgresCollectionItemRepository(handle);
    store = new PostgresAdminContentStore(handle);

    technicalId = await categoryRepo.create({
      slug: "technical",
      name: "工程札记",
    });
    await categoryRepo.create({ slug: "notes", name: "专题整理" });

    const [assetRow] = await handle.db
      .insert(assets)
      .values({
        objectKey: "assets/aa/fixture.png",
        originalName: "fixture.png",
        mimeType: "image/png",
        byteSize: 3,
        sha256: "a".repeat(64),
        publicUrl: "https://cdn.test/cblog/assets/aa/fixture.png",
      })
      .returning({ id: assets.id, publicUrl: assets.publicUrl });
    assetId = assetRow.id;
    assetUrl = assetRow.publicUrl;

    await postRepo.create({
      slug: "published-post",
      title: "已发布",
      contentMarkdown: `正文含图 ![img](asset://${assetId})`,
      categoryId: technicalId,
      status: "published",
      editorialDate: "2026-08-01T00:00:00.000Z",
      tags: ["alpha", "beta"],
    });
    await postRepo.create({
      slug: "draft-post",
      title: "草稿",
      contentMarkdown: "draft body",
      categoryId: technicalId,
      status: "draft",
    });
    await postRepo.create({
      slug: "archived-post",
      title: "归档",
      contentMarkdown: "archived body",
      categoryId: technicalId,
      status: "archived",
    });

    collectionId = await collectionRepo.create({
      slug: "fixture-column",
      name: "测试专栏",
    });
    await itemRepo.create({
      collectionId,
      slug: "public-item",
      title: "公开文档",
      contentMarkdown: "item body",
      status: "published",
      sortOrder: 1,
    });
    await itemRepo.create({
      collectionId,
      slug: "draft-item",
      title: "草稿文档",
      contentMarkdown: "draft item",
      status: "draft",
      sortOrder: 2,
    });
  }, 30_000);

  afterAll(async () => {
    if (handle) await closePostgresDb(handle);
  });

  it("公开列表只含 published（API-001/SEC-006 数据层）", async () => {
    const posts = await reader.getPosts();
    expect(posts.map((post) => post.slug)).toEqual(["published-post"]);
    expect(posts[0].tags).toEqual(["alpha", "beta"]);
  });

  it("draft/archived/不存在一律 null（API-002 数据层）", async () => {
    expect(await reader.getPost("draft-post")).toBeNull();
    expect(await reader.getPost("archived-post")).toBeNull();
    expect(await reader.getPost("no-such")).toBeNull();
  });

  it("正文 asset:// 解析为公开 URL", async () => {
    const post = await reader.getPost("published-post");
    expect(post?.contentMarkdown).toContain(assetUrl);
    expect(post?.contentMarkdown).not.toContain("asset://");
  });

  it("分类计数只计 published", async () => {
    const categories = await reader.getCategories();
    const technical = categories.find((row) => row.slug === "technical");
    expect(technical?.publishedCount).toBe(1);
  });

  it("专栏公开视图排除 draft 文档", async () => {
    const collection = await reader.getCollection("fixture-column");
    expect(collection?.items.map((item) => item.slug)).toEqual(["public-item"]);
    expect(await reader.getCollectionItem("fixture-column", "draft-item")).toBeNull();
    expect(
      await reader.getCollectionItem("fixture-column", "public-item")
    ).not.toBeNull();
  });

  it("sitemap 数据只含 published 且专栏携带 noindex", async () => {
    const sitemap = await reader.getSitemap();
    expect(sitemap.posts.map((post) => post.slug)).toEqual(["published-post"]);
    const column = sitemap.collections.find(
      (row) => row.slug === "fixture-column"
    );
    expect(column?.noindex).toBe(true);
    expect(column?.items).toEqual([{ slug: "public-item" }]);
  });

  it("分类守卫：重复/保留 slug 拒绝、有文章不可删（CORE 层）", async () => {
    await expect(
      categoryRepo.create({ slug: "technical", name: "重复" })
    ).rejects.toThrow("已存在");
    await expect(
      categoryRepo.create({ slug: "uncategorized", name: "保留" })
    ).rejects.toThrow("系统保留");
    await expect(categoryRepo.remove(technicalId)).rejects.toThrow("不可删除");
  });

  it("专栏守卫：保留路由字拒绝、排序校验与版本递增", async () => {
    await expect(
      collectionRepo.create({ slug: "posts", name: "冲突" })
    ).rejects.toThrow("保留路由");

    const items = await store.listItems(collectionId);
    await expect(
      collectionRepo.reorderItems(collectionId, [items[0].id])
    ).rejects.toThrow("不匹配");

    const reversed = [...items].reverse().map((item) => item.id);
    await collectionRepo.reorderItems(collectionId, reversed);
    const after = await store.listItems(collectionId);
    expect(after.map((item) => item.slug)).toEqual(
      [...items].reverse().map((item) => item.slug)
    );
    expect(after[0].version).toBe(items[items.length - 1].version + 1);
  });

  it("级联删除清理 revision 与标签关联", async () => {
    const created = await postRepo.create({
      slug: "cascade-me",
      title: "级联",
      contentMarkdown: "body",
      categoryId: technicalId,
      tags: ["gamma"],
    });
    await store.deletePostCascade(created.id);
    expect(await store.getPostById(created.id)).toBeNull();
    const [revisionCount] = await handle.client<
      Array<{ count: number }>
    >`select count(*)::int as count from content_revisions where post_id = ${created.id}`;
    expect(revisionCount.count).toBe(0);
  });

  it("资产 sha256 去重 upsert", async () => {
    const first = await store.upsertAssetBySha({
      sha256: "b".repeat(64),
      objectKey: "assets/bb/one.png",
      originalName: "one.png",
      mimeType: "image/png",
      byteSize: 5,
      publicUrl: "https://cdn.test/cblog/assets/bb/one.png",
    });
    const replay = await store.upsertAssetBySha({
      sha256: "b".repeat(64),
      objectKey: "assets/bb/other-key.png",
      originalName: "other.png",
      mimeType: "image/png",
      byteSize: 5,
      publicUrl: "https://cdn.test/other-url.png",
    });
    expect(replay.id).toBe(first.id);
    expect(replay.publicUrl).toBe(first.publicUrl);
  });
});
