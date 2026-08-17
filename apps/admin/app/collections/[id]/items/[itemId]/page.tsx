"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import { fetchJson } from "@/lib/api";
import { useUnsavedChangesGuard } from "@/lib/use-unsaved-changes-guard";

type ItemStatus = "draft" | "published" | "archived";

/**
 * 详情响应：id 可能是数字或 uuid 字符串；pg 模式没有 filePath；
 * version 用于乐观并发控制（pg 模式提供）。
 */
interface CollectionItemDetail {
  id: number | string;
  collectionId: number | string;
  slug: string;
  title: string;
  excerpt: string;
  status: ItemStatus;
  sortOrder: number;
  filePath?: string;
  content: string;
  version?: number;
}

/** fetchJson 只暴露 message：按 message 识别乐观锁冲突（409） */
function isVersionConflict(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("版本") || message.includes("VERSION_CONFLICT");
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
  const [assetUrlMap, setAssetUrlMap] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [savedTip, setSavedTip] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useUnsavedChangesGuard(dirty);

  const loadItem = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      setError("");
      setConflict(false);
      try {
        const data = await fetchJson<{
          item: CollectionItemDetail;
          assetUrlMap?: Record<string, string>;
        }>(`/api/v1/admin/collection-items/${itemId}`);
        setItem(data.item);
        setAssetUrlMap(data.assetUrlMap);
        setTitle(data.item.title);
        setContent(data.item.content);
        setDirty(false);
      } catch (err) {
        setItem(null);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [itemId]
  );

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

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
    setConflict(false);
    try {
      await fetchJson(`/api/v1/admin/collection-items/${String(item.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          content,
          ...(item.version !== undefined
            ? { expectedVersion: item.version }
            : {}),
        }),
      });
      setDirty(false);
      setSavedTip(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSavedTip(false), 2000);
      // 重新 GET 拿最新 version（避免下次保存被乐观锁拒绝）
      await loadItem({ silent: true });
    } catch (err) {
      if (isVersionConflict(err)) {
        setConflict(true);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setSaving(false);
    }
  }, [item, saving, title, content, loadItem]);

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
    if (
      dirty &&
      !window.confirm(
        "当前有未保存的修改，切换状态将重新加载并丢失修改，是否继续？"
      )
    ) {
      return;
    }
    setError("");
    setConflict(false);
    try {
      await fetchJson(
        `/api/v1/admin/collection-items/${String(item.id)}/status`,
        {
          method: "POST",
          body: JSON.stringify({
            status,
            ...(item.version !== undefined
              ? { expectedVersion: item.version }
              : {}),
          }),
        }
      );
      // 重新 GET 拿最新 version 与状态
      await loadItem();
    } catch (err) {
      if (isVersionConflict(err)) {
        setConflict(true);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!window.confirm(`确认删除文档「${item.title}」？`)) return;
    setError("");
    try {
      await fetchJson(`/api/v1/admin/collection-items/${String(item.id)}`, {
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

      {conflict ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <span>内容已在其他会话被修改，请刷新后重试</span>
          <button
            type="button"
            className="btn shrink-0"
            onClick={() => void loadItem()}
          >
            刷新
          </button>
        </div>
      ) : null}

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
        assetUrlMap={assetUrlMap}
      />
    </div>
  );
}
