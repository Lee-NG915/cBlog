"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import usePanZoom from "@/hooks/usePanZoom";

type MermaidViewerProps = {
  title: string;
  svg: string;
  onClose: () => void;
};

const TOOLBAR_BUTTON_CLASS =
  "min-h-11 min-w-11 rounded-full border border-line-light bg-white/90 px-3 py-1.5 text-sm text-ink-muted transition hover:bg-white hover:text-ink dark:border-line-dark dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white";

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
      const parts = viewBox
        .trim()
        .split(/[\s,]+/)
        .map(Number);
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

  const dialogRef = useRef<HTMLDialogElement>(null);
  const preparedSvg = useMemo(() => prepareViewerSvg(svg), [svg]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useLayoutEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    fitToWidth();
  }, [fitToWidth, preparedSvg]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 flex h-dvh w-screen max-w-none max-h-none flex-col border-0 bg-ink/90 p-0 backdrop-blur"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex="0"]',
          ),
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (!first) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <div className="flex flex-wrap items-center gap-2">
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
    </dialog>
  );
}
