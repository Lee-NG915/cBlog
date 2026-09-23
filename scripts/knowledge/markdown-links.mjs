import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { root } from "./local-db.mjs";
const require = createRequire(path.join(root, "packages/core/package.json"));
export async function rewriteLinks(markdown, resolve) {
  const { remark } = await import(
    pathToFileURL(require.resolve("remark")).href
  );
  const tree = remark().parse(markdown),
    edits = [];
  function visit(node) {
    if (
      (node.type === "image" || node.type === "link") &&
      node.position &&
      typeof node.url === "string"
    ) {
      const start = node.position.start.offset,
        end = node.position.end.offset,
        raw = markdown.slice(start, end);
      const open = raw.lastIndexOf("](");
      if (open >= 0) {
        let offset = open + 2;
        while (/\s/.test(raw[offset] || "") && offset < raw.length) offset++;
        if (raw[offset] === "<") offset++;
        // Exact source range replacement leaves code, labels, titles and formatting untouched.
        if (raw.slice(offset, offset + node.url.length) === node.url) {
          const url = resolve(node.url, node.type === "image");
          if (url !== node.url)
            edits.push({
              start: start + offset,
              end: start + offset + node.url.length,
              url,
            });
        }
      }
    }
    for (const child of node.children || []) visit(child);
  }
  visit(tree);
  for (const edit of edits.sort((a, b) => b.start - a.start))
    markdown =
      markdown.slice(0, edit.start) + edit.url + markdown.slice(edit.end);
  return markdown;
}
