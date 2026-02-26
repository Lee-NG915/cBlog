import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 10);

  return (
    <>
      {/* Hero Section */}
      <section className="relative text-center mb-12 md:mb-16 py-8 md:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-primary-50/30 dark:from-primary-900/20 dark:via-transparent dark:to-primary-900/10 rounded-2xl -z-10" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">
          欢迎来到 Color 的博客
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          分享技术、生活、学习和旅行的点点滴滴
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
            技术
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
            生活
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            学习
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
            旅行
          </span>
        </div>
      </section>

      {/* Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            最新文章
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            共 {posts.length} 篇
          </span>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#242424] rounded-2xl border border-gray-200 dark:border-gray-700">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              还没有文章，快去创建第一篇吧！
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              在{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                content/posts
              </code>{" "}
              目录下创建 Markdown 文件即可
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {posts.map((post, index) => (
              <PostCard key={post.slug} post={post} featured={index === 0} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
