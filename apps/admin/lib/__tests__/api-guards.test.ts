import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// api-guards 仅在写守卫中使用 requireAdminSession；本文件测公开守卫与错误封装，mock 掉避免加载 next-auth
vi.mock("@/auth", () => ({ requireAdminSession: async () => null }));

import {
  ApiError,
  consumeRateLimit,
  errorResponse,
  guardPublicApi,
  handleV1,
} from "../api-guards";

const ENV_KEYS = ["PUBLIC_CONTENT_API_ENABLED", "CONTENT_API_READ_TOKEN"];
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
});
afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

function publicRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/v1/public/posts", {
    headers,
  });
}

describe("guardPublicApi（API-002/005：flag 门控 + 只读 token 常量时间比较）", () => {
  it("flag 关闭时整个公开分区 404（不暴露存在性）", () => {
    process.env.PUBLIC_CONTENT_API_ENABLED = "false";
    const res = guardPublicApi(publicRequest());
    expect(res?.status).toBe(404);
  });

  it("未配置 read token 时匿名只读放行", () => {
    process.env.PUBLIC_CONTENT_API_ENABLED = "true";
    delete process.env.CONTENT_API_READ_TOKEN;
    expect(guardPublicApi(publicRequest())).toBeNull();
  });

  it("配置 read token 后：缺失/错误 401，正确放行", () => {
    process.env.PUBLIC_CONTENT_API_ENABLED = "true";
    process.env.CONTENT_API_READ_TOKEN = "test-read-token";
    expect(guardPublicApi(publicRequest())?.status).toBe(401);
    expect(
      guardPublicApi(
        publicRequest({ authorization: "Bearer wrong-token" })
      )?.status
    ).toBe(401);
    // 长度不同的 token 走前置分支，不触发 timingSafeEqual 抛错
    expect(
      guardPublicApi(publicRequest({ authorization: "Bearer x" }))?.status
    ).toBe(401);
    expect(
      guardPublicApi(
        publicRequest({ authorization: "Bearer test-read-token" })
      )
    ).toBeNull();
  });
});

describe("handleV1 错误封装（API-010：不泄露内部细节）", () => {
  it("ApiError 按声明的 status/code 返回", async () => {
    const res = await handleV1(() => {
      throw new ApiError(403, "GIT_PUBLISH_DISABLED", "发布已停用");
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("GIT_PUBLISH_DISABLED");
  });

  it("业务校验错误（Error 基类）原样返回 400 message", async () => {
    const res = await handleV1(() => {
      throw new Error("非法状态: bogus");
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toBe("非法状态: bogus");
  });

  it("内部异常（驱动错误等 Error 子类）返回 500 固定文案，不外抛细节", async () => {
    class FakeDriverError extends Error {}
    const res = await handleV1(() => {
      throw new FakeDriverError("connect ECONNREFUSED 10.0.0.8:5432 password=x");
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).not.toContain("ECONNREFUSED");
  });

  it("VersionConflictError 映射 409 稳定错误码（API-007）", async () => {
    class VersionConflictError extends Error {
      constructor() {
        super("版本冲突");
        this.name = "VersionConflictError";
      }
    }
    const res = await handleV1(() => {
      throw new VersionConflictError();
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe("VERSION_CONFLICT");
  });

  it("InvalidContentStatusTransitionError 映射 400 稳定错误码", async () => {
    class InvalidContentStatusTransitionError extends Error {
      constructor() {
        super("不允许的内容状态流转: draft -> archived");
        this.name = "InvalidContentStatusTransitionError";
      }
    }
    const res = await handleV1(() => {
      throw new InvalidContentStatusTransitionError();
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("畸形 JSON body（SyntaxError）映射 400 而非 500", async () => {
    const res = await handleV1(() => {
      throw new SyntaxError("Unexpected token < in JSON");
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("错误响应统一 no-store 且携带 requestId", async () => {
    const res = errorResponse(404, "NOT_FOUND", "内容不存在");
    expect(res.headers.get("cache-control")).toContain("no-store");
    const body = await res.json();
    expect(body.error.requestId).toBeTruthy();
  });
});

describe("consumeRateLimit（SEC-008 内存令牌桶）", () => {
  it("窗口内超过上限后拒绝，独立 key 互不影响", () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    expect(consumeRateLimit(key, 2)).toBe(true);
    expect(consumeRateLimit(key, 2)).toBe(true);
    expect(consumeRateLimit(key, 2)).toBe(false);
    expect(consumeRateLimit(`${key}:other`, 2)).toBe(true);
  });
});
