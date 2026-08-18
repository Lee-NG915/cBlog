/**
 * /api/revalidate webhook 的 HMAC-SHA256 验签（纯函数，供 route 与单测复用）。
 *
 * 文档约定（docs/deployment/01-technical-design.md §7.3）：
 *   X-CBlog-Signature: sha256=<hex-hmac>
 *   签名覆盖 "<timestamp>.<keyId>.<rawBody>"（时间戳.keyId.原始请求体）
 *   时间偏差 ≤ 300 秒；常量时间比较；轮换期接受 active/previous 两个 keyId。
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_TIMESTAMP_TOLERANCE_SECONDS = 300;

export interface RevalidateSecrets {
  activeKeyId: string | undefined;
  active: string | undefined;
  previousKeyId: string | undefined;
  previous: string | undefined;
}

/** keyId → 密钥；仅命中已配置的 keyId（如 local-v1），未知 keyId 返回 undefined（route 据此 401） */
export function resolveSecret(
  secrets: RevalidateSecrets,
  keyId: string
): string | undefined {
  if (secrets.activeKeyId && keyId === secrets.activeKeyId) {
    return secrets.active;
  }
  if (secrets.previousKeyId && keyId === secrets.previousKeyId) {
    return secrets.previous;
  }
  return undefined;
}

export function computeSignature(
  secret: string,
  timestamp: string,
  keyId: string,
  rawBody: string
): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(`${timestamp}.${keyId}.${rawBody}`, "utf8");
  return `sha256=${hmac.digest("hex")}`;
}

/** 时间戳头解析：仅接受纯数字 unix 秒，非法输入返回 null */
export function parseTimestampHeader(header: string): number | null {
  if (!/^\d+$/.test(header)) return null;
  const value = Number(header);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}

export function isTimestampFresh(
  timestamp: number,
  nowSeconds: number,
  toleranceSeconds: number = SIGNATURE_TIMESTAMP_TOLERANCE_SECONDS
): boolean {
  return (
    Number.isInteger(timestamp) &&
    Math.abs(nowSeconds - timestamp) <= toleranceSeconds
  );
}

/** 常量时间比较；长度先判，避免 timingSafeEqual 对不等长输入抛错 */
export function verifySignature(options: {
  secret: string;
  timestamp: string;
  keyId: string;
  rawBody: string;
  provided: string;
}): boolean {
  const expected = computeSignature(
    options.secret,
    options.timestamp,
    options.keyId,
    options.rawBody
  );
  if (options.provided.length !== expected.length) return false;
  return timingSafeEqual(
    Buffer.from(options.provided, "utf8"),
    Buffer.from(expected, "utf8")
  );
}
