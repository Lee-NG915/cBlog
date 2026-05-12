import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { Post } from "@/lib/posts";
import { getImagePath } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-line-light bg-surface-light transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800">
      <Link href={`/posts/${post.slug}`} className="flex flex-col flex-grow">
        {post.coverImage && (
          <div className="relative h-44 w-full overflow-hidden bg-primary-50 dark:bg-primary-900/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImagePath(post.coverImage)}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex flex-grow flex-col p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
              {post.category}
            </span>
            <time className="text-sm text-ink-soft dark:text-gray-500">
              {post.date &&
                format(new Date(post.date), "yyyy年MM月dd日", { locale: zhCN })}
            </time>
          </div>
          <h2 className="mb-3 font-display text-xl font-bold leading-snug tracking-tight text-ink transition-colors hover:text-primary-800 dark:text-gray-100 dark:hover:text-primary-200">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mb-4 line-clamp-3 flex-grow text-sm leading-6 text-ink-muted dark:text-gray-400">
              {post.excerpt}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line-light px-2.5 py-1 text-xs text-ink-muted dark:border-line-dark dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between text-sm text-ink-soft dark:text-gray-500">
            <span>阅读时间: {post.readingTime || 1} 分钟</span>
            <span className="text-primary-700 hover:underline dark:text-primary-300">
              阅读更多 →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
