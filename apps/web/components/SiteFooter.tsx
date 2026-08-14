import Link from "next/link";
import { mainNavItems } from "@/lib/navigation";
import { postCategories, siteConfig } from "@/lib/site";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line-light dark:border-line-dark sm:mt-24">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 py-10 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:px-7 sm:py-12">
        <div>
          <p className="font-display text-lg font-bold text-ink dark:text-gray-100">
            {siteConfig.title}
          </p>
          <p className="mt-3 max-w-sm font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="页脚导航">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft dark:text-gray-500">
            页面
          </p>
          <ul className="mt-4 space-y-2.5">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-sans text-sm text-ink-muted transition hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="阅读路径导航">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft dark:text-gray-500">
            阅读路径
          </p>
          <ul className="mt-4 space-y-2.5">
            {postCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="font-sans text-sm text-ink-muted transition hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line-light dark:border-line-dark">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-7">
          <p className="font-sans text-xs text-ink-soft dark:text-gray-500">
            © {year} {siteConfig.author} · 慢慢写，慢慢读
          </p>
          <Link
            href="/sitemap.xml"
            className="font-sans text-xs text-ink-soft transition hover:text-primary-800 dark:text-gray-500 dark:hover:text-primary-200"
          >
            Sitemap
          </Link>
        </div>
      </div>
    </footer>
  );
}
