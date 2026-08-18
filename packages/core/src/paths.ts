import fs from "node:fs";
import path from "node:path";

let cachedRoot: string | null = null;

/**
 * 从 cwd 向上查找 pnpm-workspace.yaml 定位仓库根。
 * content/、data/、docs/ 位于仓库根，被 apps/web 与 apps/admin 共享，
 * 进程可能运行在仓库根、apps/*、packages/* 任意目录下。
 * 测试/特殊场景可用 CBLOG_REPO_ROOT 环境变量覆盖（不参与缓存）。
 */
export function resolveRepoRoot(): string {
  const override = process.env.CBLOG_REPO_ROOT;
  if (override) return override;
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

export function contentRoot(): string {
  return repoPath("content");
}

/** 数据库中统一存相对 content/ 的 POSIX 路径 */
export function toPosixRelative(baseDir: string, absPath: string): string {
  return path.relative(baseDir, absPath).split(path.sep).join("/");
}

export function contentAbsPath(relativePosixPath: string): string {
  return path.join(contentRoot(), ...relativePosixPath.split("/"));
}

export type DocumentAssetErrorCode = "NOT_FOUND" | "FORBIDDEN";

export class DocumentAssetError extends Error {
  constructor(
    public readonly code: DocumentAssetErrorCode,
    message: string
  ) {
    super(message);
    this.name = "DocumentAssetError";
  }
}

/**
 * 解析编辑器预览用的随文档资产。
 *
 * 只允许读取文档同级 assets/ 目录中的既有文件，并对最终真实路径再次校验，
 * 防止 `..`、绝对路径和 symlink 逃逸到其他文章、草稿或仓库文件。
 */
export function resolveDocumentAssetPath(
  documentFilePath: string,
  assetName: string
): string {
  if (!documentFilePath || !assetName || path.isAbsolute(assetName)) {
    throw new DocumentAssetError("FORBIDDEN", "非法资产路径");
  }

  const root = path.resolve(contentRoot());
  const documentPath = path.resolve(root, ...documentFilePath.split("/"));
  if (
    !documentPath.startsWith(root + path.sep) ||
    path.extname(documentPath).toLowerCase() !== ".md"
  ) {
    throw new DocumentAssetError("FORBIDDEN", "非法文档路径");
  }
  if (!fs.existsSync(documentPath) || !fs.statSync(documentPath).isFile()) {
    throw new DocumentAssetError("NOT_FOUND", "文档不存在");
  }

  const assetsRoot = path.resolve(path.dirname(documentPath), "assets");
  const requestedPath = path.resolve(path.dirname(documentPath), assetName);
  if (!requestedPath.startsWith(assetsRoot + path.sep)) {
    throw new DocumentAssetError(
      "FORBIDDEN",
      "资产必须位于文档 assets 目录"
    );
  }
  if (!fs.existsSync(requestedPath) || !fs.statSync(requestedPath).isFile()) {
    throw new DocumentAssetError("NOT_FOUND", "资产文件不存在");
  }

  const realRoot = fs.realpathSync(root);
  const relativeDocumentPath = path.relative(root, documentPath);
  const expectedRealDocumentPath = path.resolve(
    realRoot,
    relativeDocumentPath
  );
  const realDocumentPath = fs.realpathSync(documentPath);
  const realAssetsRoot = fs.realpathSync(assetsRoot);
  const realRequestedPath = fs.realpathSync(requestedPath);
  const relativeAssetPath = path.relative(assetsRoot, requestedPath);
  const expectedRealAssetsRoot = path.resolve(
    path.dirname(expectedRealDocumentPath),
    "assets"
  );
  const expectedRealRequestedPath = path.resolve(
    expectedRealAssetsRoot,
    relativeAssetPath
  );
  if (
    realDocumentPath !== expectedRealDocumentPath ||
    realAssetsRoot !== expectedRealAssetsRoot ||
    realRequestedPath !== expectedRealRequestedPath ||
    !realAssetsRoot.startsWith(realRoot + path.sep) ||
    !realRequestedPath.startsWith(realAssetsRoot + path.sep)
  ) {
    throw new DocumentAssetError("FORBIDDEN", "资产真实路径越界");
  }

  return realRequestedPath;
}

const SLUG_PATTERN = /^[a-z0-9一-鿿]+(?:-[a-z0-9一-鿿]+)*$/;

/**
 * 专栏 slug 即根级 URL 段，禁止与既有静态路由冲突。
 * （rightCapital/addx-ai 为存量特例，含大写，单独放行）
 */
export const RESERVED_ROOT_SLUGS = new Set([
  "posts",
  "categories",
  "about",
  "brand",
  "api",
  "images",
  "og",
  "content",
  "sitemap.xml",
  "robots.txt",
  "404",
  "admin",
]);

const LEGACY_COLLECTION_SLUGS = new Set(["rightCapital", "addx-ai"]);

export function isValidSlug(slug: string): boolean {
  if (LEGACY_COLLECTION_SLUGS.has(slug)) return true;
  return SLUG_PATTERN.test(slug) && slug.length <= 128;
}

export function assertValidSlug(slug: string): void {
  if (!isValidSlug(slug)) {
    throw new Error(
      `非法 slug: "${slug}"（仅允许小写字母/数字/中文与连字符）`
    );
  }
}

export function assertValidCollectionSlug(slug: string): void {
  assertValidSlug(slug);
  if (RESERVED_ROOT_SLUGS.has(slug.toLowerCase())) {
    throw new Error(`专栏 slug "${slug}" 与站点保留路由冲突，请换一个`);
  }
}

/** 管理端写操作只允许落在 content/ 或 data/ 内（NFR-4） */
export function assertWritablePath(absPath: string): void {
  const normalized = path.resolve(absPath);
  const allowed = [contentRoot(), repoPath("data")];
  const inside = allowed.some(
    (base) => normalized === base || normalized.startsWith(base + path.sep)
  );
  if (!inside) {
    throw new Error(`拒绝写入白名单（content/、data/）之外的路径: ${absPath}`);
  }
}
