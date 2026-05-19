import Link from "next/link";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import { getAllCategories, getAllPosts, getPostStats } from "@/lib/posts";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const stats = getPostStats();
  const featuredPost = posts[0];
  const latestPosts = posts.slice(featuredPost ? 1 : 0, 7);
  const visiblePosts = latestPosts.length > 0 ? latestPosts : posts;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteConfig.title,
    description: siteConfig.description,
    url: getSiteUrl("/"),
    inLanguage: "zh-CN",
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || siteConfig.description,
      url: getSiteUrl(`/posts/${post.slug}/`),
      datePublished: post.date || undefined,
      dateModified: post.updatedAt || post.date || undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="space-y-12 sm:space-y-16">
        <section className="grid gap-6 pt-2 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div
            className="editorial-card relative overflow-hidden p-7 sm:p-10 lg:p-12"
            data-reveal="hero"
          >
            <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rotate-12 border border-line-light opacity-60 dark:border-line-dark" />
            <p className="editorial-label">Product / Engineering / Life</p>
            <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-normal text-ink dark:text-gray-50 sm:text-6xl lg:text-7xl">
              {siteConfig.title}
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-ink-muted dark:text-gray-300 sm:text-lg">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={featuredPost ? `/posts/${featuredPost.slug}` : "/categories"}
                className="rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-background-light shadow-editorial-sm transition hover:bg-primary-700 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-primary-200"
              >
                阅读最新
              </Link>
              <Link
                href="/categories"
                className="rounded-full border border-line-light bg-surface-light px-5 py-2.5 font-sans text-sm font-semibold text-ink transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-200 dark:hover:border-primary-700 dark:hover:text-primary-200"
              >
                浏览路径
              </Link>
            </div>
          </div>

          <aside className="editorial-card p-6 sm:p-7" data-reveal data-reveal-delay="120">
            <p className="editorial-label">Archive</p>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-500">
                  公开文章
                </p>
                <p className="mt-2 font-sans text-3xl font-semibold text-ink dark:text-gray-100">
                  {stats.published}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-500">
                  阅读路径
                </p>
                <p className="mt-2 font-sans text-3xl font-semibold text-ink dark:text-gray-100">
                  {categories.length}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-500">
                  标签
                </p>
                <p className="mt-2 font-sans text-3xl font-semibold text-ink dark:text-gray-100">
                  {stats.tags.length}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-500">
                  阅读分钟
                </p>
                <p className="mt-2 font-sans text-3xl font-semibold text-ink dark:text-gray-100">
                  {stats.readingMinutes}
                </p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {stats.tags.slice(0, 5).map((tag) => (
                <span key={tag.name} className="editorial-pill">
                  {tag.name}
                </span>
              ))}
            </div>
          </aside>
        </section>

        <nav className="flex flex-wrap gap-2 font-sans" data-reveal data-reveal-delay="160">
          <Link
            href="/"
            className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 ring-1 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800"
          >
            精选
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-full border border-line-light bg-surface-light px-4 py-2 text-sm text-ink-muted transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-300 dark:hover:border-primary-700 dark:hover:text-primary-200"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {featuredPost && (
          <section className="space-y-6">
            <div className="flex items-end justify-between" data-reveal>
              <div>
                <p className="editorial-label">Featured</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-4xl">
                  本期精选
                </h2>
              </div>
            </div>
            <FeaturedPost post={featuredPost} revealDelay={100} />
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-end justify-between" data-reveal>
            <div>
              <p className="editorial-label">Recently Published</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-4xl">
                全部手记
              </h2>
            </div>
            <Link
              href="/categories"
              className="font-sans text-sm font-semibold text-ink-muted transition hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200"
            >
              按路径浏览 →
            </Link>
          </div>
          {posts.length === 0 ? (
            <div className="editorial-card py-16 text-center" data-reveal>
              <p className="font-sans text-lg text-ink-muted dark:text-gray-400">
                还没有公开文章。
              </p>
              <p className="mt-2 font-sans text-sm text-ink-soft dark:text-gray-500">
                在{" "}
                <code className="rounded bg-primary-50 px-2 py-1 dark:bg-gray-800">
                  content/posts
                </code>{" "}
                下创建 Markdown 文件即可。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post, index) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  revealDelay={(index % 3) * 90}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
