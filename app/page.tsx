import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllCategories, getAllPosts, getPostStats } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts().slice(0, 9);
  const categories = getAllCategories();
  const stats = getPostStats();
  const topTags = stats.tags.slice(0, 8);

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-[1fr_340px] gap-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#242424]">
          <p className="mb-4 text-sm font-medium text-primary-600 dark:text-primary-400">
            Personal knowledge base
          </p>
          <h1 className="mb-5 max-w-3xl text-5xl font-bold leading-tight text-gray-950 dark:text-gray-50">
            {siteConfig.title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex gap-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${encodeURIComponent(category.name)}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#242424]">
          <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-gray-100">
            内容概览
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">文章</dt>
              <dd className="mt-1 text-3xl font-bold text-gray-950 dark:text-gray-50">
                {stats.published}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">分类</dt>
              <dd className="mt-1 text-3xl font-bold text-gray-950 dark:text-gray-50">
                {categories.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">标签</dt>
              <dd className="mt-1 text-3xl font-bold text-gray-950 dark:text-gray-50">
                {stats.tags.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">阅读</dt>
              <dd className="mt-1 text-3xl font-bold text-gray-950 dark:text-gray-50">
                {stats.readingMinutes}
              </dd>
            </div>
          </dl>
          {topTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {topTags.map((tag) => (
                <span
                  key={tag.name}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="grid grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/categories/${encodeURIComponent(category.name)}`}
            className="rounded-lg border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-gray-700 dark:bg-[#242424] dark:hover:border-primary-700"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-50">
                {category.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {category.count} 篇
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {category.description}
            </p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Recently published
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-gray-50">
              最新文章
            </h2>
          </div>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-[#242424]">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              还没有文章，快去创建第一篇吧！
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              在{" "}
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                content/posts
              </code>{" "}
              目录下创建 Markdown 文件即可
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
