import Link from "next/link";
export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <p className="editorial-label">404 · 页面未找到</p>
      <h1 className="page-title mt-4">这页暂时不在书架上</h1>
      <p className="my-6 leading-8 text-ink-muted dark:text-gray-300">
        链接可能已更改，或文章已下线。可以回首页，或搜索其他手记。
      </p>
      <div className="flex justify-center gap-4">
        <Link
          className="rounded-full bg-accent-sage px-6 py-3 text-white"
          href="/"
        >
          返回首页
        </Link>
        <Link
          className="rounded-full border border-line-light px-6 py-3"
          href="/search"
        >
          搜索手记
        </Link>
      </div>
    </section>
  );
}
