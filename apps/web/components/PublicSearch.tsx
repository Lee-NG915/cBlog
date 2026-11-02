"use client";
import { SelectField } from "@cblog/ui";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
export type SearchEntry = {
  href: string;
  title: string;
  excerpt: string;
  group: string;
  tags: string[];
};
export default function PublicSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [count, setCount] = useState(20);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
  }, []);
  const groups = useMemo(
    () => Array.from(new Set(entries.map((x) => x.group))),
    [entries],
  );
  const results = useMemo(() => {
    const terms = query
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return entries.filter(
      (x) =>
        (!group || x.group === group) &&
        terms.every((t) =>
          `${x.title} ${x.excerpt} ${x.tags.join(" ")}`
            .normalize("NFKC")
            .toLowerCase()
            .includes(t),
        ),
    );
  }, [entries, query, group]);
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="grid gap-2 text-sm font-medium">
          关键词
          <input
            type="search"
            value={query}
            maxLength={200}
            placeholder="搜索标题、摘要或标签"
            className="min-h-12 w-full rounded-lg border border-line-strong bg-surface-light px-4 text-base dark:border-line-dark dark:bg-surface-dark"
            onChange={(e) => {
              setQuery(e.target.value);
              setCount(20);
              const url = new URL(location.href);
              e.target.value
                ? url.searchParams.set("q", e.target.value)
                : url.searchParams.delete("q");
              history.replaceState(null, "", url);
            }}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          主题或专栏
          <SelectField
            value={group}
            className="min-h-12 w-full rounded-lg border border-line-strong bg-surface-light px-3 text-base dark:border-line-dark dark:bg-surface-dark"
            onValueChange={(e) => {
              setGroup(e);
              setCount(20);
            }}
          >
            <option value="">全部内容</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </SelectField>
        </label>
      </div>
      <p role="status" className="text-sm text-ink-muted dark:text-gray-300">
        {query || group
          ? `找到 ${results.length} 篇手记`
          : `共 ${entries.length} 篇公开手记`}
      </p>
      {results.length === 0 ? (
        <div className="editorial-card p-8 text-center">
          <h2 className="text-xl font-semibold">没有找到相关手记</h2>
          <p className="my-4 text-ink-muted dark:text-gray-300">
            换一个关键词，或取消主题筛选再试试。
          </p>
          <button
            className="min-h-11 rounded-full border border-line-strong px-5"
            onClick={() => {
              setQuery("");
              setGroup("");
              history.replaceState(null, "", location.pathname);
            }}
          >
            清除筛选
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-line-light dark:divide-line-dark">
          {results.slice(0, count).map((x) => (
            <li key={x.href}>
              <Link
                className="block rounded-lg py-6 focus-visible:outline-offset-4"
                href={x.href}
              >
                <p className="mb-2 text-sm text-primary-700 dark:text-primary-300">
                  {x.group}
                </p>
                <h2 className="text-xl font-semibold leading-snug">
                  {x.title}
                </h2>
                <p className="mt-3 line-clamp-2 leading-7 text-ink-muted dark:text-gray-300">
                  {x.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {count < results.length && (
        <button
          className="min-h-11 rounded-full border border-line-strong px-6 py-3"
          onClick={() => setCount((n) => n + 20)}
        >
          继续查看 · 已展示 {count} / {results.length} 篇
        </button>
      )}
    </section>
  );
}
