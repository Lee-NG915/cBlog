/**
 * 品牌重构链接跳转工具库
 * 用于判断链接是否应该使用内部路由还是外部跳转
 * 只有 cart 和 checkout 相关的路由保持内部跳转，其他全部跳转到新项目
 */

// 需要保持内部跳转的页面路径（只包含 cart 和 checkout 相关）
const INTERNAL_ROUTES = [
  // Cart 相关
  '/cart',

  // Checkout 相关
  '/checkout/account',
  '/checkout/shipping-address',
  '/checkout/shipping-method',
  '/checkout/payment',
  '/checkout/tctp-payment',
  '/checkout/grabpay',
  '/checkout/success',
  '/checkout/empty-cart',

  // 其他
  '/careers',
];

// 内部路由的正则表达式模式（更安全的匹配方式）
const INTERNAL_ROUTE_PATTERNS = [
  /^\/cart(\/.*)?$/, // /cart 及其所有子路径
  /^\/checkout(\/.*)?$/, // /checkout 及其所有子路径
];

/**
 * 判断是否应该使用内部路由
 * @param {string} linkPath - 要检查的路径
 * @returns {boolean} - true 表示使用内部路由，false 表示使用外部跳转
 */
export const shouldUseInternalRoute = (linkPath) => {
  if (!linkPath) return false;

  // 如果已经是完整的外部链接，使用外部跳转
  if (/^https?:\/\//.test(linkPath)) {
    return false;
  }

  // 移除开头的斜杠，获取纯路径
  const cleanPath = linkPath.startsWith('/') ? linkPath.slice(1) : linkPath;

  // 重新添加斜杠进行标准化
  const normalizedPath = `/${cleanPath}`;

  // 1. 首先检查白名单（精确匹配和前缀匹配）
  const isInWhitelist = INTERNAL_ROUTES.some(
    (route) =>
      normalizedPath === route ||
      normalizedPath.startsWith(`${route}/`) ||
      // 支持国家代码前缀的情况，如 /sg/cart, /au/checkout/payment
      (/^\/[a-z]{2}\//.test(normalizedPath) &&
        (normalizedPath.slice(3) === route.slice(1) || normalizedPath.slice(3).startsWith(`${route.slice(1)}/`)))
  );

  if (isInWhitelist) {
    return true;
  }

  // 2. 使用正则表达式模式进行双重检查（防止遗漏）
  const isMatchedByPattern = INTERNAL_ROUTE_PATTERNS.some((pattern) => {
    const directMatch = pattern.test(normalizedPath);
    const countryPrefixMatch = /^\/[a-z]{2}\//.test(normalizedPath) && pattern.test(`/${normalizedPath.slice(4)}`);
    return directMatch || countryPrefixMatch;
  });

  if (isMatchedByPattern) {
    return true;
  }

  return false;
};

/**
 * 生成外部链接
 * @param {string} linkPath - 相对路径
 * @returns {string} - 完整的外部链接 URL
 */
export const getExternalUrl = (linkPath) => {
  if (!linkPath) return '';

  // 如果已经是完整的外部链接，直接返回
  if (/^https?:\/\//.test(linkPath)) {
    return linkPath;
  }

  // 获取基础 URL（新项目域名）
  const baseUrl = typeof __BASE_URL__ !== 'undefined' ? __BASE_URL__ : '';

  // 确保路径以 / 开头
  const normalizedPath = linkPath.startsWith('/') ? linkPath : `/${linkPath}`;

  // 组合完整的外部链接
  const fullUrl = `${baseUrl}${normalizedPath}`;

  return fullUrl;
};
