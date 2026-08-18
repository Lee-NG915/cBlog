import { createHash } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import type { PostgresDbHandle } from "../db/postgres/client";
import {
  assets,
  categories,
  collectionItems,
  collections,
  contentMigrationRuns,
  contentRevisions,
  posts,
  postTags,
  tags,
} from "../db/postgres/schema";
import { calculateNoteReadingTime } from "../utils/notes";
import { calculateReadingTime } from "../utils/text";
import type { MigrationAssetStore } from "./assets";
import type {
  MigrationApplyReport,
  MigrationCounts,
  MigrationDifference,
  MigrationSnapshot,
  MigrationVerifyReport,
} from "./types";

const RUN_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,127}$/;

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function migrationTargetName(connectionString: string): string {
  const url = new URL(connectionString);
  const database = url.pathname.replace(/^\//, "");
  return `${url.hostname}:${url.port || "5432"}/${database}`;
}

export function assertConfirmedMigrationTarget(
  connectionString: string,
  confirmation: string | undefined
): void {
  const target = migrationTargetName(connectionString);
  if (!confirmation || confirmation !== target) {
    throw new Error(
      `迁移 apply 需要显式确认目标；请设置 CBLOG_MIGRATION_CONFIRM_TARGET=${target}`
    );
  }
}

function statusCounts(snapshot: MigrationSnapshot) {
  const result = { draft: 0, published: 0, archived: 0 };
  for (const entity of [...snapshot.posts, ...snapshot.collectionItems]) {
    result[entity.status] += 1;
  }
  return result;
}

function sourceCounts(snapshot: MigrationSnapshot): MigrationCounts {
  return {
    categories: snapshot.categories.length,
    posts: snapshot.posts.length,
    tags: snapshot.tags.length,
    collections: snapshot.collections.length,
    collectionItems: snapshot.collectionItems.length,
    assets: snapshot.assets.length,
    revisions: snapshot.posts.length + snapshot.collectionItems.length,
  };
}

export async function applyMigrationSnapshot(
  handle: PostgresDbHandle,
  snapshot: MigrationSnapshot,
  options: { runId: string; assetStore: MigrationAssetStore }
): Promise<MigrationApplyReport> {
  if (!RUN_ID_PATTERN.test(options.runId)) {
    throw new Error("migration run id 只允许 3-128 位字母、数字、点、下划线和连字符");
  }
  if (snapshot.unresolvedAssets.length > 0) {
    throw new Error(
      `存在 ${snapshot.unresolvedAssets.length} 个未解析本地资产，拒绝 apply`
    );
  }

  const [existingRun] = await handle.db
    .select()
    .from(contentMigrationRuns)
    .where(eq(contentMigrationRuns.runId, options.runId))
    .limit(1);
  if (existingRun) {
    if (existingRun.sourceDigest !== snapshot.sourceDigest) {
      throw new Error(
        `run id ${options.runId} 已用于不同 source digest，拒绝复用`
      );
    }
    for (const asset of snapshot.assets) await options.assetStore.put(asset);
    return {
      ...(existingRun.reportJson as unknown as MigrationApplyReport),
      replayed: true,
    };
  }

  // 文件对象使用 content-addressed key，可在数据库事务前安全幂等重试。
  for (const asset of snapshot.assets) await options.assetStore.put(asset);

  return handle.db.transaction(async (tx) => {
    const categoryIds = new Map<string, string>();
    for (const category of snapshot.categories) {
      const [row] = await tx
        .insert(categories)
        .values(category)
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: category.name,
            description: category.description,
            sortOrder: category.sortOrder,
            updatedAt: category.updatedAt,
          },
        })
        .returning({ id: categories.id });
      categoryIds.set(category.slug, row.id);
    }

    const collectionIds = new Map<string, string>();
    for (const collection of snapshot.collections) {
      const [row] = await tx
        .insert(collections)
        .values(collection)
        .onConflictDoUpdate({
          target: collections.slug,
          set: {
            name: collection.name,
            description: collection.description,
            label: collection.label,
            badge: collection.badge,
            noindex: collection.noindex,
            sortOrder: collection.sortOrder,
            updatedAt: collection.updatedAt,
          },
        })
        .returning({ id: collections.id });
      collectionIds.set(collection.slug, row.id);
    }

    const assetIds = new Map<string, string>();
    for (const asset of snapshot.assets) {
      const [row] = await tx
        .insert(assets)
        .values({
          id: asset.id,
          objectKey: asset.objectKey,
          originalName: asset.originalName,
          mimeType: asset.mimeType,
          byteSize: asset.byteSize,
          sha256: asset.sha256,
          publicUrl: asset.publicUrl,
        })
        .onConflictDoUpdate({
          target: assets.sha256,
          set: {
            objectKey: asset.objectKey,
            originalName: asset.originalName,
            mimeType: asset.mimeType,
            byteSize: asset.byteSize,
            publicUrl: asset.publicUrl,
          },
        })
        .returning({ id: assets.id });
      assetIds.set(asset.id, row.id);
    }

    // onConflictDoNothing：重放/新 run 不触碰既有 tag 行，保证 apply 对已存在数据无副作用
    const tagIds = new Map<string, string>();
    for (const name of snapshot.tags) {
      const [inserted] = await tx
        .insert(tags)
        .values({ name })
        .onConflictDoNothing({ target: tags.name })
        .returning({ id: tags.id });
      if (inserted) {
        tagIds.set(name, inserted.id);
        continue;
      }
      const [existing] = await tx
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.name, name))
        .limit(1);
      if (!existing) throw new Error(`标签写入失败: ${name}`);
      tagIds.set(name, existing.id);
    }

    for (const post of snapshot.posts) {
      const categoryId = categoryIds.get(post.categorySlug);
      if (!categoryId) throw new Error(`迁移分类不存在: ${post.categorySlug}`);
      const [existing] = await tx
        .select()
        .from(posts)
        .where(eq(posts.slug, post.slug))
        .limit(1);
      if (existing && existing.legacySourcePath !== post.legacySourcePath) {
        throw new Error(
          `目标文章 slug 冲突: ${post.slug} (${existing.legacySourcePath ?? "非迁移数据"})`
        );
      }
      const version = existing ? existing.version + 1 : 1;
      const coverAssetId = post.coverAssetId
        ? assetIds.get(post.coverAssetId) ?? null
        : null;
      const values = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        contentMarkdown: post.contentMarkdown,
        contentHash: post.contentHash,
        status: post.status,
        categoryId,
        coverAssetId,
        coverExternalUrl: post.coverExternalUrl,
        readingMinutes: calculateReadingTime(post.contentMarkdown),
        editorialDate: post.editorialDate,
        publishedAt: post.publishedAt,
        version,
        legacySourcePath: post.legacySourcePath,
        createdAt: existing?.createdAt ?? post.createdAt,
        updatedAt: post.updatedAt,
      };
      const [persisted] = existing
        ? await tx
            .update(posts)
            .set(values)
            .where(eq(posts.id, existing.id))
            .returning({ id: posts.id })
        : await tx.insert(posts).values(values).returning({ id: posts.id });

      await tx.delete(postTags).where(eq(postTags.postId, persisted.id));
      if (post.tags.length > 0) {
        await tx.insert(postTags).values(
          post.tags.map((name, position) => {
            const tagId = tagIds.get(name);
            if (!tagId) throw new Error(`迁移标签不存在: ${name}`);
            return { postId: persisted.id, tagId, position };
          })
        );
      }
      await tx.insert(contentRevisions).values({
        entityType: "post",
        postId: persisted.id,
        collectionItemId: null,
        version,
        contentMarkdown: post.contentMarkdown,
        contentHash: post.contentHash,
        metadataSnapshot: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          status: post.status,
          categoryId,
          coverAssetId,
          coverExternalUrl: post.coverExternalUrl,
          editorialDate: post.editorialDate,
          tags: post.tags,
          legacySourcePath: post.legacySourcePath,
          sourceContentHash: post.sourceContentHash,
        },
        createdAt: post.updatedAt ?? post.createdAt,
      });
    }

    for (const item of snapshot.collectionItems) {
      const collectionId = collectionIds.get(item.collectionSlug);
      if (!collectionId) {
        throw new Error(`迁移专栏不存在: ${item.collectionSlug}`);
      }
      const [existing] = await tx
        .select()
        .from(collectionItems)
        .where(
          and(
            eq(collectionItems.collectionId, collectionId),
            eq(collectionItems.slug, item.slug)
          )
        )
        .limit(1);
      if (existing && existing.legacySourcePath !== item.legacySourcePath) {
        throw new Error(
          `目标专栏文档 slug 冲突: ${item.collectionSlug}/${item.slug}`
        );
      }
      const version = existing ? existing.version + 1 : 1;
      const values = {
        collectionId,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        contentMarkdown: item.contentMarkdown,
        contentHash: item.contentHash,
        status: item.status,
        sortOrder: item.sortOrder,
        readingMinutes: calculateNoteReadingTime(item.contentMarkdown),
        version,
        legacySourcePath: item.legacySourcePath,
        createdAt: existing?.createdAt ?? item.createdAt,
        updatedAt: item.updatedAt,
      };
      const [persisted] = existing
        ? await tx
            .update(collectionItems)
            .set(values)
            .where(eq(collectionItems.id, existing.id))
            .returning({ id: collectionItems.id })
        : await tx
            .insert(collectionItems)
            .values(values)
            .returning({ id: collectionItems.id });
      await tx.insert(contentRevisions).values({
        entityType: "collection_item",
        postId: null,
        collectionItemId: persisted.id,
        version,
        contentMarkdown: item.contentMarkdown,
        contentHash: item.contentHash,
        metadataSnapshot: {
          collectionId,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          status: item.status,
          sortOrder: item.sortOrder,
          legacySourcePath: item.legacySourcePath,
          sourceContentHash: item.sourceContentHash,
        },
        createdAt: item.updatedAt,
      });
    }

    const appliedAt = new Date().toISOString();
    const report: MigrationApplyReport = {
      runId: options.runId,
      sourceDigest: snapshot.sourceDigest,
      replayed: false,
      appliedAt,
      counts: sourceCounts(snapshot),
      statusCounts: statusCounts(snapshot),
      assetReferenceCount: snapshot.assets.reduce(
        (total, asset) => total + asset.referenceCount,
        0
      ),
      unresolvedAssets: snapshot.unresolvedAssets,
      remoteAssets: snapshot.remoteAssets,
      publishedAtRule: snapshot.publishedAtRule,
      publishedWithoutEditorialDate: snapshot.posts.filter(
        (post) => post.status === "published" && post.editorialDate === null
      ).length,
    };
    await tx.insert(contentMigrationRuns).values({
      runId: options.runId,
      sourceDigest: snapshot.sourceDigest,
      reportJson: report as unknown as Record<string, unknown>,
      appliedAt,
    });
    return report;
  });
}

