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
    <article>
      <BackButton href="/" label="返回首页" />

      <div className="grid grid-cols-[minmax(0,780px)_260px] gap-10">
        <div>
          <header className="mb-10 border-b border-line-light pb-10 dark:border-line-dark">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                {post.category}
              </span>
              {post.readingTime && (
                <span className="text-sm text-ink-muted dark:text-gray-400">
                  阅读时间 {post.readingTime} 分钟
                </span>
              )}
            </div>

            <h1 className="font-display text-6xl font-black leading-[1.08] tracking-[-0.05em] text-ink dark:text-gray-50">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 text-xl leading-9 text-ink-muted dark:text-gray-300">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-ink-soft dark:text-gray-500">
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
          </header>

          <div
            className="prose rounded-3xl border border-line-light bg-surface-light p-8 dark:border-line-dark dark:bg-surface-dark"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <aside className="sticky top-10 hidden h-fit space-y-6 lg:block">
          <div className="rounded-3xl border border-line-light bg-surface-light p-6 dark:border-line-dark dark:bg-surface-dark">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700 dark:text-primary-300">
              Article note
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-ink-soft dark:text-gray-500">路径</dt>
                <dd className="mt-1 font-medium text-ink dark:text-gray-100">
                  {post.category}
                </dd>
              </div>
              <div>
                <dt className="text-ink-soft dark:text-gray-500">阅读时间</dt>
                <dd className="mt-1 font-medium text-ink dark:text-gray-100">
                  {post.readingTime || 1} 分钟
                </dd>
              </div>
              {post.date && (
                <div>
                  <dt className="text-ink-soft dark:text-gray-500">发布</dt>
                  <dd className="mt-1 font-medium text-ink dark:text-gray-100">
                    {format(new Date(post.date), "yyyy.MM.dd", {
                      locale: zhCN,
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {post.tags.length > 0 && (
            <div className="rounded-3xl border border-line-light bg-surface-light p-6 dark:border-line-dark dark:bg-surface-dark">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700 dark:text-primary-300">
                Tags
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line-light px-3 py-1 text-xs text-ink-muted dark:border-line-dark dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
