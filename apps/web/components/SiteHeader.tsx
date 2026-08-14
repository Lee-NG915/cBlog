import Link from "next/link";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import { mainNavItems } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line-light bg-background-light/88 backdrop-blur-md dark:border-line-dark dark:bg-background-dark/90">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:h-[72px] sm:px-7">
        <Link
          href="/"
          aria-label={`${siteConfig.title} 首页`}
          className="flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-sans text-sm font-bold text-background-light shadow-editorial-sm dark:bg-gray-100 dark:text-gray-950">
            C
          </span>
          <span className="truncate font-sans text-sm font-semibold tracking-normal text-ink dark:text-gray-100">
            {siteConfig.author}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-sans text-sm font-medium text-ink-muted transition hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/categories"
            className="hidden rounded-full border border-line-light bg-surface-light px-4 py-2 font-sans text-xs font-semibold text-ink-muted transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-300 dark:hover:border-primary-700 dark:hover:text-primary-200 sm:inline-block sm:px-5 sm:text-sm"
          >
            开始阅读
          </Link>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
