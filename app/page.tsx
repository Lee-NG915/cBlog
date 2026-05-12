import Link from "next/link";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import { getAllCategories, getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const featuredPost = posts[0];
  const latestPosts = posts.slice(featuredPost ? 1 : 0, 7);
  const visiblePosts = latestPosts.length > 0 ? latestPosts : posts;

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-4xl py-12 text-center">
        <h2 className="mb-5 font-display text-5xl font-black tracking-[-0.04em] text-ink dark:text-gray-50">
          Color&apos;s Blog
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-muted dark:text-gray-300">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={featuredPost ? `/posts/${featuredPost.slug}` : "/categories"}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background-light transition hover:bg-primary-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-primary-200"
          >
            阅读最新札记
          </Link>
          <Link
            href="/categories"
            className="rounded-full border border-line-light bg-surface-light px-5 py-2.5 text-sm font-medium text-ink transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-200 dark:hover:border-primary-700 dark:hover:text-primary-200"
          >
            浏览研究路径
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 ring-1 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800"
          >
            Featured
          </Link>
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${encodeURIComponent(category.name)}`}
              className="rounded-full bg-surface-light px-4 py-2 text-sm text-ink-muted ring-1 ring-line-light transition hover:text-primary-800 hover:ring-primary-200 dark:bg-surface-dark dark:text-gray-300 dark:ring-line-dark dark:hover:text-primary-200 dark:hover:ring-primary-800"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {featuredPost && (
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
                Featured post
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink dark:text-gray-50">
                精选文章
              </h2>
            </div>
          </div>
          <FeaturedPost post={featuredPost} />
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
              All posts
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink dark:text-gray-50">
              所有文章
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-sm font-medium text-ink-muted transition hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200"
          >
            按路径浏览 →
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line-light bg-surface-light py-16 text-center dark:border-line-dark dark:bg-surface-dark">
            <p className="text-lg text-ink-muted dark:text-gray-400">
              还没有文章，快去创建第一篇吧！
            </p>
            <p className="mt-2 text-sm text-ink-soft dark:text-gray-500">
              在{" "}
              <code className="rounded bg-primary-50 px-2 py-1 dark:bg-gray-800">
                content/posts
              </code>{" "}
              目录下创建 Markdown 文件即可
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {visiblePosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
