import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import MermaidEnhancer from "@/components/MermaidEnhancer";
import PostReadingProgress from "@/components/PostReadingProgress";
import PostTableOfContents from "@/components/PostTableOfContents";
import { getPostHeadings, markdownToHtml } from "@/lib/posts";
import {
  getAllRightCapitalNotes,
  getAllRightCapitalSlugs,
  getRightCapitalNoteBySlug,
} from "@/lib/rightCapital";
import { decodePathSegment } from "@/lib/utils";
import { notFound } from "next/navigation";

interface RightCapitalNotePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return getAllRightCapitalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RightCapitalNotePageProps): Promise<Metadata> {
  const slug = decodePathSegment(params.slug);
  const note = getRightCapitalNoteBySlug(slug);

  if (!note) {
    return {
      title: "笔记不存在",
    };
  }

  return {
    title: note.title,
    description: note.excerpt,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RightCapitalNotePage({
  params,
}: RightCapitalNotePageProps) {
  const slug = decodePathSegment(params.slug);
  const note = getRightCapitalNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const allNotes = getAllRightCapitalNotes();
  const headings = getPostHeadings(note.content);
  const content = await markdownToHtml(note.content, headings);
  const hasMermaidDiagrams = content.includes("mermaid-diagram");

  return (
    <>
      <PostReadingProgress />
      <article className="min-w-0">
        <div data-reveal="fade">
          <BackButton href="/rightCapital" label="返回笔记目录" />
        </div>

        <header className="mb-10 pb-4">
          <div className="mb-6 flex flex-wrap items-center gap-3" data-reveal="hero">
            <span className="rounded-full bg-primary-50 px-4 py-2 font-sans text-sm font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
              RightCapital
            </span>
            <span className="font-sans text-sm text-ink-muted dark:text-gray-400">
              {note.readingTime} 分钟阅读
            </span>
          </div>

          <h1
            className="max-w-5xl break-words font-display text-5xl font-bold leading-[1.06] tracking-normal text-ink dark:text-gray-50 sm:text-6xl lg:text-7xl"
            data-reveal="hero"
            data-reveal-delay="80"
          >
            {note.title}
          </h1>

          {note.excerpt && (
            <p
              className="mt-6 max-w-4xl break-words font-sans text-lg leading-8 text-ink-muted dark:text-gray-300 sm:text-xl sm:leading-9"
              data-reveal
              data-reveal-delay="140"
            >
              {note.excerpt}
            </p>
          )}
        </header>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,760px)_300px] xl:gap-12">
          <div className="min-w-0 space-y-6">
            <div
              className="prose min-w-0 rounded-lg border border-line-light bg-surface-light p-5 shadow-editorial dark:border-line-dark dark:bg-surface-dark sm:p-8 lg:p-9"
              data-reveal
              data-post-body
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {hasMermaidDiagrams && <MermaidEnhancer />}
          </div>

          <aside className="hidden min-w-0 lg:block" data-reveal data-reveal-delay="140">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto pr-1">
              {headings.length > 0 && (
                <PostTableOfContents headings={headings} title="文章目录" />
              )}

              <div className="rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial dark:border-line-dark dark:bg-surface-dark">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
                  全部笔记
                </p>

                <div className="mt-5 space-y-2">
                  {allNotes.map((item) => {
                    const isCurrent = item.slug === note.slug;

                    return (
                      <Link
                        key={item.slug}
                        href={`/rightCapital/${item.slug}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`block rounded-md px-3 py-2 font-sans text-sm leading-5 transition ${
                          isCurrent
                            ? "bg-primary-50 font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
                            : "text-ink-muted hover:bg-background-light hover:text-primary-800 dark:text-gray-400 dark:hover:bg-background-dark dark:hover:text-primary-200"
                        }`}
                      >
                        <span className="line-clamp-2">
                          {item.order}. {item.title}
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