function compare(
  differences: MigrationDifference[],
  entity: string,
  key: string,
  field: string,
  expected: unknown,
  actual: unknown
): void {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    differences.push({ entity, key, field, expected, actual });
  }
}

function normalizedTimestamp(value: string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

export async function verifyMigrationSnapshot(
  handle: PostgresDbHandle,
  snapshot: MigrationSnapshot
): Promise<MigrationVerifyReport> {
  const differences: MigrationDifference[] = [];
  const [
    categoryRows,
    postRows,
    tagRows,
    allTagRows,
    collectionRows,
    itemRows,
    assetRows,
    runRows,
    revisionRows,
  ] =
    await Promise.all([
      handle.db.select().from(categories),
      handle.db.select().from(posts),
      handle.db
        .select({
          postId: postTags.postId,
          name: tags.name,
          position: postTags.position,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .orderBy(asc(postTags.position)),
      handle.db.select({ name: tags.name }).from(tags),
      handle.db.select().from(collections),
      handle.db.select().from(collectionItems),
      handle.db.select().from(assets),
      handle.db.select().from(contentMigrationRuns),
      handle.db.select().from(contentRevisions),
    ]);
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const collectionById = new Map(collectionRows.map((row) => [row.id, row]));
  const assetById = new Map(assetRows.map((row) => [row.id, row]));
  const postBySource = new Map(postRows.map((row) => [row.legacySourcePath, row]));
  const itemBySource = new Map(itemRows.map((row) => [row.legacySourcePath, row]));
  const revisionByEntityVersion = new Map(
    revisionRows.map((row) => [
      row.postId
        ? `post:${row.postId}:${row.version}`
        : `collection_item:${row.collectionItemId}:${row.version}`,
      row,
    ])
  );
  const tagsByPost = new Map<string, string[]>();
  for (const row of tagRows) {
    tagsByPost.set(row.postId, [...(tagsByPost.get(row.postId) ?? []), row.name]);
  }

  const actualCounts: MigrationCounts = {
    categories: categoryRows.length,
    posts: postRows.length,
    tags: allTagRows.length,
    collections: collectionRows.length,
    collectionItems: itemRows.length,
    assets: assetRows.length,
    revisions: revisionRows.length,
  };
  const expectedCounts = sourceCounts(snapshot);
  for (const key of Object.keys(expectedCounts) as (keyof MigrationCounts)[]) {
    compare(differences, "dataset", "counts", key, expectedCounts[key], actualCounts[key]);
  }

  compare(
    differences,
    "migration_run",
    "source-digest",
    "matched",
    true,
    runRows.some((run) => run.sourceDigest === snapshot.sourceDigest)
  );

  compare(
    differences,
    "tag",
    "name-set",
    "names",
    [...snapshot.tags].sort(),
    allTagRows.map((row) => row.name).sort()
  );

  const categoryBySlug = new Map(categoryRows.map((row) => [row.slug, row]));
  for (const expected of snapshot.categories) {
    const actual = categoryBySlug.get(expected.slug);
    compare(differences, "category", expected.slug, "name", expected.name, actual?.name);
    compare(
      differences,
      "category",
      expected.slug,
      "description",
      expected.description,
      actual?.description
    );
    compare(
      differences,
      "category",
      expected.slug,
      "sortOrder",
      expected.sortOrder,
      actual?.sortOrder
    );
  }

  const collectionBySlug = new Map(collectionRows.map((row) => [row.slug, row]));
  for (const expected of snapshot.collections) {
    const actual = collectionBySlug.get(expected.slug);
    compare(differences, "collection", expected.slug, "name", expected.name, actual?.name);
    compare(
      differences,
      "collection",
      expected.slug,
      "description",
      expected.description,
      actual?.description
    );
    compare(
      differences,
      "collection",
      expected.slug,
      "label",
      expected.label,
      actual?.label
    );
    compare(
      differences,
      "collection",
      expected.slug,
      "badge",
      expected.badge,
      actual?.badge
    );
    compare(
      differences,
      "collection",
      expected.slug,
      "sortOrder",
      expected.sortOrder,
      actual?.sortOrder
    );
    compare(
      differences,
      "collection",
      expected.slug,
      "noindex",
      expected.noindex,
      actual?.noindex
    );
  }

  for (const expected of snapshot.posts) {
    const actual = postBySource.get(expected.legacySourcePath);
    if (!actual) {
      differences.push({
        entity: "post",
        key: expected.slug,
        field: "missing",
        expected: true,
        actual: false,
      });
      continue;
    }
    compare(differences, "post", expected.slug, "slug", expected.slug, actual.slug);
    compare(differences, "post", expected.slug, "title", expected.title, actual.title);
    compare(differences, "post", expected.slug, "excerpt", expected.excerpt, actual.excerpt);
    compare(differences, "post", expected.slug, "status", expected.status, actual.status);
    compare(
      differences,
      "post",
      expected.slug,
      "category",
      expected.categorySlug,
      categoryById.get(actual.categoryId)?.slug
    );
    compare(differences, "post", expected.slug, "contentHash", expected.contentHash, actual.contentHash);
    // 对 DB 正文重算 SHA-256：检出"正文被改而 hash 字段未动"的目标库漂移（DATA-003/006）
    compare(
      differences,
      "post",
      expected.slug,
      "contentMarkdownSha256",
      expected.contentHash,
      sha256Hex(actual.contentMarkdown)
    );
    compare(
      differences,
      "post",
      expected.slug,
      "createdAt",
      normalizedTimestamp(expected.createdAt),
      normalizedTimestamp(actual.createdAt)
    );
    compare(
      differences,
      "post",
      expected.slug,
      "updatedAt",
      normalizedTimestamp(expected.updatedAt),
      normalizedTimestamp(actual.updatedAt)
    );
    compare(
      differences,
      "post",
      expected.slug,
      "editorialDate",
      normalizedTimestamp(expected.editorialDate),
      normalizedTimestamp(actual.editorialDate)
    );
    compare(
      differences,
      "post",
      expected.slug,
      "publishedAt",
      normalizedTimestamp(expected.publishedAt),
      normalizedTimestamp(actual.publishedAt)
    );
    compare(differences, "post", expected.slug, "tags", expected.tags, tagsByPost.get(actual.id) ?? []);
    compare(
      differences,
      "post",
      expected.slug,
      "coverExternalUrl",
      expected.coverExternalUrl,
      actual.coverExternalUrl
    );
    compare(
      differences,
      "post",
      expected.slug,
      "coverAssetSha256",
      expected.coverAssetId
        ? snapshot.assets.find((asset) => asset.id === expected.coverAssetId)?.sha256
        : null,
      actual.coverAssetId ? assetById.get(actual.coverAssetId)?.sha256 : null
    );
    const revision = revisionByEntityVersion.get(
      `post:${actual.id}:${actual.version}`
    );
    compare(
      differences,
      "post",
      expected.slug,
      "sourceContentHashAudit",
      expected.sourceContentHash,
      revision?.metadataSnapshot.sourceContentHash
    );
    compare(
      differences,
      "post",
      expected.slug,
      "revisionContentSha256",
      expected.contentHash,
      revision ? sha256Hex(revision.contentMarkdown) : undefined
    );
  }

  for (const expected of snapshot.collectionItems) {
    const actual = itemBySource.get(expected.legacySourcePath);
    const key = `${expected.collectionSlug}/${expected.slug}`;
    if (!actual) {
      differences.push({ entity: "collection_item", key, field: "missing", expected: true, actual: false });
      continue;
    }
    compare(differences, "collection_item", key, "slug", expected.slug, actual.slug);
    compare(differences, "collection_item", key, "title", expected.title, actual.title);
    compare(differences, "collection_item", key, "excerpt", expected.excerpt, actual.excerpt);
    compare(differences, "collection_item", key, "status", expected.status, actual.status);
    compare(differences, "collection_item", key, "sortOrder", expected.sortOrder, actual.sortOrder);
    compare(differences, "collection_item", key, "contentHash", expected.contentHash, actual.contentHash);
    compare(
      differences,
      "collection_item",
      key,
      "contentMarkdownSha256",
      expected.contentHash,
      sha256Hex(actual.contentMarkdown)
    );
    compare(
      differences,
      "collection_item",
      key,
      "createdAt",
      normalizedTimestamp(expected.createdAt),
      normalizedTimestamp(actual.createdAt)
    );
    compare(
      differences,
      "collection_item",
      key,
      "updatedAt",
      normalizedTimestamp(expected.updatedAt),
      normalizedTimestamp(actual.updatedAt)
    );
    compare(
      differences,
      "collection_item",
      key,
      "collection",
      expected.collectionSlug,
      collectionById.get(actual.collectionId)?.slug
    );
    const revision = revisionByEntityVersion.get(
      `collection_item:${actual.id}:${actual.version}`
    );
    compare(
      differences,
      "collection_item",
      key,
      "sourceContentHashAudit",
      expected.sourceContentHash,
      revision?.metadataSnapshot.sourceContentHash
    );
    compare(
      differences,
      "collection_item",
      key,
      "revisionContentSha256",
      expected.contentHash,
      revision ? sha256Hex(revision.contentMarkdown) : undefined
    );
  }

  compare(
    differences,
    "asset",
    "sha256-set",
    "sha256",
    snapshot.assets.map((asset) => asset.sha256).sort(),
    assetRows.map((asset) => asset.sha256).sort()
  );

  const assetBySha = new Map(assetRows.map((asset) => [asset.sha256, asset]));
  for (const expected of snapshot.assets) {
    const actual = assetBySha.get(expected.sha256);
    compare(
      differences,
      "asset",
      expected.sha256,
      "objectKey",
      expected.objectKey,
      actual?.objectKey
    );
    compare(
      differences,
      "asset",
      expected.sha256,
      "publicUrl",
      expected.publicUrl,
      actual?.publicUrl
    );
    compare(
      differences,
      "asset",
      expected.sha256,
      "byteSize",
      expected.byteSize,
      actual?.byteSize
    );
  }

  return {
    sourceDigest: snapshot.sourceDigest,
    ok: differences.length === 0,
    counts: actualCounts,
    differences,
  };
}
