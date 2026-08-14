import type { Metadata } from "next";
import Link from "next/link";
import { getAllAddxAiNotes } from "@/lib/addxAi";

export const metadata: Metadata = {
  title: "addx.ai 面试笔记",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddxAiIndexPage() {
  const notes = getAllAddxAiNotes();

  return (
    <div className="space-y-8">
      <header data-reveal="hero">
        <p className="editorial-label">Interview Notes</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          addx.ai 面试笔记
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-7 text-ink-muted dark:text-gray-300">
          针对积加科技 / addx.ai 面试准备的要点复习目录，仅通过手动输入路由访问。
        </p>
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
            <li
              key={note.slug}
              data-reveal
              data-reveal-delay={(index % 4) * 80}
            >
              <Link
                href={`/addx-ai/${note.slug}`}
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
