import { auth, signOut } from "@/auth";
import { localFilesystemAuthBypass } from "@/lib/env";

/** 侧边栏底部会话栏（Server Component）：显示当前登录者并提供登出 */
export default async function SessionBar() {
  if (localFilesystemAuthBypass()) {
    return (
      <div className="mt-auto border-t border-slate-200 px-3 pt-4">
        <p className="text-xs text-slate-500">本地开发 · 无登录</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          仅 127.0.0.1，未启用 GitHub OAuth
        </p>
      </div>
    );
  }

  const session = await auth();
  const userName = session?.user?.name ?? "未登录";

  return (
    <div className="mt-auto border-t border-slate-200 px-3 pt-4">
      <p className="truncate text-xs text-slate-500" title={userName}>
        {userName}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit" className="btn mt-2 w-full justify-center text-xs">
          登出
        </button>
      </form>
    </div>
  );
}
