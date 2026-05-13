import Link from "next/link";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allPosts = getAllPosts();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
          阅读路径
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          阅读路径
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted dark:text-gray-300">
          按长期主题浏览产品观察、工程札记和生活手记。
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-light bg-surface-light py-16 text-center dark:border-line-dark dark:bg-surface-dark">
          <p className="text-lg text-ink-muted dark:text-gray-400">
            还没有路径。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryPosts = allPosts.filter(
              (post) => post.categorySlug === category.slug
            );

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="rounded-3xl border border-line-light bg-surface-light p-6 transition hover:-translate-y-0.5 hover:border-primary-200 dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-normal text-ink dark:text-gray-50">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-ink-muted dark:text-gray-300">
                      {category.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                    {category.count}
                  </span>
                </div>
                <div className="space-y-3 border-t border-line-light pt-5 dark:border-line-dark">
                  {categoryPosts.slice(0, 3).map((post) => (
                    <p
                      key={post.slug}
                      className="truncate text-sm text-ink-muted dark:text-gray-300"
                    >
                      {post.title}
                    </p>
                  ))}
                  {categoryPosts.length === 0 && (
                    <p className="text-sm text-ink-soft dark:text-gray-500">暂无文章</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
