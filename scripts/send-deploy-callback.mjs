#!/usr/bin/env node
/**
 * 部署结果签名 callback 发送器（STATIC-006 链路，deploy.yml callback job 与本地端到端验证共用）。
 *
 * 用法：
 *   DEPLOY_CALLBACK_URL=http://127.0.0.1:3101/api/v1/internal/deployments/callback \
 *   DEPLOY_CALLBACK_SECRET=... \
 *   node scripts/send-deploy-callback.mjs --batch-id <id> --status succeeded|failed [--detail "..."]
 *
 * 签名与 admin 端对齐：HMAC-SHA256 覆盖 `<X-CBlog-Timestamp>.<rawBody>`，
 * 头 `X-CBlog-Timestamp`（unix 秒）/ `X-CBlog-Signature: sha256=<hex>`。
 * 非 2xx 以非零码退出。
 */
import { createHmac } from "node:crypto";

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const url = process.env.DEPLOY_CALLBACK_URL?.trim();
const secret = process.env.DEPLOY_CALLBACK_SECRET?.trim();
const batchId = argValue("--batch-id") ?? process.env.GITHUB_RUN_ID ?? "";
const status = argValue("--status") ?? "";
const detail = argValue("--detail");

if (!url || !secret) {
  console.error("缺少 DEPLOY_CALLBACK_URL 或 DEPLOY_CALLBACK_SECRET");
  process.exit(2);
}
if (!batchId || batchId.length > 128) {
  console.error("--batch-id 必填且不超过 128 字符");
  process.exit(2);
}
if (status !== "succeeded" && status !== "failed") {
  console.error("--status 只接受 succeeded|failed");
  process.exit(2);
}

const payload = {
  batchId,
  status,
  reportedAt: new Date().toISOString(),
  ...(detail ? { detail } : {}),
};
const rawBody = JSON.stringify(payload);
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac("sha256", secret)
  .update(`${timestamp}.${rawBody}`)
  .digest("hex");

const response = await fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-cblog-timestamp": timestamp,
    "x-cblog-signature": `sha256=${signature}`,
  },
  body: rawBody,
});

const text = await response.text();
console.log(`callback ${response.status}: ${text}`);
if (!response.ok) {
  process.exit(1);
}
