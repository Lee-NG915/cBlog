import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
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
import {
  PostgresCollectionItemRepository,
  PostgresPostRepository,
} from "./repositories";
import {
  buildPublicationPayload,
  insertPublicationEvent,
  type PublicationOperation,
} from "./publication-events";
import { posts, publicationEvents } from "./schema";

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

type EventRow = typeof publicationEvents.$inferSelect;

describe.skipIf(!testDatabaseUrl)("phase 6 publication_events 事务写入", () => {
  let handle: PostgresDbHandle;
  let categoryRepo: PostgresCategoryRepository;
  let collectionRepo: PostgresCollectionRepository;
  let postRepo: PostgresPostRepository;
  let itemRepo: PostgresCollectionItemRepository;
  let store: PostgresAdminContentStore;
  let catAId: string;
  let catBId: string;
  let collectionId: string;

  async function eventsFor(entityId: string): Promise<EventRow[]> {
    return handle.db
      .select()
      .from(publicationEvents)
      .where(eq(publicationEvents.entityId, entityId));
  }

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    handle = createPostgresDb(testDatabaseUrl!, { max: 4 });
    await handle.client.unsafe("drop schema if exists public cascade");
    await handle.client.unsafe("drop schema if exists drizzle cascade");
    await handle.client.unsafe("create schema public");
    await migratePostgres(handle);

    categoryRepo = new PostgresCategoryRepository(handle);
    collectionRepo = new PostgresCollectionRepository(handle);
    postRepo = new PostgresPostRepository(handle);
    itemRepo = new PostgresCollectionItemRepository(handle);
    store = new PostgresAdminContentStore(handle);

    // 夹具：分类/专栏的 create 本身会写 category/collection 事件，
    // 建完夹具后清空事件表，让每个用例从干净状态计数
    catAId = await categoryRepo.create({ slug: "cat-a", name: "分类甲" });
    catBId = await categoryRepo.create({ slug: "cat-b", name: "分类乙" });
    collectionId = await collectionRepo.create({
      slug: "p6-column",
      name: "P6 专栏",
    });
    await handle.db.delete(publicationEvents);
  }, 30_000);

  afterAll(async () => {
    if (handle) await closePostgresDb(handle);
  });

  it("draft 创建与保存不产生事件", async () => {
    const post = await postRepo.create({
      slug: "p6-draft-only",
      title: "草稿",
      contentMarkdown: "draft body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.update(post.id, {
      expectedVersion: 1,
      title: "草稿改标题",
    });
    expect(await eventsFor(post.id)).toHaveLength(0);
  });

  it("draft→published 写恰好 1 条 publish 事件", async () => {
    const post = await postRepo.create({
      slug: "p6-publish",
      title: "待发布",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");

    const events = await eventsFor(post.id);
    expect(events).toHaveLength(1);
    expect(events[0].entityType).toBe("post");
    expect(events[0].operation).toBe("publish");
    expect(events[0].status).toBe("pending");
    expect(events[0].schemaVersion).toBe(1);
    expect(events[0].payloadJson).toEqual({
      slug: "p6-publish",
      categorySlug: "cat-a",
      contentVersion: 2,
    });
  });

  it("published 文章 save 写 update 事件，contentVersion 为新版本", async () => {
    const post = await postRepo.create({
      slug: "p6-save",
      title: "已发布",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");
    await postRepo.update(post.id, {
      expectedVersion: 2,
      title: "已发布改标题",
    });

    const events = await eventsFor(post.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "publish",
      "update",
    ]);
    const update = events.find((event) => event.operation === "update")!;
    expect(update.payloadJson).toEqual({
      slug: "p6-save",
      categorySlug: "cat-a",
      contentVersion: 3,
    });
  });

  it("published 文章移动分类，update 事件带 previousCategorySlug", async () => {
    const post = await postRepo.create({
      slug: "p6-move",
      title: "移动分类",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");
    await postRepo.update(post.id, { expectedVersion: 2, categoryId: catBId });

    const events = await eventsFor(post.id);
    const update = events.find((event) => event.operation === "update")!;
    expect(update.payloadJson).toEqual({
      slug: "p6-move",
      categorySlug: "cat-b",
      previousCategorySlug: "cat-a",
      contentVersion: 3,
    });
  });

  it("published→draft 写 unpublish 事件", async () => {
    const post = await postRepo.create({
      slug: "p6-unpublish",
      title: "下线",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");
    await postRepo.changeStatus(post.id, 2, "draft");

    const events = await eventsFor(post.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "publish",
      "unpublish",
    ]);
    const unpublish = events.find(
      (event) => event.operation === "unpublish"
    )!;
    expect(unpublish.payloadJson).toMatchObject({
      slug: "p6-unpublish",
      categorySlug: "cat-a",
      contentVersion: 3,
    });
  });

  it("published→archived 写 archive 事件", async () => {
    const post = await postRepo.create({
      slug: "p6-archive",
      title: "归档",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");
    await postRepo.changeStatus(post.id, 2, "archived");

    const events = await eventsFor(post.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "archive",
      "publish",
    ]);
  });

  it("删除 published 文章写 delete 事件；删除 draft 不写", async () => {
    const published = await postRepo.create({
      slug: "p6-delete-published",
      title: "删已发布",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(published.id, 1, "published");
    await store.deletePostCascade(published.id);

    const events = await eventsFor(published.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "delete",
      "publish",
    ]);
    const del = events.find((event) => event.operation === "delete")!;
    expect(del.payloadJson).toEqual({
      slug: "p6-delete-published",
      categorySlug: "cat-a",
      // contentVersion = 删除时的 version（create v1 → publish v2，删除时 v2）
      contentVersion: 2,
    });

    const draft = await postRepo.create({
      slug: "p6-delete-draft",
      title: "删草稿",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await store.deletePostCascade(draft.id);
    expect(await eventsFor(draft.id)).toHaveLength(0);
  });

  it("collection_item：publish / update / unpublish 各写 1 条事件", async () => {
    const item = await itemRepo.create({
      collectionId,
      slug: "p6-item",
      title: "专栏文档",
      contentMarkdown: "item body",
      status: "draft",
    });
    // draft 创建/保存不写事件
    await itemRepo.update(item.id, { expectedVersion: 1, title: "草稿改" });
    expect(await eventsFor(item.id)).toHaveLength(0);

    await itemRepo.changeStatus(item.id, 2, "published");
    await itemRepo.update(item.id, { expectedVersion: 3, title: "发布后改" });
    await itemRepo.changeStatus(item.id, 4, "draft");

    const events = await eventsFor(item.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "publish",
      "unpublish",
      "update",
    ]);
    for (const event of events) {
      expect(event.entityType).toBe("collection_item");
      expect(event.status).toBe("pending");
    }
    const publish = events.find((event) => event.operation === "publish")!;
    expect(publish.payloadJson).toEqual({
      collectionSlug: "p6-column",
      slug: "p6-item",
      contentVersion: 3,
    });
    const update = events.find((event) => event.operation === "update")!;
    expect(update.payloadJson).toEqual({
      collectionSlug: "p6-column",
      slug: "p6-item",
      contentVersion: 4,
    });
    const unpublish = events.find(
      (event) => event.operation === "unpublish"
    )!;
    expect(unpublish.payloadJson).toMatchObject({
      collectionSlug: "p6-column",
      slug: "p6-item",
      contentVersion: 5,
    });
  });

  it("删除 published 专栏文档写 delete 事件；删除 draft 不写", async () => {
    const published = await itemRepo.create({
      collectionId,
      slug: "p6-item-delete-published",
      title: "删已发布文档",
      contentMarkdown: "item body",
      status: "draft",
    });
    await itemRepo.changeStatus(published.id, 1, "published");
    await store.deleteItemCascade(published.id);

    const events = await eventsFor(published.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "delete",
      "publish",
    ]);
    const del = events.find((event) => event.operation === "delete")!;
    expect(del.payloadJson).toEqual({
      collectionSlug: "p6-column",
      slug: "p6-item-delete-published",
      contentVersion: 2,
    });

    const draft = await itemRepo.create({
      collectionId,
      slug: "p6-item-delete-draft",
      title: "删草稿文档",
      contentMarkdown: "item body",
      status: "draft",
    });
    await store.deleteItemCascade(draft.id);
    expect(await eventsFor(draft.id)).toHaveLength(0);
  });

  it("同事务回滚：事件插入失败则业务行不落库（无半提交）", async () => {
    const slug = "p6-rollback";
    await expect(
      handle.db.transaction(async (tx) => {
        // 业务写入（直接发布一篇文章）
        const [created] = await tx
          .insert(posts)
          .values({
            slug,
            title: "回滚",
            contentMarkdown: "body",
            contentHash: "h".repeat(64),
            status: "published",
            categoryId: catAId,
          })
          .returning({ id: posts.id });
        // 注入事件插入失败：非法 operation 触发枚举约束错误
        await insertPublicationEvent(tx, {
          entityType: "post",
          entityId: created.id,
          operation: "bogus" as PublicationOperation,
          payload: buildPublicationPayload({
            entityType: "post",
            slug,
            categorySlug: "cat-a",
            contentVersion: 1,
          }),
        });
      })
    ).rejects.toThrow();

    const [postCount] = await handle.client<
      Array<{ count: number }>
    >`select count(*)::int as count from posts where slug = ${slug}`;
    expect(postCount.count).toBe(0);
    const [eventCount] = await handle.client<
      Array<{ count: number }>
    >`select count(*)::int as count from publication_events where payload_json->>'slug' = ${slug}`;
    expect(eventCount.count).toBe(0);
  });

  it("同事务内连续两次 save published 写两条 update 事件（不合并）", async () => {
    const post = await postRepo.create({
      slug: "p6-double-save",
      title: "双保存",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");

    // 在同一事务内模拟连续两次 save（每次版本 +1 并各写一条 update 事件）
    const now = new Date().toISOString();
    await handle.db.transaction(async (tx) => {
      await tx
        .update(posts)
        .set({ title: "双保存 v3", version: 3, updatedAt: now })
        .where(eq(posts.id, post.id));
      await insertPublicationEvent(tx, {
        entityType: "post",
        entityId: post.id,
        operation: "update",
        payload: buildPublicationPayload({
          entityType: "post",
          slug: "p6-double-save",
          categorySlug: "cat-a",
          contentVersion: 3,
        }),
      });
      await tx
        .update(posts)
        .set({ title: "双保存 v4", version: 4, updatedAt: now })
        .where(eq(posts.id, post.id));
      await insertPublicationEvent(tx, {
        entityType: "post",
        entityId: post.id,
        operation: "update",
        payload: buildPublicationPayload({
          entityType: "post",
          slug: "p6-double-save",
          categorySlug: "cat-a",
          contentVersion: 4,
        }),
      });
    });

    const events = await eventsFor(post.id);
    const updates = events.filter((event) => event.operation === "update");
    expect(updates).toHaveLength(2);
    const versions = updates
      .map((event) => event.payloadJson.contentVersion)
      .sort();
    expect(versions).toEqual([3, 4]);
  });

  it("category 与 collection 的 create/update/delete 写事件", async () => {
    const catId = await categoryRepo.create({
      slug: "p6-cat",
      name: "临时分类",
    });
    await categoryRepo.update(catId, { name: "临时分类改" });
    await categoryRepo.remove(catId);

    const catEvents = await eventsFor(catId);
    expect(catEvents.map((event) => event.operation).sort()).toEqual([
      "delete",
      "update",
      "update",
    ]);
    for (const event of catEvents) {
      expect(event.entityType).toBe("category");
      expect(event.payloadJson).toMatchObject({ slug: "p6-cat", version: 1 });
    }

    const colId = await collectionRepo.create({
      slug: "p6-col",
      name: "临时专栏",
    });
    await collectionRepo.update(colId, { name: "临时专栏改" });
    await collectionRepo.remove(colId);

    const colEvents = await eventsFor(colId);
    expect(colEvents.map((event) => event.operation).sort()).toEqual([
      "delete",
      "update",
      "update",
    ]);
    for (const event of colEvents) {
      expect(event.entityType).toBe("collection");
      expect(event.payloadJson).toMatchObject({ slug: "p6-col", version: 1 });
    }
  });

  it("直接以 published 创建写 publish 事件（contentVersion=1）", async () => {
    const post = await postRepo.create({
      slug: "p6-create-published",
      title: "直接发布",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "published",
    });
    const postEvents = await eventsFor(post.id);
    expect(postEvents).toHaveLength(1);
    expect(postEvents[0].operation).toBe("publish");
    expect(postEvents[0].status).toBe("pending");
    expect(postEvents[0].payloadJson).toEqual({
      slug: "p6-create-published",
      categorySlug: "cat-a",
      contentVersion: 1,
    });

    const item = await itemRepo.create({
      collectionId,
      slug: "p6-item-create-published",
      title: "直接发布文档",
      contentMarkdown: "item body",
      status: "published",
    });
    const itemEvents = await eventsFor(item.id);
    expect(itemEvents).toHaveLength(1);
    expect(itemEvents[0].entityType).toBe("collection_item");
    expect(itemEvents[0].operation).toBe("publish");
    expect(itemEvents[0].payloadJson).toEqual({
      collectionSlug: "p6-column",
      slug: "p6-item-create-published",
      contentVersion: 1,
    });
  });

  it("archived→published 重新上架写 publish 事件", async () => {
    const post = await postRepo.create({
      slug: "p6-republish",
      title: "重新上架",
      contentMarkdown: "body",
      categoryId: catAId,
      status: "draft",
    });
    await postRepo.changeStatus(post.id, 1, "published");
    await postRepo.changeStatus(post.id, 2, "archived");
    await postRepo.changeStatus(post.id, 3, "published");

    const events = await eventsFor(post.id);
    expect(events.map((event) => event.operation).sort()).toEqual([
      "archive",
      "publish",
      "publish",
    ]);
    const republish = events.find(
      (event) => event.operation === "publish" &&
        event.payloadJson.contentVersion === 4
    )!;
    expect(republish.payloadJson).toEqual({
      slug: "p6-republish",
      categorySlug: "cat-a",
      contentVersion: 4,
    });
  });

  it("reorderItems 拖拽排序写 collection 的 update 事件", async () => {
    const colId = await collectionRepo.create({
      slug: "p6-reorder-col",
      name: "排序专栏",
    });
    const itemA = await itemRepo.create({
      collectionId: colId,
      slug: "p6-reorder-a",
      title: "甲",
      contentMarkdown: "a",
      status: "published",
      sortOrder: 1,
    });
    const itemB = await itemRepo.create({
      collectionId: colId,
      slug: "p6-reorder-b",
      title: "乙",
      contentMarkdown: "b",
      status: "published",
      sortOrder: 2,
    });

    await collectionRepo.reorderItems(colId, [itemB.id, itemA.id]);

    const events = await eventsFor(colId);
    // create 1 条 + reorder 1 条，均为 collection/update
    expect(events).toHaveLength(2);
    for (const event of events) {
      expect(event.entityType).toBe("collection");
      expect(event.operation).toBe("update");
      expect(event.payloadJson).toEqual({ slug: "p6-reorder-col", version: 1 });
    }
    const after = await store.listItems(colId);
    expect(after.map((item) => item.slug)).toEqual([
      "p6-reorder-b",
      "p6-reorder-a",
    ]);
  });
});
