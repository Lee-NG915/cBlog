/** 与原 apps/web/lib/posts.ts 完全一致的规范化/计算逻辑（展示等价性依赖它们） */

export function normalizeDate(date: unknown): string {
  if (!date) {
    return "";
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return String(date).trim();
}

export function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(String).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

/** 计算阅读时间（中文 + 英文混合，约 250 字词/分钟） */
export function calculateReadingTime(content: string): number {
  const chineseCharCount = (content.match(/[一-龥]/g) || []).length;
  const englishWordCount = content
    .split(/\s+/)
    .filter((word) => /^[a-zA-Z]+$/.test(word)).length;
  const totalWords = chineseCharCount + englishWordCount;
  const readingTime = Math.ceil(totalWords / 250);
  return readingTime || 1;
}

/** 列表排序：date 降序 → updatedAt 降序 → slug 降序（字符串比较，与原实现一致） */
export function compareByDateDesc(
  a: { date: string; updatedAt?: string | null; slug: string },
  b: { date: string; updatedAt?: string | null; slug: string }
): number {
  const dateComparison = b.date.localeCompare(a.date);
  if (dateComparison !== 0) {
    return dateComparison;
  }

  const updatedAtComparison = (b.updatedAt || "").localeCompare(
    a.updatedAt || ""
  );
  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  return b.slug.localeCompare(a.slug);
}

export function nowIso(): string {
  return new Date().toISOString();
}
