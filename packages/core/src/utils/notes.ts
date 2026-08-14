/** 专栏文档的摘要/阅读时长/排序逻辑，迁自原 lib/rightCapital.ts 与 lib/addxAi.ts（行为不变） */

export function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 链接
    .replace(/`([^`]+)`/g, "$1") // 行内代码
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 加粗
    .replace(/(\*|_)(.*?)\1/g, "$2") // 斜体
    .replace(/~~(.*?)~~/g, "$1") // 删除线
    .replace(/^\s{0,3}>\s?/gm, "") // 引用标记
    .replace(/<[^>]+>/g, "") // HTML 标签
    .replace(/\s+/g, " ")
    .trim();
}

export function getNoteExcerpt(content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const plain = stripMarkdown(trimmed);
    if (!plain) {
      continue;
    }

    return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
  }

  return "";
}

/** 专栏文档阅读时长公式与文章不同（words + cjk/2），保持原展示等价 */
export function calculateNoteReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjkChars = (content.match(/[一-鿿]/g) || []).length;
  const totalWords = words + Math.ceil(cjkChars / 2);
  return Math.max(1, Math.ceil(totalWords / 250));
}

/** 专栏文档排序：order 升序 → 标题中文序（与原实现一致） */
export function compareNotesByOrder(
  a: { sortOrder: number; title: string },
  b: { sortOrder: number; title: string }
): number {
  return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "zh-CN");
}
