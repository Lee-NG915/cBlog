import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site";

function toLastModified(date?: string): Date {
  if (!date) {
    return new Date();
  }

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categories = getAllCategories();

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
