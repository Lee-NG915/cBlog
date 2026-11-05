import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories, getPostStats } from "@/lib/content";
import { profile, siteConfig } from "@/lib/site";

const description =
  "了解 Color 手记与作者李东海：全栈开发工程师（前端方向 / AI 应用），记录学习、工程与生活。";

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

export default async function AboutPage() {
  const stats = await getPostStats();
  const categories = (await getAllCategories()).filter(
    (category) => category.count > 0,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="mb-2" data-reveal="hero">
        <p className="editorial-label">关于这个站点</p>
        <h1 className="mt-3 page-title text-ink dark:text-gray-50">关于</h1>
      </header>

      {/* 个人定位 */}
      <div
        className="rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm dark:border-line-dark dark:bg-surface-dark sm:p-7"
        data-reveal
      >
        <div className="flex items-start gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink font-sans text-2xl font-bold text-background-light shadow-editorial-sm dark:bg-gray-100 dark:text-gray-950">
            C
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-ink dark:text-gray-100">
              {profile.name}
              <span className="ml-2 font-sans text-sm font-medium text-ink-soft dark:text-gray-400">
                {profile.penName}
              </span>
            </p>
            <p className="mt-1 font-sans text-sm font-medium text-primary-800 dark:text-primary-200">
              {profile.role}
            </p>
            <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
              {profile.tagline}
            </p>
            <p className="mt-3 font-sans text-sm text-ink-soft dark:text-gray-400">
              联系：
              <a
                href={`mailto:${profile.email}`}
                className="font-medium text-primary-700 underline-offset-4 transition hover:text-primary-800 hover:underline dark:text-primary-300 dark:hover:text-primary-200"
              >
                {profile.email}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* 关于我 */}
      <section
        className="rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm dark:border-line-dark dark:bg-surface-dark sm:p-7"
        data-reveal
      >
        <p className="editorial-label">关于我</p>
        <h2 className="mt-2 font-display text-xl font-bold text-ink dark:text-gray-100">
          擅长的事情
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {profile.highlights.map((item) => (
            <div key={item.title}>
              <h3 className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
                {item.title}
              </h3>
              <p className="mt-1.5 font-sans text-sm leading-6 text-ink-muted dark:text-gray-400">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-sans text-sm font-semibold text-ink dark:text-gray-100">
          经历
        </h3>
        <ol className="mt-4 space-y-4 border-l border-line-light pl-5 dark:border-line-dark">
          {profile.experience.map((item) => (
            <li key={item.org} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary-200 bg-surface-light dark:border-primary-800 dark:bg-surface-dark" />
              <p className="font-sans text-xs text-ink-soft dark:text-gray-400">
                {item.period}
              </p>
              <p className="mt-0.5 font-sans text-sm font-semibold text-ink dark:text-gray-100">
                {item.org} · {item.role}
              </p>
              <p className="mt-0.5 font-sans text-sm leading-6 text-ink-muted dark:text-gray-400">
                {item.note}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 站点介绍 */}
      <div
        className="prose rounded-lg border border-line-light bg-surface-light p-8 shadow-editorial dark:border-line-dark dark:bg-surface-dark"
        data-reveal
      >
        <ul>
          <li>学习记录：最近在啃什么、怎么理解的、哪里还卡着。</li>
          <li>工程札记：写代码、部署、工具选用时的真实取舍。</li>
          <li>专题整理：围绕一个主题整理的复盘、问题清单和阶段性记录。</li>
          <li>生活手记：工作以外的小事，不用包装，真实就好。</li>
        </ul>
        <p>
          想了解我怎么看这间站、希望读者有什么感受，见{" "}
          <a href="/brand/">品牌手记</a>。
        </p>
      </div>

      {/* 其他站点 */}
      <section data-reveal>
        <p className="editorial-label">其他站点</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {profile.sites.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-line-light bg-surface-light p-5 shadow-editorial-sm transition hover:border-primary-200 hover:shadow-editorial dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-ink transition group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-200">
                  {site.name}
                </h3>
                <span
                  aria-hidden="true"
                  className="font-sans text-sm text-ink-soft transition group-hover:text-primary-700 dark:text-gray-400 dark:group-hover:text-primary-300"
                >
                  ↗
                </span>
              </div>
              <p className="mt-1 font-sans text-xs text-ink-soft dark:text-gray-500">
                {site.domain}
              </p>
              <p className="mt-2 font-sans text-sm leading-6 text-ink-muted dark:text-gray-400">
                {site.detail}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* 分类入口 */}
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

      {/* 统计 */}
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
