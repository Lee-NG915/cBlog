import { distinctExcerpt, readingHtml } from "@/lib/content-display";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleDate from "@/components/ArticleDate";
import BackButton from "@/components/BackButton";
import MermaidEnhancer from "@/components/MermaidEnhancer";
import PostReadingProgress from "@/components/PostReadingProgress";
import PostTableOfContents from "@/components/PostTableOfContents";
import {
  getAllCollections,
  getCollection,
  getCollectionNote,
  getCollectionNotes,
} from "@/lib/content";
import { getPostHeadings, markdownToHtml } from "@/lib/content";
import { decodePathSegment } from "@/lib/utils";

interface CollectionNotePageProps {
  params: {
    collection: string;
    slug: string;
  };
}

/**
 * dev 下 Next 以百分号编码后的请求路径比对参数，须返回编码值（中文 slug 时必需）；
 * 生产构建须返回原始值——编码值会改变导出目录名，破坏与基线一致的 URL（MIG-002）。
 * Phase 5：该 hack 的存在条件 = output:"export" + dev + 非 ASCII slug；
 * runtime-isr 无此检查（无 export 目录名问题），dev 也返回原始值。
 */
function toRouteParam(slug: string): string {
  return process.env.NODE_ENV === "development" &&
    process.env.WEB_RENDER_MODE !== "runtime-isr"
    ? encodeURIComponent(slug)
    : slug;
}

export async function generateStaticParams() {
  const collections = await getAllCollections();
  const paramSets = await Promise.all(
    collections.map(async (collection) =>
      (await getCollectionNotes(collection.slug)).map((note) => ({
        collection: toRouteParam(collection.slug),
        slug: toRouteParam(note.slug),
      })),
    ),
  );
  // Next 14 static export requires a parameter even when all collections are private.
  return paramSets.flat().length
    ? paramSets.flat()
    : [{ collection: "__empty__", slug: "__empty__" }];
}

export async function generateMetadata({
  params,
}: CollectionNotePageProps): Promise<Metadata> {
  const collection = await getCollection(decodePathSegment(params.collection));
  const note = collection
    ? await getCollectionNote(collection.slug, decodePathSegment(params.slug))
    : null;

  if (!collection || !note) {
    return { title: "笔记不存在" };
  }

  return {
    title: note.title,
    description: note.excerpt,
    openGraph: { type: "article", publishedTime: note.date || undefined, modifiedTime: note.updatedAt || note.date || undefined },
    ...(collection.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function CollectionNotePage({
  params,
}: CollectionNotePageProps) {
  const collection = await getCollection(decodePathSegment(params.collection));
  const note = collection
    ? await getCollectionNote(collection.slug, decodePathSegment(params.slug))
    : null;

  if (!collection || !note) {
    notFound();
  }

  const allNotes = await getCollectionNotes(collection.slug);
  const noteIndex = allNotes.findIndex((item) => item.slug === note.slug);
  const neighbors = [
    { note: allNotes[noteIndex - 1], label: "上一篇" },
    { note: allNotes[noteIndex + 1], label: "下一篇" },
  ];
  const excerpt = distinctExcerpt(note.content, note.excerpt);
  const headings = getPostHeadings(note.content);
  const content = await markdownToHtml(
    note.content,
    headings,
    `/content/collections/${collection.slug}`,
  );
  const hasMermaidDiagrams = content.includes("mermaid-diagram");

  return (
    <>
      <PostReadingProgress />
      <article className="min-w-0">
        <div data-reveal="fade">
          <BackButton href={`/${collection.slug}`} label="返回笔记目录" />
        </div>

        <header className="mb-8 pb-2 sm:mb-10 sm:pb-4">
          <div
            className="mb-6 flex flex-wrap items-center gap-3"
            data-reveal="hero"
          >
            <span className="rounded-full bg-primary-50 px-4 py-2 font-sans text-sm font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
              {collection.badge}
            </span>
            <span className="font-sans text-sm text-ink-muted dark:text-gray-400">
              {note.readingTime} 分钟阅读
            </span>
            <ArticleDate value={note.date} />
          </div>

          <h1
            className="article-title text-ink dark:text-gray-50"
            data-reveal="hero"
            data-reveal-delay="80"
          >
            {note.title}
          </h1>

          {excerpt && (
            <p
              className="mt-6 max-w-4xl break-words font-sans text-base leading-8 text-ink-muted dark:text-gray-300 sm:text-lg"
              data-reveal
              data-reveal-delay="140"
            >
              {excerpt}
            </p>
          )}
        </header>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,760px)_300px] xl:gap-12">
          <div className="min-w-0 space-y-6">
            {headings.length > 0 && (
              <details className="mobile-toc">
                <summary>文章目录 · {headings.length} 节</summary>
                <PostTableOfContents headings={headings} />
              </details>
            )}
            <div
              className="prose -mx-4 min-w-0 border-y border-line-light bg-surface-light px-4 py-6 shadow-none dark:border-line-dark dark:bg-surface-dark sm:mx-0 sm:rounded-lg sm:border sm:p-8 sm:shadow-editorial lg:p-9"
              data-reveal
              data-post-body
              dangerouslySetInnerHTML={{
                __html: readingHtml(content),
              }}
            />
            <ArticleDate value={note.updatedAt} edited />
            {hasMermaidDiagrams && <MermaidEnhancer />}
            <nav aria-label="专栏前后篇" className="grid gap-3 sm:grid-cols-2">
              {neighbors.map(
                ({ note: item, label }) =>
                  item && (
                    <Link
                      key={label}
                      href={`/${collection.slug}/${item.slug}`}
                      className="editorial-card p-5"
                    >
                      <span className="block text-sm text-ink-muted dark:text-gray-300">
                        {label}
                      </span>
                      <span className="mt-2 block font-medium">
                        {item.title}
                      </span>
                    </Link>
                  ),
              )}
            </nav>
          </div>

          <aside
            className="hidden min-w-0 lg:block"
            data-reveal
            data-reveal-delay="140"
          >
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto pr-1">
              {headings.length > 0 && (
                <PostTableOfContents headings={headings} title="文章目录" />
              )}

              <div className="rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial dark:border-line-dark dark:bg-surface-dark">
                <p className="font-sans text-xs font-semibold tracking-normal text-primary-700 dark:text-primary-300">
                  全部笔记
                </p>

                <div className="mt-5 space-y-2">
                  {allNotes.map((item) => {
                    const isCurrent = item.slug === note.slug;

                    return (
                      <Link
                        key={item.slug}
                        href={`/${collection.slug}/${item.slug}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`block rounded-md px-3 py-2 font-sans text-sm leading-5 transition ${
                          isCurrent
                            ? "bg-primary-50 font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
                            : "text-ink-muted hover:bg-background-light hover:text-primary-800 dark:text-gray-400 dark:hover:bg-background-dark dark:hover:text-primary-200"
                        }`}
                      >
                        <span className="line-clamp-2">
                          {String(item.order).padStart(2, "0")}. {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
