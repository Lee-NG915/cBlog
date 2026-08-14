import {
  countPostsByCategory,
  listCategories,
  listCollectionItems,
  listCollections,
  listPostMetas,
} from "@cblog/core";
import { handleApi } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(() => {
    const metas = listPostMetas();
    const counts = countPostsByCategory();
    const collections = listCollections();

    return {
      posts: {
        total: metas.length,
        published: metas.filter((meta) => meta.status === "published").length,
        draft: metas.filter((meta) => meta.status === "draft").length,
        archived: metas.filter((meta) => meta.status === "archived").length,
      },
      categories: listCategories().map((category) => ({
        slug: category.slug,
        name: category.name,
        count: counts.get(category.id) ?? 0,
      })),
      collections: collections.map((collection) => ({
        slug: collection.slug,
        name: collection.name,
        count: listCollectionItems(collection.slug).length,
      })),
      recent: metas.slice(0, 6),
    };
  });
}
