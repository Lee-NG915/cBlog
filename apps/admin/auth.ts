import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { allowedGithubId, authSecret, authTestModeEnabled } from "@/lib/env";

/**
 * Auth.js（next-auth v5）单用户鉴权（ADR-208）：
 * - GitHub OAuth 为唯一真实登录方式；
 * - allowlist 校验固定、不可变的 GitHub user ID，绝不使用可改名的 login；
 * - AUTH_TEST_MODE=1 时启用显式测试身份 provider（仅本地/CI 契约测试）。
 */

const providers = [];

// 硬防呆：测试身份 provider 不得与真实 GitHub OAuth 凭据共存。
// 真实部署必然配置 AUTH_GITHUB_ID/SECRET；二者同现说明 AUTH_TEST_MODE 被误带入部署，直接拒绝启动。
if (
  authTestModeEnabled() &&
  (process.env.AUTH_GITHUB_ID || process.env.AUTH_GITHUB_SECRET)
) {
  throw new Error(
    "AUTH_TEST_MODE=1 不得与 AUTH_GITHUB_ID/AUTH_GITHUB_SECRET 同时配置（测试身份仅限本地/CI）"
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

if (authTestModeEnabled()) {
  providers.push(
    Credentials({
      id: "test-identity",
      name: "Test Identity",
      credentials: { githubId: { label: "GitHub User ID", type: "text" } },
      authorize(credentials) {
        const id = String(credentials?.githubId ?? "").trim();
        if (!/^\d{1,20}$/.test(id)) return null;
        return { id, name: `test-user-${id}` };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    signIn({ account, profile, user }) {
      const candidateId =
        account?.provider === "github"
          ? String(profile?.id ?? "")
          : String(user?.id ?? "");
      const allowed = candidateId === allowedGithubId();
      if (!allowed) {
        console.warn(
          `[auth] 拒绝登录: provider=${account?.provider} githubId=${candidateId || "(空)"}`
        );
      }
      return allowed;
    },
    jwt({ token, account, profile, user }) {
      if (account) {
        token.githubId =
          account.provider === "github"
            ? String(profile?.id ?? "")
            : String(user?.id ?? "");
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { githubId?: string }).githubId = String(
          token.githubId ?? ""
        );
      }
      return session;
    },
  },
});

/** 会话有效且 githubId 命中 allowlist 才视为已认证（双重校验，防 token 陈旧） */
export async function requireAdminSession() {
  const session = await auth();
  const githubId = (session?.user as { githubId?: string } | undefined)
    ?.githubId;
  if (!session || !githubId || githubId !== allowedGithubId()) {
    return null;
  }
  return session;
}
