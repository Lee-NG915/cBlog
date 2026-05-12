import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { notFound } from "next/navigation";
import { decodePathSegment } from "@/lib/utils";

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
  const category = decodePathSegment(params.category);
  const posts = getPostsByCategory(category);
  const allCategories = getAllCategories();

  // 检查分类是否存在
  if (!allCategories.find((c) => c.name === category)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <BackButton href="/categories" label="返回研究路径" />
      <header className="border-b border-line-light pb-8 dark:border-line-dark">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
          Reading path
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-ink dark:text-gray-50">
          {category}
        </h1>
        <p className="mt-4 text-ink-muted dark:text-gray-300">
          共 {posts.length} 篇文章
        </p>
      </header>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line-light bg-surface-light py-16 text-center dark:border-line-dark dark:bg-surface-dark">
            <p className="text-lg text-ink-muted dark:text-gray-400">
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
