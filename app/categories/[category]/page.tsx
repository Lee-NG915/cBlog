import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category.name),
  }));
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);
  const allCategories = getAllCategories();

  // 检查分类是否存在
  if (!allCategories.find((c) => c.name === category)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <BackButton href="/categories" label="返回分类" />
      <header className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#242424]">
        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
          Category
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-gray-50">
          {category}
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          共 {posts.length} 篇文章
        </p>
      </header>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-[#242424]">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              该分类下还没有文章
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
    </div>
  );
}
