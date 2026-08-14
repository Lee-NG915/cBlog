"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@cblog/core";
import { fetchJson } from "@/lib/api";

interface CategoryOption {
  id: number;
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

const STATUS_LABELS: Record<PostMeta["status"], string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

export default function PostsPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<{ categories: CategoryOption[] }>("/api/categories")
      .then((data) => setCategories(data.categories))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "分类加载失败")
      );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (keyword) params.set("q", keyword);
    const query = params.toString();

    setLoading(true);
    setError("");
    fetchJson<{ posts: PostMeta[] }>(`/api/posts${query ? `?${query}` : ""}`)
      .then((data) => {
        if (!cancelled) setPosts(data.posts);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "文章加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, category, keyword]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章</h1>
        <Link href="/posts/new" className="btn btn-primary">
          新建文章
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        className="mb-4 flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setKeyword(keywordInput.trim());
        }}
      >
        <select
          className="input w-32"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="状态筛选"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
        <select
          className="input w-44"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="分类筛选"
        >
          <option value="">全部分类</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          className="input w-56"
          placeholder="搜索标题或 slug"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
        />
        <button type="submit" className="btn">
          搜索
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">标签</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">日期</th>
              <th className="px-4 py-3 font-medium">阅读</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/posts/${post.id}`}
                    className="font-bold text-slate-800 hover:text-emerald-700"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{post.category}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {post.tags.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge badge-${post.status}`}>
                    {STATUS_LABELS[post.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{post.date.slice(0, 10)}</td>
                <td className="px-4 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            加载中...
          </p>
        )}
        {!loading && posts.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            暂无文章
          </p>
        )}
      </div>
    </div>
  );
}
