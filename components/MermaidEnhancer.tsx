"use client";

import { useEffect, useState } from "react";

type ExpandedDiagram = {
  title: string;
  svg: string;
};

export default function MermaidEnhancer() {
  const [expandedDiagram, setExpandedDiagram] =
    useState<ExpandedDiagram | null>(null);

  useEffect(() => {
    const diagrams = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".mermaid-diagram")
    );

    if (diagrams.length === 0) {
      return;
    }

    let isCancelled = false;

    async function renderDiagrams() {
      const mermaidModule = await import("mermaid");
      const mermaid = mermaidModule.default;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          background: "#FFFDF8",
          primaryColor: "#E6F3F1",
          primaryTextColor: "#1F2933",
          primaryBorderColor: "#9DD1C9",
          lineColor: "#0F766E",
          secondaryColor: "#F7F4ED",
          tertiaryColor: "#FFFFFF",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      });

      if (isCancelled) {
        return;
      }

      diagrams.forEach((diagram, index) => {
        if (diagram.dataset.rendered === "true") {
          return;
        }

        const source = decodeURIComponent(diagram.dataset.mermaid || "").trim();
        if (!source) {
          return;
        }

        diagram.dataset.rendered = "true";

        mermaid
          .render(`mermaid-${Date.now()}-${index}`, source)
          .then(({ svg }) => {
            if (isCancelled) {
              return;
            }

            diagram.innerHTML = svg;
            diagram.dataset.svg = encodeURIComponent(svg);
            diagram.dataset.title = diagram.dataset.title || `图例 ${index + 1}`;
            diagram.classList.add("is-rendered");
          })
          .catch(() => {
            diagram.innerHTML =
              '<span class="mermaid-error">图例渲染失败，请检查 Mermaid 语法。</span>';
            diagram.classList.add("has-error");
          });
      });
    }

    renderDiagrams();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const diagrams = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".mermaid-diagram")
    );

    diagrams.forEach((diagram, index) => {
      diagram.dataset.title = diagram.dataset.title || `图例 ${index + 1}`;
    });
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const diagram = target.closest<HTMLButtonElement>(".mermaid-diagram");

      if (!diagram || !diagram.dataset.svg) {
        return;
      }

      setExpandedDiagram({
        title: diagram.dataset.title || "图例",
        svg: decodeURIComponent(diagram.dataset.svg),
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  if (!expandedDiagram) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-6 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={expandedDiagram.title}
      onClick={() => setExpandedDiagram(null)}
    >
      <div
        className="max-h-full w-full max-w-6xl overflow-auto rounded-3xl border border-line-light bg-surface-light p-5 shadow-2xl dark:border-line-dark dark:bg-surface-dark"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            {expandedDiagram.title}
          </p>
          <button
            type="button"
            className="rounded-full border border-line-light px-4 py-2 text-sm text-ink-muted transition hover:border-primary-200 hover:text-primary-800 dark:border-line-dark dark:text-gray-300 dark:hover:border-primary-800 dark:hover:text-primary-200"
            onClick={() => setExpandedDiagram(null)}
          >
            关闭
          </button>
        </div>
        <div
          className="min-w-[720px]"
          dangerouslySetInnerHTML={{ __html: expandedDiagram.svg }}
        />
      </div>
    </div>
  );
}
