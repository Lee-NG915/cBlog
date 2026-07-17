import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories, getPostStats } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

const description =
  "了解 Color 手记的内容方向：学习记录、工程札记、专题整理和生活手记。";

export const metadata: Metadata = {
  title: "关于",
  description,
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    type: "website",
    url: "/about/",
    siteName: siteConfig.title,
    title: `关于 | ${siteConfig.title}`,
    description,
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
    title: `关于 | ${siteConfig.title}`,
    description,
    images: [siteConfig.ogImage],
  },
};

export default function AboutPage() {
  const stats = getPostStats();
  const categories = getAllCategories().filter(
    (category) => category.count > 0,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="mb-2" data-reveal="hero">
        <p className="editorial-label">关于这个站点</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          关于
        </h1>
      </header>

      <div
        className="flex items-center gap-5 rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm dark:border-line-dark dark:bg-surface-dark sm:p-7"
        data-reveal
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink font-sans text-2xl font-bold text-background-light shadow-editorial-sm dark:bg-gray-100 dark:text-gray-950">
          C
        </span>
        <div>
          <p className="font-display text-xl font-bold text-ink dark:text-gray-100">
            {siteConfig.author}
          </p>
          <p className="mt-1.5 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
            {siteConfig.description}
          </p>
        </div>
      </div>

      <div
        className="prose rounded-lg border border-line-light bg-surface-light p-8 shadow-editorial dark:border-line-dark dark:bg-surface-dark"
        data-reveal
      >
        <p>
          这里更像一本慢慢写的本子：学到哪记到哪，工程里踩过的坑、生活里的小事，偶尔翻回去看一眼。
        </p>
        <ul>
          <li>学习记录：最近在啃什么、怎么理解的、哪里还卡着。</li>
          <li>工程札记：写代码、部署、工具选用时的真实取舍。</li>
          <li>专题整理：围绕一个主题整理的复盘、问题清单和阶段性记录。</li>
          <li>生活手记：工作以外的小事，不用包装，真实就好。</li>
        </ul>
        <p>
          想了解我怎么看这间站、希望读者有什么感受，见{" "}
          <a href="/brand/">关于我</a>。
        </p>
      </div>

      {categories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2" data-reveal>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm transition hover:border-primary-200 hover:shadow-editorial dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-ink transition group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-200">
                  {category.name}
                </h2>
                <span className="rounded-full bg-primary-50 px-2.5 py-1 font-sans text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                  {category.count} 篇
                </span>
              </div>
              <p className="mt-2 font-sans text-sm leading-6 text-ink-muted dark:text-gray-400">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div
        className="flex flex-wrap items-center gap-x-10 gap-y-5 rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm dark:border-line-dark dark:bg-surface-dark sm:p-7"
        data-reveal
      >
        <div>
          <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
            公开文章
          </p>
          <p className="mt-1.5 font-sans text-2xl font-semibold text-ink dark:text-gray-100">
            {stats.published}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
            标签
          </p>
          <p className="mt-1.5 font-sans text-2xl font-semibold text-ink dark:text-gray-100">
            {stats.tags.length}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
            阅读分钟
          </p>
          <p className="mt-1.5 font-sans text-2xl font-semibold text-ink dark:text-gray-100">
            {stats.readingMinutes}
          </p>
        </div>
        <Link
          href="/categories"
          className="ml-auto font-sans text-sm font-semibold text-primary-700 transition hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
        >
          按路径开始读 →
        </Link>
      </div>
    </div>
  );
}
