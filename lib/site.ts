export const siteConfig = {
  name: "Color Blog",
  title: "Color's Blog",
  description: "Personal space for product thinking, engineering notes, and long-term learning.",
  author: "Color",
};

export const postCategories = [
  {
    slug: "technical",
    name: "Engineering",
    description: "Frontend engineering, deployment notes, tooling, and architecture tradeoffs.",
  },
  {
    slug: "learning",
    name: "Product",
    description: "Product judgment shaped by data, user behavior, and business goals.",
  },
  {
    slug: "life",
    name: "Life",
    description: "Personal observations, reading notes, interests, and life outside work.",
  },
] as const;

export type PostCategoryName = (typeof postCategories)[number]["name"];
export type PostCategorySlug = (typeof postCategories)[number]["slug"];

export function getCategoryNameBySlug(slug: string): string | undefined {
  return postCategories.find((category) => category.slug === slug)?.name;
}
