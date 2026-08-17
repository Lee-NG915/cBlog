"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/api";

interface CategoryOption {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

const SLUG_PATTERN = /^[a-z0-9一-鿿]+(?:-[a-z0-9一-鿿]+)*$/;

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<{ categories: CategoryOption[] }>("/api/v1/admin/categories")
      .then((data) => {
        // uncategorized 为系统兜底分类，新建时不可选
        const options = data.categories.filter(
          (item) => item.slug !== "uncategorized"
        );
        setCategories(options);
        setCategorySlug((current) => current || options[0]?.slug || "");
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "分类加载失败")
      );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedTitle) {
      setError("请填写标题");
      return;
    }
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      setError("slug 格式不正确：仅支持小写字母/数字/中文，词间用连字符分隔");
      return;
    }
    if (!categorySlug) {
      setError("请选择分类");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { id } = await fetchJson<{ id: number | string }>(
        "/api/v1/admin/posts",
        {
          method: "POST",
          body: JSON.stringify({
            title: trimmedTitle,
            slug: trimmedSlug,
            categorySlug,
          }),
        }
      );
      router.push(`/posts/${String(id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/posts" className="btn">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-bold">新建文章</h1>
      </div>

      {error && (
        <div className="mb-4 max-w-lg rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="card max-w-lg space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="new-post-title">
            标题
          </label>
          <input
            id="new-post-title"
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="文章标题"
          />
        </div>
        <div>
          <label className="label" htmlFor="new-post-slug">
            slug
          </label>
          <input
            id="new-post-slug"
            className="input"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="小写字母/数字/中文与连字符"
          />
        </div>
        <div>
          <label className="label" htmlFor="new-post-category">
            分类
          </label>
          <select
            id="new-post-category"
            className="input"
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "创建中..." : "创建文章"}
        </button>
      </form>
    </div>
  );
}
