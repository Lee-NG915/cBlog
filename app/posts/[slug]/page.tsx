import BackButton from "@/components/BackButton";
import TableOfContents from "@/components/TableOfContents";
import GiscusComments from "@/components/GiscusComments";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import {
  getPostBySlug,
  getAllPostSlugs,
  markdownToHtml,
  extractToc,
} from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || `${post.title} - cBlog`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);
  const toc = extractToc(post.content);

  return (
    <div className="flex gap-8 max-w-6xl mx-auto">
      {/* Article Content */}
      <article className="flex-1 min-w-0">
        <BackButton href="/" label="返回首页" />

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              {post.category}
            </span>
            {post.readingTime && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
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
                {post.readingTime} 分钟阅读
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
            {post.title}
          </h1>
          {post.date && (
            <time className="text-gray-500 dark:text-gray-400 text-sm">
              {format(new Date(post.date), "yyyy年MM月dd日", {
                locale: zhCN,
              })}
            </time>
          )}
        </header>

        {/* Post Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Comments */}
        <GiscusComments slug={params.slug} />
      </article>

      {/* Table of Contents Sidebar */}
      {toc.length > 0 && <TableOfContents toc={toc} />}
    </div>
  );
}
