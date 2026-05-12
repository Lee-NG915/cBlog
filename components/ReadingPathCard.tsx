import Link from "next/link";
import { Category, Post } from "@/lib/posts";

interface ReadingPathCardProps {
  category: Category;
  latestPost?: Post;
}

export default function ReadingPathCard({
  category,
  latestPost,
}: ReadingPathCardProps) {
  return (
    <Link
      href={`/categories/${encodeURIComponent(category.name)}`}
      className="group flex min-h-[190px] flex-col rounded-3xl border border-line-light bg-surface-light p-6 transition hover:-translate-y-0.5 hover:border-primary-200 dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-700 dark:text-primary-300">
            Reading path
          </p>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink group-hover:text-primary-800 dark:text-gray-50 dark:group-hover:text-primary-200">
            {category.name}
          </h3>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
          {category.count}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink-muted dark:text-gray-300">
        {category.description}
      </p>

      <div className="mt-auto border-t border-line-light pt-4 dark:border-line-dark">
        <p className="text-xs text-ink-soft dark:text-gray-500">最近文章</p>
        <p className="mt-1 truncate text-sm font-medium text-ink dark:text-gray-100">
          {latestPost?.title || "等待新的笔记"}
        </p>
      </div>
    </Link>
  );
}
