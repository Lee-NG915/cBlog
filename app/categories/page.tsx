import Link from "next/link";
import { getAllCategories, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文章分类",
};

const categoryColors: Record<string, string> = {
  技术类:
    "from-primary-500 to-blue-600 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/40",
  日常生活:
    "from-green-500 to-emerald-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40",
  学习记录:
    "from-purple-500 to-violet-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40",
  旅游: "from-orange-500 to-amber-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40",
};

const defaultColor =
  "from-gray-500 to-slate-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/40";

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allPosts = getAllPosts();

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          文章分类
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          共 {allPosts.length} 篇文章，{categories.length} 个分类
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            还没有分类，快去创建文章吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const colors = categoryColors[category.name] || defaultColor;
            const gradientClass = colors.split(" ").slice(0, 2).join(" ");
            const bgClass = colors.split(" ").slice(2).join(" ");
            return (
              <Link
                key={category.name}
                href={`/categories/${encodeURIComponent(category.name)}`}
                className={`group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${bgClass}`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`}
                />
                <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.count} 篇文章
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
