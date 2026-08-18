"use client";

import { useEffect, useRef } from "react";

const DEFAULT_MESSAGE = "当前有未保存的修改，确定离开此页面吗？";

/**
 * 同时保护浏览器关闭/刷新和 Next.js Link 站内导航。
 * App Router 没有稳定的可取消 popstate API；浏览器前进/后退是已知限制，
 * 不使用 history.pushState workaround，避免产生路由状态与浏览器历史不一致。
 */
export function useUnsavedChangesGuard(
  dirty: boolean,
  message: string = DEFAULT_MESSAGE
): void {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        !dirtyRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.download) return;
      if (anchor.target && anchor.target !== "_self") return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin) return;
      if (
        destination.pathname === current.pathname &&
        destination.search === current.search
      ) {
        return;
      }

      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [message]);
}
