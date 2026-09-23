import {
  Children,
  isValidElement,
  type ReactNode,
  useState,
  lazy,
  Suspense,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
const Diagram = lazy(() => import("./Diagram"));
export function jumpToHeading(id: string) {
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.has("note")) {
    params.set("section", id);
    history.replaceState(null, "", "#" + params.toString());
  }
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
}
export function headingSlug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-") || "section"
  );
}
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((x) =>
      isValidElement<{ children?: ReactNode }>(x)
        ? textOf(x.props.children)
        : typeof x === "string" || typeof x === "number"
          ? String(x)
          : "",
    )
    .join("");
}
export function readingBody(body: string, title: string) {
  const lines = body.trimStart().split("\n");
  if (
    lines[0]?.replace(/^#\s+/, "").trim() === title.trim() &&
    /^#\s+/.test(lines[0])
  )
    return lines.slice(1).join("\n");
  return body;
}
export function headings(body: string) {
  let fenced = false;
  const used = new Map<string, number>();
  return body.split("\n").flatMap((line) => {
    if (/^\s*```|^\s*~~~/.test(line)) {
      fenced = !fenced;
      return [];
    }
    if (fenced) return [];
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (!m) return [];
    const title = m[2].replace(/[*`]/g, ""),
      base = headingSlug(title),
      n = used.get(base) || 0;
    used.set(base, n + 1);
    return [{ title, level: m[1].length, id: base + (n ? "-" + n : "") }];
  });
}
function Pre({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  if (
    isValidElement<{ className?: string }>(children) &&
    children.props.className === "language-mermaid"
  )
    return <>{children}</>;
  return (
    <div className="code-wrap">
      <button
        className="copy"
        aria-label="复制代码"
        onClick={() =>
          void navigator.clipboard.writeText(textOf(children)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
        }
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre>{children}</pre>
    </div>
  );
}
export function Markdown({ body }: { body: string }) {
  const used = new Map<string, number>();
  const header = (level: number, children: ReactNode) => {
    const base = headingSlug(textOf(children)),
      n = used.get(base) || 0;
    used.set(base, n + 1);
    const id = base + (n ? "-" + n : "");
    return level === 1 ? (
      <h2 id={id}>{children}</h2>
    ) : level === 2 ? (
      <h2 id={id}>{children}</h2>
    ) : (
      <h3 id={id}>{children}</h3>
    );
  };
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) =>
          /^(https?:|mailto:|\/|#|\.\/|\.\.\/)/i.test(url) ? url : ""
        }
        components={{
          code: ({ children, className }) =>
            className === "language-mermaid" ? (
              <Suspense fallback={<pre>{children}</pre>}>
                <Diagram source={String(children)} />
              </Suspense>
            ) : (
              <code className={className}>{children}</code>
            ),
          h1: ({ children }) => header(1, children),
          h2: ({ children }) => header(2, children),
          h3: ({ children }) => header(3, children),
          pre: ({ children }) => <Pre>{children}</Pre>,
          table: ({ children }) => (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="可横向滚动的表格"
            >
              <table>{children}</table>
            </div>
          ),
          img: ({ src, alt }) => (
            <figure>
              <a href={src} target="_blank" rel="noreferrer">
                <img src={src} alt={alt || "笔记图片"} loading="lazy" />
              </a>
              {alt && <figcaption>{alt}</figcaption>}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              onClick={(event) => {
                if (href?.startsWith("#")) {
                  event.preventDefault();
                  try {
                    jumpToHeading(decodeURIComponent(href.slice(1)));
                  } catch {
                    jumpToHeading(href.slice(1));
                  }
                }
              }}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
