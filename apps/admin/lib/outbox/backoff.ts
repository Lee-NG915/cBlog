/**
 * Outbox 重投退避（REL-002）：5s/30s/2m/10m/30m 序列，超出后保持 30m。
 * attempt 从 1 开始（claim 时已 +1，即第 1 次投递失败按 attempt=1 退避 5s）。
 * OUTBOX_BACKOFF_MS 可用逗号分隔毫秒序列覆盖默认值（仅测试 harness 用）。
 */
const BACKOFF_MS: readonly number[] = (() => {
  const override = process.env.OUTBOX_BACKOFF_MS?.trim();
  if (!override) return [5_000, 30_000, 120_000, 600_000, 1_800_000];
  const parsed = override
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((value) => Number.isFinite(value) && value >= 0);
  return parsed.length > 0 ? parsed : [5_000, 30_000, 120_000, 600_000, 1_800_000];
})();

export function nextDelayMs(attempt: number): number {
  const index = Math.max(1, Math.floor(attempt)) - 1;
  return BACKOFF_MS[Math.min(index, BACKOFF_MS.length - 1)];
}

export function isExhausted(attempt: number, maxAttempts: number): boolean {
  return attempt >= maxAttempts;
}
