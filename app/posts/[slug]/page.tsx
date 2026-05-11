import BackButton from "@/components/BackButton";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { getPostBySlug, getAllPostSlugs, markdownToHtml } from "@/lib/posts";
import { notFound } from "next/navigation";
import { decodePathSegment } from "@/lib/utils";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: encodeURIComponent(slug),
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const slug = decodePathSegment(params.slug);
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);

  return (
    <article className="mx-auto max-w-4xl">
      <BackButton href="/" label="返回首页" />

      <header className="mb-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#242424]">
        <div className="flex items-center space-x-4 mb-4">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full">
            {post.category}
          </span>
          {post.readingTime && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              阅读时间: {post.readingTime} 分钟
            </span>
          )}
        </div>
        <h1 className="mb-4 text-5xl font-bold leading-tight text-gray-950 dark:text-gray-50">
          {post.title}
        </h1>
        <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
          {post.date && (
            <time>
              发布于{" "}
              {format(new Date(post.date), "yyyy年MM月dd日", {
                locale: zhCN,
              })}
            </time>
          )}
          {post.updatedAt && (
            <time>
              更新于{" "}
              {format(new Date(post.updatedAt), "yyyy年MM月dd日", {
                locale: zhCN,
              })}
            </time>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose max-w-none rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-[#242424]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
