/**
 * revalidation-webhook 驱动（runtime-isr 链路）。
 * 签名格式（Phase 5 契约，逐字遵守）：HMAC-SHA256 覆盖 `<timestamp>.<keyId>.<rawBody>`，
 * 头 X-CBlog-Event-Id / X-CBlog-Timestamp / X-CBlog-Key-Id / X-CBlog-Signature: sha256=<hex>。
 * 2xx → delivered，随后 best-effort 预热公开页；非 2xx/网络错 → throw（worker 走退避）。
 */
import { createHmac, randomUUID } from "node:crypto";
import type { ClaimedEvent } from "../events";
import type { DeliverFn } from "./types";

export interface RevalidationWebhookConfig {
  url: string;
  keyId: string;
  secret: string;
  /** 可选预热基址；不设则跳过预热 */
  publicWebBaseUrl?: string;
  requestTimeoutMs?: number;
  prewarmTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export function buildWebhookBody(event: ClaimedEvent): string {
  return JSON.stringify({
    schemaVersion: event.schemaVersion,
    eventId: event.id,
    entityType: event.entityType,
    operation: event.operation,
    occurredAt: event.createdAt,
    ...event.payloadJson,
  });
}

/** 预热路径推导：仅处理带 slug 的 post / collection_item / collection，其余跳过 */
function prewarmPath(event: ClaimedEvent): string | null {
  const slug = event.payloadJson.slug;
  if (typeof slug !== "string" || !slug) return null;
  if (event.entityType === "post") return `/posts/${slug}`;
  if (event.entityType === "collection_item") {
    const collectionSlug = event.payloadJson.collectionSlug;
    return typeof collectionSlug === "string" && collectionSlug
      ? `/${collectionSlug}/${slug}`
      : null;
  }
  if (event.entityType === "collection") return `/${slug}`;
  return null;
}

export function createRevalidationWebhookDeliver(
  config: RevalidationWebhookConfig
): DeliverFn {
  const fetchImpl = config.fetchImpl ?? fetch;
  return async (event) => {
    const rawBody = buildWebhookBody(event);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac("sha256", config.secret)
      .update(`${timestamp}.${config.keyId}.${rawBody}`)
      .digest("hex");

    const response = await fetchImpl(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-CBlog-Event-Id": event.id,
        "X-CBlog-Timestamp": timestamp,
        "X-CBlog-Key-Id": config.keyId,
        "X-CBlog-Signature": `sha256=${signature}`,
      },
      body: rawBody,
      signal: AbortSignal.timeout(config.requestTimeoutMs ?? 15_000),
    });
    if (!response.ok) {
      throw new Error(
        `revalidation webhook 投递失败：HTTP ${response.status}（event ${event.id}）`
      );
    }

    // 投递成功后 best-effort 预热：失败只 log，不影响投递结果
    const path = prewarmPath(event);
    if (config.publicWebBaseUrl && path) {
      void fetchImpl(`${config.publicWebBaseUrl}${path}`, {
          method: "GET",
          headers: { "x-cblog-prewarm": randomUUID() },
          signal: AbortSignal.timeout(config.prewarmTimeoutMs ?? 5_000),
        }).catch((error) => {
        console.warn(
          `[outbox] 预热失败（忽略） ${config.publicWebBaseUrl}${path}:`,
          error instanceof Error ? error.message : error
        );
        });
    }
    return { outcome: "delivered" };
  };
}
