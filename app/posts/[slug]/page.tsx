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
    <article className="min-w-0 overflow-hidden">
      <BackButton href="/" label="Back home" />

      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,780px)_260px]">
        <div className="min-w-0">
          <header className="mb-10 border-b border-line-light pb-10 dark:border-line-dark">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                {post.category}
              </span>
              {post.readingTime && (
                <span className="text-sm text-ink-muted dark:text-gray-400">
                  {post.readingTime} min read
                </span>
              )}
            </div>

            <h1 className="break-words font-display text-5xl font-bold leading-[1.08] tracking-[-0.05em] text-ink dark:text-gray-50 sm:text-6xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 break-words text-lg leading-8 text-ink-muted dark:text-gray-300 sm:text-xl sm:leading-9">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-ink-soft dark:text-gray-500">
              {post.date && (
                <time>
                  Published{" "}
                  {format(new Date(post.date), "yyyy.MM.dd", {
                    locale: zhCN,
                  })}
                </time>
              )}
              {post.updatedAt && (
                <time>
                  Updated{" "}
                  {format(new Date(post.updatedAt), "yyyy.MM.dd", {
                    locale: zhCN,
                  })}
                </time>
              )}
            </div>
          </header>

          <div
            className="prose min-w-0 overflow-hidden rounded-3xl border border-line-light bg-surface-light p-5 dark:border-line-dark dark:bg-surface-dark sm:p-8"
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
                <dt className="text-ink-soft dark:text-gray-500">Path</dt>
                <dd className="mt-1 font-medium text-ink dark:text-gray-100">
                  {post.category}
                </dd>
              </div>
              <div>
                <dt className="text-ink-soft dark:text-gray-500">Reading time</dt>
                <dd className="mt-1 font-medium text-ink dark:text-gray-100">
                  {post.readingTime || 1} min
                </dd>
              </div>
              {post.date && (
                <div>
                  <dt className="text-ink-soft dark:text-gray-500">Published</dt>
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
