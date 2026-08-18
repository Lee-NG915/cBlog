import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { VersionConflictError } from "../../domain/errors";
import { closePostgresDb, createPostgresDb, type PostgresDbHandle } from "./client";
import { migratePostgres } from "./migrate";
import {
  PostgresCollectionItemRepository,
  PostgresPostRepository,
} from "./repositories";
import {
  assets,
  categories,
  collections,
  contentRevisions,
} from "./schema";

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

function assertSafeTestDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const database = url.pathname.replace(/^\//, "");
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "54329" ||
    database !== "cblog"
  ) {
    throw new Error(
      "PostgreSQL 集成测试只允许 127.0.0.1:54329/cblog"
    );
  }
}

describe.skipIf(!testDatabaseUrl)("PostgreSQL repository integration", () => {
  let handle: PostgresDbHandle;

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    handle = createPostgresDb(testDatabaseUrl!, { max: 4 });
    await handle.client.unsafe("drop schema if exists public cascade");
    await handle.client.unsafe("drop schema if exists drizzle cascade");
    await handle.client.unsafe("create schema public");
    await migratePostgres(handle);
    await migratePostgres(handle);
  }, 30_000);

  beforeEach(async () => {
    await handle.client.unsafe(`
      truncate table
        publication_deployment_events,
        publication_events,
        publication_deployments,
        content_revisions,
        post_tags,
        tags,
        collection_items,
        collections,
        posts,
        categories,
        assets
      cascade
    `);
  });

  afterAll(async () => {
    if (handle) await closePostgresDb(handle);
  });

  it("migration 对空库可重复执行", async () => {
    const rows = await handle.client<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('posts', 'content_revisions', 'publication_events')
      order by table_name
    `;
    expect(rows.map((row) => row.table_name)).toEqual([
      "content_revisions",
      "posts",
      "publication_events",
    ]);
  });

  it("条件版本更新阻止静默覆盖并保留标签顺序", async () => {
    const [category] = await handle.db
      .insert(categories)
      .values({ slug: "technical", name: "技术" })
      .returning({ id: categories.id });
    const repository = new PostgresPostRepository(handle);
    const created = await repository.create({
      slug: "optimistic-lock",
      title: "初始标题",
      contentMarkdown: "# v1",
      categoryId: category.id,
      tags: ["nextjs", "postgres"],
    });

    const updated = await repository.update(created.id, {
      expectedVersion: 1,
      title: "标签页 A",
      contentMarkdown: "# v2",
      tags: ["postgres", "nextjs"],
    });
    expect(updated.version).toBe(2);
    expect(updated.tags).toEqual(["postgres", "nextjs"]);

    await expect(
      repository.update(created.id, {
        expectedVersion: 1,
        title: "标签页 B",
      })
    ).rejects.toMatchObject({
      code: "VERSION_CONFLICT",
      expectedVersion: 1,
      currentVersion: 2,
    } satisfies Partial<VersionConflictError>);
    expect((await repository.getById(created.id))?.title).toBe("标签页 A");
  });

  it("两个并发写入只能有一个以相同版本成功", async () => {
    const [category] = await handle.db
      .insert(categories)
      .values({ slug: "concurrency", name: "并发" })
      .returning({ id: categories.id });
    const repository = new PostgresPostRepository(handle);
    const created = await repository.create({
      slug: "parallel-optimistic-lock",
      title: "初始标题",
      contentMarkdown: "v1",
      categoryId: category.id,
    });

    await handle.client.unsafe(`
      create function delay_post_update() returns trigger
      language plpgsql as $$
      begin
        perform pg_sleep(0.1);
        return new;
      end;
      $$
    `);
    await handle.client.unsafe(`
      create trigger delay_post_update_trigger
      before update on posts
      for each row execute function delay_post_update()
    `);

    let results: PromiseSettledResult<Awaited<ReturnType<typeof repository.update>>>[];
    try {
      results = await Promise.allSettled([
        repository.update(created.id, {
          expectedVersion: 1,
          title: "并发更新 A",
        }),
        repository.update(created.id, {
          expectedVersion: 1,
          title: "并发更新 B",
        }),
      ]);
    } finally {
      await handle.client.unsafe(
        "drop trigger if exists delay_post_update_trigger on posts"
      );
      await handle.client.unsafe("drop function if exists delay_post_update()");
    }

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      VersionConflictError
    );
    expect((await repository.getById(created.id))?.version).toBe(2);
  });

  it("实体更新与 revision 插入处于同一事务", async () => {
    const [category] = await handle.db
      .insert(categories)
      .values({ slug: "notes", name: "笔记" })
      .returning({ id: categories.id });
    const repository = new PostgresPostRepository(handle);
    const created = await repository.create({
      slug: "transaction-rollback",
      title: "提交前",
      contentMarkdown: "old",
      categoryId: category.id,
    });

    await handle.client.unsafe(`
      create function fail_content_revision_insert() returns trigger
      language plpgsql as $$
      begin
        raise exception 'injected revision failure';
      end;
      $$
    `);
    await handle.client.unsafe(`
      create trigger fail_content_revision_insert_trigger
      before insert on content_revisions
      for each row execute function fail_content_revision_insert()
    `);

    try {
      await expect(
        repository.update(created.id, {
          expectedVersion: 1,
          title: "不应提交",
          contentMarkdown: "new",
        })
      ).rejects.toThrow("injected revision failure");
    } finally {
      await handle.client.unsafe(
        "drop trigger if exists fail_content_revision_insert_trigger on content_revisions"
      );
      await handle.client.unsafe(
        "drop function if exists fail_content_revision_insert()"
      );
    }

    const persisted = await repository.getById(created.id);
    expect(persisted).toMatchObject({
      title: "提交前",
      contentMarkdown: "old",
      version: 1,
    });
    const [revisionCount] = await handle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentRevisions)
      .where(eq(contentRevisions.postId, created.id));
    expect(revisionCount.count).toBe(1);
  });

  it("公开查询在 repository 层固定过滤草稿和归档", async () => {
    const [category] = await handle.db
      .insert(categories)
      .values({ slug: "life", name: "生活" })
      .returning({ id: categories.id });
    const repository = new PostgresPostRepository(handle);
    const draft = await repository.create({
      slug: "draft-post",
      title: "草稿",
      contentMarkdown: "draft",
      categoryId: category.id,
    });
    const published = await repository.create({
      slug: "published-post",
      title: "公开",
      contentMarkdown: "published",
      categoryId: category.id,
      status: "published",
      editorialDate: "2026-08-17",
    });
    const publishedWithoutDate = await repository.create({
      slug: "published-without-date",
      title: "无编辑日期的公开文章",
      contentMarkdown: "published",
      categoryId: category.id,
      status: "published",
    });
    const archived = await repository.create({
      slug: "archived-post",
      title: "归档",
      contentMarkdown: "archived",
      categoryId: category.id,
      status: "archived",
    });

    expect(await repository.getPublishedBySlug(draft.slug)).toBeNull();
    expect(await repository.getPublishedBySlug(archived.slug)).toBeNull();
    expect((await repository.getPublishedBySlug(published.slug))?.id).toBe(
      published.id
    );
    expect((await repository.listPublished()).map((post) => post.slug)).toEqual([
      "published-post",
      "published-without-date",
    ]);
  });

  it("本地封面与远程封面互斥并可显式切换", async () => {
    const [category] = await handle.db
      .insert(categories)
      .values({ slug: "covers", name: "封面" })
      .returning({ id: categories.id });
    const [asset] = await handle.db
      .insert(assets)
      .values({
        objectKey: "cover/example.png",
        originalName: "example.png",
        mimeType: "image/png",
        byteSize: 1,
        sha256: "a".repeat(64),
        publicUrl: "https://assets.example/cover/example.png",
      })
      .returning({ id: assets.id });
    const repository = new PostgresPostRepository(handle);
    await expect(
      repository.create({
        slug: "invalid-cover",
        title: "冲突封面",
        contentMarkdown: "body",
        categoryId: category.id,
        coverAssetId: asset.id,
        coverExternalUrl: "https://example.com/cover.png",
      })
    ).rejects.toThrow("其中一种");
    await expect(
      repository.create({
        slug: "invalid-cover-protocol",
        title: "非法远程封面",
        contentMarkdown: "body",
        categoryId: category.id,
        coverExternalUrl: "javascript:alert(1)",
      })
    ).rejects.toThrow("HTTP(S)");

    const created = await repository.create({
      slug: "external-cover",
      title: "远程封面",
      contentMarkdown: "body",
      categoryId: category.id,
      coverExternalUrl: "https://example.com/cover.png",
    });
    const switched = await repository.update(created.id, {
      expectedVersion: 1,
      coverAssetId: asset.id,
    });
    expect(switched.coverAssetId).toBe(asset.id);
    expect(switched.coverExternalUrl).toBeNull();
  });

  it("专栏文档也使用版本锁、revision 和 published-only 查询", async () => {
    const [collection] = await handle.db
      .insert(collections)
      .values({ slug: "notes", name: "Notes" })
      .returning({ id: collections.id });
    const repository = new PostgresCollectionItemRepository(handle);
    const created = await repository.create({
      collectionId: collection.id,
      slug: "chapter-1",
      title: "第一章",
      contentMarkdown: "v1",
    });
    expect(await repository.getPublished(collection.id, created.slug)).toBeNull();

    const published = await repository.changeStatus(created.id, 1, "published");
    expect(published.version).toBe(2);
    expect(
      (await repository.getPublished(collection.id, created.slug))?.id
    ).toBe(created.id);
    await expect(
      repository.update(created.id, {
        expectedVersion: 1,
        title: "旧标签页",
      })
    ).rejects.toBeInstanceOf(VersionConflictError);
  });
});
