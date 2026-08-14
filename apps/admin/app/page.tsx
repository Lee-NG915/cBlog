"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PostMeta } from "@cblog/core";
import { fetchJson } from "@/lib/api";

interface Stats {
  posts: { total: number; published: number; draft: number; archived: number };
  categories: Array<{ slug: string; name: string; count: number }>;
  collections: Array<{ slug: string; name: string; count: number }>;
  recent: PostMeta[];
}

const STATUS_LABELS: Record<PostMeta["status"], string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchJson<Stats>("/api/stats")
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <div className="flex items-center gap-2">
          <Link href="/posts/new" className="btn btn-primary">
            新建文章
          </Link>
          <Link href="/publish" className="btn">
            发布上线
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!stats && !error && <p className="text-sm text-slate-400">加载中…</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="card">
              <p className="text-xs font-medium text-slate-500">全部文章</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.posts.total}
              </p>
            </div>
            <div className="card">
              <p className="text-xs font-medium text-slate-500">已发布</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {stats.posts.published}
              </p>
            </div>
            <div className="card">
              <p className="text-xs font-medium text-slate-500">草稿</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {stats.posts.draft}
              </p>
            </div>
            <div className="card">
              <p className="text-xs font-medium text-slate-500">已归档</p>
              <p className="mt-2 text-3xl font-bold text-slate-500">
                {stats.posts.archived}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                分类分布
              </h2>
              {stats.categories.length === 0 ? (
                <p className="text-sm text-slate-400">暂无分类</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.categories.map((category) => (
                    <li
                      key={category.slug}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-slate-700">{category.name}</span>
                      <span
                        className={`font-mono tabular-nums ${
                          category.count === 0
                            ? "text-slate-300"
                            : "text-slate-800"
                        }`}
                      >
                        {category.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                专栏
              </h2>
              {stats.collections.length === 0 ? (
                <p className="text-sm text-slate-400">暂无专栏</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.collections.map((collection) => (
                    <li key={collection.slug}>
                      <Link
                        href="/collections"
                        className="flex items-center justify-between py-2 text-sm transition hover:text-emerald-700"
                      >
                        <span className="text-slate-700">
                          {collection.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {collection.count} 篇文档
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              最近文章
            </h2>
            {stats.recent.length === 0 ? (
              <p className="text-sm text-slate-400">暂无文章</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.recent.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <Link
                      href={`/posts/${post.id}`}
                      className="min-w-0 flex-1 truncate font-medium text-slate-800 transition hover:text-emerald-700"
                    >
                      {post.title}
                    </Link>
                    <span className={`badge badge-${post.status}`}>
                      {STATUS_LABELS[post.status]}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {post.date.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
