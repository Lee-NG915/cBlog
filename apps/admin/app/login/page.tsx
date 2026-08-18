import { redirect } from "next/navigation";
import { requireAdminSession, signIn } from "@/auth";
import { authTestModeEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";

/** 登录页：GitHub OAuth 为唯一真实入口；测试模式额外提供显式测试身份表单 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await requireAdminSession();
  // 仅放行站内相对路径，防 open redirect（//evil.com 同样拒绝）
  const rawCallback = searchParams.callbackUrl ?? "";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/";
  if (session) redirect(callbackUrl);

  const hasGithub = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-96 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">cBlog 管理台</h1>
          <p className="mt-1 text-sm text-slate-500">
            仅允许指定 GitHub 账号登录
          </p>
        </div>

        {searchParams.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            登录失败或账号不在允许名单（{searchParams.error}）
          </p>
        )}

        {hasGithub && (
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
          >
            <button type="submit" className="btn btn-primary w-full justify-center">
              使用 GitHub 登录
            </button>
          </form>
        )}

        {!hasGithub && !authTestModeEnabled() && (
          <p className="text-sm text-slate-500">
            未配置 GitHub OAuth（AUTH_GITHUB_ID / AUTH_GITHUB_SECRET）。
          </p>
        )}

        {authTestModeEnabled() && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("test-identity", {
                githubId: String(formData.get("githubId") ?? ""),
                redirectTo: callbackUrl,
              });
            }}
            className="space-y-2 border-t border-slate-200 pt-4"
          >
            <p className="text-xs font-medium text-amber-600">
              测试模式（AUTH_TEST_MODE=1，禁止用于真实部署）
            </p>
            <input
              name="githubId"
              className="input"
              placeholder="GitHub User ID"
              autoComplete="off"
            />
            <button type="submit" className="btn w-full justify-center">
              以测试身份登录
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
