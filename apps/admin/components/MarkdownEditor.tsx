"use client";

import { useEffect, useRef, useState } from "react";
import CodeMirror, { type EditorView } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { markdownToHtml } from "@cblog/core/markdown";
import { fetchJson } from "@/lib/api";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  uploadFilePath?: string; // 目标文档相对 content/ 的路径；提供时启用粘贴/拖拽图片上传
  heightClass?: string; // 默认 "h-[70vh]"
}

/** mermaid 只初始化一次（模块级标记） */
let mermaidInitialized = false;

function collectImageFiles(list: FileList | null): File[] {
  if (!list) return [];
  return Array.from(list).filter((file) => file.type.startsWith("image/"));
}

export default function MarkdownEditor({
  value,
  onChange,
  uploadFilePath,
  heightClass = "h-[70vh]",
}: MarkdownEditorProps): JSX.Element {
  const [html, setHtml] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const viewRef = useRef<EditorView | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // 对 value 300ms 防抖渲染预览 HTML
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      markdownToHtml(value)
        .then((rendered) => {
          if (cancelled) return;
          let result = rendered;
          if (uploadFilePath) {
            result = result.replaceAll(
              'src="./assets/',
              `src="/api/assets?doc=${encodeURIComponent(uploadFilePath)}&name=assets/`
            );
          }
          setHtml(result);
        })
        .catch(() => {
          if (!cancelled) setHtml("<p>预览渲染失败</p>");
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, uploadFilePath]);

  // HTML 注入后渲染 Mermaid 图例
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const targets = Array.from(
      container.querySelectorAll<HTMLElement>(".mermaid-diagram[data-mermaid]")
    ).filter((el) => el.dataset.rendered !== "true");
    if (targets.length === 0) return;

    let cancelled = false;
    (async () => {
      let mermaid: typeof import("mermaid").default;
      try {
        mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
          mermaidInitialized = true;
        }
      } catch {
        if (!cancelled) {
          targets.forEach((el) => {
            el.textContent = "图例渲染失败";
            el.dataset.rendered = "true";
          });
        }
        return;
      }

      for (const el of targets) {
        if (cancelled) return;
        const src = decodeURIComponent(el.dataset.mermaid || "");
        const div = document.createElement("div");
        div.className = "mermaid";
        div.textContent = src;
        el.replaceChildren(div);
        try {
          await mermaid.run({ nodes: [div], suppressErrors: true });
          if (!div.querySelector("svg")) {
            el.textContent = "图例渲染失败";
          }
        } catch {
          el.textContent = "图例渲染失败";
        }
        el.dataset.rendered = "true";
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html]);

  async function uploadImages(files: File[]) {
    if (!uploadFilePath || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filePath", uploadFilePath);
        const { src } = await fetchJson<{ src: string }>("/api/images", {
          method: "POST",
          body: formData,
        });
        const view = viewRef.current;
        if (view) {
          view.dispatch(view.state.replaceSelection(`![](${src})\n`));
        }
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setUploading(false);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    if (!uploadFilePath) return;
    const files = collectImageFiles(event.clipboardData.files);
    if (files.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    void uploadImages(files);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    if (!uploadFilePath) return;
    const files = collectImageFiles(event.dataTransfer.files);
    if (files.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    void uploadImages(files);
  }

  return (
    <div className={`grid grid-cols-2 gap-4 ${heightClass}`}>
      <div
        className="relative h-full min-h-0 overflow-hidden rounded-md border border-slate-200 bg-white"
        onPasteCapture={handlePaste}
        onDropCapture={handleDrop}
        onDragOver={(event) => {
          if (uploadFilePath) event.preventDefault();
        }}
      >
        <CodeMirror
          value={value}
          height="100%"
          className="h-full"
          extensions={[markdown()]}
          onChange={(nextValue) => onChange(nextValue)}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
        />
        {uploading && (
          <div className="absolute bottom-2 right-2 z-10 rounded bg-slate-800/80 px-2 py-1 text-xs text-white">
            图片上传中...
          </div>
        )}
        {!uploading && uploadError && (
          <div className="absolute bottom-2 right-2 z-10 rounded bg-red-600/90 px-2 py-1 text-xs text-white">
            {uploadError}
          </div>
        )}
      </div>
      <div
        ref={previewRef}
        className="preview-prose h-full min-h-0 overflow-y-auto rounded-md border border-slate-200 bg-white p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
