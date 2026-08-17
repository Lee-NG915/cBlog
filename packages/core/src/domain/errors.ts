export class ContentNotFoundError extends Error {
  readonly code = "CONTENT_NOT_FOUND";

  constructor(entity: string, id: string) {
    super(`${entity} 不存在: ${id}`);
    this.name = "ContentNotFoundError";
  }
}

export class VersionConflictError extends Error {
  readonly code = "VERSION_CONFLICT";

  constructor(
    public readonly expectedVersion: number,
    public readonly currentVersion: number
  ) {
    super(
      `内容版本冲突: expected=${expectedVersion}, current=${currentVersion}`
    );
    this.name = "VersionConflictError";
  }
}
