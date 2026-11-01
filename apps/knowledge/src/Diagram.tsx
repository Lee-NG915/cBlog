import { useEffect, useRef, useState } from "react";
export default function Diagram({ source }: { source: string }) {
  const container = useRef<HTMLDivElement>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [dark, setDark] = useState(
      document.documentElement.dataset.theme === "dark",
    );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.dataset.theme === "dark"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    setError("");
    setLoading(true);
    const target = container.current;
    void import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "neutral",
          fontFamily: "system-ui",
          suppressErrorRendering: true,
          maxTextSize: 50000,
        });
        const { svg } = await mermaid.render(
          "diagram-" + crypto.randomUUID(),
          source,
        );
        if (active && target) {
          target.innerHTML = svg;
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          setError("图表语法暂不支持，已保留源码。");
        }
      });
    return () => {
      active = false;
    };
  }, [source, dark]);
  return (
    <div className="diagram">
      {loading && <p role="status">正在绘制图表…</p>}
      {error ? (
        <div className="diagram-error">
          <p>{error}</p>
          <pre>{source}</pre>
        </div>
      ) : null}
      <div
        ref={container}
        hidden={!!error || loading}
        role="img"
        aria-label="笔记流程图"
      />
      <details>
        <summary>查看图表源码</summary>
        <pre>{source}</pre>
      </details>
    </div>
  );
}
