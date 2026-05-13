export const siteConfig = {
  name: "Color Blog",
  title: "Color 手记",
  description: "写产品判断、工程实践和长期学习中的可复盘经验。",
  author: "Color",
};

export const postCategories = [
  {
    slug: "technical",
    name: "工程札记",
    description: "前端工程、部署实践、工具链和架构取舍。",
  },
  {
    slug: "learning",
    name: "产品观察",
    description: "基于数据、用户行为和业务目标形成的产品判断。",
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
