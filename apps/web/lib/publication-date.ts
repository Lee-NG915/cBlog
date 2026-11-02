/** Editorial dates use UTC+8 in both server rendering and the editor. */
export function publicationDate(value: string, withTime = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const text = new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString();
  return text.slice(0, 10).replaceAll("-", ".") + (withTime ? ` ${text.slice(11, 16)}` : "");
}
