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
    category: category.slug,
  }));
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category;
  const allCategories = getAllCategories();
  const currentCategory = allCategories.find((c) => c.slug === category);

  if (!currentCategory) {
    notFound();
  }

  const posts = getPostsByCategory(currentCategory.slug);

  return (
    <div className="space-y-8">
      <BackButton href="/categories" label="返回路径" />
      <header className="border-b border-line-light pb-8 dark:border-line-dark">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
          阅读路径
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          {currentCategory.name}
        </h1>
        <p className="mt-4 text-ink-muted dark:text-gray-300">
          共 {posts.length} 篇手记
        </p>
      </header>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line-light bg-surface-light py-16 text-center dark:border-line-dark dark:bg-surface-dark">
            <p className="text-lg text-ink-muted dark:text-gray-400">
              这个路径下还没有文章。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
    </div>
  );
}
