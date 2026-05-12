import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { Post } from "@/lib/posts";

interface EssayListItemProps {
  post: Post;
}

export default function EssayListItem({ post }: EssayListItemProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group grid grid-cols-[160px_1fr_auto] items-start gap-6 border-t border-line-light py-6 transition dark:border-line-dark"
    >
      <div className="space-y-2 text-sm text-ink-muted dark:text-gray-400">
        <p>{post.date && format(new Date(post.date), "yyyy.MM.dd", { locale: zhCN })}</p>
        <p>{post.readingTime || 1} min read</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-primary-700 dark:text-primary-300">
          {post.category}
        </p>
        <h3 className="font-display text-2xl font-bold tracking-tight text-ink transition group-hover:text-primary-800 dark:text-gray-50 dark:group-hover:text-primary-200">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted dark:text-gray-300">
            {post.excerpt}
          </p>
        )}
      </div>

      <span className="pt-9 text-primary-700 transition group-hover:translate-x-1 dark:text-primary-300">
        →
      </span>
    </Link>
  );
}
