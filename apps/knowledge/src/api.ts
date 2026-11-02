import type { Corpus, Note } from "./types";
let csrf = "";
export function setCSRF(value: string) {
  csrf = value;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch("/api/v1" + url, {
    signal: options.signal || AbortSignal.timeout(20000),
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
      ...options.headers,
    },
  }).catch((error) => {
    throw new ApiError(
      error.name === "TimeoutError"
        ? "请求超时，请重新核对状态后重试。刚才的操作可能仍在处理中。"
        : "连接中断，请联网后重试；未保存的修改会留在本机。",
      "NETWORK",
      0,
    );
  });
  const value = await response.json().catch(() => {
    throw new ApiError(
      `服务暂时无法响应（HTTP ${response.status}），请稍后重试。`,
      "INVALID_RESPONSE",
      response.status,
    );
  });
  if (response.status === 401)
    window.dispatchEvent(new Event("cblog:session-expired"));
  if (!response.ok)
    throw new ApiError(
      value.error?.message || "服务暂不可用",
      value.error?.code || "UNAVAILABLE",
      response.status,
    );
  return value;
}
export async function loadCorpus(): Promise<Corpus> {
  for (let retry = 0; retry < 3; retry++) {
    const notes: Note[] = [];
    const deletedIds: string[] = [];
    let cursor = "",
      revision: number | undefined;
    try {
      do {
        const response = await api<{
          data: Note[];
          deletedIds?: string[];
          revision: number;
          nextCursor: string | null;
        }>(
          "/corpus?cursor=" +
            encodeURIComponent(cursor) +
            (revision === undefined ? "" : "&revision=" + revision),
        );
        notes.push(...response.data);
        deletedIds.push(...(response.deletedIds || []));
        revision = response.revision;
        cursor = response.nextCursor || "";
      } while (cursor);
      return { notes, revision: revision!, deletedIds };
    } catch (e) {
      if (!(e instanceof ApiError && e.code === "CORPUS_CHANGED")) throw e;
    }
  }
  throw new Error("笔记持续变化，请稍后刷新");
}
export function download(filename: string, value: string, type = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([value], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
