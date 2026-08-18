import { createHash } from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { CollectionItemEntity, PostEntity } from "../../domain/content";
import { ContentNotFoundError, VersionConflictError } from "../../domain/errors";
import {
  assertContentStatusTransition,
  type ContentStatus,
} from "../../domain/status";
import type {
  CollectionItemRepository,
  CreateCollectionItemRecordInput,
  CreatePostRecordInput,
  PostRepository,
  UpdateCollectionItemRecordInput,
  UpdatePostRecordInput,
} from "../../repo/contracts";
import { assertValidSlug } from "../../paths";
import { calculateNoteReadingTime } from "../../utils/notes";
import { calculateReadingTime } from "../../utils/text";
import type { PostgresDbHandle } from "./client";
import {
  collectionItems,
  contentRevisions,
  posts,
  postTags,
  tags,
} from "./schema";

function contentHash(markdown: string): string {
  return createHash("sha256").update(markdown).digest("hex");
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeTagNames(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function assertExclusiveCoverSources(
  coverAssetId: string | null,
  coverExternalUrl: string | null
): void {
  if (coverAssetId && coverExternalUrl) {
    throw new Error("封面只能使用本地资产或外部 URL 其中一种");
  }
  if (coverExternalUrl && !/^https?:\/\//i.test(coverExternalUrl)) {
    throw new Error("远程封面只允许 HTTP(S) URL");
  }
}

export class PostgresPostRepository implements PostRepository {
  constructor(private readonly handle: PostgresDbHandle) {}

  async create(input: CreatePostRecordInput): Promise<PostEntity> {
    const title = input.title.trim();
    if (!title) throw new Error("标题不能为空");
    assertValidSlug(input.slug);

    const markdown = input.contentMarkdown;
    const hash = contentHash(markdown);
    const createdAt = nowIso();
    const status = input.status ?? "draft";
    const tagNames = normalizeTagNames(input.tags ?? []);
    const coverAssetId = input.coverAssetId ?? null;
    const coverExternalUrl = input.coverExternalUrl ?? null;
    assertExclusiveCoverSources(coverAssetId, coverExternalUrl);

    const id = await this.handle.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(posts)
        .values({
          slug: input.slug,
          title,
          excerpt: input.excerpt ?? "",
          contentMarkdown: markdown,
          contentHash: hash,
          status,
          categoryId: input.categoryId,
          coverAssetId,
          coverExternalUrl,
          readingMinutes: calculateReadingTime(markdown),
          editorialDate: input.editorialDate ?? null,
          publishedAt: status === "published" ? createdAt : null,
          version: 1,
          createdAt,
          // 新建尚未有"最后修改"：updatedAt 置 NULL，首次保存时写入
          updatedAt: null,
        })
        .returning({ id: posts.id });

      await this.syncTags(tx, created.id, tagNames, createdAt);
      await tx.insert(contentRevisions).values({
        entityType: "post",
        postId: created.id,
        collectionItemId: null,
        version: 1,
        contentMarkdown: markdown,
        contentHash: hash,
        metadataSnapshot: {
          slug: input.slug,
          title,
          excerpt: input.excerpt ?? "",
          status,
          categoryId: input.categoryId,
          coverAssetId,
          coverExternalUrl,
          editorialDate: input.editorialDate ?? null,
          tags: tagNames,
        },
        createdAt,
      });
      return created.id;
    });

    return this.requireById(id);
  }

  async getById(id: string): Promise<PostEntity | null> {
    const [row] = await this.handle.db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async getPublishedBySlug(slug: string): Promise<PostEntity | null> {
    const [row] = await this.handle.db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
      .limit(1);
    return row ? this.toEntity(row) : null;
  }

  async listPublished(): Promise<PostEntity[]> {
    const rows = await this.handle.db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(
        sql`${posts.editorialDate} desc nulls last`,
        desc(posts.createdAt)
      );
    return Promise.all(rows.map((row) => this.toEntity(row)));
  }

  async update(
    id: string,
    input: UpdatePostRecordInput
  ): Promise<PostEntity> {
    await this.handle.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);
      if (!current) throw new ContentNotFoundError("post", id);
      if (current.version !== input.expectedVersion) {
        throw new VersionConflictError(input.expectedVersion, current.version);
      }

      const title = (input.title ?? current.title).trim();
      if (!title) throw new Error("标题不能为空");
      const markdown = input.contentMarkdown ?? current.contentMarkdown;
      const hash = contentHash(markdown);
      const updatedAt = nowIso();
      const nextVersion = current.version + 1;
      const tagNames = input.tags
        ? normalizeTagNames(input.tags)
        : await this.loadTags(tx, id);
      const coverAssetId =
        input.coverExternalUrl && input.coverAssetId === undefined
          ? null
          : input.coverAssetId === undefined
            ? current.coverAssetId
            : input.coverAssetId;
      const coverExternalUrl =
        input.coverAssetId && input.coverExternalUrl === undefined
          ? null
          : input.coverExternalUrl === undefined
            ? current.coverExternalUrl
            : input.coverExternalUrl;
      assertExclusiveCoverSources(coverAssetId, coverExternalUrl);

      const [updated] = await tx
        .update(posts)
        .set({
          title,
          excerpt: input.excerpt ?? current.excerpt,
          contentMarkdown: markdown,
          contentHash: hash,
          categoryId: input.categoryId ?? current.categoryId,
          coverAssetId,
          coverExternalUrl,
          editorialDate:
            input.editorialDate === undefined
              ? current.editorialDate
              : input.editorialDate,
          readingMinutes: calculateReadingTime(markdown),
          version: nextVersion,
          updatedAt,
        })
        .where(
          and(
            eq(posts.id, id),
            eq(posts.version, input.expectedVersion)
          )
        )
        .returning();

      if (!updated) {
        await this.throwConflictOrNotFound(tx, id, input.expectedVersion);
      }
      if (input.tags) {
        await this.syncTags(tx, id, tagNames, updatedAt);
      }
      await tx.insert(contentRevisions).values({
        entityType: "post",
        postId: id,
        collectionItemId: null,
        version: nextVersion,
        contentMarkdown: markdown,
        contentHash: hash,
        metadataSnapshot: {
          slug: current.slug,
          title,
          excerpt: input.excerpt ?? current.excerpt,
          status: current.status,
          categoryId: input.categoryId ?? current.categoryId,
          coverAssetId,
          coverExternalUrl,
          editorialDate:
            input.editorialDate === undefined
              ? current.editorialDate
              : input.editorialDate,
          tags: tagNames,
        },
        createdAt: updatedAt,
      });
    });
    return this.requireById(id);
  }

  async changeStatus(
    id: string,
    expectedVersion: number,
    status: ContentStatus
  ): Promise<PostEntity> {
    await this.handle.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);
      if (!current) throw new ContentNotFoundError("post", id);
      if (current.version !== expectedVersion) {
        throw new VersionConflictError(expectedVersion, current.version);
      }
      assertContentStatusTransition(current.status, status);
      if (current.status === status) return;

      const updatedAt = nowIso();
      const nextVersion = current.version + 1;
      const [updated] = await tx
        .update(posts)
        .set({
          status,
          publishedAt:
            status === "published" && current.publishedAt === null
              ? updatedAt
              : current.publishedAt,
          version: nextVersion,
          updatedAt,
        })
        .where(and(eq(posts.id, id), eq(posts.version, expectedVersion)))
        .returning();
      if (!updated) {
        await this.throwConflictOrNotFound(tx, id, expectedVersion);
      }

      await tx.insert(contentRevisions).values({
        entityType: "post",
        postId: id,
        collectionItemId: null,
        version: nextVersion,
        contentMarkdown: current.contentMarkdown,
        contentHash: current.contentHash,
        metadataSnapshot: {
          slug: current.slug,
          title: current.title,
          excerpt: current.excerpt,
          status,
          categoryId: current.categoryId,
          coverAssetId: current.coverAssetId,
          coverExternalUrl: current.coverExternalUrl,
          editorialDate: current.editorialDate,
          tags: await this.loadTags(tx, id),
        },
        createdAt: updatedAt,
      });
    });
    return this.requireById(id);
  }

  private async requireById(id: string): Promise<PostEntity> {
    const entity = await this.getById(id);
    if (!entity) throw new ContentNotFoundError("post", id);
    return entity;
  }

  private async toEntity(
    row: typeof posts.$inferSelect
  ): Promise<PostEntity> {
    return { ...row, tags: await this.loadTags(this.handle.db, row.id) };
  }

  private async loadTags(
    db: Pick<PostgresDbHandle["db"], "select">,
    postId: string
  ): Promise<string[]> {
    const rows = await db
      .select({ name: tags.name })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId))
      .orderBy(asc(postTags.position));
    return rows.map((row) => row.name);
  }

  private async syncTags(
    tx: Parameters<Parameters<PostgresDbHandle["db"]["transaction"]>[0]>[0],
    postId: string,
    tagNames: string[],
    updatedAt: string
  ): Promise<void> {
    await tx.delete(postTags).where(eq(postTags.postId, postId));

    // Shared tag rows are locked in a deterministic order to avoid two post
    // updates deadlocking when the submitted tag order differs.
    const tagIds = new Map<string, string>();
    for (const name of [...tagNames].sort()) {
      const [tag] = await tx
        .insert(tags)
        .values({ name, createdAt: updatedAt, updatedAt })
        .onConflictDoUpdate({
          target: tags.name,
          set: { updatedAt },
        })
        .returning({ id: tags.id });
      tagIds.set(name, tag.id);
    }

    if (tagNames.length > 0) {
      await tx.insert(postTags).values(
        tagNames.map((name, position) => {
          const tagId = tagIds.get(name);
          if (!tagId) throw new Error(`Tag 写入失败: ${name}`);
          return { postId, tagId, position };
        })
      );
    }
  }

  private async throwConflictOrNotFound(
    tx: Parameters<Parameters<PostgresDbHandle["db"]["transaction"]>[0]>[0],
    id: string,
    expectedVersion: number
  ): Promise<never> {
    const [latest] = await tx
      .select({ version: posts.version })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    if (!latest) throw new ContentNotFoundError("post", id);
    throw new VersionConflictError(expectedVersion, latest.version);
  }
}

