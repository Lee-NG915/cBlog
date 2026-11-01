import { useState } from "react";
import {
  ExternalLink,
  UploadCloud,
  EyeOff,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import type { Note, Group } from "./types";
import {
  articleStatus,
  articleUrl,
  isActive,
  jobLabel,
  type PublishAction,
  type PublishingState,
  type PublishJob,
} from "./publishing";

export function BlogStatus({
  note,
  state,
}: {
  note: Note;
  state: PublishingState | null;
}) {
  const s = articleStatus(note, state);
  return (
    <div className="blog-status" aria-live="polite">
      <span className={"status-badge " + s.tone}>{s.label}</span>
      <span>{s.description}</span>
      {s.live && state && (
        <a href={articleUrl(state, s.live)} target="_blank" rel="noreferrer">
          查看博客 <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}
export function BlogPanel({
  notes,
  groups,
  state,
  busy,
  onRead,
  onAction,
  onRecover,
}: {
  notes: Note[];
  groups: Group[];
  state: PublishingState | null;
  busy: boolean;
  onRead: (n: Note) => void;
  onAction: (n: Note, a: PublishAction) => void;
  onRecover: (job: PublishJob) => void;
}) {
  const [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [count, setCount] = useState(20);
  const candidates = notes
    .filter(
      (n) => n.state !== "archived" || state?.live.some((l) => l.id === n.id),
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .filter(
      (n) => !query || n.title.toLowerCase().includes(query.toLowerCase()),
    );
  const matching = candidates.filter((n) => {
    const s = articleStatus(n, state);
    return (
      filter === "all" ||
      (filter === "live" && s.live) ||
      (filter === "draft" && !s.live && !s.active) ||
      (filter === "changed" && s.changed) ||
      (filter === "failed" && s.failed)
    );
  });
  const active = state?.history.find(isActive);
  return (
    <section className="page blog-center">
      <p className="eyebrow">从草稿到读者</p>
      <h1>博客发布</h1>
      <p className="lead">
        保存只更新草稿。选择一篇文章发布、更新或下线，完成后会在这里告诉你结果。
      </p>
      <div className="publish-summary">
        <span>
          <strong>{state?.live.length ?? "—"}</strong> 篇已上线
        </span>
        <span>
          <strong>
            {state
              ? notes.filter(
                  (n) =>
                    n.state !== "archived" &&
                    !state?.live.some((l) => l.id === n.id),
                ).length
              : "—"}
          </strong>{" "}
          篇未上线
        </span>
        {state?.siteUrl && (
          <a href={state.siteUrl} target="_blank" rel="noreferrer">
            打开博客 <ExternalLink size={16} />
          </a>
        )}
      </div>
      {!state?.enabled && (
        <p className="notice">
          {state ? "发布服务尚未连接，草稿可以正常保存。" : "正在读取博客状态…"}
        </p>
      )}
      {active && (
        <div className="operation-progress" role="status">
          <UploadCloud size={20} />
          <div>
            <strong>
              {jobLabel(active)} · {active.intent?.title || "先前的发布任务"}
            </strong>
            <p>可以继续编辑草稿。请等当前操作完成后，再发布其他文章。</p>
          </div>
          <button className="quiet" onClick={() => onRecover(active)}>
            {active.run_id ? "核对结果" : "取消排队"}
          </button>
        </div>
      )}
      <div className="blog-filters">
        <label>
          查找文章
          <input
            type="search"
            placeholder="输入文章标题"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCount(20);
            }}
          />
        </label>
        <label>
          发布状态
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCount(20);
            }}
          >
            <option value="all">全部文章</option>
            <option value="live">已上线</option>
            <option value="draft">草稿 / 已下线</option>
            <option value="changed">有未发布修改</option>
            <option value="failed">操作失败</option>
          </select>
        </label>
      </div>
      <p className="muted">{matching.length} 篇文章 · 每次操作只影响所选文章</p>
      <div className="blog-articles">
        {matching.slice(0, count).map((n) => {
          const s = articleStatus(n, state);
          return (
            <article className="blog-article" key={n.id}>
              <div>
                <button
                  className="text-link article-title"
                  onClick={() => onRead(n)}
                >
                  {n.title}
                  <ArrowRight size={16} />
                </button>
                <p className="muted">
                  {groups.find((g) => g.id === n.topic_id)?.name || "未分类"}
                </p>
                <BlogStatus note={n} state={state} />
              </div>
              <div className="article-actions">
                <button
                  className="primary"
                  disabled={
                    busy ||
                    !state?.enabled ||
                    n.version === 0 ||
                    n.state === "archived"
                  }
                  onClick={() => onAction(n, "publish")}
                >
                  <UploadCloud size={16} />
                  {s.failed && s.job?.intent?.action === "publish"
                    ? "重试发布"
                    : s.live
                      ? "更新博客"
                      : "发布文章"}
                </button>
                {s.live && (
                  <button
                    className="quiet"
                    disabled={busy}
                    onClick={() => onAction(n, "unpublish")}
                  >
                    <EyeOff size={16} />
                    {s.failed && s.job?.intent?.action === "unpublish"
                      ? "重试下线"
                      : "从博客下线"}
                  </button>
                )}
              </div>
              {s.failed && (
                <p className="operation-error" role="status">
                  {s.job?.detail || "操作未完成，请重试。"}
                </p>
              )}
            </article>
          );
        })}
      </div>
      {!matching.length && (
        <div className="empty">
          <h2>没有符合条件的文章</h2>
          <p>试试其他标题或发布状态。</p>
        </div>
      )}
      {matching.length > count && (
        <button className="load-more" onClick={() => setCount((v) => v + 20)}>
          再看 20 篇
        </button>
      )}
      <details className="release-history">
        <summary>操作记录 · {state?.history.length || 0}</summary>
        {state?.history.map((j) => (
          <div className="release-row" key={j.id}>
            <div>
              <strong>{j.intent?.title || "历史发布"}</strong>
              <p>
                {j.intent?.action === "unpublish" ? "下线文章" : "发布文章"} ·{" "}
                {new Date(j.created_at).toLocaleString("zh-CN")}
              </p>
              <span
                className={
                  "status-badge " +
                  (j.status === "failed"
                    ? "error"
                    : isActive(j)
                      ? "progress"
                      : "draft")
                }
              >
                {jobLabel(j)}
              </span>
              {j.detail && <p>{j.detail}</p>}
            </div>
            <details>
              <summary>技术详情</summary>
              <p>发布批次 #{j.publication_id}</p>
              {j.run_id && (
                <a
                  href={`https://github.com/${state.repository}/actions/runs/${j.run_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  查看运行日志
                </a>
              )}
              {isActive(j) && (
                <button onClick={() => onRecover(j)}>
                  <RefreshCw size={14} />
                  {j.run_id ? "核对结果" : "取消排队"}
                </button>
              )}
            </details>
          </div>
        ))}
      </details>
    </section>
  );
}
