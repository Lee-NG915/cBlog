import type { ContentStatus } from "../../domain/status";
import type { PostgresDbHandle } from "./client";
import { publicationEvents } from "./schema";

/**
 * 部署态 v2 Phase 6：publication_events 事务写入（技术设计 §6.4）。
 *
 * 规则：只有影响公开视图的事务才创建事件——draft 保存不创建；draft/archived→published
 * 为 publish（archived→published 是重新上架）；published 内容/元数据修改为 update；
 * published→draft/archived 为 unpublish/archive；删除 published 内容为 delete
 * （删除 draft 不创建）。业务写入与事件插入必须复用同一个 db.transaction。
 *
 * payload 与 webhook 接收端 parseRevalidateEvent（apps/web/lib/revalidate/plan.ts）
 * 的输入同构：payload 本身不含 schemaVersion/entityType/operation（它们是行级字段），
 * webhook driver 转发时拼装 {schemaVersion, eventId, entityType, operation, occurredAt, ...payload}。
 */

/** db.transaction 回调收到的事务句柄类型 */
export type PostgresTx = Parameters<
  Parameters<PostgresDbHandle["db"]["transaction"]>[0]
>[0];

export type PublicationOperation =
  (typeof publicationEvents.$inferInsert)["operation"];

export type PublicationEntityType =
  (typeof publicationEvents.$inferInsert)["entityType"];

/** 各 entityType 的 payload 构造输入（判别联合）；与 parseRevalidateEvent 的字段一一对应 */
export type PublicationPayloadInput =
  | {
      entityType: "post";
      slug: string;
      categorySlug: string;
      /** 移动分类时为旧分类 slug；未移动时省略 */
      previousCategorySlug?: string;
      /** 变更后的新 content version */
      contentVersion: number;
    }
  | {
      entityType: "category";
      slug: string;
      previousSlug?: string;
      version: number;
    }
  | {
      entityType: "tag";
      name: string;
      previousName?: string;
      version: number;
    }
  | {
      entityType: "collection";
      slug: string;
      previousSlug?: string;
      version: number;
    }
  | {
      entityType: "collection_item";
      collectionSlug: string;
      slug: string;
      contentVersion: number;
    }
  | { entityType: "site"; version: number };

/** 构造 payloadJson：只包含 parseRevalidateEvent 识别的业务字段，可选字段为 undefined 时省略 */
export function buildPublicationPayload(
  input: PublicationPayloadInput
): Record<string, unknown> {
  switch (input.entityType) {
    case "post": {
      const payload: Record<string, unknown> = {
        slug: input.slug,
        categorySlug: input.categorySlug,
        contentVersion: input.contentVersion,
      };
      if (input.previousCategorySlug !== undefined) {
        payload.previousCategorySlug = input.previousCategorySlug;
      }
      return payload;
    }
    case "category": {
      const payload: Record<string, unknown> = {
        slug: input.slug,
        version: input.version,
      };
      if (input.previousSlug !== undefined) {
        payload.previousSlug = input.previousSlug;
      }
      return payload;
    }
    case "tag": {
      const payload: Record<string, unknown> = {
        name: input.name,
        version: input.version,
      };
      if (input.previousName !== undefined) {
        payload.previousName = input.previousName;
      }
      return payload;
    }
    case "collection": {
      const payload: Record<string, unknown> = {
        slug: input.slug,
        version: input.version,
      };
      if (input.previousSlug !== undefined) {
        payload.previousSlug = input.previousSlug;
      }
      return payload;
    }
    case "collection_item":
      return {
        collectionSlug: input.collectionSlug,
        slug: input.slug,
        contentVersion: input.contentVersion,
      };
    case "site":
      return { version: input.version };
  }
}

export interface InsertPublicationEventInput {
  entityType: PublicationEntityType;
  /** 内容实体 uuid（post/collection_item 行 id；category/collection 事件存对应行 id；可空） */
  entityId?: string | null;
  operation: PublicationOperation;
  payload: Record<string, unknown>;
}

/**
 * 在传入事务内插入一条 publication_events 行（status 走默认 pending）。
 * 必须由业务写路径在业务写入的同一事务内调用，保证同事务提交/回滚。
 */
export async function insertPublicationEvent(
  tx: PostgresTx,
  input: InsertPublicationEventInput
): Promise<string> {
  const [row] = await tx
    .insert(publicationEvents)
    .values({
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      operation: input.operation,
      payloadJson: input.payload,
    })
    .returning({ id: publicationEvents.id });
  console.info(
    JSON.stringify({
      metric: "publication_event_staged",
      eventId: row.id,
      entityType: input.entityType,
      operation: input.operation,
    })
  );
  return row.id;
}

/**
 * 状态流转到事件 operation 的映射（§6.4）：
 * draft→published=publish；archived→published=publish（重新上架，ISR-015）；
 * published→draft=unpublish；published→archived=archive；其余流转返回 null，不创建事件。
 */
export function operationForStatusChange(
  from: ContentStatus,
  to: ContentStatus
): PublicationOperation | null {
  if (to === "published" && (from === "draft" || from === "archived")) {
    return "publish";
  }
  if (from === "published" && to === "draft") return "unpublish";
  if (from === "published" && to === "archived") return "archive";
  return null;
}
