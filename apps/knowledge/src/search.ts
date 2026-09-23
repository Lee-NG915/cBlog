import type { Note } from "./types";
const aliases = [
  ["广告", "投放", "付费获客", "paid ads", "获客"],
  ["埋点", "tracking", "事件追踪"],
  ["下单", "购买", "转化", "checkout"],
  ["架构", "architecture", "重构"],
  ["缓存", "cache", "isr"],
  ["组件", "设计系统", "design system"],
];
export function tokens(text: string) {
  const normalized = text.normalize("NFKC").toLowerCase();
  const out = new Set(normalized.match(/[a-z0-9_+./-]+/g) || []);
  for (const chunk of normalized.match(/[\p{Script=Han}]+/gu) || []) {
    if (chunk.length === 1) out.add(chunk);
    for (let i = 0; i < chunk.length - 1; i++) out.add(chunk.slice(i, i + 2));
  }
  return [...out];
}
export function searchNotes(notes: Note[], query: string) {
  if (!query.trim())
    return notes.map((note) => ({
      note,
      score: 0,
      snippet: note.body.replace(/[#*`>]/g, "").slice(0, 150),
    }));
  const original = query.toLowerCase(),
    terms = tokens(query),
    expanded = new Set(terms);
  for (const synonyms of aliases)
    if (synonyms.some((s) => original.includes(s)))
      for (const s of synonyms) expanded.add(s);
  return notes
    .map((note) => {
      const title = note.title.toLowerCase(),
        body = note.body.toLowerCase(),
        tags = note.tags.toLowerCase();
      let score = 0,
        first = -1;
      for (const term of expanded) {
        if (title.includes(term)) score += 5;
        if (tags.includes(term)) score += 4;
        const i = body.indexOf(term);
        if (i >= 0) {
          score += 1;
          if (first < 0) first = i;
        }
      }
      if (title.includes(original)) score += 12;
      const start = Math.max(0, first - 35);
      return {
        note,
        score,
        snippet: note.body.slice(start, start + 170).replace(/[#*`>]/g, ""),
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
