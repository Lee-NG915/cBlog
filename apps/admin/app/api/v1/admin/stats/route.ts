import { handleV1 } from "@/lib/api-guards";
import { contentService } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleV1(async () => {
    const service = contentService();
    const [posts, categories, collections] = await Promise.all([
      service.listPosts({}),
      service.listCategories(),
      service.listCollections(),
    ]);

    return {
      posts: {
        total: posts.length,
        published: posts.filter((post) => post.status === "published").length,
        draft: posts.filter((post) => post.status === "draft").length,
        archived: posts.filter((post) => post.status === "archived").length,
      },
      categories: categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        count: category.postCount,
      })),
      collections: collections.map((collection) => ({
        slug: collection.slug,
        name: collection.name,
        count: collection.itemCount,
      })),
      recent: posts.slice(0, 6),
    };
  });
}
