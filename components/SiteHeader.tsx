import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { mainNavItems } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line-light bg-background-light/90 backdrop-blur dark:border-line-dark dark:bg-background-dark/90">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-background-light dark:bg-gray-100 dark:text-gray-950">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink dark:text-gray-100">
            {siteConfig.author}
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-muted transition hover:text-ink dark:text-gray-400 dark:hover:text-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="rounded-full bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-800 dark:bg-primary-400 dark:text-gray-950 dark:hover:bg-primary-300"
          >
            Start reading
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
