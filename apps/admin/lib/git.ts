import { simpleGit, type StatusResult } from "simple-git";
import { resolveRepoRoot } from "@cblog/core";

/** 一键发布的 git 提交白名单（FR-7.3）：仅内容与数据库 */
const WHITELIST_PREFIXES = ["content/", "data/"];

function isWhitelisted(filePath: string): boolean {
  return WHITELIST_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

function git() {
  return simpleGit(resolveRepoRoot());
}

export interface PublishStatus {
  branch: string;
  ahead: number;
  behind: number;
  tracking: string | null;
  contentChanges: Array<{ path: string; status: string }>;
  otherChanges: Array<{ path: string; status: string }>;
}

function classify(status: StatusResult) {
  const all = status.files.map((file) => ({
    path: file.path,
    status: `${file.index}${file.working_dir}`.trim() || "?",
  }));
  return {
    contentChanges: all.filter((file) => isWhitelisted(file.path)),
    otherChanges: all.filter((file) => !isWhitelisted(file.path)),
  };
}

export async function getPublishStatus(): Promise<PublishStatus> {
  const status = await git().status();
  const { contentChanges, otherChanges } = classify(status);
  return {
    branch: status.current ?? "(unknown)",
    ahead: status.ahead,
    behind: status.behind,
    tracking: status.tracking,
    contentChanges,
    otherChanges,
  };
}

export interface PublishResult {
  commit: string;
  pushed: boolean;
  branch: string;
}

/**
 * 一键发布（FR-7.2/7.3）：仅 add 白名单路径 → commit → push。
 * 无白名单变更时拒绝；push 失败原样抛出（不重试、不 force）。
 */
export async function publish(message: string): Promise<PublishResult> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("提交信息不能为空");

  const repo = git();
  const status = await repo.status();
  const { contentChanges } = classify(status);
  if (contentChanges.length === 0 && status.ahead === 0) {
    throw new Error("没有可发布的内容变更（content/、data/）");
  }

  let commitSha = "";
  if (contentChanges.length > 0) {
    await repo.add(["content", "data"]);
    const commit = await repo.commit(trimmed);
    commitSha = commit.commit;
  }

  const branch = status.current ?? "HEAD";
  try {
    await repo.push();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `已提交（${commitSha || "无新提交"}）但推送失败，请在终端处理后重试：${detail}`
    );
  }

  return { commit: commitSha, pushed: true, branch };
}

/** 自动生成提交信息（FR-7.2）：单篇变更含标题，多处变更汇总 */
export function suggestCommitMessage(
  contentChanges: Array<{ path: string }>
): string {
  const postDirs = new Set(
    contentChanges
      .map((file) => file.path)
      .filter((filePath) => filePath.startsWith("content/"))
      .map((filePath) => filePath.split("/").slice(0, 5).join("/"))
  );

  if (postDirs.size === 1) {
    const only = [...postDirs][0]!;
    const slug = only.split("/").at(-2) || only.split("/").at(-1) || "content";
    return `content: update ${slug}`;
  }
  return `content: update ${postDirs.size || contentChanges.length} entries`;
}
