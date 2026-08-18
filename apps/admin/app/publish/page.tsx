"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "@/lib/api";

interface FileChange {
  path: string;
  status: string;
}

interface PublishStatus {
  branch: string;
  isDeployBranch: boolean;
  ahead: number;
  behind: number;
  tracking: string | null;
  contentChanges: FileChange[];
  otherChanges: FileChange[];
  stagedOtherChanges: FileChange[];
  suggestedMessage: string;
}

interface PublishResult {
  commit: string;
  pushed: boolean;
  branch: string;
}

/** git status 缩写 → 颜色点与中文说明 */
function changeKind(status: string): { dot: string; label: string } {
  if (status.includes("D")) return { dot: "bg-red-500", label: "删除" };
  if (status.includes("A") || status.includes("?"))
    return { dot: "bg-emerald-500", label: "新增" };
  return { dot: "bg-blue-500", label: "修改" };
}

function ChangeList({ changes }: { changes: FileChange[] }) {
  return (
    <ul className="space-y-1">
      {changes.map((change) => {
        const kind = changeKind(change.status);
        return (
          <li
            key={change.path}
            className="flex items-center gap-2 font-mono text-xs text-slate-700"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${kind.dot}`} />
            <span className="w-8 shrink-0 text-slate-500">
              {change.status}
            </span>
            <span className="truncate" title={change.path}>
              {change.path}
            </span>
            <span className="shrink-0 text-slate-400">{kind.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Git 发布链路在当前部署模式下被停用（后端返回 409）时的 message 识别 */
function isPublishDisabled(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("已停用");
}

// ---------- 发布动态（postgres 模式，Phase 6） ----------

type PublicationEventStatus =
  | "pending"
  | "delivering"
  | "awaiting_deploy"
  | "delivered"
  | "failed";

interface PublicationEventItem {
  id: string;
  entityType: string;
  operation: string;
  payloadJson: Record<string, unknown>;
  status: PublicationEventStatus;
  attemptCount: number;
  lastError: string | null;
  deploymentId: string | null;
  deliveredAt: string | null;
  createdAt: string;
  nextAttemptAt: string | null;
}

interface PublicationsResponse {
  events: PublicationEventItem[];
  stats: {
    counts: Record<string, number>;
    oldestPendingAt: string | null;
    backlogWarning: boolean;
  };
  driver: "github-dispatch" | "generic-build-hook" | "revalidation-webhook";
}

const EVENT_STATUS_META: Record<
  PublicationEventStatus,
  { label: string; badge: string }
> = {
  pending: { label: "待投递", badge: "bg-amber-100 text-amber-800" },
  delivering: { label: "投递中", badge: "bg-blue-100 text-blue-800" },
  awaiting_deploy: {
    label: "等待部署",
    badge: "bg-violet-100 text-violet-800",
  },
  delivered: { label: "已送达", badge: "bg-emerald-100 text-emerald-800" },
  failed: { label: "失败", badge: "bg-red-100 text-red-800" },
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  post: "文章",
  category: "分类",
  tag: "标签",
  collection: "合集",
  collection_item: "合集条目",
  site: "站点",
};

const OPERATION_LABELS: Record<string, string> = {
  publish: "发布",
  update: "更新",
  unpublish: "取消发布",
  archive: "归档",
  delete: "删除",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return iso;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return `${Math.floor(diff / 86_400_000)} 天前`;
}

function payloadSlug(payload: Record<string, unknown>): string | null {
  const slug = payload.slug;
  return typeof slug === "string" && slug ? slug : null;
}

/** postgres 模式的发布动态视图：Outbox 事件流 + 积压告警 + 手动重试，5 秒轮询 */
function PublicationFeed() {
  const [data, setData] = useState<PublicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchJson<PublicationsResponse>(
        "/api/v1/admin/publications"
      );
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [load]);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    setError(null);
    try {
      await fetchJson(`/api/v1/admin/publications/${id}/retry`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRetryingId(null);
    }
  };

  const flowSteps =
    data?.driver === "revalidation-webhook"
      ? "待投递 → 投递中 → 已送达 / 失败"
      : "待投递 → 投递中 → 等待部署 → 已送达 / 失败";

  return (
    <div className="space-y-4">
      {data?.stats.backlogWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          发布事件积压：待投递超过 5 条，或最老待投递事件已超过 5
          分钟。请确认 outbox worker 正在运行。
        </div>
      )}

      <div className="card">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">状态流：</span>
          {flowSteps}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {data?.driver === "revalidation-webhook"
            ? "事件投递到 revalidation webhook，成功即送达。"
            : "事件先投递到构建驱动并合并为部署批次，部署完成后由 callback 确认送达；失败事件可手动重试。"}
        </p>
        {data && (
          <p className="mt-2 text-xs text-slate-500">
            待投递 {data.stats.counts.pending ?? 0} · 投递中{" "}
            {data.stats.counts.delivering ?? 0} · 等待部署{" "}
            {data.stats.counts.awaiting_deploy ?? 0} · 已送达{" "}
            {data.stats.counts.delivered ?? 0} · 失败{" "}
            {data.stats.counts.failed ?? 0}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!data && loading && <p className="text-sm text-slate-400">加载中…</p>}

      {data && data.events.length === 0 && (
        <div className="card">
          <p className="text-sm text-slate-400">暂无发布事件</p>
        </div>
      )}

      {data && data.events.length > 0 && (
        <ul className="space-y-2">
          {data.events.map((event) => {
            const meta = EVENT_STATUS_META[event.status] ?? {
              label: event.status,
              badge: "bg-slate-200 text-slate-600",
            };
            const slug = payloadSlug(event.payloadJson);
            return (
              <li key={event.id} className="card py-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={`badge ${meta.badge}`}>{meta.label}</span>
                  <span className="text-slate-800">
                    {ENTITY_TYPE_LABELS[event.entityType] ?? event.entityType} ·{" "}
                    {OPERATION_LABELS[event.operation] ?? event.operation}
                  </span>
                  {slug && (
                    <span className="font-mono text-xs text-slate-500">
                      {slug}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 text-xs text-slate-400">
                    尝试 {event.attemptCount} 次 ·{" "}
                    {relativeTime(event.createdAt)}
                  </span>
                  {event.status === "failed" && (
                    <button
                      type="button"
                      className="btn shrink-0 px-2 py-0.5 text-xs"
                      disabled={retryingId === event.id}
                      onClick={() => void handleRetry(event.id)}
                    >
                      {retryingId === event.id ? "重试中…" : "重试"}
                    </button>
                  )}
                </div>
                {event.lastError && (
                  <p
                    className="mt-1 truncate text-xs text-red-600"
                    title={event.lastError}
                  >
                    {event.lastError}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function PublishPage() {
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gitDisabled, setGitDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState<PublishResult | null>(null);
  const messageDirtyRef = useRef(false);

  const loadStatus = useCallback(async (resetMessage = false) => {
    setLoading(true);
    setError(null);
    setGitDisabled(false);
    try {
      const data = await fetchJson<PublishStatus>(
        "/api/v1/admin/publish/status"
      );
      setStatus(data);
      if (resetMessage || !messageDirtyRef.current) {
        setMessage(data.suggestedMessage);
        messageDirtyRef.current = false;
      }
    } catch (err) {
      if (isPublishDisabled(err)) {
        setGitDisabled(true);
        setStatus(null);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const canPublish =
    !!status &&
    status.isDeployBranch &&
    status.stagedOtherChanges.length === 0 &&
    (status.contentChanges.length > 0 || status.ahead > 0);

  const handlePublish = async () => {
    if (!window.confirm("确认提交并推送？")) return;
    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fetchJson<PublishResult>("/api/v1/admin/publish", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setSuccess(result);
      messageDirtyRef.current = false;
      await loadStatus(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">发布上线</h1>
        <p className="mt-1 text-sm text-slate-500">
          {gitDisabled
            ? "Outbox 发布事件流与部署状态，每 5 秒自动刷新。"
            : "提交并推送内容变更（content/ 与 data/），推送后 GitHub Actions 自动构建部署。"}
        </p>
      </div>

      {gitDisabled && <PublicationFeed />}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="card border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-800">已发布</p>
          <p className="mt-1 font-mono text-sm text-emerald-700">
            {success.commit ? success.commit.slice(0, 7) : "无新提交"} ·{" "}
            {success.branch}
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            GitHub Actions 正在构建，稍后可在仓库 Actions 页查看
          </p>
        </div>
      )}

      {!status && loading && <p className="text-sm text-slate-400">加载中…</p>}

      {status && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="badge bg-slate-800 font-mono text-slate-100">
              {status.branch}
            </span>
            <span className="text-slate-600">
              领先 {status.ahead} / 落后 {status.behind}
            </span>
            {status.tracking && (
              <span className="font-mono text-xs text-slate-400">
                → {status.tracking}
              </span>
            )}
          </div>

          {status.behind > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              远端有新提交，建议先在终端 git pull
            </div>
          )}

          {!status.isDeployBranch && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              当前分支为 {status.branch}，不是 main。
              只有推送到 main 才会触发 GitHub Pages
              部署，请先在终端合并到 main 后再发布。
            </div>
          )}

          {status.stagedOtherChanges.length > 0 && (
            <div className="card border-red-200 bg-red-50">
              <p className="mb-3 text-sm font-medium text-red-800">
                以下变更已暂存（staged）且不在发布白名单内，发布会将它们一并提交，已禁止发布。请先在终端
                git restore --staged 处理
              </p>
              <ChangeList changes={status.stagedOtherChanges} />
            </div>
          )}

          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              内容变更
            </h2>
            {status.contentChanges.length > 0 ? (
              <ChangeList changes={status.contentChanges} />
            ) : status.ahead > 0 ? (
              <p className="text-sm text-slate-600">
                有 {status.ahead} 个本地提交待推送
              </p>
            ) : (
              <p className="text-sm text-slate-400">没有待发布的变更</p>
            )}
          </div>

          {status.otherChanges.length > 0 && (
            <div className="card border-amber-200 bg-amber-50">
              <p className="mb-3 text-sm font-medium text-amber-800">
                以下变更不在发布白名单（content/、data/），不会被提交，请在
                IDE 中处理
              </p>
              <ChangeList changes={status.otherChanges} />
            </div>
          )}

          <div className="card space-y-4">
            <div>
              <label htmlFor="commit-message" className="label">
                提交信息
              </label>
              <textarea
                id="commit-message"
                className="input min-h-[72px] font-mono"
                rows={3}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  messageDirtyRef.current = true;
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-primary px-6 py-2.5 text-base"
                disabled={!canPublish || publishing}
                onClick={() => void handlePublish()}
              >
                {publishing ? "发布中…" : "发布"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => void loadStatus()}
              >
                {loading ? "刷新中…" : "刷新状态"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
