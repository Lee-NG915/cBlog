const DEFAULT_SITE_URL = "https://lee-ng915.github.io/cBlog";

export function resolveSiteUrl(value = process.env.SITE_URL): string {
  const candidate = value?.trim() || DEFAULT_SITE_URL;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("SITE_URL 必须是 http/https 绝对 URL");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.search || url.hash) {
    throw new Error("SITE_URL 必须是无 query/hash 的 http/https 绝对 URL");
  }
  return url.toString().replace(/\/$/, "");
}

export const siteConfig = {
  name: "Color Blog",
  title: "Color 手记",
  description: "记录学习中的片段、工程里的取舍，和生活里值得留下的瞬间。",
  author: "Color",
  url: resolveSiteUrl(),
  ogImage: "/og/default.png",
};

export function getSiteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export function getSeoImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return siteConfig.ogImage;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return imagePath.replace(/^\/cBlog/, "") || siteConfig.ogImage;
}
