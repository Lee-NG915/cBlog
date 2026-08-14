import fs from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { getDb, type DbHandle } from "../db/client";
import { collectionItems, collections, type PostStatus } from "../db/schema";
import {
  assertValidCollectionSlug,
  assertValidSlug,
  contentAbsPath,
  contentRoot,
} from "../paths";
import { parseMarkdown, serializeMarkdown } from "../content/frontmatter";
import { moveToTrash, writeFileAtomic } from "../content/files";
import { getNoteExcerpt } from "../utils/notes";
import { nowIso } from "../utils/text";

export interface CreateCollectionInput {
  slug: string;
  name: string;
  description?: string;
  label?: string;
  badge?: string;
  noindex?: boolean;
}

/** 新建专栏：保留字校验 + 入库 + 自动创建 content/collections/<slug>/（FR-5.1） */
export function createCollection(
  input: CreateCollectionInput,
  handle: DbHandle = getDb()
): number {
  const slug = input.slug.trim();
  const name = input.name.trim();
  assertValidCollectionSlug(slug);
  if (!name) throw new Error("专栏名称不能为空");

  const existing = handle.db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.slug, slug))
    .get();
  if (existing) throw new Error(`专栏 slug 已存在: ${slug}`);

  const maxRow = handle.db
    .select({ max: sql<number>`max(sort_order)` })
    .from(collections)
    .get();
  const now = nowIso();
  const inserted = handle.db
    .insert(collections)
    .values({
      slug,
      name,
      description: input.description?.trim() || "",
      label: input.label?.trim() || "Collection",
      badge: input.badge?.trim() || null,
      noindex: input.noindex === false ? 0 : 1,
      sortOrder: (maxRow?.max ?? -1) + 1,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: collections.id })
    .get();

  fs.mkdirSync(path.join(contentRoot(), "collections", slug), {
    recursive: true,
  });
  return inserted!.id;
}

export interface UpdateCollectionPatch {
  name?: string;
  description?: string;
  label?: string;
  badge?: string | null;
  noindex?: boolean;
  sortOrder?: number;
}

export function updateCollection(
  id: number,
  patch: UpdateCollectionPatch,
  handle: DbHandle = getDb()
): void {
  const row = handle.db.select().from(collections).where(eq(collections.id, id)).get();
  if (!row) throw new Error(`专栏不存在: id=${id}`);

  handle.db
    .update(collections)
    .set({
      name: patch.name?.trim() || row.name,
      description: patch.description ?? row.description,
      label: patch.label?.trim() || row.label,
      badge: patch.badge === undefined ? row.badge : patch.badge?.trim() || null,
      noindex:
        patch.noindex === undefined ? row.noindex : patch.noindex ? 1 : 0,
      sortOrder: patch.sortOrder ?? row.sortOrder,
      updatedAt: nowIso(),
    })
    .where(eq(collections.id, id))
    .run();
}

export function deleteCollection(id: number, handle: DbHandle = getDb()): void {
  const row = handle.db.select().from(collections).where(eq(collections.id, id)).get();
  if (!row) throw new Error(`专栏不存在: id=${id}`);

  const count = handle.db
    .select({ count: sql<number>`count(*)` })
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, id))
    .get();
  if ((count?.count ?? 0) > 0) {
    throw new Error(`专栏下还有 ${count!.count} 个文档，不可删除`);
  }

  handle.db.delete(collections).where(eq(collections.id, id)).run();

  const dir = path.join(contentRoot(), "collections", row.slug);
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

function getItemOrThrow(handle: DbHandle, id: number) {
  const row = handle.db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.id, id))
    .get();
  if (!row) throw new Error(`专栏文档不存在: id=${id}`);
  return row;
}

export interface CreateCollectionItemInput {
  collectionId: number;
  title: string;
  slug: string;
}

/** 新建专栏文档：content/collections/<专栏>/<slug>.md 脚手架 + 入库（FR-5.2） */
export function createCollectionItem(
  input: CreateCollectionItemInput,
  handle: DbHandle = getDb()
): number {
  const title = input.title.trim();
  const slug = input.slug.trim();
  if (!title) throw new Error("标题不能为空");
  assertValidSlug(slug);

  const collection = handle.db
    .select()
    .from(collections)
    .where(eq(collections.id, input.collectionId))
    .get();
  if (!collection) throw new Error(`专栏不存在: id=${input.collectionId}`);

  const dup = handle.db
    .select()
    .from(collectionItems)
    .all()
    .find(
      (row) => row.collectionId === collection.id && row.slug === slug
    );
  if (dup) throw new Error(`专栏内 slug 已存在: ${slug}`);

  const maxRow = handle.db
    .select({ max: sql<number>`max(sort_order)` })
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, collection.id))
    .get();
  const sortOrder = (maxRow?.max ?? 0) + 1;

  const filePath = `collections/${collection.slug}/${slug}.md`;
  const absPath = contentAbsPath(filePath);
  if (fs.existsSync(absPath)) throw new Error(`文件已存在: ${filePath}`);

  writeFileAtomic(
    absPath,
    serializeMarkdown(
      { title, slug, order: sortOrder, status: "draft" },
      "正文从这里开始。\n"
    )
  );

  try {
    const now = nowIso();
    const inserted = handle.db
      .insert(collectionItems)
      .values({
        collectionId: collection.id,
        slug,
        title,
        excerpt: getNoteExcerpt("正文从这里开始。"),
        status: "draft",
        sortOrder,
        filePath,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: collectionItems.id })
      .get();
    return inserted!.id;
  } catch (error) {
    fs.rmSync(absPath, { force: true });
    throw error;
  }
}

