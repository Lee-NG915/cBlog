/**
 * github-dispatch 驱动（static-export 链路）：repository_dispatch 触发构建 workflow。
 * 204 → awaiting_deploy，externalId = batchId（新 uuid）。
 * 妥协说明：repository_dispatch 响应不携带 workflow run id，
 * 真实环境由 workflow 把 client_payload.batchId 透传到部署 callback（STATIC-006 幂等键），
 * 而不是以 run_id 关联；因此这里以 batchId 作为 externalId。
 */
import { randomUUID } from "node:crypto";
import type { DeliverFn } from "./types";

export interface GithubDispatchConfig {
  apiBaseUrl: string;
  repository: string;
  eventType: string;
  token: string;
  requestTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export function createGithubDispatchDeliver(
  config: GithubDispatchConfig
): DeliverFn {
  const fetchImpl = config.fetchImpl ?? fetch;
  return async (_event, options) => {
    const batchId = options?.externalId ?? randomUUID();
    const response = await fetchImpl(
      `${config.apiBaseUrl}/repos/${config.repository}/dispatches`,
      {
        method: "POST",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${config.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          event_type: config.eventType,
          client_payload: { batchId },
        }),
        signal: AbortSignal.timeout(config.requestTimeoutMs ?? 15_000),
      }
    );
    if (response.status !== 204) {
      throw new Error(
        `github dispatch 触发失败：HTTP ${response.status}（repo ${config.repository}）`
      );
    }
    return { outcome: "awaiting_deploy", externalId: batchId };
  };
}
