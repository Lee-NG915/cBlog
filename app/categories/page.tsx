import Link from "next/link";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allPosts = getAllPosts();

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        文章分类
      </h1>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              还没有分类，快去创建文章吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryPosts = allPosts.filter(
                (post) => post.category === category.name
              );
              return (
                <Link
                  key={category.name}
                  href={`/categories/${encodeURIComponent(category.name)}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
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
