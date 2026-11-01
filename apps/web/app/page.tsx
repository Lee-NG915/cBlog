import Link from "next/link";
import FeaturedPost from "@/components/FeaturedPost";
import InfinitePostList from "@/components/InfinitePostList";
import {
  getAllCategories,
  getAllPosts,
  getPostStats,
  toPostSummary,
} from "@/lib/content";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default async function Home() {
  const posts = await getAllPosts();
  const categories = await getAllCategories();
  const activeCategories = categories.filter((category) => category.count > 0);
  const stats = await getPostStats();
  const featuredPost = posts[0];
  const listPosts = posts.slice(featuredPost ? 1 : 0).map(toPostSummary);
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
          <div className="home-hero editorial-card relative overflow-hidden p-7 sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="home-hero-paper pointer-events-none absolute -right-20 -top-16 h-56 w-56 rotate-12 border border-line-light opacity-60 dark:border-line-dark"
            />
            <p className="home-hero-label editorial-label">
              工程 / 学习 / 生活
            </p>
            <h1 className="home-hero-title mt-7 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-normal text-ink dark:text-gray-50 sm:text-5xl lg:text-6xl">
              {siteConfig.title}
            </h1>
            <p className="home-hero-description mt-6 max-w-2xl font-sans text-base leading-8 text-ink-muted dark:text-gray-300 sm:text-lg">
              {siteConfig.description}
            </p>
            <div className="home-hero-actions mt-8 flex flex-wrap gap-3">
              <Link
                href={
                  featuredPost ? `/posts/${featuredPost.slug}` : "/categories"
                }
                className="rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-background-light shadow-editorial-sm transition hover:bg-primary-700 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-primary-200"
              >
                阅读最新
              </Link>
              <Link
                href="/categories"
                className="rounded-full border border-line-light bg-surface-light px-5 py-2.5 font-sans text-sm font-semibold text-ink transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-200 dark:hover:border-primary-700 dark:hover:text-primary-200"
              >
                浏览主题
              </Link>
            </div>
          </div>

          <aside className="home-hero-overview editorial-card p-4 sm:p-6 lg:p-7">
            <p className="editorial-label">站点概览</p>
            <div className="mt-4 grid grid-cols-4 gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6">
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
                  公开文章
                </p>
                <p className="mt-2 font-sans text-2xl lg:text-3xl font-semibold text-ink dark:text-gray-100">
                  {stats.published}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
                  文章主题
                </p>
                <p className="mt-2 font-sans text-2xl lg:text-3xl font-semibold text-ink dark:text-gray-100">
                  {activeCategories.length}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
                  标签
                </p>
                <p className="mt-2 font-sans text-2xl lg:text-3xl font-semibold text-ink dark:text-gray-100">
                  {stats.tags.length}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
                  阅读分钟
                </p>
                <p className="mt-2 font-sans text-2xl lg:text-3xl font-semibold text-ink dark:text-gray-100">
                  {stats.readingMinutes}
                </p>
              </div>
            </div>
            <div className="mt-7 hidden flex-wrap gap-2 lg:flex">
              {stats.tags.slice(0, 5).map((tag) => (
                <span key={tag.name} className="editorial-pill">
                  {tag.name}
                </span>
              ))}
            </div>
          </aside>
        </section>

        <nav
          className="flex flex-wrap gap-2 font-sans"
          data-reveal
          data-reveal-delay="160"
        >
          <Link
            href="/"
            className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 ring-1 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800"
          >
            先看这里
          </Link>
          {activeCategories.map((category) => (
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
                <p className="editorial-label">推荐入口</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-normal text-ink dark:text-gray-50 sm:text-3xl">
                  先读这篇
                </h2>
              </div>
            </div>
            <FeaturedPost post={featuredPost} revealDelay={100} />
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-end justify-between" data-reveal>
            <div>
              <p className="editorial-label">最近更新</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-normal text-ink dark:text-gray-50 sm:text-3xl">
                全部手记
              </h2>
            </div>
            <Link
              href="/categories"
              className="font-sans text-sm font-semibold text-ink-muted transition hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200"
            >
              按主题浏览 →
            </Link>
          </div>
          {posts.length === 0 ? (
            <div className="editorial-card py-16 text-center" data-reveal>
              <p className="font-sans text-lg text-ink-muted dark:text-gray-400">
                还没有公开文章。
              </p>
              <p className="mt-2 font-sans text-sm text-ink-soft dark:text-gray-400">
                新的记录还在整理中，欢迎稍后再来翻翻。
              </p>
            </div>
          ) : (
            <InfinitePostList posts={listPosts} />
          )}
        </section>
      </div>
    </>
  );
}
