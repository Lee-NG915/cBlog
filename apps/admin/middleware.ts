import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { allowedGithubId } from "@/lib/env";

/**
 * 全站鉴权边界（AUTH-001）：
 * - /api/auth/**、/login：匿名可达（登录流程本身）；
 * - /api/v1/public/**：匿名可达，published-only（handler 内再做 flag/token 校验）；
 * - 其余全部（Admin 页面、/api/v1/admin/**、/api/v1/internal/**、/api/assets）要求会话，
 *   且会话 githubId 必须仍命中 allowlist（AUTH-002/003：allowlist 轮换后陈旧 JWT 立即失效，
 *   页面与 GET 读路径同样拦截，写路径另有 requireAdminSession 二次校验）。
 * API 返回 401 JSON；页面重定向 /login。
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname.startsWith("/api/auth/") ||
    pathname === "/login" ||
    pathname.startsWith("/api/v1/public/");
  if (isPublic) return NextResponse.next();

  const githubId = (
    request.auth?.user as { githubId?: string } | undefined
  )?.githubId;
  let allowed = "";
  try {
    allowed = allowedGithubId();
  } catch {
    allowed = ""; // 配置缺失时 fail-closed
  }
  if (!request.auth || !githubId || githubId !== allowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "未登录" } },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
