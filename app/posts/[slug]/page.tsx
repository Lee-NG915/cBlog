import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { getPostBySlug, getAllPostSlugs, markdownToHtml } from "@/lib/posts";
import { notFound } from "next/navigation";

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

export default async function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="text-primary-600 dark:text-primary-400 hover:underline mb-6 inline-block"
          >
            ← 返回首页
          </Link>

          {/* Post Header */}
          <header className="mb-8">
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>
            {post.date && (
              <time className="text-gray-500 dark:text-gray-400">
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
        </article>
      </main>
      <Footer />
    </div>
  );
}
