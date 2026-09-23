import { useEffect, useRef, useState } from "react";
export default function Diagram({ source }: { source: string }) {
  const container = useRef<HTMLDivElement>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    const target = container.current;
    void import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
          fontFamily: "system-ui",
          suppressErrorRendering: true,
          maxTextSize: 50000,
        });
        const { svg } = await mermaid.render(
          "diagram-" + crypto.randomUUID(),
          source,
        );
        if (active && target) target.innerHTML = svg;
      })
      .catch(() => {
        if (active) setError("图表语法暂不支持，已保留源码。");
      });
    return () => {
      active = false;
    };
  }, [source]);
  return (
    <div className="diagram">
      {error ? (
        <div className="diagram-error">
          <p>{error}</p>
          <pre>{source}</pre>
        </div>
      ) : (
        <div ref={container} role="img" aria-label="笔记流程图" />
      )}
      <details>
        <summary>查看图表源码</summary>
        <pre>{source}</pre>
      </details>
    </div>
  );
}
