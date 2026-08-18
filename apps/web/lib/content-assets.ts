import fs from "fs";
import { repoPath } from "./repo-root";

let cachedManifest: Record<string, string> | null = null;

/**
 * 资产优化 manifest（由 scripts/sync-content-assets.mjs 生成）：
 * 原始相对路径 → WebP 副本相对路径（均相对 public/content/）。
 */
export function loadAssetManifest(): Record<string, string> {
  if (cachedManifest) return cachedManifest;
  const manifestPath = repoPath(
    "apps/web/public/content/asset-manifest.json"
  );
  cachedManifest = fs.existsSync(manifestPath)
    ? (JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Record<string, string>)
    : {};
  return cachedManifest;
}

/** 把正文里指向 /content/ 的位图引用替换为 WebP 优化副本（原图保留兜底，FR-10.2） */
export function rewriteOptimizedAssets(
  htmlContent: string,
  basePath: string
): string {
  const manifest = loadAssetManifest();
  if (Object.keys(manifest).length === 0) return htmlContent;

  const prefix = `${basePath}/content/`;
  return htmlContent.replace(/src="([^"]+)"/g, (match, src: string) => {
    if (!src.startsWith(prefix)) return match;
    const relative = src.slice(prefix.length);
    const optimized = manifest[relative];
    return optimized ? `src="${prefix}${optimized}"` : match;
  });
}
