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
    <article className="flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-gray-700 dark:bg-[#242424] dark:hover:border-primary-700">
      <Link href={`/posts/${post.slug}`} className="flex flex-col flex-grow">
        {post.coverImage && (
          <div className="relative h-44 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              {post.category}
            </span>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {post.date &&
                format(new Date(post.date), "yyyy年MM月dd日", { locale: zhCN })}
            </time>
          </div>
          <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900 transition-colors hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mb-4 line-clamp-3 flex-grow text-sm leading-6 text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <span>阅读时间: {post.readingTime || 1} 分钟</span>
            <span className="text-primary-600 dark:text-primary-400 hover:underline">
              阅读更多 →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
