/**
 * generic-build-hook 驱动（static-export 链路）：通用平台构建钩子。
 * POST JSON {batchId}（可选 Bearer）；2xx → awaiting_deploy，externalId = batchId。
 * 平台构建完成后须以同一 batchId 回调部署 callback（STATIC-006 幂等键）。
 */
import { randomUUID } from "node:crypto";
import type { DeliverFn } from "./types";

export interface GenericBuildHookConfig {
  url: string;
  bearerToken?: string;
  requestTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export function createGenericBuildHookDeliver(
  config: GenericBuildHookConfig
): DeliverFn {
  const fetchImpl = config.fetchImpl ?? fetch;
  return async (_event, options) => {
    const batchId = options?.externalId ?? randomUUID();
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (config.bearerToken) {
      headers.authorization = `Bearer ${config.bearerToken}`;
    }
    const response = await fetchImpl(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify({ batchId }),
      signal: AbortSignal.timeout(config.requestTimeoutMs ?? 15_000),
    });
    if (!response.ok) {
      throw new Error(`generic build hook 触发失败：HTTP ${response.status}`);
    }
    return { outcome: "awaiting_deploy", externalId: batchId };
  };
}
