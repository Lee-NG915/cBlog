export const siteConfig = {
  name: "Color Blog",
  title: "Color 手记",
  description: "记录学习中的片段、工程里的取舍，和生活里值得留下的瞬间。",
  author: "Color",
  url: "https://lee-ng915.github.io/cBlog",
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
