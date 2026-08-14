import fs from "fs";
import path from "path";

let cachedRoot: string | null = null;

/**
 * 从当前工作目录向上查找 pnpm-workspace.yaml 定位仓库根。
 * content/、data/、docs/ 位于仓库根，被 apps/web 与 apps/admin 共享，
 * 构建可能在仓库根或 apps/web 下执行，需统一解析。
 */
export function resolveRepoRoot(): string {
  if (cachedRoot) return cachedRoot;

  let dir = process.cwd();
  while (true) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      cachedRoot = dir;
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("未找到 pnpm-workspace.yaml，无法定位仓库根目录");
    }
    dir = parent;
  }
}

export function repoPath(...segments: string[]): string {
  return path.join(resolveRepoRoot(), ...segments);
}
