"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import { fetchJson } from "@/lib/api";

type ItemStatus = "draft" | "published" | "archived";

interface CollectionItemDetail {
  id: number;
  collectionId: number;
  slug: string;
  title: string;
  excerpt: string;
  status: ItemStatus;
  sortOrder: number;
  filePath: string;
  content: string;
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

/** 写全类名，避免 Tailwind 按字面量扫描时裁剪掉 badge 样式 */
const STATUS_BADGE_CLASS: Record<ItemStatus, string> = {
  draft: "badge badge-draft",
  published: "badge badge-published",
  archived: "badge badge-archived",
};

const STATUS_ACTIONS: Record<
  ItemStatus,
  { label: string; next: ItemStatus }[]
> = {
  draft: [{ label: "发布", next: "published" }],
  published: [
    { label: "转草稿", next: "draft" },
    { label: "归档", next: "archived" },
  ],
  archived: [
    { label: "恢复草稿", next: "draft" },
    { label: "发布", next: "published" },
  ],
};

export default function CollectionItemEditPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  const router = useRouter();
  const { id: collectionId, itemId } = params;

  const [item, setItem] = useState<CollectionItemDetail | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedTip, setSavedTip] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJson<{ item: CollectionItemDetail }>(
          `/api/collection-items/${itemId}`
        );
        if (cancelled) return;
        setItem(data.item);
        setTitle(data.item.title);
        setContent(data.item.content);
        setDirty(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  // 未保存离开提示
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!item || saving) return;
    if (!title.trim()) {
      setError("标题不能为空");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await fetchJson(`/api/collection-items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: title.trim(), content }),
      });
      setDirty(false);
      setSavedTip(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSavedTip(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [item, saving, title, content]);

  // Cmd/Ctrl+S 保存
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  async function handleSetStatus(status: ItemStatus) {
    if (!item) return;
    setError("");
    try {
      await fetchJson(`/api/collection-items/${item.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      setItem({ ...item, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!window.confirm(`确认删除文档「${item.title}」？`)) return;
    setError("");
    try {
      await fetchJson(`/api/collection-items/${item.id}`, {
        method: "DELETE",
      });
      setDirty(false);
      router.push(`/collections/${collectionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">加载中…</p>;
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <Link
          href={`/collections/${collectionId}`}
          className="text-sm text-emerald-700"
        >
          ← 返回专栏
        </Link>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error || "文档不存在"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/collections/${collectionId}`}
          className="shrink-0 text-sm text-emerald-700"
        >
          ← 返回专栏
        </Link>
        <input
          className="input min-w-48 flex-1 text-base font-semibold"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setDirty(true);
          }}
          placeholder="文档标题"
          aria-label="标题"
        />
        <span className={STATUS_BADGE_CLASS[item.status]}>
          {STATUS_LABEL[item.status]}
        </span>
        {STATUS_ACTIONS[item.status].map((action) => (
          <button
            key={action.next + action.label}
            type="button"
            className="btn"
            onClick={() => void handleSetStatus(action.next)}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving}
          title="Cmd/Ctrl+S"
          onClick={() => void handleSave()}
        >
          {saving ? "保存中…" : dirty ? "保存 *" : "保存"}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => void handleDelete()}
        >
          删除
        </button>
        {savedTip ? (
          <span className="text-sm text-emerald-600">已保存</span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <MarkdownEditor
        value={content}
        onChange={(value: string) => {
          setContent(value);
          setDirty(true);
        }}
        uploadFilePath={item.filePath}
      />
    </div>
  );
}
