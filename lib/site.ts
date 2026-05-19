export const siteConfig = {
  name: "Color Blog",
  title: "Color 手记",
  description: "记录学习中的片段、工程里的取舍，和生活里值得留下的瞬间。",
  author: "Color",
  url: "https://lee-ng915.github.io/cBlog",
  ogImage: "/og/default.png",
};

export const postCategories = [
  {
    slug: "technical",
    name: "工程札记",
    description: "前端工程、部署实践、工具链和架构取舍。",
  },
  {
    slug: "learning",
    name: "学习记录",
    description: "正在学什么、如何理解、还有哪些没想通。",
  },
  {
    slug: "life",
    name: "生活手记",
    description: "日常观察、阅读笔记、兴趣和工作之外的生活记录。",
  },
] as const;

export type PostCategoryName = (typeof postCategories)[number]["name"];
export type PostCategorySlug = (typeof postCategories)[number]["slug"];
export type PostCategory = (typeof postCategories)[number];

export function getCategoryNameBySlug(slug: string): string | undefined {
  return postCategories.find((category) => category.slug === slug)?.name;
}

export function getCategoryBySlug(slug: string): PostCategory | undefined {
  return postCategories.find((category) => category.slug === slug);
}

export function getCategoryByName(name: string): PostCategory | undefined {
  return postCategories.find((category) => category.name === name);
}

export function resolveCategory(value: string): PostCategory | undefined {
  return getCategoryBySlug(value) || getCategoryByName(value);
}

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
