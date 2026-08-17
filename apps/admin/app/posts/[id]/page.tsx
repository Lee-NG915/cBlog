"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PostMeta } from "@cblog/core";
import MarkdownEditor from "@/components/MarkdownEditor";
import { fetchJson } from "@/lib/api";
import { useUnsavedChangesGuard } from "@/lib/use-unsaved-changes-guard";

type PostDetail = PostMeta & { content: string };

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

/** 状态机：当前状态 → 可执行操作 */
const STATUS_ACTIONS: Record<
  PostMeta["status"],
  { label: string; next: PostMeta["status"] }[]
> = {
  draft: [{ label: "发布", next: "published" }],
  published: [
    { label: "转草稿", next: "draft" },
    { label: "归档", next: "archived" },
  ],
  archived: [
    { label: "恢复为草稿", next: "draft" },
    { label: "直接发布", next: "published" },
  ],
};

export default function PostEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 表单字段
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [content, setContent] = useState("");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [savedHint, setSavedHint] = useState(false);

  const dirtyRef = useRef(false);
  const savedHintTimerRef = useRef<number | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useUnsavedChangesGuard(dirty);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchJson<{ post: PostDetail }>(
        `/api/posts/${postId}`
      );
      const detail = data.post;
      setPost(detail);
      setTitle(detail.title);
      setDate(detail.date);
      setUpdatedAt(detail.updatedAt ?? "");
      setExcerpt(detail.excerpt);
      setTagsText(detail.tags.join(", "));
      setCoverImage(detail.coverImage ?? "");
      setCategorySlug(detail.categorySlug);
      setContent(detail.content);
      setDirty(false);
    } catch (err) {
      setPost(null);
      setError(err instanceof Error ? err.message : "文章加载失败");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  useEffect(() => {
    fetchJson<{ categories: CategoryOption[] }>("/api/categories")
      .then((data) => setCategories(data.categories))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "分类加载失败")
      );
  }, []);

  const handleSave = useCallback(async () => {
    if (!post || saving) return;
    setSaving(true);
    setError("");
    try {
      await fetchJson<{ ok: boolean }>(`/api/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          date,
          updatedAt: updatedAt.trim() === "" ? null : updatedAt.trim(),
          excerpt,
          tags: tagsText
            .split(/[,，]/)
            .map((tag) => tag.trim())
            .filter(Boolean),
          coverImage: coverImage.trim() === "" ? null : coverImage.trim(),
          categorySlug,
          content,
        }),
      });
      setDirty(false);
      setSavedHint(true);
      if (savedHintTimerRef.current !== null) {
        window.clearTimeout(savedHintTimerRef.current);
      }
      savedHintTimerRef.current = window.setTimeout(
        () => setSavedHint(false),
        2000
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [
    post,
    saving,
    title,
    date,
    updatedAt,
    excerpt,
    tagsText,
    coverImage,
    categorySlug,
    content,
  ]);

  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  }, [handleSave]);

  // Cmd/Ctrl+S 保存
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveRef.current();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (savedHintTimerRef.current !== null) {
        window.clearTimeout(savedHintTimerRef.current);
      }
    };
  }, []);

  async function handleStatusChange(next: PostMeta["status"]) {
    if (!post || statusChanging) return;
    if (
      dirtyRef.current &&
      !window.confirm("当前有未保存的修改，切换状态将重新加载并丢失修改，是否继续？")
    ) {
      return;
    }
    setStatusChanging(true);
    setError("");
    try {
      await fetchJson<{ ok: boolean }>(`/api/posts/${post.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: next }),
      });
      await loadPost();
    } catch (err) {
      setError(err instanceof Error ? err.message : "状态更新失败");
    } finally {
      setStatusChanging(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!window.confirm("确认删除？文件将移入回收站")) return;
    setError("");
    try {
      await fetchJson<{ ok: boolean }>(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      setDirty(false);
      dirtyRef.current = false;
      router.push("/posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !post) return;
    setCoverUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filePath", post.filePath);
      const { src } = await fetchJson<{ src: string }>("/api/images", {
        method: "POST",
        body: formData,
      });
      setCoverImage(src);
      setDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "封面上传失败");
    } finally {
      setCoverUploading(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-sm text-slate-400">加载中...</p>;
  }

  if (!post) {
    return (
      <div>
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error || "文章不存在"}
        </div>
        <Link href="/posts" className="btn">
          ← 返回列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/posts" className="btn shrink-0">
          ← 返回列表
        </Link>
        <input
          className="input min-w-40 flex-1 text-xl font-bold"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setDirty(true);
          }}
          placeholder="文章标题"
          aria-label="文章标题"
        />
        <span className={`badge badge-${post.status} shrink-0`}>
          {STATUS_LABELS[post.status]}
        </span>
        {STATUS_ACTIONS[post.status].map((action) => (
          <button
            key={action.label}
            type="button"
            className="btn shrink-0"
            disabled={statusChanging}
            onClick={() => void handleStatusChange(action.next)}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-primary shrink-0"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          className="btn btn-danger shrink-0"
          onClick={() => void handleDelete()}
        >
          删除
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
        <MarkdownEditor
          value={content}
          onChange={(nextValue) => {
            setContent(nextValue);
            setDirty(true);
          }}
          uploadFilePath={post.filePath}
        />

        <div className="card space-y-4">
          <div>
            <label className="label" htmlFor="post-date">
              日期
            </label>
            <input
              id="post-date"
              className="input"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setDirty(true);
              }}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="label" htmlFor="post-updated-at">
              更新时间（可空）
            </label>
            <input
              id="post-updated-at"
              className="input"
              value={updatedAt}
              onChange={(event) => {
                setUpdatedAt(event.target.value);
                setDirty(true);
              }}
              placeholder="留空表示未设置"
            />
          </div>
          <div>
            <label className="label" htmlFor="post-excerpt">
              摘要
            </label>
            <textarea
              id="post-excerpt"
              className="input h-24 resize-y"
              value={excerpt}
              onChange={(event) => {
                setExcerpt(event.target.value);
                setDirty(true);
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="post-tags">
              标签（逗号分隔）
            </label>
            <input
              id="post-tags"
              className="input"
              value={tagsText}
              onChange={(event) => {
                setTagsText(event.target.value);
                setDirty(true);
              }}
              placeholder="如：nextjs, sqlite"
            />
          </div>
          <div>
            <label className="label" htmlFor="post-cover">
              封面
            </label>
            <div className="flex gap-2">
              <input
                id="post-cover"
                className="input flex-1"
                value={coverImage}
                onChange={(event) => {
                  setCoverImage(event.target.value);
                  setDirty(true);
                }}
                placeholder="./assets/cover.png"
              />
              <button
                type="button"
                className="btn shrink-0"
                disabled={coverUploading}
                onClick={() => coverInputRef.current?.click()}
              >
                {coverUploading ? "上传中..." : "上传封面"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleCoverUpload(event)}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="post-category">
              分类
            </label>
            <select
              id="post-category"
              className="input"
              value={categorySlug}
              onChange={(event) => {
                setCategorySlug(event.target.value);
                setDirty(true);
              }}
            >
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-400">
            <p className="break-all">slug：{post.slug}</p>
            <p className="break-all">filePath：{post.filePath}</p>
          </div>
        </div>
      </div>

      {savedHint && (
        <div className="fixed bottom-6 right-6 z-20 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white shadow-lg">
          已保存
        </div>
      )}
    </div>
  );
}
