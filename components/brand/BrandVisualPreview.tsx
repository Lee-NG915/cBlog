import Link from "next/link";
import FeaturedPost from "@/components/FeaturedPost";
import { showcasePost } from "@/lib/brand-showcase";
import ShowcaseSandbox from "./ShowcaseSandbox";

const moodColors = [
  { name: "暖纸色", className: "bg-background-light" },
  { name: "深夜墨", className: "bg-background-dark" },
  { name: "墨迹", className: "bg-ink" },
  { name: "陶土", className: "bg-primary-500" },
  { name: "鼠尾草", className: "bg-accent-sage" },
  { name: "青蓝", className: "bg-accent-blue" },
];

export default function BrandVisualPreview() {
  return (
    <div id="look" className="scroll-mt-28 space-y-10" data-reveal>
      <div className="editorial-card p-6 sm:p-8">
        <p className="editorial-label mb-4">配色</p>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {moodColors.map((c) => (
            <div key={c.name} className="space-y-2 text-center">
              <div
                className={`mx-auto h-14 w-14 rounded-full border border-line-light dark:border-line-dark ${c.className}`}
              />
              <p className="font-sans text-xs text-ink-muted dark:text-gray-400">
                {c.name}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 font-serif text-base leading-relaxed text-ink/90 dark:text-gray-300">
          中文、英文、标题、正文和代码都使用 Maple Mono CN 的圆润字形，再用字号与字重拉开层级。正文行距偏宽，整体想让你像坐在窗边翻笔记本，而不是刷短内容。
        </p>
      </div>

      <div>
        <p className="mb-4 font-sans text-sm text-ink-soft dark:text-gray-500">
          文章在列表里大致长这样
        </p>
        <ShowcaseSandbox>
          <FeaturedPost post={showcasePost} revealDelay={0} />
        </ShowcaseSandbox>
      </div>

      <div className="editorial-card p-6 sm:p-8">
        <p className="editorial-label mb-4">正文片段</p>
        <div className="prose max-w-none">
          <p>
            有时一篇文章只是为了记住某一天的想法。不必完整，不必正确，过阵子再读，也许会有新的理解。
          </p>
          <blockquote>留一点空白，是给未来的自己写的。</blockquote>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 font-sans">
        <Link
          href="/"
          className="rounded-full bg-accent-sage px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:hover:bg-primary-600"
        >
          从最新文章开始
        </Link>
        <Link
          href="/categories"
          className="rounded-full border border-line-light bg-surface-light px-5 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-300 dark:hover:text-primary-200"
        >
          按主题翻翻
        </Link>
      </div>
    </div>
  );
}
