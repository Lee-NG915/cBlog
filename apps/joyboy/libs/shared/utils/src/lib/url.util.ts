export const formatSearchToQueryString = (searchParams: URLSearchParams) => {
  const urlParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      // 排除 undefined 值
      if (Array.isArray(value)) {
        value.forEach((val) => {
          urlParams.append(key, val);
        });
      } else {
        urlParams.append(key, value);
      }
    }
  });
  return urlParams.toString();
};

/**
 * 清洗 PDP 页面的 URL Slug
 *
 * 场景：用户复制链接时可能带入零宽字符或控制字符，导致后端查询 404
 *
 * 策略：White-list (白名单) 太激进，采用 Black-list (黑名单) 策略移除干扰字符
 *
 * @param slug - 原始 slug 字符串
 * @returns 清理后的 slug
 *
 * @example
 * ```ts
 * sanitizeSlug('product\u200Bname') // 'productname'
 * sanitizeSlug('product%E2%80%8Bname') // 'productname' (处理 URL 编码)
 * sanitizeSlug('café') // 'café' (保留)
 * sanitizeSlug('产品名称') // '产品名称' (保留)
 * ```
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return '';

  // 1. 尝试 URL 解码 (处理被转义的 %E2%80%8B)
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch (e) {
    // 如果解码失败（比如这是个非法的 % 序列），降级使用原始字符串
    // 静默处理，不抛出错误
  }

  return (
    decoded
      // 2. 移除 Unicode 格式控制字符 (Cf) -> 包含 \u200B(零宽空格), \uFEFF(BOM) 等
      // 3. 移除 其他控制字符 (Cc) -> 包含 ASCII 控制符如 \x00-\x1F
      // 使用 'u' flag 开启 Unicode 模式
      .replace(/[\p{Cf}\p{Cc}]/gu, '')
      // 4. 移除 XSS 危险字符（但保留 URL 安全字符 - _ . ~ 以及所有 Unicode 字符）
      .replace(/[<>"'&]/g, '')
      .trim()
  );
}
