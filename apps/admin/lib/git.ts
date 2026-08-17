import { simpleGit, type StatusResult } from "simple-git";
import { resolveRepoRoot } from "@cblog/core";

/** 一键发布的 git 提交白名单（FR-7.3）：仅内容与数据库 */
const WHITELIST_PREFIXES = ["content/", "data/"];

/** 只有 main 分支的推送会触发 GitHub Pages 部署（.github/workflows/deploy.yml） */
const DEPLOY_BRANCH = "main";

function isWhitelisted(filePath: string): boolean {
  return WHITELIST_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

/** 已暂存（staged）且不在白名单内的变更：发布提交会把它们一并裹入，必须拒绝 */
function stagedNonWhitelist(status: StatusResult): Array<{ path: string; status: string }> {
  return status.files
    .filter((file) => file.index !== " " && file.index !== "?")
    .filter((file) => !isWhitelisted(file.path))
    .map((file) => ({
      path: file.path,
      status: `${file.index}${file.working_dir}`.trim() || "?",
    }));
}

function git() {
  return simpleGit(resolveRepoRoot());
}

export interface PublishStatus {
  branch: string;
  /** 当前分支是否会触发部署（仅 main） */
  isDeployBranch: boolean;
  ahead: number;
  behind: number;
  tracking: string | null;
  contentChanges: Array<{ path: string; status: string }>;
  otherChanges: Array<{ path: string; status: string }>;
  /** 已暂存的白名单外变更：发布会拒绝，需先 unstage */
  stagedOtherChanges: Array<{ path: string; status: string }>;
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
    isDeployBranch: status.current === DEPLOY_BRANCH,
    ahead: status.ahead,
    behind: status.behind,
    tracking: status.tracking,
    contentChanges,
    otherChanges,
    stagedOtherChanges: stagedNonWhitelist(status),
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

  const branch = status.current ?? "HEAD";
  if (branch !== DEPLOY_BRANCH) {
    throw new Error(
      `当前分支为 ${branch}，一键发布仅在 ${DEPLOY_BRANCH} 分支可用` +
        `（只有 ${DEPLOY_BRANCH} 的推送会触发 GitHub Pages 部署）。` +
        `请先将变更合并到 ${DEPLOY_BRANCH} 再发布。`
    );
  }

  // 白名单只约束"新 add"，挡不住事先已 staged 的变更；
  // 若不清场，git commit 会把白名单外的暂存内容一并提交推送
  const stagedOther = stagedNonWhitelist(status);
  if (stagedOther.length > 0) {
    throw new Error(
      "暂存区包含白名单（content/、data/）外的已暂存变更，发布会将其一并提交，已拒绝。\n" +
        "请先在终端处理（如 git restore --staged <file>）：\n" +
        stagedOther.map((file) => `  ${file.status} ${file.path}`).join("\n")
    );
  }

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
    const slug = only.split("/").at(-1) || "content";
    return `content: update ${slug}`;
  }
  return `content: update ${postDirs.size || contentChanges.length} entries`;
}
