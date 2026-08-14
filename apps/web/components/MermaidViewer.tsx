"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import usePanZoom from "@/hooks/usePanZoom";

type MermaidViewerProps = {
  title: string;
  svg: string;
  onClose: () => void;
};

const TOOLBAR_BUTTON_CLASS =
  "rounded-full border border-line-light bg-white/90 px-3 py-1.5 text-sm text-ink-muted transition hover:bg-white hover:text-ink dark:border-line-dark dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white";

function prepareViewerSvg(svgMarkup: string): string {
  try {
    const doc = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
    const svg = doc.documentElement;

    if (
      svg.nodeName.toLowerCase() !== "svg" ||
      doc.querySelector("parsererror")
    ) {
      return svgMarkup;
    }

    svg.removeAttribute("width");
    svg.removeAttribute("height");

    let sizeStyle = "max-width:none;display:block;";
    const viewBox = svg.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (
        parts.length === 4 &&
        Number.isFinite(parts[2]) &&
        Number.isFinite(parts[3]) &&
        parts[2] > 0 &&
        parts[3] > 0
      ) {
        sizeStyle += `width:${parts[2]}px;height:${parts[3]}px;`;
      }
    }

    const existingStyle = svg.getAttribute("style");
    svg.setAttribute(
      "style",
      existingStyle ? `${existingStyle};${sizeStyle}` : sizeStyle,
    );

    return new XMLSerializer().serializeToString(svg);
  } catch {
    return svgMarkup;
  }
}

export default function MermaidViewer({
  title,
  svg,
  onClose,
}: MermaidViewerProps) {
  const {
    containerRef,
    contentRef,
    scale,
    zoomIn,
    zoomOut,
    fitToWidth,
    resetToOriginal,
  } = usePanZoom();

  const preparedSvg = useMemo(() => prepareViewerSvg(svg), [svg]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useLayoutEffect(() => {
    fitToWidth();
  }, [fitToWidth, preparedSvg]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/70 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={TOOLBAR_BUTTON_CLASS}
            aria-label="缩小"
            title="缩小"
            onClick={zoomOut}
          >
            −
          </button>
          <span className="min-w-[3.5rem] text-center text-sm tabular-nums text-white/85">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className={TOOLBAR_BUTTON_CLASS}
            aria-label="放大"
            title="放大"
            onClick={zoomIn}
          >
            +
          </button>
          <button
            type="button"
            className={TOOLBAR_BUTTON_CLASS}
            aria-label="适配宽度"
            title="适配宽度"
            onClick={fitToWidth}
          >
            适配宽度
          </button>
          <button
            type="button"
            className={TOOLBAR_BUTTON_CLASS}
            aria-label="原始大小"
            title="原始大小"
            onClick={resetToOriginal}
          >
            1:1
          </button>
          <button
            type="button"
            className={TOOLBAR_BUTTON_CLASS}
            aria-label="关闭查看器"
            title="关闭"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative flex-1 cursor-grab select-none overflow-hidden"
      >
        <div
          ref={contentRef}
          className="absolute left-0 top-0 rounded-md bg-surface-light shadow-editorial dark:bg-surface-dark"
          style={{ transformOrigin: "0 0", willChange: "transform" }}
          onClick={(event) => event.stopPropagation()}
          dangerouslySetInnerHTML={{ __html: preparedSvg }}
        />
      </div>
    </div>
  );
}
