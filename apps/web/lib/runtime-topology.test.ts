import { describe, expect, it } from "vitest";

const { validateRuntimeTopology } = require("../next.config.js") as {
  validateRuntimeTopology: (
    renderMode: string,
    replicasValue?: string
  ) => void;
};

describe("ISR-011 runtime topology guard", () => {
  it("static profile 不受 runtime 副本配置影响", () => {
    expect(() =>
      validateRuntimeTopology("static-export", "3")
    ).not.toThrow();
  });

  it("runtime 必须显式声明单副本", () => {
    expect(() =>
      validateRuntimeTopology("runtime-isr", undefined)
    ).toThrow("显式设置");
    expect(() =>
      validateRuntimeTopology("runtime-isr", "1")
    ).not.toThrow();
  });

  it("共享 Cache Handler 未落地前拒绝所有多副本及非法数字", () => {
    expect(() =>
      validateRuntimeTopology("runtime-isr", "2")
    ).toThrow("仅允许");
    expect(() =>
      validateRuntimeTopology("runtime-isr", "1.5")
    ).toThrow("正整数");
    expect(() =>
      validateRuntimeTopology("runtime-isr", "2pods")
    ).toThrow("正整数");
  });
});
