export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** 保留 v1 名称，避免现有 SQLite/Web/Admin 在迁移期被迫同步改名。 */
export const POST_STATUSES = CONTENT_STATUSES;
export type PostStatus = ContentStatus;

const ALLOWED_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ["published"],
  published: ["draft", "archived"],
  archived: ["draft", "published"],
};

export function canTransitionContentStatus(
  current: ContentStatus,
  next: ContentStatus
): boolean {
  return current === next || ALLOWED_TRANSITIONS[current].includes(next);
}

export function assertContentStatusTransition(
  current: ContentStatus,
  next: ContentStatus
): void {
  if (!canTransitionContentStatus(current, next)) {
    throw new InvalidContentStatusTransitionError(current, next);
  }
}

export class InvalidContentStatusTransitionError extends Error {
  readonly code = "INVALID_STATUS_TRANSITION";

  constructor(
    public readonly current: ContentStatus,
    public readonly next: ContentStatus
  ) {
    super(`不允许的内容状态流转: ${current} -> ${next}`);
    this.name = "InvalidContentStatusTransitionError";
  }
}
