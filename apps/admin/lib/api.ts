"use client";

/** 客户端 fetch 封装：非 2xx 抛出后端 error.message */
export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (data as { error?: { message?: string } })?.error?.message ||
        `请求失败: ${response.status}`
    );
  }
  return data as T;
}
