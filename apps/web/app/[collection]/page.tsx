import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCollections,
  getCollection,
  getCollectionNotes,
} from "@/lib/collections";
import { decodePathSegment } from "@/lib/utils";

interface CollectionPageProps {
  params: {
    collection: string;
  };
}

/**
 * dev 下 Next 以百分号编码后的请求路径比对参数，须返回编码值（中文 slug 时必需）；
 * 生产构建须返回原始值——编码值会改变导出目录名，破坏与基线一致的 URL（MIG-002）。
 */
function toRouteParam(slug: string): string {
  return process.env.NODE_ENV === "development"
    ? encodeURIComponent(slug)
    : slug;
}

export async function generateStaticParams() {
  return getAllCollections().map((collection) => ({
    collection: toRouteParam(collection.slug),
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = getCollection(decodePathSegment(params.collection));

  if (!collection) {
    return { title: "专栏不存在" };
  }

  return {
    title: collection.name,
    ...(collection.noindex
      ? { robots: { index: false, follow: false } }
      : { description: collection.description }),
  };
}

export default function CollectionIndexPage({ params }: CollectionPageProps) {
  const collection = getCollection(decodePathSegment(params.collection));

  if (!collection) {
    notFound();
  }

  const notes = getCollectionNotes(collection.slug);

  return (
    <div className="space-y-8">
      <header data-reveal="hero">
        <p className="editorial-label">{collection.label}</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-4 max-w-2xl font-sans text-base leading-7 text-ink-muted dark:text-gray-300">
            {collection.description}
          </p>
        )}
      </header>

      {notes.length === 0 ? (
        <div className="editorial-card py-16 text-center" data-reveal>
          <p className="font-sans text-lg text-ink-muted dark:text-gray-400">
            还没有笔记。
          </p>
        </div>
      ) : (
        <ol className="space-y-4">
          {notes.map((note, index) => (
            <li key={note.slug} data-reveal data-reveal-delay={(index % 4) * 80}>
              <Link
                href={`/${collection.slug}/${note.slug}`}
                className="group block rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm transition hover:border-primary-200 hover:shadow-editorial dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-sans text-sm font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                    {String(note.order).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-2xl font-bold tracking-normal text-ink transition group-hover:text-primary-800 dark:text-gray-50 dark:group-hover:text-primary-200">
                      {note.title}
                    </h2>
                    {note.excerpt && (
                      <p className="mt-2 line-clamp-2 font-sans text-sm leading-6 text-ink-muted dark:text-gray-300">
                        {note.excerpt}
                      </p>
                    )}
                    <p className="mt-3 font-sans text-xs text-ink-soft dark:text-gray-500">
                      {note.readingTime} 分钟阅读
                    </p>
                  </div>
                  <svg
                    className="mt-1 h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-1 group-hover:text-primary-700 dark:text-gray-500 dark:group-hover:text-primary-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
