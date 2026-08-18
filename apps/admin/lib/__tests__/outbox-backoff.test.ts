import { describe, expect, it } from "vitest";
import { isExhausted, nextDelayMs } from "../outbox/backoff";

describe("outbox 退避序列（REL-002）", () => {
  it("按 5s/30s/2m/10m/30m 递进", () => {
    expect(nextDelayMs(1)).toBe(5_000);
    expect(nextDelayMs(2)).toBe(30_000);
    expect(nextDelayMs(3)).toBe(120_000);
    expect(nextDelayMs(4)).toBe(600_000);
    expect(nextDelayMs(5)).toBe(1_800_000);
  });

  it("超出序列后保持 30m", () => {
    expect(nextDelayMs(6)).toBe(1_800_000);
    expect(nextDelayMs(100)).toBe(1_800_000);
  });

  it("非法 attempt 按第 1 次处理，不越界", () => {
    expect(nextDelayMs(0)).toBe(5_000);
    expect(nextDelayMs(-3)).toBe(5_000);
  });

  it("isExhausted 按 attempt >= max 判定", () => {
    expect(isExhausted(7, 8)).toBe(false);
    expect(isExhausted(8, 8)).toBe(true);
    expect(isExhausted(9, 8)).toBe(true);
  });
});
