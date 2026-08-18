/**
 * 进程内 eventId 幂等记录：Map<eventId, expiresAt>，TTL 24h，惰性清理。
 * 仅防 webhook 重试造成的重复执行；进程重启后记录丢失，
 * 重复 revalidateTag/revalidatePath 本身无副作用，语义可接受。
 */

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export class IdempotencyStore {
  private readonly seen = new Map<string, number>();

  constructor(private readonly ttlMs: number = IDEMPOTENCY_TTL_MS) {}

  /** eventId 已在有效期内（重复事件） */
  isDuplicate(eventId: string, now: number = Date.now()): boolean {
    this.sweep(now);
    const expiresAt = this.seen.get(eventId);
    return expiresAt !== undefined && expiresAt > now;
  }

  record(eventId: string, now: number = Date.now()): void {
    this.seen.set(eventId, now + this.ttlMs);
  }

  get size(): number {
    return this.seen.size;
  }

  private sweep(now: number): void {
    for (const [eventId, expiresAt] of this.seen) {
      if (expiresAt <= now) this.seen.delete(eventId);
    }
  }
}
