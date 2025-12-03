/**
 * 获取 basePath（用于 GitHub Pages 部署）
 * 在构建时通过环境变量 BASE_PATH 设置
 */
export function getBasePath(): string {
  // 构建时或服务端：从环境变量获取
  if (typeof window === "undefined") {
    return process.env.BASE_PATH || "";
  }

  // 客户端：尝试从 NEXT_PUBLIC_BASE_PATH 获取（如果设置了）
  // 对于静态导出，basePath 应该在构建时已经处理
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

/**
 * 处理图片路径，添加 basePath（如果需要）
 * 在构建时，路径可能已经包含 basePath，所以需要检查
 */
export function getImagePath(path: string): string {
  if (!path) return path;

  // 如果已经是完整 URL，直接返回
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 如果路径以 / 开头
  if (path.startsWith("/")) {
    const basePath = getBasePath();
    // 如果 basePath 存在且路径不包含它，则添加
    if (basePath && !path.startsWith(basePath)) {
      return basePath + path;
    }
    return path;
  }

  return path;
}
