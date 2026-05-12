export const siteConfig = {
  name: "Color Blog",
  title: "Color's Field Notes",
  description: "用产品分析和工程实践，记录问题如何被拆解、验证和落地。",
  author: "Color",
};

export const postCategories = [
  {
    slug: "technical",
    name: "工程实践",
    description: "前端工程、部署流程、工具链和架构取舍的实战记录。",
  },
  {
    slug: "learning",
    name: "产品分析",
    description: "从数据、用户行为和业务目标中形成可行动的产品判断。",
  },
  {
    slug: "life",
    name: "生活观察",
    description: "非工作语境下的长期观察、阅读、兴趣和个人状态记录。",
  },
] as const;

export type PostCategoryName = (typeof postCategories)[number]["name"];
export type PostCategorySlug = (typeof postCategories)[number]["slug"];

export function getCategoryNameBySlug(slug: string): string | undefined {
  return postCategories.find((category) => category.slug === slug)?.name;
}
