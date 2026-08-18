import { describe, expect, it } from "vitest";
import { isBatchReady } from "../outbox/batch";

describe("静态驱动合批窗口判断", () => {
  const now = new Date("2026-08-18T05:00:00.000Z");

  it("窗口未到时继续等待", () => {
    expect(
      isBatchReady(new Date("2026-08-18T04:59:30.000Z"), now, 120)
    ).toBe(false);
  });

  it("窗口边界及之后可投递", () => {
    expect(
      isBatchReady(new Date("2026-08-18T04:58:00.000Z"), now, 120)
    ).toBe(true);
    expect(
      isBatchReady(new Date("2026-08-18T04:57:59.999Z"), now, 120)
    ).toBe(true);
  });

  it("未来时间（时钟偏差）与零窗口", () => {
    expect(
      isBatchReady(new Date("2026-08-18T05:00:01.000Z"), now, 120)
    ).toBe(false);
    expect(isBatchReady(now, now, 0)).toBe(true);
  });
});
