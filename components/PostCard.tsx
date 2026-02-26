import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { Post } from "@/lib/posts";
import { getImagePath } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article
      className={`group bg-white dark:bg-[#242424] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-0.5 ${
        featured ? "md:col-span-2 md:flex-row" : ""
      }`}
    >
      <Link
        href={`/posts/${post.slug}`}
        className={`flex flex-col flex-grow ${
          featured ? "md:flex-row" : ""
        }`}
      >
        {/* Cover Image */}
        {post.coverImage && (
          <div
            className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
              featured
                ? "w-full md:w-1/2 h-56 md:h-auto md:min-h-[280px]"
                : "w-full h-48 md:h-52"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImagePath(post.coverImage)}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <div
          className={`p-5 md:p-6 flex flex-col flex-grow ${
            featured ? "md:w-1/2" : ""
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              {post.category}
            </span>
            <time className="text-xs text-gray-400 dark:text-gray-500">
              {post.date &&
                format(new Date(post.date), "yyyy年MM月dd日", {
                  locale: zhCN,
                })}
            </time>
          </div>

          <h2
            className={`font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug ${
              featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
            }`}
          >
            {post.title}
          </h2>

          {post.excerpt && (
            <p
              className={`text-gray-500 dark:text-gray-400 mb-4 flex-grow leading-relaxed ${
                featured ? "line-clamp-4 text-base" : "line-clamp-2 text-sm"
              }`}
            >
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{post.readingTime || 1} 分钟阅读</span>
            </div>
            <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-0.5 transition-transform duration-200 inline-flex items-center gap-1">
              阅读全文
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
