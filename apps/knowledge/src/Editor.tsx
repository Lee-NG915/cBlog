import { useRef, useState, lazy, Suspense } from "react";
import { markdown } from "@codemirror/lang-markdown";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  ArrowLeft,
  ImagePlus,
  Download,
  Eye,
  Code2,
  Save,
  Settings2,
} from "lucide-react";
import type { Note, Group } from "./types";
import { useEditor } from "./useEditor";
import { api, download } from "./api";
import { Markdown } from "./Markdown";
const CodeMirror = lazy(() => import("@uiw/react-codemirror"));
export function Editor({
  initial,
  groups,
  onBack,
  onSaved,
  onPublish,
}: {
  initial: Note;
  groups: Group[];
  onBack: () => void;
  onSaved: (n: Note) => void;
  onPublish: () => void;
}) {
  const e = useEditor(initial, onSaved),
    [preparing, setPreparing] = useState(false),
    [publishError, setPublishError] = useState(""),
    [preview, setPreview] = useState(false),
    [properties, setProperties] = useState(false),
    [uploading, setUploading] = useState(false),
    [imageError, setImageError] = useState(""),
    [server, setServer] = useState<Note | null>(null),
    [merged, setMerged] = useState("");
  const input = useRef<HTMLInputElement>(null),
    editorRef = useRef<ReactCodeMirrorRef>(null);
  const [history, setHistory] = useState<
    { version: number; created_at: string; snapshot: string }[]
  >([]);
  const [tagText, setTagText] = useState<string>(
    JSON.parse(initial.tags).join(", "),
  );
  function insert(before: string, after = "") {
    const view = editorRef.current?.view;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to) || "文字";
    view.dispatch({
      changes: { from, to, insert: before + selected + after },
      selection: {
        anchor: from + before.length,
        head: from + before.length + selected.length,
      },
    });
    view.focus();
  }
  async function upload(file: File) {
    setUploading(true);
    setImageError("");
    try {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("请选择 PNG、JPEG 或 WebP");
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("图片处理失败"))),
          "image/webp",
          0.86,
        ),
      );
      if (blob.size > 1024 * 1024)
        throw new Error("压缩后仍超过 1 MiB，请裁剪图片后重试");
      const r = await api<{ data: { id: string } }>("/assets", {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      e.change({
        body:
          e.note.body +
          `\n\n![${file.name.replace(/[\[\]]/g, "")}](/api/v1/assets/${r.data.id})\n`,
      });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }
  function leave() {
    if (
      e.isDirty() &&
      !confirm("还有本机草稿未同步，离开后会保留在此设备。确定返回吗？")
    )
      return;
    onBack();
  }
  return (
    <section className="editor-page">
      <div className="editor-bar">
        <button
          className="icon-button"
          onClick={leave}
          aria-label="返回笔记列表"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="save-label" role="status">
          {e.status}
        </div>
        <button onClick={() => void e.save()} className="quiet">
          <Save size={17} />
          <span>保存</span>
        </button>
        <button
          className="quiet"
          disabled={preparing || uploading || !e.ready}
          onClick={() => {
            setPreparing(true);
            setPublishError("");
            void e
              .flush()
              .then(onPublish)
              .catch((err) => setPublishError(err.message))
              .finally(() => setPreparing(false));
          }}
        >
          {preparing ? "确认保存中…" : "保存并前往发布"}
        </button>
        <button
          className="icon-button"
          onClick={() => setProperties(!properties)}
          aria-label="笔记属性"
        >
          <Settings2 size={20} />
        </button>
      </div>
      {publishError && (
        <p role="alert" className="error">
          {publishError}
        </p>
      )}
      {e.conflict && (
        <div className="warning">
          <strong>检测到版本冲突，本机内容未被覆盖。</strong>
          <button
            onClick={() =>
              void e.merge().then((n) => {
                setServer(n);
                setMerged(e.note.body);
              })
            }
          >
            查看差异并合并
          </button>
          <button onClick={() => download(e.note.title + ".md", e.note.body)}>
            导出本机稿
          </button>
        </div>
      )}
      {server && (
        <div className="merge-panel">
          <h2>人工合并</h2>
          <p>
            服务器版本 {server.version}。对照右侧内容，编辑下方合并稿后提交。
          </p>
          <details>
            <summary>查看服务器正文</summary>
            <pre>{server.body}</pre>
          </details>
          <textarea
            value={merged}
            onChange={(v) => setMerged(v.target.value)}
            aria-label="合并后的正文"
          />
          <button
            className="primary"
            onClick={() => {
              e.acceptMerge(server.version, merged);
              setServer(null);
            }}
          >
            以合并稿继续保存
          </button>
          <button onClick={() => setServer(null)}>取消</button>
        </div>
      )}
      <div className={"editor-grid " + (properties ? "with-properties" : "")}>
        <div className="writing">
          <input
            className="title-input"
            aria-label="笔记标题"
            placeholder="给这篇笔记一个名字"
            value={e.note.title}
            onChange={(v) => e.change({ title: v.target.value })}
          />
          <div className="editor-tools">
            <div className="segmented">
              <button
                className={!preview ? "selected" : ""}
                onClick={() => setPreview(false)}
              >
                <Code2 size={16} /> Markdown
              </button>
              <button
                className={preview ? "selected" : ""}
                onClick={() => setPreview(true)}
              >
                <Eye size={16} /> 阅读预览
              </button>
            </div>
            <div className="toolbar-right">
              <input
                ref={input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(v) => {
                  const f = v.target.files?.[0];
                  if (f) void upload(f);
                }}
              />
              <button
                aria-label="上传图片"
                disabled={uploading}
                onClick={() => input.current?.click()}
              >
                <ImagePlus size={18} />
                <span>{uploading ? "上传中" : "插入图片"}</span>
              </button>
              <button
                aria-label="导出 Markdown"
                onClick={() => download(e.note.title + ".md", e.note.body)}
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          {imageError && (
            <p className="error" role="alert">
              {imageError}
            </p>
          )}
          {!preview && (
            <div className="format-toolbar" aria-label="Markdown 格式工具">
              <button onClick={() => insert("## ")} title="二级标题">
                标题
              </button>
              <button onClick={() => insert("**", "**")} title="加粗">
                <strong>B</strong>
              </button>
              <button onClick={() => insert("*", "*")} title="斜体">
                <em>I</em>
              </button>
              <button onClick={() => insert("- ")}>列表</button>
              <button onClick={() => insert("> ")}>引用</button>
              <button onClick={() => insert("[", "](https://)")}>链接</button>
              <button onClick={() => insert("`", "`")}>代码</button>
              <button
                onClick={() =>
                  insert("\n| 列一 | 列二 |\n| --- | --- |\n| ", " | 内容 |\n")
                }
              >
                表格
              </button>
            </div>
          )}
          {!e.ready ? (
            <p>正在恢复本机草稿…</p>
          ) : preview ? (
            <Markdown body={e.note.body} />
          ) : (
            <Suspense fallback={<p>正在加载编辑器…</p>}>
              <CodeMirror
                ref={editorRef}
                value={e.note.body}
                extensions={[markdown()]}
                onChange={(body) => e.change({ body })}
                minHeight="60vh"
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                  highlightActiveLine: false,
                }}
                aria-label="Markdown 正文"
              />
            </Suspense>
          )}
          <div className="editor-foot">
            <span>{e.note.body.length.toLocaleString()} 字符</span>
            <span>本机草稿 · 自动同步 · Markdown 可导出</span>
          </div>
        </div>
        {properties && (
          <aside className="properties">
            <h2>笔记属性</h2>
            <button
              className="quiet"
              disabled={e.note.version === 0}
              onClick={() =>
                void api<{ data: typeof history }>(
                  "/notes/" + e.note.id + "/revisions",
                )
                  .then((r) => setHistory(r.data))
                  .catch((err) => setImageError(err.message))
              }
            >
              查看最近版本
            </button>
            {history.length > 0 && (
              <details open>
                <summary>最近 {history.length} 个版本</summary>
                {history.map((r) => (
                  <div className="revision-row" key={r.version}>
                    <span>v{r.version}</span>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "将此版本正文恢复为当前草稿？当前云端版本仍保留在历史中。",
                          )
                        ) {
                          e.change({ body: JSON.parse(r.snapshot).body });
                          setHistory([]);
                        }
                      }}
                    >
                      恢复正文
                    </button>
                  </div>
                ))}
              </details>
            )}
            <label>
              归属主题
              <select
                value={e.note.topic_id || ""}
                onChange={(v) => e.change({ topic_id: v.target.value || null })}
              >
                <option value="">收件箱 · 待整理</option>
                {groups
                  .filter((g) => g.kind === "topic")
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {groups.find((p) => p.id === g.parent_id)?.name} /{" "}
                      {g.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              文稿状态
              <select
                value={e.note.state}
                onChange={(v) =>
                  e.change({ state: v.target.value as Note["state"] })
                }
              >
                <option value="draft">草稿</option>
                <option value="ready">可发布</option>
                <option value="archived">归档</option>
              </select>
            </label>
            <label>
              可见性
              <select
                value={e.note.visibility}
                onChange={(v) =>
                  e.change({ visibility: v.target.value as Note["visibility"] })
                }
              >
                <option value="owner">仅自己</option>
                <option value="public">允许公开发布</option>
              </select>
            </label>
            <p className="muted">
              允许公开不等于已上线。只有生成发布快照并完成部署后，访客才能看到。
            </p>
            <label>
              标签（用逗号分隔）
              <input
                value={tagText}
                onChange={(v) => setTagText(v.target.value)}
                onBlur={() =>
                  e.change({
                    tags: JSON.stringify(
                      tagText
                        .split(/[,，]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    ),
                  })
                }
              />
            </label>
            <button className="quiet" onClick={() => setProperties(false)}>
              收起属性
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}
