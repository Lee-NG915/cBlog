/** Avoid repeating an automatically extracted opening paragraph above the body.
 * Presentation only: metadata, Markdown, and publication identity stay intact. */
export function distinctExcerpt(
  body: string,
  excerpt?: string,
): string | undefined {
  if (!excerpt) return undefined;
  const normalize = (s: string) => s.replace(/[#*`>\[\]\s]/g, "").toLowerCase();
  const lead = normalize(body).slice(0, 260);
  const summary = normalize(excerpt).slice(0, 80);
  return summary.length >= 35 && lead.includes(summary) ? undefined : excerpt;
}

/** Keep the page title unique and make horizontally scrollable content keyboard reachable. */
export function readingHtml(html: string): string {
  return html
    .replace(/<h1(\s[^>]*)?>/g, "<h2$1>")
    .replace(/<\/h1>/g, "</h2>")
    .replace(/<pre>/g, '<pre tabindex="0" aria-label="代码块">')
    .replace(/<table>/g, '<table tabindex="0">');
}