export interface SaveCollectionItemPatch {
  title?: string;
  content?: string;
  sortOrder?: number;
}

/** 保存专栏文档：原子写文件 + 数据库事务，失败回滚文件 */
export function saveCollectionItem(
  id: number,
  patch: SaveCollectionItemPatch,
  handle: DbHandle = getDb()
): void {
  const row = getItemOrThrow(handle, id);
  const absPath = contentAbsPath(row.filePath);
  const oldRaw = fs.readFileSync(absPath, "utf8");
  const { data: oldData, content: oldContent } = parseMarkdown(oldRaw);

  const next = {
    title: (patch.title ?? row.title).trim(),
    content: patch.content ?? oldContent,
    sortOrder: patch.sortOrder ?? row.sortOrder,
  };
  if (!next.title) throw new Error("标题不能为空");
  const excerpt = getNoteExcerpt(next.content);

  writeFileAtomic(
    absPath,
    serializeMarkdown(
      {
        ...oldData,
        title: next.title,
        slug: row.slug,
        order: next.sortOrder,
        status: row.status,
      },
      next.content
    )
  );

  try {
    handle.db
      .update(collectionItems)
      .set({
        title: next.title,
        excerpt,
        sortOrder: next.sortOrder,
        updatedAt: nowIso(),
      })
      .where(eq(collectionItems.id, id))
      .run();
  } catch (error) {
    writeFileAtomic(absPath, oldRaw);
    throw error;
  }
}

export function setCollectionItemStatus(
  id: number,
  status: PostStatus,
  handle: DbHandle = getDb()
): void {
  const row = getItemOrThrow(handle, id);
  const absPath = contentAbsPath(row.filePath);
  const oldRaw = fs.readFileSync(absPath, "utf8");
  const { data, content } = parseMarkdown(oldRaw);

  writeFileAtomic(absPath, serializeMarkdown({ ...data, status }, content));

  try {
    handle.db
      .update(collectionItems)
      .set({ status, updatedAt: nowIso() })
      .where(eq(collectionItems.id, id))
      .run();
  } catch (error) {
    writeFileAtomic(absPath, oldRaw);
    throw error;
  }
}

export function deleteCollectionItem(
  id: number,
  handle: DbHandle = getDb()
): void {
  const row = getItemOrThrow(handle, id);
  const absPath = contentAbsPath(row.filePath);
  const trashRoot = path.join(contentRoot(), ".trash");

  handle.db.delete(collectionItems).where(eq(collectionItems.id, id)).run();
  moveToTrash(absPath, trashRoot);
}

/**
 * 拖拽排序（FR-5.2）：按传入顺序重排 sortOrder（1..n），
 * 同时回写每个文档 frontmatter 的 order 字段（FR-2.3 回写规则）。
 */
export function reorderCollectionItems(
  collectionId: number,
  orderedIds: number[],
  handle: DbHandle = getDb()
): void {
  const rows = handle.db
    .select()
    .from(collectionItems)
    .all()
    .filter((row) => row.collectionId === collectionId);
  const rowById = new Map(rows.map((row) => [row.id, row]));

  if (
    orderedIds.length !== rows.length ||
    orderedIds.some((id) => !rowById.has(id))
  ) {
    throw new Error("排序列表与专栏文档不匹配");
  }

  const now = nowIso();
  orderedIds.forEach((id, index) => {
    const row = rowById.get(id)!;
    const sortOrder = index + 1;
    if (row.sortOrder === sortOrder) return;

    const absPath = contentAbsPath(row.filePath);
    const raw = fs.readFileSync(absPath, "utf8");
    const { data, content } = parseMarkdown(raw);
    writeFileAtomic(
      absPath,
      serializeMarkdown({ ...data, order: sortOrder }, content)
    );
    handle.db
      .update(collectionItems)
      .set({ sortOrder, updatedAt: now })
      .where(eq(collectionItems.id, id))
      .run();
  });
}
