import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import MermaidEnhancer from "@/components/MermaidEnhancer";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import {
  getAllCategories,
  getAllPosts,
  getPostBySlug,
  getAllPostSlugs,
  markdownToHtml,
} from "@/lib/posts";
import { notFound } from "next/navigation";
import { decodePathSegment } from "@/lib/utils";
import { getSeoImageUrl, getSiteUrl, siteConfig } from "@/lib/site";

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

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const slug = decodePathSegment(params.slug);
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  const canonicalPath = `/posts/${post.slug}/`;
  const description = post.excerpt || siteConfig.description;
  const image = getSeoImageUrl(post.coverImage);

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: canonicalPath,
      siteName: siteConfig.title,
      title: post.title,
      description,
      locale: "zh_CN",
      publishedTime: post.date || undefined,
      modifiedTime: post.updatedAt || post.date || undefined,
      authors: [siteConfig.author],
      tags: post.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const slug = decodePathSegment(params.slug);
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);
  const categories = getAllCategories();
  const allPosts = getAllPosts();
  const sidebarCategories = categories.map((category) => ({
    ...category,
    posts: allPosts
      .filter((categoryPost) => categoryPost.categorySlug === category.slug)
      .slice(0, 4),
  }));
  const canonicalUrl = getSiteUrl(`/posts/${post.slug}/`);
  const image = getSeoImageUrl(post.coverImage);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || siteConfig.description,
    image: getSiteUrl(image),
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    datePublished: post.date || undefined,
    dateModified: post.updatedAt || post.date || undefined,
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
    },
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="min-w-0">
        <BackButton href="/" label="返回首页" />

        <header className="mb-10 pb-4">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/categories/${post.categorySlug}`}
              className="rounded-full bg-primary-50 px-4 py-2 font-sans text-sm font-semibold text-primary-800 transition hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
            >
              {post.category}
            </Link>
            <span className="font-sans text-sm text-ink-muted dark:text-gray-400">
              {post.readingTime || 1} 分钟阅读
            </span>
          </div>

          <h1 className="max-w-5xl break-words font-display text-5xl font-bold leading-[1.06] tracking-normal text-ink dark:text-gray-50 sm:text-6xl lg:text-7xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 max-w-4xl break-words font-sans text-lg leading-8 text-ink-muted dark:text-gray-300 sm:text-xl sm:leading-9">
              {post.excerpt}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            {post.date && (
              <time className="font-sans text-sm text-ink-soft dark:text-gray-500">
                发布于{" "}
                {format(new Date(post.date), "yyyy.MM.dd", {
                  locale: zhCN,
                })}
              </time>
            )}
            {post.updatedAt && (
              <time className="font-sans text-sm text-ink-soft dark:text-gray-500">
                更新于{" "}
                {format(new Date(post.updatedAt), "yyyy.MM.dd", {
                  locale: zhCN,
                })}
              </time>
            )}
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line-light bg-surface-light px-3 py-1 font-sans text-xs text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,760px)_300px] xl:gap-12">
          <div className="min-w-0">
            <div
              className="prose min-w-0 overflow-hidden rounded-lg border border-line-light bg-surface-light p-5 shadow-editorial dark:border-line-dark dark:bg-surface-dark sm:p-8 lg:p-9"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <MermaidEnhancer />
          </div>

        <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto pr-1">
              <div className="rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial dark:border-line-dark dark:bg-surface-dark">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
                    阅读路径
                  </p>
                  <Link
                    href="/categories"
                    className="font-sans text-xs font-medium text-ink-soft transition hover:text-primary-800 dark:text-gray-500 dark:hover:text-primary-200"
                  >
                    全部
                  </Link>
                </div>

                <div className="mt-5 space-y-6">
                  {sidebarCategories.map((category) => (
                    <section
                      key={category.slug}
                      className="border-t border-line-light pt-5 first:border-t-0 first:pt-0 dark:border-line-dark"
                    >
                      <Link
                        href={`/categories/${category.slug}`}
                        className="group flex items-center justify-between gap-3"
                      >
                        <span className="font-sans text-sm font-semibold text-ink transition group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-200">
                          {category.name}
                        </span>
                        <span className="rounded-full bg-primary-50 px-2.5 py-1 font-sans text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                          {category.count}
                        </span>
                      </Link>

                      <div className="mt-3 space-y-2">
                        {category.posts.length === 0 ? (
                          <p className="font-sans text-xs leading-5 text-ink-soft dark:text-gray-500">
                            暂无文章
                          </p>
                        ) : (
                          category.posts.map((categoryPost) => {
                            const isCurrentPost =
                              categoryPost.slug === post.slug;

                            return (
                              <Link
                                key={categoryPost.slug}
                                href={`/posts/${categoryPost.slug}`}
                                aria-current={isCurrentPost ? "page" : undefined}
                                className={`block rounded-md px-3 py-2 font-sans text-sm leading-5 transition ${
                                  isCurrentPost
                                    ? "bg-primary-50 font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
                                    : "text-ink-muted hover:bg-background-light hover:text-primary-800 dark:text-gray-400 dark:hover:bg-background-dark dark:hover:text-primary-200"
                                }`}
                              >
                                <span className="line-clamp-2">
                                  {categoryPost.title}
                                </span>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
