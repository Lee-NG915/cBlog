/**
 * filesystem 数据源的空 stub（WEB-202 构建期隔离）。
 *
 * WEB_CONTENT_SOURCE=api 时，next.config.js 用 NormalModuleReplacementPlugin
 * 把 `./filesystem` 的模块解析替换到本文件，使 api 影子构建的 bundle
 * 完全不包含 filesystem 模块图（@cblog/core 根入口 → better-sqlite3）。
 * 若任何代码路径在 api 模式误求值本模块，立即抛错让构建失败。
 */
function forbidden(): never {
  throw new Error("WEB-202 违例：api 模式加载了 filesystem 数据源");
}

export const getAllPosts = forbidden;
export const getAllPostSlugs = forbidden;
export const getPostBySlug = forbidden;
export const getPostsByCategory = forbidden;
export const getAllCategories = forbidden;
export const getOfficialCategories = forbidden;
export const getPostStats = forbidden;
export const getPostHeadings = forbidden;
export const markdownToHtml = forbidden;
export const docAssetBase = forbidden;
export const isDraftPreviewEnabled = forbidden;
export const toPostSummary = forbidden;
export const getAllCollections = forbidden;
export const getCollection = forbidden;
export const getCollectionNotes = forbidden;
export const getCollectionNote = forbidden;
