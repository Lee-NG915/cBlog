"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "@/lib/api";

interface FileChange {
  path: string;
  status: string;
}

interface PublishStatus {
  branch: string;
  ahead: number;
  behind: number;
  tracking: string | null;
  contentChanges: FileChange[];
  otherChanges: FileChange[];
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

export default function PublishPage() {
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState<PublishResult | null>(null);
  const messageDirtyRef = useRef(false);

  const loadStatus = useCallback(async (resetMessage = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<PublishStatus>("/api/publish/status");
      setStatus(data);
      if (resetMessage || !messageDirtyRef.current) {
        setMessage(data.suggestedMessage);
        messageDirtyRef.current = false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const canPublish =
    !!status && (status.contentChanges.length > 0 || status.ahead > 0);

  const handlePublish = async () => {
    if (!window.confirm("确认提交并推送？")) return;
    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fetchJson<PublishResult>("/api/publish", {
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
          提交并推送内容变更（content/ 与 data/），推送后 GitHub Actions
          自动构建部署。
        </p>
      </div>

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
