import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

describe("SITE_URL production contract", () => {
  it("未配置时保持现有 GitHub Pages /cBlog URL", () => {
    expect(resolveSiteUrl("")).toBe("https://lee-ng915.github.io/cBlog");
  });

  it("接受根域名或带 basePath 的绝对 URL，并移除尾斜杠", () => {
    expect(resolveSiteUrl("https://blog.example.com/")).toBe(
      "https://blog.example.com"
    );
    expect(resolveSiteUrl("https://example.github.io/cBlog/")).toBe(
      "https://example.github.io/cBlog"
    );
  });

  it("拒绝相对 URL、非 HTTP 协议及 query/hash", () => {
    expect(() => resolveSiteUrl("/cBlog")).toThrow("SITE_URL");
    expect(() => resolveSiteUrl("javascript:alert(1)")).toThrow("SITE_URL");
    expect(() => resolveSiteUrl("https://example.com/?preview=1")).toThrow(
      "SITE_URL"
    );
  });
});
