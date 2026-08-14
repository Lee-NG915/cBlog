"use client";

import Link from "next/link";
import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchJson } from "@/lib/api";

type ItemStatus = "draft" | "published" | "archived";

interface Collection {
  id: number;
  slug: string;
  name: string;
  description: string;
  label: string;
  badge: string;
  noindex: boolean;
  sortOrder: number;
  itemCount: number;
}

interface CollectionItem {
  id: number;
  collectionId: number;
  collectionSlug: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ItemStatus;
  sortOrder: number;
  filePath: string;
}

const SLUG_PATTERN = /^[a-z0-9一-鿿]+(?:-[a-z0-9一-鿿]+)*$/;

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

export default function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const collectionId = params.id;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 专栏信息编辑
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState("");
  const [badge, setBadge] = useState("");
  const [noindex, setNoindex] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);

  // 新建文档
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  // 拖拽排序
  const dragIndexRef = useRef<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchJson<{
        collection: Collection;
        items: CollectionItem[];
      }>(`/api/collections/${collectionId}`);
      setCollection(data.collection);
      setItems(data.items);
      setName(data.collection.name);
      setDescription(data.collection.description);
      setLabel(data.collection.label);
      setBadge(data.collection.badge);
      setNoindex(data.collection.noindex);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSaveInfo(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("名称不能为空");
      return;
    }
    setSavingInfo(true);
    setError("");
    try {
      await fetchJson(`/api/collections/${collectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          label: label.trim(),
          badge: badge.trim(),
          noindex,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleCreateItem(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = newTitle.trim();
    const trimmedSlug = newSlug.trim();
    if (!trimmedTitle) {
      setError("标题不能为空");
      return;
    }
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      setError(
        "slug 格式不正确：仅允许小写字母、数字、中文，可用中划线分隔"
      );
      return;
    }
    setCreating(true);
    setError("");
    try {
      await fetchJson(`/api/collections/${collectionId}/items`, {
        method: "POST",
        body: JSON.stringify({ title: trimmedTitle, slug: trimmedSlug }),
      });
      setNewTitle("");
      setNewSlug("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  /** 本地重排 + 全量 reorder，失败回滚 */
  const applyReorder = useCallback(
    async (next: CollectionItem[]) => {
      const prev = items;
      const renumbered = next.map((item, index) => ({
        ...item,
        sortOrder: index + 1,
      }));
      setItems(renumbered);
      setReordering(true);
      setError("");
      try {
        await fetchJson(`/api/collections/${collectionId}/reorder`, {
          method: "POST",
          body: JSON.stringify({
            orderedIds: renumbered.map((item) => item.id),
          }),
        });
      } catch (err) {
        setItems(prev);
        setError(
          `排序保存失败，已恢复原顺序：${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setReordering(false);
      }
    },
    [collectionId, items]
  );

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
  }

  function handleDrop(targetIndex: number) {
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    if (fromIndex === null || fromIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(targetIndex, 0, moved);
    void applyReorder(next);
  }

  function handleMove(index: number, delta: -1 | 1) {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    void applyReorder(next);
  }

  async function handleSetStatus(item: CollectionItem, status: ItemStatus) {
    setError("");
    try {
      await fetchJson(`/api/collection-items/${item.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status } : entry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDeleteItem(item: CollectionItem) {
    if (!window.confirm(`确认删除文档「${item.title}」？`)) return;
    setError("");
    try {
      await fetchJson(`/api/collection-items/${item.id}`, {
        method: "DELETE",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">加载中…</p>;
  }

  if (!collection) {
    return (
      <div className="space-y-4">
        <Link href="/collections" className="text-sm text-emerald-700">
          ← 返回专栏列表
        </Link>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error || "专栏不存在"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/collections" className="text-sm text-emerald-700">
          ← 返回专栏列表
        </Link>
        <h1 className="mt-2 text-xl font-bold">{collection.name}</h1>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSaveInfo} className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">专栏信息</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">slug（不可改）</span>
            <p className="font-mono text-sm text-slate-600">
              {collection.slug}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              前台地址：/{collection.slug}/
            </p>
          </div>
          <div>
            <label className="label" htmlFor="info-name">
              名称
            </label>
            <input
              id="info-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="info-label">
              label（列表页角标文案）
            </label>
            <input
              id="info-label"
              className="input"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="info-badge">
              badge（详情徽标，可空）
            </label>
            <input
              id="info-badge"
              className="input"
              value={badge}
              onChange={(event) => setBadge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="info-description">
              描述
            </label>
            <input
              id="info-description"
              className="input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={noindex}
              onChange={(event) => setNoindex(event.target.checked)}
            />
            对搜索引擎隐藏（noindex，不进 sitemap）
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingInfo}
          >
            {savingInfo ? "保存中…" : "保存"}
          </button>
        </div>
      </form>

      <form onSubmit={handleCreateItem} className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">新建文档</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="item-title">
              标题
            </label>
            <input
              id="item-title"
              className="input"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="文档标题"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="item-slug">
              slug（创建后不可改）
            </label>
            <input
              id="item-slug"
              className="input font-mono"
              value={newSlug}
              onChange={(event) => setNewSlug(event.target.value)}
              placeholder="如 chapter-1"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? "创建中…" : "新建文档（初始为草稿）"}
        </button>
      </form>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            文档列表（{items.length}）
          </h2>
          {reordering ? (
            <span className="text-xs text-slate-400">排序保存中…</span>
          ) : null}
        </div>
        <p className="text-xs text-slate-400">
          可拖拽或用上移/下移调整顺序；排序会同步回写各文档 frontmatter 的
          order 字段。
        </p>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">暂无文档</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className="flex flex-wrap items-center gap-3 py-2.5"
              >
                <span
                  className="cursor-grab select-none text-slate-400"
                  title="拖拽调整顺序"
                  aria-hidden
                >
                  ≡
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {String(item.sortOrder).padStart(2, "0")}
                </span>
                <Link
                  href={`/collections/${collectionId}/items/${item.id}`}
                  className="min-w-0 flex-1 truncate font-medium text-emerald-700 hover:underline"
                >
                  {item.title}
                </Link>
                <span className="font-mono text-xs text-slate-400">
                  {item.slug}
                </span>
                <span className={STATUS_BADGE_CLASS[item.status]}>
                  {STATUS_LABEL[item.status]}
                </span>
                <span className="flex items-center gap-1">
                  {STATUS_ACTIONS[item.status].map((action) => (
                    <button
                      key={action.next + action.label}
                      type="button"
                      className="btn px-2 py-1 text-xs"
                      onClick={() => void handleSetStatus(item, action.next)}
                    >
                      {action.label}
                    </button>
                  ))}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn px-2 py-1 text-xs"
                    disabled={index === 0 || reordering}
                    title="上移"
                    onClick={() => handleMove(index, -1)}
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    className="btn px-2 py-1 text-xs"
                    disabled={index === items.length - 1 || reordering}
                    title="下移"
                    onClick={() => handleMove(index, 1)}
                  >
                    下移
                  </button>
                </span>
                <button
                  type="button"
                  className="btn btn-danger px-2 py-1 text-xs"
                  onClick={() => void handleDeleteItem(item)}
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