export class PostgresCollectionItemRepository
  implements CollectionItemRepository
{
  constructor(private readonly handle: PostgresDbHandle) {}

  async create(
    input: CreateCollectionItemRecordInput
  ): Promise<CollectionItemEntity> {
    const title = input.title.trim();
    if (!title) throw new Error("标题不能为空");
    assertValidSlug(input.slug);
    const markdown = input.contentMarkdown;
    const hash = contentHash(markdown);
    const createdAt = nowIso();

    const id = await this.handle.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(collectionItems)
        .values({
          collectionId: input.collectionId,
          slug: input.slug,
          title,
          excerpt: input.excerpt ?? "",
          contentMarkdown: markdown,
          contentHash: hash,
          status: input.status ?? "draft",
          sortOrder: input.sortOrder ?? 0,
          readingMinutes: calculateNoteReadingTime(markdown),
          version: 1,
          createdAt,
          updatedAt: createdAt,
        })
        .returning({ id: collectionItems.id });
      await tx.insert(contentRevisions).values({
        entityType: "collection_item",
        postId: null,
        collectionItemId: created.id,
        version: 1,
        contentMarkdown: markdown,
        contentHash: hash,
        metadataSnapshot: {
          collectionId: input.collectionId,
          slug: input.slug,
          title,
          excerpt: input.excerpt ?? "",
          status: input.status ?? "draft",
          sortOrder: input.sortOrder ?? 0,
        },
        createdAt,
      });
      return created.id;
    });
    return this.requireById(id);
  }

  async getById(id: string): Promise<CollectionItemEntity | null> {
    const [row] = await this.handle.db
      .select()
      .from(collectionItems)
      .where(eq(collectionItems.id, id))
      .limit(1);
    return row ?? null;
  }

  async getPublished(
    collectionId: string,
    slug: string
  ): Promise<CollectionItemEntity | null> {
    const [row] = await this.handle.db
      .select()
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, collectionId),
          eq(collectionItems.slug, slug),
          eq(collectionItems.status, "published")
        )
      )
      .limit(1);
    return row ?? null;
  }

  async listPublished(collectionId: string): Promise<CollectionItemEntity[]> {
    return this.handle.db
      .select()
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, collectionId),
          eq(collectionItems.status, "published")
        )
      )
      .orderBy(asc(collectionItems.sortOrder), asc(collectionItems.title));
  }

  async update(
    id: string,
    input: UpdateCollectionItemRecordInput
  ): Promise<CollectionItemEntity> {
    await this.handle.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(collectionItems)
        .where(eq(collectionItems.id, id))
        .limit(1);
      if (!current) throw new ContentNotFoundError("collection_item", id);
      if (current.version !== input.expectedVersion) {
        throw new VersionConflictError(input.expectedVersion, current.version);
      }
      const title = (input.title ?? current.title).trim();
      if (!title) throw new Error("标题不能为空");
      const markdown = input.contentMarkdown ?? current.contentMarkdown;
      const hash = contentHash(markdown);
      const updatedAt = nowIso();
      const nextVersion = current.version + 1;

      const [updated] = await tx
        .update(collectionItems)
        .set({
          title,
          excerpt: input.excerpt ?? current.excerpt,
          contentMarkdown: markdown,
          contentHash: hash,
          sortOrder: input.sortOrder ?? current.sortOrder,
          readingMinutes: calculateNoteReadingTime(markdown),
          version: nextVersion,
          updatedAt,
        })
        .where(
          and(
            eq(collectionItems.id, id),
            eq(collectionItems.version, input.expectedVersion)
          )
        )
        .returning();
      if (!updated) {
        await this.throwConflictOrNotFound(tx, id, input.expectedVersion);
      }
      await tx.insert(contentRevisions).values({
        entityType: "collection_item",
        postId: null,
        collectionItemId: id,
        version: nextVersion,
        contentMarkdown: markdown,
        contentHash: hash,
        metadataSnapshot: {
          collectionId: current.collectionId,
          slug: current.slug,
          title,
          excerpt: input.excerpt ?? current.excerpt,
          status: current.status,
          sortOrder: input.sortOrder ?? current.sortOrder,
        },
        createdAt: updatedAt,
      });
    });
    return this.requireById(id);
  }

  async changeStatus(
    id: string,
    expectedVersion: number,
    status: ContentStatus
  ): Promise<CollectionItemEntity> {
    await this.handle.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(collectionItems)
        .where(eq(collectionItems.id, id))
        .limit(1);
      if (!current) throw new ContentNotFoundError("collection_item", id);
      if (current.version !== expectedVersion) {
        throw new VersionConflictError(expectedVersion, current.version);
      }
      assertContentStatusTransition(current.status, status);
      if (current.status === status) return;

      const updatedAt = nowIso();
      const nextVersion = current.version + 1;
      const [updated] = await tx
        .update(collectionItems)
        .set({ status, version: nextVersion, updatedAt })
        .where(
          and(eq(collectionItems.id, id), eq(collectionItems.version, expectedVersion))
        )
        .returning();
      if (!updated) {
        await this.throwConflictOrNotFound(tx, id, expectedVersion);
      }
      await tx.insert(contentRevisions).values({
        entityType: "collection_item",
        postId: null,
        collectionItemId: id,
        version: nextVersion,
        contentMarkdown: current.contentMarkdown,
        contentHash: current.contentHash,
        metadataSnapshot: {
          collectionId: current.collectionId,
          slug: current.slug,
          title: current.title,
          excerpt: current.excerpt,
          status,
          sortOrder: current.sortOrder,
        },
        createdAt: updatedAt,
      });
    });
    return this.requireById(id);
  }

  private async requireById(id: string): Promise<CollectionItemEntity> {
    const entity = await this.getById(id);
    if (!entity) throw new ContentNotFoundError("collection_item", id);
    return entity;
  }

  private async throwConflictOrNotFound(
    tx: Parameters<Parameters<PostgresDbHandle["db"]["transaction"]>[0]>[0],
    id: string,
    expectedVersion: number
  ): Promise<never> {
    const [latest] = await tx
      .select({ version: collectionItems.version })
      .from(collectionItems)
      .where(eq(collectionItems.id, id))
      .limit(1);
    if (!latest) throw new ContentNotFoundError("collection_item", id);
    throw new VersionConflictError(expectedVersion, latest.version);
  }
}
