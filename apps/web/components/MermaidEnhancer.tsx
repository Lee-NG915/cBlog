"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type ExpandedDiagram = {
  title: string;
  svg: string;
};

function isDiagramLayoutReady(diagram: HTMLElement): boolean {
  const revealHost = diagram.closest<HTMLElement>("[data-reveal]");
  const revealed =
    !revealHost ||
    revealHost.classList.contains("is-revealed") ||
    !document.documentElement.classList.contains("reveal-ready");

  const host = diagram.closest<HTMLElement>(".mermaid-figure") ?? diagram;
  const width = host.getBoundingClientRect().width;

  return revealed && width > 0;
}

function waitForDiagramLayout(diagram: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    if (isDiagramLayoutReady(diagram)) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled || !isDiagramLayoutReady(diagram)) {
        return;
      }

      settled = true;
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearTimeout(timeoutId);
      resolve();
    };

    const intersectionObserver = new IntersectionObserver(() => finish(), {
      threshold: 0,
    });
    intersectionObserver.observe(diagram);

    const resizeObserver = new ResizeObserver(() => finish());
    resizeObserver.observe(diagram);

    const mutationObserver = new MutationObserver(() => finish());
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });

    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      resolve();
    }, 4000);
  });
}

function prepareInlineSvg(svg: SVGSVGElement): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("width");
  clone.removeAttribute("height");
  clone.style.width = "100%";
  clone.style.height = "auto";
  clone.style.display = "block";
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return clone;
}

function serializeSvg(svg: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(svg);
}

export default function MermaidEnhancer() {
  const [expandedDiagram, setExpandedDiagram] =
    useState<ExpandedDiagram | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const diagrams = Array.from(
      document.querySelectorAll<HTMLElement>(".mermaid-diagram"),
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
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          padding: 16,
        },
        sequence: {
          useMaxWidth: false,
        },
      });

      if (isCancelled) {
        return;
      }

      for (const [index, diagram] of Array.from(diagrams.entries())) {
        if (diagram.dataset.rendered === "true") {
          continue;
        }

        const source = decodeURIComponent(diagram.dataset.mermaid || "").trim();
        if (!source) {
          continue;
        }

        try {
          await waitForDiagramLayout(diagram);

          if (isCancelled) {
            return;
          }

          const staging = document.createElement("div");
          staging.className = "mermaid";
          staging.textContent = source;
          diagram.replaceChildren(staging);

          await mermaid.run({
            nodes: [staging],
            suppressErrors: true,
          });

          if (isCancelled) {
            return;
          }

          const svg = staging.querySelector("svg");
          if (!svg) {
            throw new Error("Mermaid did not produce SVG output");
          }

          const inlineSvg = prepareInlineSvg(svg);
          const inlineSvgHtml = serializeSvg(inlineSvg);
          const modalSvgHtml = serializeSvg(svg);
          diagram.innerHTML = inlineSvgHtml;
          diagram.dataset.svg = encodeURIComponent(modalSvgHtml);
          diagram.dataset.title = diagram.dataset.title || `图例 ${index + 1}`;
          diagram.dataset.rendered = "true";
          diagram.classList.add("is-rendered");
        } catch {
          diagram.innerHTML =
            '<span class="mermaid-error">图例渲染失败，请检查 Mermaid 语法。</span>';
          diagram.dataset.rendered = "true";
          diagram.classList.add("has-error");
        }
      }
    }

    renderDiagrams();

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const diagrams = Array.from(
      document.querySelectorAll<HTMLElement>(".mermaid-diagram"),
    );

    diagrams.forEach((diagram, index) => {
      diagram.dataset.title = diagram.dataset.title || `图例 ${index + 1}`;
    });
  }, [pathname]);

  useEffect(() => {
    const openDiagram = (diagram: HTMLElement) => {
      if (!diagram.dataset.svg) {
        return;
      }

      setExpandedDiagram({
        title: diagram.dataset.title || "图例",
        svg: decodeURIComponent(diagram.dataset.svg),
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const diagram = target.closest<HTMLElement>(".mermaid-diagram");

      if (!diagram) {
        return;
      }

      openDiagram(diagram);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const target = event.target as HTMLElement;
      const diagram = target.closest<HTMLElement>(".mermaid-diagram");

      if (!diagram) {
        return;
      }

      event.preventDefault();
      openDiagram(diagram);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
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
          className="overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: expandedDiagram.svg }}
        />
      </div>
    </div>
  );
}
