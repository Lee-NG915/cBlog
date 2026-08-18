#!/usr/bin/env node
/**
 * repository_dispatch 触发器（STATIC-002 链路的手动/测试触发；Phase 6 起由 Outbox worker 取代）。
 *
 * 用法：
 *   GITHUB_REPOSITORY=owner/repo GITHUB_DISPATCH_TOKEN=... \
 *   node scripts/dispatch-content-published.mjs [--batch-id <id>] [--reason manual|test]
 *
 * env：GITHUB_DISPATCH_EVENT 默认 cblog-content-published。
 * client_payload 携带 batchId（默认生成随机 id），供部署 callback 关联批次。
 */
import { randomUUID } from "node:crypto";

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const repository = process.env.GITHUB_REPOSITORY?.trim();
const token = process.env.GITHUB_DISPATCH_TOKEN?.trim();
const eventType =
  process.env.GITHUB_DISPATCH_EVENT?.trim() || "cblog-content-published";
const batchId = argValue("--batch-id") ?? randomUUID();
const reason = argValue("--reason") ?? "manual";

if (!repository || !token) {
  console.error("缺少 GITHUB_REPOSITORY 或 GITHUB_DISPATCH_TOKEN");
  process.exit(2);
}
if (reason !== "manual" && reason !== "test") {
  console.error("--reason 只接受 manual|test");
  process.exit(2);
}

const response = await fetch(
  `https://api.github.com/repos/${repository}/dispatches`,
  {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: { batchId, reason },
    }),
  }
);

if (response.status !== 204) {
  console.error(`dispatch 失败 ${response.status}: ${await response.text()}`);
  process.exit(1);
}
console.log(`dispatch 已接受：event=${eventType} batchId=${batchId} reason=${reason}`);
