import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories, getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "阅读路径",
  description: "按长期主题浏览学习记录、工程札记、面试札记和生活手记。",
  alternates: {
    canonical: "/categories/",
  },
  openGraph: {
    type: "website",
    url: "/categories/",
    siteName: siteConfig.title,
    title: `阅读路径 | ${siteConfig.title}`,
    description: "按长期主题浏览学习记录、工程札记、面试札记和生活手记。",
    locale: "zh_CN",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `阅读路径 | ${siteConfig.title}`,
    description: "按长期主题浏览学习记录、工程札记、面试札记和生活手记。",
    images: [siteConfig.ogImage],
  },
};

export default function CategoriesPage() {
  const categories = getAllCategories();
  const allPosts = getAllPosts();
  const activeCategories = categories.filter((category) => category.count > 0);
  const emptyCategories = categories.filter((category) => category.count === 0);

  return (
    <div className="space-y-8">
      <header data-reveal="hero">
        <p className="editorial-label">阅读路径</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          阅读路径
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-7 text-ink-muted dark:text-gray-300">
          按长期主题浏览学习记录、工程札记、面试札记和生活手记。
        </p>
      </header>

      {activeCategories.length === 0 ? (
        <div className="editorial-card py-16 text-center" data-reveal>
          <p className="font-sans text-lg text-ink-muted dark:text-gray-400">
            还没有路径。
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeCategories.map((category, index) => {
            const categoryPosts = allPosts.filter(
              (post) => post.categorySlug === category.slug,
            );

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm transition hover:border-primary-200 hover:shadow-editorial dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
                data-reveal
                data-reveal-delay={(index % 3) * 90}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-normal text-ink dark:text-gray-50">
                      {category.name}
                    </h2>
                    <p className="mt-2 font-sans text-sm leading-6 text-ink-muted dark:text-gray-300">
                      {category.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 font-sans text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                    {category.count}
                  </span>
                </div>
                <div className="space-y-3 border-t border-line-light pt-5 dark:border-line-dark">
                  <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
                    从这里开始
                  </p>
                  {categoryPosts.slice(0, 3).map((post) => (
                    <p
                      key={post.slug}
                      className="truncate font-sans text-sm text-ink-muted dark:text-gray-300"
                    >
                      {post.title}
                    </p>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
          {emptyCategories.length > 0 && (
            <section className="editorial-card space-y-4 p-6 sm:p-7" data-reveal>
              <div className="space-y-2">
                <p className="editorial-label">整理中的路径</p>
                <h2 className="font-display text-2xl font-semibold tracking-normal text-ink dark:text-gray-50">
                  还在补充的主题
                </h2>
                <p className="max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-300">
                  这些栏目会继续补内容，暂时不和已有文章的阅读路径放在同一层级。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {emptyCategories.map((category) => (
                  <span
                    key={category.slug}
                    className="rounded-full border border-line-light bg-background-light px-4 py-2 font-sans text-sm text-ink-muted dark:border-line-dark dark:bg-background-dark dark:text-gray-300"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
