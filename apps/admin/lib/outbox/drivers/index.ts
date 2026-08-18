/**
 * 按 PUBLICATION_DRIVER 装配投递函数。配置缺失即抛错（worker 入口已先行校验，这里是兜底）。
 */
import {
  genericBuildHookBearerToken,
  genericBuildHookUrl,
  githubApiBaseUrl,
  githubDispatchEvent,
  githubDispatchToken,
  githubRepository,
  outboxRequestTimeoutMs,
  publicWebBaseUrl,
  revalidationActiveKeyId,
  revalidationActiveSecret,
  revalidationWebhookUrl,
  type PublicationDriver,
} from "../../env";
import { createGenericBuildHookDeliver } from "./generic-build-hook";
import { createGithubDispatchDeliver } from "./github-dispatch";
import { createRevalidationWebhookDeliver } from "./revalidation-webhook";
import type { DeliverFn } from "./types";

export type { DeliverFn, DeliverOutcome } from "./types";

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return value;
}

export function createDeliverFn(driver: PublicationDriver): DeliverFn {
  const requestTimeoutMs = outboxRequestTimeoutMs();
  if (driver === "revalidation-webhook") {
    return createRevalidationWebhookDeliver({
      url: required(revalidationWebhookUrl(), "REVALIDATION_WEBHOOK_URL"),
      keyId: required(revalidationActiveKeyId(), "REVALIDATION_ACTIVE_KEY_ID"),
      secret: required(revalidationActiveSecret(), "REVALIDATION_ACTIVE_SECRET"),
      publicWebBaseUrl: publicWebBaseUrl(),
      requestTimeoutMs,
    });
  }
  if (driver === "github-dispatch") {
    return createGithubDispatchDeliver({
      apiBaseUrl: githubApiBaseUrl(),
      repository: required(githubRepository(), "GITHUB_REPOSITORY"),
      eventType: githubDispatchEvent(),
      token: required(githubDispatchToken(), "GITHUB_DISPATCH_TOKEN"),
      requestTimeoutMs,
    });
  }
  return createGenericBuildHookDeliver({
    url: required(genericBuildHookUrl(), "GENERIC_BUILD_HOOK_URL"),
    bearerToken: genericBuildHookBearerToken(),
    requestTimeoutMs,
  });
}
