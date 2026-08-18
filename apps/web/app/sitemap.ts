import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

// Phase 5：runtime-isr 下 sitemap 有 TTL 兜底（配合 webhook revalidatePath 事件失效）；
// static-export 构建下该配置被忽略，out/sitemap.xml 照常产出（已在 Phase 5 实证）。
export const revalidate = 86400;

function toLastModified(date?: string): Date {
  if (!date) {
    return new Date();
  }

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const categories = await getAllCategories();

  return [
    {
      url: getSiteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getSiteUrl("/categories/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getSiteUrl("/about/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...categories.map((category) => ({
      url: getSiteUrl(`/categories/${category.slug}/`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: getSiteUrl(`/posts/${post.slug}/`),
      lastModified: toLastModified(post.updatedAt || post.date),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
