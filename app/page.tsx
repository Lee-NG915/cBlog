import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 10); // 首页显示最新 10 篇文章

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            欢迎来到 Color 的博客
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            分享技术、生活、学习和旅行的点点滴滴
          </p>
        </section>

        {/* Posts Grid */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-gray-100">
            最新文章
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
