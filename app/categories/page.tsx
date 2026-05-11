import Link from "next/link";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allPosts = getAllPosts();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
          Taxonomy
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-gray-50">
          文章分类
        </h1>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-[#242424]">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            还没有分类，快去创建文章吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryPosts = allPosts.filter(
              (post) => post.category === category.name
            );

            return (
              <Link
                key={category.name}
                href={`/categories/${encodeURIComponent(category.name)}`}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-gray-700 dark:bg-[#242424] dark:hover:border-primary-700"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-50">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {category.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {category.count}
                  </span>
                </div>
                <div className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                  {categoryPosts.slice(0, 3).map((post) => (
                    <p
                      key={post.slug}
                      className="truncate text-sm text-gray-600 dark:text-gray-300"
                    >
                      {post.title}
                    </p>
                  ))}
                  {categoryPosts.length === 0 && (
                    <p className="text-sm text-gray-400">暂无文章</p>
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
