import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { Post } from "@/lib/posts";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
      <Link href={`/posts/${post.slug}`} className="flex flex-col flex-grow">
        {/* 封面图片 */}
        {post.coverImage && (
          <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-200 dark:bg-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              {post.category}
            </span>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {post.date &&
                format(new Date(post.date), "yyyy年MM月dd日", { locale: zhCN })}
            </time>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
              {post.excerpt}
            </p>
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
