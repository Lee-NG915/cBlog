"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

interface Category {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  postCount: number;
}

const SLUG_PATTERN = /^[a-z0-9一-鿿]+(?:-[a-z0-9一-鿿]+)*$/;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 新建表单
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // 行内编辑（id 统一按 string 处理，兼容数字与 uuid）
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchJson<{ categories: Category[] }>(
        "/api/v1/admin/categories"
      );
      setCategories(data.categories);
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
      await fetchJson("/api/v1/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          slug: trimmedSlug,
          name: trimmedName,
          description: description.trim(),
        }),
      });
      setSlug("");
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(String(category.id));
    setEditName(category.name);
    setEditDescription(category.description);
  }

  async function handleSaveEdit(id: number | string) {
    if (!editName.trim()) {
      setError("名称不能为空");
      return;
    }
    setSavingEdit(true);
    setError("");
    try {
      await fetchJson(`/api/v1/admin/categories/${String(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
        }),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`确认删除分类「${category.name}」？`)) return;
    setError("");
    try {
      await fetchJson(`/api/v1/admin/categories/${String(category.id)}`, {
        method: "DELETE",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">分类</h1>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">新建分类</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="category-slug">
              slug（创建后不可改）
            </label>
            <input
              id="category-slug"
              className="input font-mono"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="如 frontend"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="category-name">
              名称
            </label>
            <input
              id="category-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如 前端开发"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="category-description">
              描述
            </label>
            <input
              id="category-description"
              className="input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="可选"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? "创建中…" : "创建分类"}
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-5 py-3 font-medium">slug</th>
              <th className="px-5 py-3 font-medium">名称</th>
              <th className="px-5 py-3 font-medium">描述</th>
              <th className="px-5 py-3 font-medium">文章数</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-5 py-4 text-slate-400" colSpan={5}>
                  加载中…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td className="px-5 py-4 text-slate-400" colSpan={5}>
                  暂无分类
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const isEditing = editingId === String(category.id);
                const isFallback = category.slug === "uncategorized";
                return (
                  <tr
                    key={String(category.id)}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                      {category.slug}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          className="input"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {isEditing ? (
                        <input
                          className="input"
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                        />
                      ) : (
                        category.description || "—"
                      )}
                    </td>
                    <td className="px-5 py-3">{category.postCount}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={savingEdit}
                              onClick={() => void handleSaveEdit(category.id)}
                            >
                              {savingEdit ? "保存中…" : "保存"}
                            </button>
                            <button
                              type="button"
                              className="btn"
                              disabled={savingEdit}
                              onClick={() => setEditingId(null)}
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => startEdit(category)}
                            >
                              编辑
                            </button>
                            {isFallback ? null : (
                              <button
                                type="button"
                                className="btn btn-danger"
                                disabled={category.postCount > 0}
                                title={
                                  category.postCount > 0
                                    ? "分类下有文章"
                                    : undefined
                                }
                                onClick={() => void handleDelete(category)}
                              >
                                删除
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
