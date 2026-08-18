/**
 * 静态驱动合批窗口判断（纯函数，便于单测）。
 * 从最老 pending 事件开始等待一个 debounce 窗口；窗口到期后一次 claim
 * 当前可投递事件。已触发的 queued/running deployment 绝不再接收新事件。
 */
export function isBatchReady(
  oldestPendingCreatedAt: Date,
  now: Date,
  windowSeconds: number
): boolean {
  const ageMs = now.getTime() - oldestPendingCreatedAt.getTime();
  return ageMs >= Math.max(0, windowSeconds) * 1000;
}
