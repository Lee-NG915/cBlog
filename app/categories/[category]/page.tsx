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

  if (!allCategories.find((c) => c.name === category)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <BackButton href="/categories" label="Back to paths" />
      <header className="border-b border-line-light pb-8 dark:border-line-dark">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
          Reading path
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.04em] text-ink dark:text-gray-50 sm:text-6xl">
          {category}
        </h1>
        <p className="mt-4 text-ink-muted dark:text-gray-300">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </header>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line-light bg-surface-light py-16 text-center dark:border-line-dark dark:bg-surface-dark">
            <p className="text-lg text-ink-muted dark:text-gray-400">
              No posts in this path yet.
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
