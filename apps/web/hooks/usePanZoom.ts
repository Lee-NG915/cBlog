"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PanZoomTransform = {
  scale: number;
  tx: number;
  ty: number;
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 8;
const WHEEL_ZOOM_INTENSITY = 0.002;
const BUTTON_ZOOM_FACTOR = 1.4;
const DOUBLE_CLICK_ZOOM_FACTOR = 1.5;
const FIT_MARGIN = 24;
const DRAG_CLICK_THRESHOLD = 6;

function clampScale(value: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function measureContent(
  content: HTMLElement,
): { width: number; height: number; hasIntrinsicSize: boolean } {
  const svg = content.querySelector("svg");

  if (svg) {
    const viewBox = svg.viewBox?.baseVal;
    if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
      return {
        width: viewBox.width,
        height: viewBox.height,
        hasIntrinsicSize: true,
      };
    }

    try {
      const box = svg.getBBox();
      if (box.width > 0 && box.height > 0) {
        return { width: box.width, height: box.height, hasIntrinsicSize: true };
      }
    } catch {
      // getBBox 在部分浏览器中对未布局元素会抛错，走兜底分支。
    }
  }

  return {
    width: content.offsetWidth || 1,
    height: content.offsetHeight || 1,
    hasIntrinsicSize: false,
  };
}

export function usePanZoom() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<PanZoomTransform>({ scale: 1, tx: 0, ty: 0 });
  const rafRef = useRef<number | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureTravelRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [scale, setScale] = useState(1);

  const schedulePaint = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const { scale: nextScale, tx, ty } = transformRef.current;

      const content = contentRef.current;
      if (content) {
        content.style.transform = `translate(${tx}px, ${ty}px) scale(${nextScale})`;
      }

      setScale((previous) =>
        Math.round(previous * 100) === Math.round(nextScale * 100)
          ? previous
          : nextScale,
      );
    });
  }, []);

  const applyTo = useCallback(
    (next: Partial<PanZoomTransform>) => {
      const current = transformRef.current;
      transformRef.current = {
        scale: clampScale(next.scale ?? current.scale),
        tx: next.tx ?? current.tx,
        ty: next.ty ?? current.ty,
      };
      schedulePaint();
    },
    [schedulePaint],
  );

  const zoomAt = useCallback(
    (anchorX: number, anchorY: number, targetScale: number) => {
      const { scale: currentScale, tx, ty } = transformRef.current;
      const nextScale = clampScale(targetScale);
      const ratio = nextScale / currentScale;
      applyTo({
        scale: nextScale,
        tx: anchorX - (anchorX - tx) * ratio,
        ty: anchorY - (anchorY - ty) * ratio,
      });
    },
    [applyTo],
  );

  const zoomAtCenter = useCallback(
    (factor: number) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      zoomAt(
        rect.width / 2,
        rect.height / 2,
        transformRef.current.scale * factor,
      );
    },
    [zoomAt],
  );

  const zoomIn = useCallback(
    () => zoomAtCenter(BUTTON_ZOOM_FACTOR),
    [zoomAtCenter],
  );
  const zoomOut = useCallback(
    () => zoomAtCenter(1 / BUTTON_ZOOM_FACTOR),
    [zoomAtCenter],
  );

  const fitToWidth = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const size = measureContent(content);
    const availableWidth = Math.max(rect.width - FIT_MARGIN * 2, 1);
    const availableHeight = Math.max(rect.height - FIT_MARGIN * 2, 1);
    const nextScale = size.hasIntrinsicSize
      ? clampScale(
          Math.min(availableWidth / size.width, availableHeight / size.height, 1),
        )
      : 1;

    applyTo({
      scale: nextScale,
      tx: (rect.width - size.width * nextScale) / 2,
      ty: (rect.height - size.height * nextScale) / 2,
    });
  }, [applyTo]);

  const resetToOriginal = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const size = measureContent(content);
    applyTo({
      scale: 1,
      tx: (rect.width - size.width) / 2,
      ty: (rect.height - size.height) / 2,
    });
  }, [applyTo]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.style.touchAction = "none";
    const pointers = pointersRef.current;

    const toLocalPoint = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const anchor = toLocalPoint(event.clientX, event.clientY);
      zoomAt(
        anchor.x,
        anchor.y,
        transformRef.current.scale * Math.exp(-event.deltaY * WHEEL_ZOOM_INTENSITY),
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      event.preventDefault();
      container.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        gestureTravelRef.current = 0;
      }
      container.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) {
        return;
      }

      const current = { x: event.clientX, y: event.clientY };
      gestureTravelRef.current += Math.hypot(
        current.x - previous.x,
        current.y - previous.y,
      );

      if (pointers.size === 1) {
        pointers.set(event.pointerId, current);
        const { tx, ty } = transformRef.current;
        applyTo({
          tx: tx + current.x - previous.x,
          ty: ty + current.y - previous.y,
        });
        return;
      }

      if (pointers.size === 2) {
        const otherEntry = Array.from(pointers.entries()).find(
          ([pointerId]) => pointerId !== event.pointerId,
        );
        if (!otherEntry) {
          return;
        }

        const other = otherEntry[1];
        const previousDistance = Math.hypot(
          previous.x - other.x,
          previous.y - other.y,
        );
        const previousCenter = toLocalPoint(
          (previous.x + other.x) / 2,
          (previous.y + other.y) / 2,
        );

        pointers.set(event.pointerId, current);

        const nextDistance = Math.hypot(
          current.x - other.x,
          current.y - other.y,
        );
        const nextCenter = toLocalPoint(
          (current.x + other.x) / 2,
          (current.y + other.y) / 2,
        );

        const { tx, ty } = transformRef.current;
        applyTo({
          tx: tx + nextCenter.x - previousCenter.x,
          ty: ty + nextCenter.y - previousCenter.y,
        });

        if (previousDistance > 0 && nextDistance > 0) {
          zoomAt(
            nextCenter.x,
            nextCenter.y,
            transformRef.current.scale * (nextDistance / previousDistance),
          );
        }
      }
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) {
        return;
      }

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }

      if (pointers.size === 0) {
        container.style.cursor = "";
        if (gestureTravelRef.current > DRAG_CLICK_THRESHOLD) {
          suppressClickRef.current = true;
        }
        gestureTravelRef.current = 0;
      }
    };

    const handleClickCapture = (event: MouseEvent) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleDoubleClick = (event: MouseEvent) => {
      event.preventDefault();
      const currentScale = transformRef.current.scale;

      if (currentScale >= MAX_SCALE - 0.001) {
        fitToWidth();
        return;
      }

      const anchor = toLocalPoint(event.clientX, event.clientY);
      zoomAt(anchor.x, anchor.y, currentScale * DOUBLE_CLICK_ZOOM_FACTOR);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerEnd);
    container.addEventListener("pointercancel", handlePointerEnd);
    container.addEventListener("click", handleClickCapture, true);
    container.addEventListener("dblclick", handleDoubleClick);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerEnd);
      container.removeEventListener("pointercancel", handlePointerEnd);
      container.removeEventListener("click", handleClickCapture, true);
      container.removeEventListener("dblclick", handleDoubleClick);
      pointers.clear();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [applyTo, fitToWidth, zoomAt]);

  return {
    containerRef,
    contentRef,
    scale,
    zoomIn,
    zoomOut,
    fitToWidth,
    resetToOriginal,
    applyTo,
  };
}

export default usePanZoom;
