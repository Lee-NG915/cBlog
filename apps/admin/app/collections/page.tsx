"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

interface Collection {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  label: string;
  badge: string;
  noindex: boolean;
  sortOrder: number;
  itemCount: number;
}

const SLUG_PATTERN = /^[a-z0-9一-鿿]+(?:-[a-z0-9一-鿿]+)*$/;

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 新建表单
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState("Collection");
  const [badge, setBadge] = useState("");
  const [noindex, setNoindex] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchJson<{ collections: Collection[] }>(
        "/api/v1/admin/collections"
      );
      setCollections(data.collections);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmedSlug = slug.trim();
    const trimmedName = name.trim();
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      setError(
        "slug 格式不正确：仅允许小写字母、数字、中文，可用中划线分隔"
      );
      return;
    }
    if (!trimmedName) {
      setError("名称不能为空");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await fetchJson("/api/v1/admin/collections", {
        method: "POST",
        body: JSON.stringify({
          slug: trimmedSlug,
          name: trimmedName,
          description: description.trim(),
          label: label.trim() || "Collection",
          badge: badge.trim(),
          noindex,
        }),
      });
      setSlug("");
      setName("");
      setDescription("");
      setLabel("Collection");
      setBadge("");
      setNoindex(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(collection: Collection) {
    if (!window.confirm(`确认删除专栏「${collection.name}」？`)) return;
    setError("");
    try {
      await fetchJson(`/api/v1/admin/collections/${String(collection.id)}`, {
        method: "DELETE",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">专栏</h1>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">新建专栏</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="collection-slug">
              slug（将成为一级路由，如 /my-column，创建后不可改）
            </label>
            <input
              id="collection-slug"
              className="input font-mono"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="如 interview-notes"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="collection-name">
              名称
            </label>
            <input
              id="collection-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如 面试笔记"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="collection-label">
              label（列表页角标文案）
            </label>
            <input
              id="collection-label"
              className="input"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Collection"
            />
          </div>
          <div>
            <label className="label" htmlFor="collection-badge">
              badge（详情徽标，可空）
            </label>
            <input
              id="collection-badge"
              className="input"
              value={badge}
              onChange={(event) => setBadge(event.target.value)}
              placeholder="可空"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="collection-description">
              描述
            </label>
            <input
              id="collection-description"
              className="input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="可选"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={noindex}
            onChange={(event) => setNoindex(event.target.checked)}
          />
          对搜索引擎隐藏（noindex，不进 sitemap）
        </label>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? "创建中…" : "创建专栏"}
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-5 py-3 font-medium">名称</th>
              <th className="px-5 py-3 font-medium">slug</th>
              <th className="px-5 py-3 font-medium">label</th>
              <th className="px-5 py-3 font-medium">文档数</th>
              <th className="px-5 py-3 font-medium">noindex</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-5 py-4 text-slate-400" colSpan={6}>
                  加载中…
                </td>
              </tr>
            ) : collections.length === 0 ? (
              <tr>
                <td className="px-5 py-4 text-slate-400" colSpan={6}>
                  暂无专栏
                </td>
              </tr>
            ) : (
              collections.map((collection) => (
                <tr
                  key={String(collection.id)}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/collections/${String(collection.id)}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {collection.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    {collection.slug}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {collection.label}
                  </td>
                  <td className="px-5 py-3">{collection.itemCount}</td>
                  <td className="px-5 py-3">
                    {collection.noindex ? "是" : "否"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={collection.itemCount > 0}
                      title={
                        collection.itemCount > 0 ? "专栏下有文档" : undefined
                      }
                      onClick={() => void handleDelete(collection)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
