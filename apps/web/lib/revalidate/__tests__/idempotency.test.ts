import { describe, expect, it } from "vitest";

import { IdempotencyStore } from "@/lib/revalidate/idempotency";

describe("IdempotencyStore", () => {
  it("首次 record 后重复 eventId 命中幂等", () => {
    const store = new IdempotencyStore();
    const now = 1_000_000;
    expect(store.isDuplicate("evt-1", now)).toBe(false);
    store.record("evt-1", now);
    expect(store.isDuplicate("evt-1", now)).toBe(true);
    expect(store.isDuplicate("evt-2", now)).toBe(false);
  });

  it("TTL 24h 内重复命中，过期后不再命中并被清理", () => {
    const ttl = 24 * 60 * 60 * 1000;
    const store = new IdempotencyStore(ttl);
    const now = 1_000_000;
    store.record("evt-1", now);

    expect(store.isDuplicate("evt-1", now + ttl - 1)).toBe(true);
    // 恰好到达过期时刻视为过期
    expect(store.isDuplicate("evt-1", now + ttl)).toBe(false);
    // 过期条目在下一次 isDuplicate 时被清理
    expect(store.size).toBe(0);
  });

  it("过期后可重新 record 同一 eventId", () => {
    const ttl = 1000;
    const store = new IdempotencyStore(ttl);
    const now = 1_000_000;
    store.record("evt-1", now);
    store.record("evt-1", now + ttl + 1);
    expect(store.isDuplicate("evt-1", now + ttl + 2)).toBe(true);
  });
});
