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
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
      ...options.headers,
    },
  });
  const value = await response.json();
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
    let cursor = "",
      revision: number | undefined;
    try {
      do {
        const response = await api<{
          data: Note[];
          revision: number;
          nextCursor: string | null;
        }>(
          "/corpus?cursor=" +
            encodeURIComponent(cursor) +
            (revision === undefined ? "" : "&revision=" + revision),
        );
        notes.push(...response.data);
        revision = response.revision;
        cursor = response.nextCursor || "";
      } while (cursor);
      return { notes, revision: revision! };
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
