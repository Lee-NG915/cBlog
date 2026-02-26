import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  return {
    title: `${category} - 分类`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);
  const allCategories = getAllCategories();

  if (!allCategories.find((c) => c.name === category)) {
    notFound();
  }

  return (
    <>
      <BackButton href="/categories" label="返回分类" />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          {category}
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {posts.length} 篇文章
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            该分类下还没有文章
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
