import { SelectField } from "@cblog/ui";
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { BookOpen, ExternalLink } from "lucide-react";
import { api } from "./api";
import type { Note } from "./types";
import { isActive, jobLabel, type PublishingState, type PublishJob, type BlogCollection, type CollectionVisibility } from "./publishing";
const modes: Record<CollectionVisibility, { label: string; description: string }> = {
  public: { label: "公开展示", description: "显示在主题与专栏、站内搜索中，访客可打开目录和文章。" },
  unlisted: { label: "仅链接访问", description: "从专栏列表和站内搜索隐藏，已有链接仍可访问。" },
  private: { label: "仅后台", description: "从博客撤下整个专栏及其中已上线的文章，原链接将无法访问。" },
};
export function BlogCollectionsPanel({ notes, state, busy, refresh, onRead, onRecover }: {
  notes: Note[]; state: PublishingState | null; busy: boolean;
  refresh: () => Promise<void>; onRead: (n: Note) => void; onRecover: (j: PublishJob) => void;
}) {
  const [selection, setSelection] = useState<Record<string, CollectionVisibility>>({});
  const [intent, setIntent] = useState<{collection: BlogCollection; visibility: CollectionVisibility; publicationId: number; requestId: string} | null>(null);
  const [saving, setSaving] = useState(false), [error, setError] = useState("");
  async function submit() {
    if (!intent) return;
    setSaving(true); setError("");
    try {
      await api(`/blog-collections/${encodeURIComponent(intent.collection.slug)}/visibility`, {
        method: "POST", body: JSON.stringify({visibility: intent.visibility, expectedPublicationId: intent.publicationId, requestId: intent.requestId}),
      });
      setIntent(null);
      setSelection(prev => { const next = {...prev}; delete next[intent.collection.slug]; return next; });
      await refresh();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }
  const active = state?.history.find(isActive);
  return <section className="page collection-center">
    <p className="eyebrow">把一组文章交给读者</p>
    <h1>博客专栏</h1>
    <p className="lead">管理博客上的专栏目录与访问范围。调整可见性会自动更新博客，文章正文和草稿修改会保留。</p>
    {!state ? <p role="status">正在核对线上专栏…</p> : !state.enabled && <p className="notice">发布服务尚未连接，暂时不能应用变更。</p>}
    {active && <div className="operation-progress" role="status"><div>
      <strong>{jobLabel(active)} · {active.intent?.title || "博客操作"}</strong>
      <p>完成前，访客仍看到当前线上版本。核验成功后，此处会自动更新。</p>
    </div><button onClick={() => onRecover(active)}>{active.run_id ? "核对结果" : "取消排队"}</button></div>}
    {error && !intent && <p className="operation-error" role="alert">{error}<button onClick={() => void refresh().then(()=>setError("")).catch(e=>setError(e.message))}>重新核对</button></p>}
    <div className="collection-grid">{state?.collections?.map(c => {
      const selected = selection[c.slug] || c.visibility;
      const latest = state.history.find(j => j.intent?.collectionSlug === c.slug);
      const pending = latest && isActive(latest);
      const failed = latest?.status === "failed";
      const visibleCount = state.live.filter(n=>n.route.startsWith(c.slug + "/")).length;
      const count = c.visibility === "private" ? c.retainedInventory.length : visibleCount;
      return <article className="collection-card" key={c.slug}>
        <div className="collection-card-heading"><BookOpen size={22}/><h2>{c.name}</h2></div>
        <p className="muted">{c.description.replace(/，仅通过手动输入路由访问。$/, "。")}</p>
        <div className="collection-live" aria-live="polite"><span className={"status-badge " + (c.visibility === "private" ? "draft" : "live")}>当前线上：{modes[c.visibility].label}</span><span>{count} 篇{c.visibility === "private" ? "可恢复的已发布文章" : "已上线文章"}</span></div>
        {c.visibility !== "private" && <a className="text-link" href={`${state.siteUrl.replace(/\/$/,"")}/${encodeURIComponent(c.slug)}/`} target="_blank" rel="noreferrer">查看博客专栏 <ExternalLink size={14}/></a>}
        <div className="collection-controls">
          <label htmlFor={`visibility-${c.slug}`}>专栏可见性</label>
          <SelectField id={`visibility-${c.slug}`} value={selected} disabled={busy || saving || !state.enabled} onValueChange={e=>setSelection({...selection,[c.slug]:e as CollectionVisibility})}>
            {Object.entries(modes).map(([value,m])=><option key={value} value={value}>{m.label}</option>)}
          </SelectField>
          <p className="muted">{modes[selected].description}</p>
          <button className="primary" disabled={busy || saving || !state.enabled || selected === c.visibility} onClick={()=>{setError("");setIntent({collection:c,visibility:selected,publicationId:state.publicationId!,requestId:crypto.randomUUID()});}}>应用并更新博客</button>
        </div>
        {pending && <p className="notice" role="status">正在变更为“{modes[latest.intent!.visibility!].label}”，尚未生效。</p>}
        {failed && <div className="operation-error" role="status"><p>{latest.detail.startsWith("已取消") ? "上次操作已取消" : "上次变更未完成"}，当前仍为“{modes[c.visibility].label}”。{latest.detail}</p>
          {!latest.detail.startsWith("已取消") && latest.intent?.visibility && latest.intent.visibility !== c.visibility && <button disabled={busy || saving || !state.enabled} onClick={()=>{setError("");setIntent({collection:c,visibility:latest.intent!.visibility!,publicationId:state.publicationId!,requestId:crypto.randomUUID()});}}>重试变更</button>}
        </div>}
        {latest?.run_id && <a className="muted" target="_blank" rel="noreferrer" href={`https://github.com/${state.repository}/actions/runs/${latest.run_id}`}>查看最近运行日志</a>}
        <details className="collection-members"><summary>查看所属文章 · {c.members.length} 篇</summary><ol>{c.members.map(m=>{
          const note = notes.find(n=>n.id===m.id), live = state.live.some(n=>n.id===m.id);
          return <li key={m.id}>{note ? <button className="text-link" onClick={()=>onRead(note)}>{note.title}</button> : <span>后台文章已移入回收站</span>}<small>{live ? "已上线" : "未上线"}</small></li>;
        })}</ol></details>
      </article>;
    })}</div>
    {state && !state.collections?.length && <div className="empty"><h2>还没有接入博客专栏</h2><p>专栏接入后会在这里显示，原有文章保持不变。</p></div>}
    <Dialog.Root open={!!intent} onOpenChange={open=>{if(!open && !saving)setIntent(null);}}>
      <Dialog.Portal><Dialog.Backdrop className="backdrop"/><Dialog.Popup className="dialog publish-dialog">
        <Dialog.Title>将专栏设为“{intent ? modes[intent.visibility].label : ""}”？</Dialog.Title>
        <p><strong>{intent?.collection.name}</strong></p>
        <Dialog.Description>{intent ? modes[intent.visibility].description : ""} 变更需要完成博客部署后生效。</Dialog.Description>
        {intent && <p className="notice">影响本专栏的 {intent.collection.visibility === "private" ? intent.collection.retainedInventory.length : state?.live.filter(n=>n.route.startsWith(intent.collection.slug+"/")).length} 篇已发布文章。恢复可见性时使用原已发布版本；后台的未发布修改不会随之公开。</p>}
        {error && <p className="operation-error" role="alert">{error}</p>}
        <div className="dialog-actions"><Dialog.Close disabled={saving}>暂不调整</Dialog.Close><button className="primary" disabled={saving || busy} onClick={()=>void submit()}>{saving ? "正在提交…" : "确认并更新博客"}</button></div>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>
  </section>;
}
