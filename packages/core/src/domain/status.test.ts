import { describe, expect, it } from "vitest";
import {
  assertContentStatusTransition,
  canTransitionContentStatus,
  InvalidContentStatusTransitionError,
} from "./status";

describe("内容状态机", () => {
  it("保持现有 draft/published/archived 流转", () => {
    expect(canTransitionContentStatus("draft", "published")).toBe(true);
    expect(canTransitionContentStatus("published", "draft")).toBe(true);
    expect(canTransitionContentStatus("published", "archived")).toBe(true);
    expect(canTransitionContentStatus("archived", "draft")).toBe(true);
    expect(canTransitionContentStatus("archived", "published")).toBe(true);
    expect(canTransitionContentStatus("draft", "archived")).toBe(false);
  });

  it("非法流转返回稳定领域错误", () => {
    expect(() => assertContentStatusTransition("draft", "archived")).toThrow(
      InvalidContentStatusTransitionError
    );
  });
});
