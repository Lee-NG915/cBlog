"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  defaultInterviewPresetId,
  InterviewPreset,
  InterviewSession,
  InterviewSourceSummary,
  interviewBackendUrl,
} from "@/lib/interview";

const defaultScopes = ["blog", "joyboy", "onepiece"];

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`${interviewBackendUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

export default function InterviewWorkbench() {
  const [jobDescription, setJobDescription] = useState("");
  const [focusHint, setFocusHint] = useState("");
  const [presetId, setPresetId] = useState(defaultInterviewPresetId);
  const [presets, setPresets] = useState<InterviewPreset[]>([]);
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>(
    []
  );
  const [scopes, setScopes] = useState<string[]>(defaultScopes);
  const [sources, setSources] = useState<InterviewSourceSummary[]>([]);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<
    "" | "starting" | "replying" | "summary" | "reindex" | "switching"
  >("");

  useEffect(() => {
    requestJson("/api/sources")
      .then((payload) => setSources(payload.sources))
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "无法连接本地面试后端。"
        );
      });
  }, []);

  useEffect(() => {
    requestJson("/api/interview/presets")
      .then((payload) => {
        setPresets(payload.presets);
        const nextPreset =
          payload.presets.find(
            (item: InterviewPreset) => item.id === defaultInterviewPresetId
          ) || payload.presets[0];

        if (nextPreset) {
          setPresetId(nextPreset.id);
          setSelectedInterviewerIds(nextPreset.interviewerIds);
        }
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "无法加载面试官配置。"
        );
      });
  }, []);

  const activeScopeSet = useMemo(() => new Set(scopes), [scopes]);
  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === presetId) || null,
    [presets, presetId]
  );

  const toggleScope = (sourceId: string) => {
    setScopes((current) =>
      current.includes(sourceId)
        ? current.filter((item) => item !== sourceId)
        : [...current, sourceId]
    );
  };

  const toggleInterviewer = (interviewerId: string) => {
    setSelectedInterviewerIds((current) =>
      current.includes(interviewerId)
        ? current.filter((item) => item !== interviewerId)
        : [...current, interviewerId]
    );
  };

  const handlePresetChange = (nextPresetId: string) => {
    setPresetId(nextPresetId);
    const nextPreset = presets.find((preset) => preset.id === nextPresetId);
    if (nextPreset) {
      setSelectedInterviewerIds(nextPreset.interviewerIds);
    }
  };

  const startSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("请先粘贴目标岗位 JD。");
      return;
    }

    setBusyAction("starting");

    try {
      const payload = await requestJson("/api/interview/sessions", {
        method: "POST",
        body: JSON.stringify({
          jobDescription,
          focusHint,
          presetId,
          interviewerIds: selectedInterviewerIds,
          scopes: scopes.length > 0 ? scopes : ["blog"],
        }),
      });

      setSession(payload.session);
      setAnswer("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "启动模拟面试失败。"
      );
    } finally {
      setBusyAction("");
    }
  };

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !answer.trim()) {
      return;
    }

    setBusyAction("replying");
    setError("");

    try {
      const payload = await requestJson(
        `/api/interview/sessions/${session.id}/message`,
        {
          method: "POST",
          body: JSON.stringify({
            answer,
          }),
        }
      );

      setSession(payload.session);
      setAnswer("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "提交回答失败。"
      );
    } finally {
      setBusyAction("");
    }
  };

  const switchInterviewer = async () => {
    if (!session) {
      return;
    }

    setBusyAction("switching");
    setError("");

    try {
      const payload = await requestJson(
        `/api/interview/sessions/${session.id}/switch`,
        {
          method: "POST",
        }
      );

      setSession(payload.session);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "切换面试官失败。"
      );
    } finally {
      setBusyAction("");
    }
  };

  const buildSummary = async () => {
    if (!session) {
      return;
    }

    setBusyAction("summary");
    setError("");

    try {
      const payload = await requestJson(
        `/api/interview/sessions/${session.id}/summary`,
        {
          method: "POST",
        }
      );

      setSession(payload.session);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "生成总结失败。"
      );
    } finally {
      setBusyAction("");
    }
  };

  const reindexSources = async () => {
    setBusyAction("reindex");
    setError("");

    try {
      const payload = await requestJson("/api/sources/reindex", {
        method: "POST",
      });
      setSources(payload.sources);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "刷新知识库失败。"
      );
    } finally {
      setBusyAction("");
    }
  };

  const currentInterviewer = session
    ? session.interviewers[session.currentInterviewerIndex]
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
      <section className="editorial-card space-y-6 p-6">
        <div className="space-y-2">
          <p className="editorial-label">Local Interview Coach</p>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-gray-100">
            模拟面试
          </h1>
          <p className="font-sans text-sm leading-7 text-ink-muted dark:text-gray-300">
            基于当前博客、`joyboy`、`onepiece` 和目标岗位 JD，对你的项目理解与表达进行追问和复盘。
          </p>
        </div>

        <form className="space-y-5" onSubmit={startSession}>
          <label className="block space-y-2">
            <span className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
              面试目标
            </span>
            <select
              value={presetId}
              onChange={(event) => handlePresetChange(event.target.value)}
              className="w-full rounded-lg border border-line-light bg-surface-light px-4 py-3 font-sans text-sm text-ink outline-none transition focus:border-primary-300 dark:border-line-dark dark:bg-surface-dark dark:text-gray-100"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          {activePreset && (
            <div className="rounded-lg border border-line-light bg-background-light px-4 py-3 dark:border-line-dark dark:bg-background-dark">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">
                Preset Summary
              </p>
              <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-300">
                {activePreset.summary}
              </p>
            </div>
          )}

          <label className="block space-y-2">
            <span className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
              目标岗位 JD
            </span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={10}
              className="w-full rounded-lg border border-line-light bg-surface-light px-4 py-3 font-sans text-sm leading-7 text-ink outline-none transition focus:border-primary-300 dark:border-line-dark dark:bg-surface-dark dark:text-gray-100"
              placeholder="粘贴目标岗位 JD，AI 会据此挑选知识源并设计问题。"
            />
          </label>

          <label className="block space-y-2">
            <span className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
              本轮重点
            </span>
            <textarea
              value={focusHint}
              onChange={(event) => setFocusHint(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-line-light bg-surface-light px-4 py-3 font-sans text-sm leading-7 text-ink outline-none transition focus:border-primary-300 dark:border-line-dark dark:bg-surface-dark dark:text-gray-100"
              placeholder="例如：我对支付链路、可观测性分桶、迁移策略讲得还不够扎实。"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
                面试官 Pack
              </span>
              <span className="font-sans text-xs text-ink-soft dark:text-gray-500">
                可按本轮目标删减
              </span>
            </div>

            <div className="space-y-3">
              {activePreset?.interviewers.map((interviewer) => {
                const checked = selectedInterviewerIds.includes(interviewer.id);

                return (
                  <label
                    key={interviewer.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-light bg-background-light px-4 py-3 dark:border-line-dark dark:bg-background-dark"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleInterviewer(interviewer.id)}
                      className="mt-1 h-4 w-4 rounded border-line-strong"
                    />
                    <span className="space-y-2">
                      <span className="block font-sans text-sm font-semibold text-ink dark:text-gray-100">
                        {interviewer.label}
                      </span>
                      <span className="block font-sans text-xs leading-6 text-ink-muted dark:text-gray-400">
                        {interviewer.focusAreas.join(" · ")}
                      </span>
                      <span className="flex flex-wrap gap-2">
                        {interviewer.skillDetails.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full border border-line-light bg-surface-light px-2.5 py-1 font-sans text-[11px] text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-gray-300"
                          >
                            {skill.label}
                          </span>
                        ))}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
                知识源
              </span>
              <button
                type="button"
                onClick={reindexSources}
                className="font-sans text-xs font-medium text-primary-700 transition hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-100"
              >
                {busyAction === "reindex" ? "刷新中…" : "刷新索引"}
              </button>
            </div>

            <div className="space-y-3">
              {sources.map((source) => (
                <label
                  key={source.sourceId}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-light bg-background-light px-4 py-3 dark:border-line-dark dark:bg-background-dark"
                >
                  <input
                    type="checkbox"
                    checked={activeScopeSet.has(source.sourceId)}
                    onChange={() => toggleScope(source.sourceId)}
                    disabled={!source.available}
                    className="mt-1 h-4 w-4 rounded border-line-strong"
                  />
                  <span className="space-y-1">
                    <span className="block font-sans text-sm font-semibold text-ink dark:text-gray-100">
                      {source.label}
                    </span>
                    <span className="block font-sans text-xs leading-6 text-ink-muted dark:text-gray-400">
                      {source.available
                        ? `${source.fileCount} files · ${source.chunkCount} indexed chunks`
                        : "当前未同步到 monorepo，本轮不会参与检索。"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-ink px-5 py-3 font-sans text-sm font-semibold text-background-light transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-primary-200"
            disabled={busyAction === "starting"}
          >
            {busyAction === "starting" ? "启动中…" : "开始模拟面试"}
          </button>
        </form>

        {sources.length === 0 && (
          <p className="rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 font-sans text-sm leading-7 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
            本地后端未连通。先运行 `pnpm run dev:local`，并在 `apps/backend`
            环境里提供 `OPENAI_API_KEY`。
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 font-sans text-sm leading-7 text-primary-900 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-100">
            {error}
          </p>
        )}
      </section>

      <section className="editorial-card flex min-h-[720px] flex-col overflow-hidden">
        <div className="border-b border-line-light px-6 py-5 dark:border-line-dark">
          <p className="editorial-label">Session</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-100">
            {session ? "对话与追问" : "等待启动"}
          </h2>
          {session && currentInterviewer && (
            <p className="mt-3 font-sans text-sm leading-7 text-ink-muted dark:text-gray-300">
              当前目标：{session.presetLabel} · 当前面试官：{currentInterviewer.label}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {!session && (
            <p className="max-w-3xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
              启动后，AI 会基于你的 JD 与已同步知识源提出第一个问题。后续每次回答后，它会给出即时点评并继续追问。
            </p>
          )}

          {session?.messages.map((message, index) => (
            <article
              key={`${message.role}-${index}-${message.createdAt}`}
              className={`rounded-2xl border px-5 py-4 shadow-editorial-sm ${
                message.role === "assistant"
                  ? "border-line-light bg-surface-light dark:border-line-dark dark:bg-surface-dark"
                  : "border-primary-100 bg-primary-50/80 dark:border-primary-900/30 dark:bg-primary-900/20"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">
                  {message.role === "assistant"
                    ? message.interviewerLabel || "Interviewer"
                    : "Candidate"}
                </p>
                <time className="font-sans text-xs text-ink-soft dark:text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-ink dark:text-gray-100">
                {message.content}
              </p>

              {message.references && message.references.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-line-light pt-4 dark:border-line-dark">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft dark:text-gray-500">
                    参考依据
                  </p>
                  {message.references.map((reference) => (
                    <div
                      key={`${reference.sourceId}:${reference.path}:${reference.title}`}
                      className="rounded-lg bg-background-light px-3 py-2 dark:bg-background-dark"
                    >
                      <p className="font-sans text-xs font-semibold text-ink dark:text-gray-100">
                        {reference.sourceLabel} · {reference.path}
                      </p>
                      <p className="mt-1 font-sans text-xs leading-6 text-ink-muted dark:text-gray-400">
                        {reference.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="border-t border-line-light px-6 py-5 dark:border-line-dark">
          <form onSubmit={submitAnswer} className="space-y-4">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={5}
              className="w-full rounded-xl border border-line-light bg-surface-light px-4 py-3 font-sans text-sm leading-7 text-ink outline-none transition focus:border-primary-300 dark:border-line-dark dark:bg-surface-dark dark:text-gray-100"
              placeholder="把你的回答写在这里。尽量讲清楚背景、约束、方案、权衡、结果和你自己的贡献。"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!session || !answer.trim() || busyAction === "replying"}
                className="rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-background-light transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-primary-200"
              >
                {busyAction === "replying" ? "提交中…" : "提交回答"}
              </button>
              <button
                type="button"
                onClick={switchInterviewer}
                disabled={!session || busyAction === "switching"}
                className="rounded-full border border-line-light bg-background-light px-5 py-2.5 font-sans text-sm font-semibold text-ink transition hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark dark:bg-background-dark dark:text-gray-200 dark:hover:border-primary-700 dark:hover:text-primary-200"
              >
                {busyAction === "switching" ? "切换中…" : "切换面试官"}
              </button>
              <button
                type="button"
                onClick={buildSummary}
                disabled={!session || busyAction === "summary"}
                className="rounded-full border border-line-light bg-surface-light px-5 py-2.5 font-sans text-sm font-semibold text-ink transition hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark dark:bg-surface-dark dark:text-gray-200 dark:hover:border-primary-700 dark:hover:text-primary-200"
              >
                {busyAction === "summary" ? "生成中…" : "生成本轮总结"}
              </button>
            </div>
          </form>

          {session?.summary && (
            <div className="mt-6 rounded-2xl border border-line-light bg-background-light p-5 dark:border-line-dark dark:bg-background-dark">
              <p className="editorial-label">Session Summary</p>
              <div className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-ink dark:text-gray-100">
                {session.summary.markdown}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
