import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { Post } from "@/lib/posts";
import { getImagePath } from "@/lib/utils";

interface FeaturedPostProps {
  post: Post;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group grid overflow-hidden rounded-[2rem] border border-line-light bg-surface-light transition hover:-translate-y-0.5 hover:border-primary-200 dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800 md:min-h-[360px] md:grid-cols-[0.95fr_1.05fr]"
    >
      <div className="relative min-h-[220px] overflow-hidden bg-ink dark:bg-black sm:min-h-[300px] md:min-h-[360px]">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImagePath(post.coverImage)}
            alt={post.title}
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 p-8 text-background-light">
            <div className="grid h-full grid-cols-6 grid-rows-6 gap-2 opacity-80">
              {Array.from({ length: 36 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-xl border border-white/10 ${
                    index % 5 === 0
                      ? "bg-primary-300/40"
                      : index % 7 === 0
                        ? "bg-white/20"
                        : "bg-white/5"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        <div className="absolute bottom-6 left-6 rounded-full bg-background-light/90 px-4 py-2 text-sm font-medium text-ink">
          {post.category}
        </div>
      </div>

      <div className="flex flex-col p-6 sm:p-8 md:p-9">
        <div className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-primary-700 dark:text-primary-300">
          <span>Featured note</span>
          <span className="h-px w-10 bg-primary-200 dark:bg-primary-800" />
          <time className="tracking-normal text-ink-muted dark:text-gray-400">
            {post.date && format(new Date(post.date), "yyyy.MM.dd", { locale: zhCN })}
          </time>
        </div>

        <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.12] tracking-[-0.04em] text-ink transition group-hover:text-primary-800 dark:text-gray-50 dark:group-hover:text-primary-200 sm:text-5xl">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-muted dark:text-gray-300">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-8">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line-light px-3 py-1 text-xs text-ink-muted dark:border-line-dark dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-line-light pt-5 text-sm dark:border-line-dark">
          <span className="text-ink-muted dark:text-gray-400">
            {post.readingTime || 1} min read
          </span>
          <span className="font-medium text-primary-800 transition group-hover:translate-x-1 dark:text-primary-200">
            Read post →
          </span>
        </div>
      </div>
    </Link>
  );
}
