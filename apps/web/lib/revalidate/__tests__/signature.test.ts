import { describe, expect, it } from "vitest";

import {
  computeSignature,
  isTimestampFresh,
  parseTimestampHeader,
  resolveSecret,
  SIGNATURE_TIMESTAMP_TOLERANCE_SECONDS,
  verifySignature,
} from "@/lib/revalidate/signature";

const SECRET = "test-secret-active";
const SECRET_PREVIOUS = "test-secret-previous";
const BODY = JSON.stringify({
  schemaVersion: 1,
  entityType: "site",
  version: 1,
});

describe("resolveSecret", () => {
  const secrets = {
    activeKeyId: "local-v1",
    active: SECRET,
    previousKeyId: "local-v0",
    previous: SECRET_PREVIOUS,
  };

  it("配置的 active / previous keyId 映射到对应密钥", () => {
    expect(resolveSecret(secrets, "local-v1")).toBe(SECRET);
    expect(resolveSecret(secrets, "local-v0")).toBe(SECRET_PREVIOUS);
  });

  it("未知 keyId 返回 undefined", () => {
    expect(resolveSecret(secrets, "next")).toBeUndefined();
    expect(resolveSecret(secrets, "")).toBeUndefined();
  });

  it("previous 未配置时返回 undefined", () => {
    expect(
      resolveSecret(
        { activeKeyId: "local-v1", active: SECRET, previousKeyId: undefined, previous: undefined },
        "local-v0"
      )
    ).toBeUndefined();
  });
});

describe("computeSignature / verifySignature", () => {
  it("正确签名通过验证", () => {
    const signature = computeSignature(SECRET, "1755000000", "active", BODY);
    expect(signature).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(
      verifySignature({
        secret: SECRET,
        timestamp: "1755000000",
        keyId: "active",
        rawBody: BODY,
        provided: signature,
      })
    ).toBe(true);
  });

  it("签名确定：同输入同输出", () => {
    expect(computeSignature(SECRET, "1", "active", BODY)).toBe(
      computeSignature(SECRET, "1", "active", BODY)
    );
  });

  it("错误密钥 / 篡改 body / 篡改时间戳 / 错误 keyId：拒绝", () => {
    const signature = computeSignature(SECRET, "1755000000", "active", BODY);
    const base = {
      secret: SECRET,
      timestamp: "1755000000",
      keyId: "active",
      rawBody: BODY,
      provided: signature,
    };
    expect(verifySignature({ ...base, secret: "wrong" })).toBe(false);
    expect(verifySignature({ ...base, rawBody: BODY + " " })).toBe(false);
    expect(verifySignature({ ...base, timestamp: "1755000001" })).toBe(false);
    expect(verifySignature({ ...base, keyId: "previous" })).toBe(false);
  });

  it("previous key 签名的请求可用 previous 密钥验证（轮换期）", () => {
    const signature = computeSignature(
      SECRET_PREVIOUS,
      "1755000000",
      "previous",
      BODY
    );
    expect(
      verifySignature({
        secret: SECRET_PREVIOUS,
        timestamp: "1755000000",
        keyId: "previous",
        rawBody: BODY,
        provided: signature,
      })
    ).toBe(true);
  });

  it("长度不匹配的 provided：直接 false（常量时间比较前置长度判断，不抛错）", () => {
    expect(
      verifySignature({
        secret: SECRET,
        timestamp: "1755000000",
        keyId: "active",
        rawBody: BODY,
        provided: "sha256=abcd",
      })
    ).toBe(false);
    expect(
      verifySignature({
        secret: SECRET,
        timestamp: "1755000000",
        keyId: "active",
        rawBody: BODY,
        provided: "",
      })
    ).toBe(false);
  });
});

describe("parseTimestampHeader", () => {
  it("纯数字 unix 秒解析成功", () => {
    expect(parseTimestampHeader("1755000000")).toBe(1755000000);
  });

  it("非数字 / 浮点 / 负数 / 空串：null", () => {
    for (const header of ["abc", "1755000000.5", "-1", "", " 1755000000"]) {
      expect(parseTimestampHeader(header)).toBeNull();
    }
  });
});

describe("isTimestampFresh", () => {
  const now = 1_755_000_000;

  it("偏差 ≤300 秒（含边界）通过", () => {
    expect(isTimestampFresh(now, now)).toBe(true);
    expect(
      isTimestampFresh(now - SIGNATURE_TIMESTAMP_TOLERANCE_SECONDS, now)
    ).toBe(true);
    expect(
      isTimestampFresh(now + SIGNATURE_TIMESTAMP_TOLERANCE_SECONDS, now)
    ).toBe(true);
  });

  it("超出时间窗（过去与未来）拒绝", () => {
    expect(isTimestampFresh(now - 301, now)).toBe(false);
    expect(isTimestampFresh(now + 301, now)).toBe(false);
  });

  it("非整数时间戳拒绝", () => {
    expect(isTimestampFresh(now + 0.5, now)).toBe(false);
  });
});
