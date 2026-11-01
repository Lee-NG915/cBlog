import { useEffect, useMemo, useState, useRef, lazy, Suspense } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  Archive,
  EyeOff,
  Undo2,
  BookOpen,
  Search,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  Menu,
  X,
  ChevronRight,
  Folder,
  Route,
  FileText,
  Inbox,
  Settings,
  UploadCloud,
  Sun,
  Moon,
  PenLine,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  LogOut,
  Library,
  Leaf,
  List,
} from "lucide-react";
import type { Note, Group, Membership } from "./types";
import { ApiError, api, download, loadCorpus, setCSRF } from "./api";
import { draftStore, listDrafts, pendingDraftIds } from "./drafts";
import { BlogPanel, BlogStatus } from "./BlogPanel";
import {
  articleStatus,
  isActive,
  type PublishingState,
  type PublishAction,
  type PublishJob,
} from "./publishing";
import { searchNotes } from "./search";
import { Markdown, headings, readingBody, jumpToHeading } from "./Markdown";
const Editor = lazy(() =>
  import("./Editor").then((m) => ({ default: m.Editor })),
);
type View =
  | "library"
  | "paths"
  | "projects"
  | "inbox"
  | "publish"
  | "search"
  | "brand"
  | "archive"
  | "trash";
const nav = [
  ["library", "知识库", Library],
  ["paths", "学习路径", Route],
  ["projects", "项目", Folder],
  ["inbox", "收件箱", Inbox],
  ["publish", "博客发布", UploadCloud],
] as const;
export default function App() {
  const [authenticated, setAuthenticated] = useState(false),
    [checking, setChecking] = useState(true),
    [notes, setNotes] = useState<Note[]>([]),
    [groups, setGroups] = useState<Group[]>([]),
    [memberships, setMemberships] = useState<Membership[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("library"),
    [group, setGroup] = useState(""),
    [reading, setReading] = useState(""),
    [editing, setEditing] = useState<Note | null>(null),
    [query, setQuery] = useState(""),
    [searchScope, setSearchScope] = useState(""),
    [includeArchived, setIncludeArchived] = useState(false),
    [searchCount, setSearchCount] = useState(30),
    [collapsed, setCollapsed] = useState<Set<string>>(new Set()),
    [drawer, setDrawer] = useState(false),
    [tocOpen, setTocOpen] = useState(false),
    [large, setLarge] = useState(false),
    [dark, setDark] = useState(
      () => localStorage.getItem("color-theme") === "dark",
    ),
    [publishingState, setPublishingState] = useState<PublishingState | null>(
      null,
    ),
    [publishError, setPublishError] = useState(""),
    [intent, setIntent] = useState<{
      note: Note;
      action: PublishAction;
      requestId: string;
    } | null>(null),
    [submitting, setSubmitting] = useState(false),
    [operationError, setOperationError] = useState(""),
    [trash, setTrash] = useState<
      Pick<Note, "id" | "title" | "version" | "deleted_at">[]
    >([]);
  const editorDirty = useRef<(() => boolean) | null>(null);
  const buildBusy = submitting || !!publishingState?.history.some(isActive);
  const [createOpen, setCreateOpen] = useState(false),
    [newKind, setNewKind] = useState<Group["kind"]>("domain"),
    [newName, setNewName] = useState(""),
    [newParent, setNewParent] = useState(""),
    [creating, setCreating] = useState(false),
    [visibleCount, setVisibleCount] = useState(20);
  const [dialogError, setDialogError] = useState(""),
    [savingOrder, setSavingOrder] = useState(false),
    [renameTarget, setRenameTarget] = useState<Group | null>(null),
    [renameValue, setRenameValue] = useState("");
  const [organize, setOrganize] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
  async function refresh() {
    setLoading(true);
    try {
      const [corpus, g] = await Promise.all([
        loadCorpus(),
        api<{ data: Group[]; memberships: Membership[] }>("/groups"),
      ]);
      const drafts = await listDrafts().catch(() => []);
      const unsynced = drafts
        .filter((d) => !corpus.notes.some((n) => n.id === d.note.id))
        .map((d) => d.note);
      setNotes([...unsynced, ...corpus.notes]);
      setGroups(g.data);
      setMemberships(g.memberships);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void api<{ data: { csrf: string } }>("/session")
      .then((r) => {
        setCSRF(r.data.csrf);
        setAuthenticated(true);
        return refresh();
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401))
          setError("暂时无法连接后台，请检查网络后重试。");
      })
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    const expire = () => {
      setAuthenticated(false);
      setNotes([]);
      setGroups([]);
      setEditing(null);
      setCSRF("");
    };
    window.addEventListener("cblog:session-expired", expire);
    return () => window.removeEventListener("cblog:session-expired", expire);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("color-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const update = (event?: HashChangeEvent) => {
      if (
        event &&
        editorDirty.current?.() &&
        !confirm("离开写作工作台？未同步内容会保留在本机。")
      ) {
        history.replaceState(null, "", event.oldURL);
        return;
      }
      const p = new URLSearchParams(location.hash.slice(1));
      if (location.hash === "#main") return;
      const next = p.get("view") || "library";
      if (
        [
          "library",
          "paths",
          "projects",
          "inbox",
          "publish",
          "search",
          "brand",
          "archive",
          "trash",
        ].includes(next)
      )
        setView(next as View);
      setReading(p.get("note") || "");
      setGroup(p.get("group") || "");
      setEditing(null);
      setDrawer(false);
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  async function refreshPublishing() {
    try {
      const next = await api<PublishingState>("/publishing");
      setPublishingState(next);
      setPublishError("");
    } catch (e) {
      setPublishError("暂时无法核对博客状态。请重新连接后再操作。");
      throw e;
    }
  }
  useEffect(() => {
    if (!authenticated) {
      setPublishingState(null);
      return;
    }
    const update = () => void refreshPublishing().catch(() => {});
    update();
    const timer = setInterval(
      update,
      publishingState?.history.some(isActive) ? 3000 : 30000,
    );
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [authenticated, !!publishingState?.history.some(isActive)]);
  useEffect(() => {
    if (authenticated && view === "trash") void loadTrash();
  }, [authenticated, view]);
  async function loadTrash() {
    try {
      setTrash((await api<{ data: typeof trash }>("/trash")).data);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function prepareAction(note: Note, action: PublishAction) {
    setOperationError("");
    setIntent({ note, action, requestId: crypto.randomUUID() });
  }
  async function confirmAction() {
    if (!intent || submitting) return;
    setSubmitting(true);
    setOperationError("");
    try {
      if ((await pendingDraftIds()).includes(intent.note.id))
        throw new Error(
          "这篇文章还有未保存的本机修改，请回到编辑器保存后再操作。",
        );
      await api("/publishing", {
        method: "POST",
        body: JSON.stringify({
          noteId: intent.note.id,
          action: intent.action,
          expectedVersion: intent.note.version,
          requestId: intent.requestId,
        }),
      });
      await refreshPublishing();
      setIntent(null);
    } catch (e) {
      setOperationError((e as Error).message);
      await refreshPublishing().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }
  async function recover(job: PublishJob) {
    if (
      !job.run_id &&
      !confirm("取消这次尚未开始的操作？文章和当前博客保持不变。")
    )
      return;
    setSubmitting(true);
    try {
      await api(`/builds/${job.id}/reconcile`, { method: "POST" });
      await refreshPublishing();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }
  async function archive(note: Note) {
    try {
      if ((await pendingDraftIds()).includes(note.id))
        throw new Error("请先保存这篇文章的本机修改。");
      await api(`/notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: note.title,
          body: note.body,
          topic_id: note.topic_id,
          visibility: note.visibility,
          tags: JSON.parse(note.tags),
          expectedVersion: note.version,
          clientMutationId: crypto.randomUUID(),
          state: note.state === "archived" ? "draft" : "archived",
        }),
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function restore(note: (typeof trash)[number]) {
    try {
      await api(`/notes/${note.id}/restore`, {
        method: "POST",
        body: JSON.stringify({ expectedVersion: note.version }),
      });
      await Promise.all([refresh(), loadTrash()]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const current = notes.find((n) => n.id === reading),
    activeGroup = groups.find((g) => g.id === group),
    domains = groups.filter((g) => g.kind === "domain");
  function descendants(id: string): Set<string> {
    const out = new Set([id]);
    for (const g of groups.filter((g) => g.parent_id === id))
      for (const nested of descendants(g.id)) out.add(nested);
    return out;
  }
  function renderTopics(parent: string, depth = 1): React.ReactNode {
    return groups
      .filter((g) => g.parent_id === parent)
      .map((t) => (
        <div key={t.id}>
          <button
            style={{
              marginLeft: 14 + depth * 10,
              width: `calc(100% - ${14 + depth * 10}px)`,
            }}
            className={"topic-item " + (group === t.id ? "active" : "")}
            aria-current={group === t.id ? "page" : undefined}
            onClick={() => navigate("library", t.id)}
          >
            {t.name}
            <span>
              {
                notes.filter(
                  (n) =>
                    n.state !== "archived" &&
                    descendants(t.id).has(n.topic_id || ""),
                ).length
              }
            </span>
          </button>
          {renderTopics(t.id, depth + 1)}
        </div>
      ));
  }
  const displayed = useMemo(() => {
    let filtered = notes.filter((n) =>
      view === "archive" ? n.state === "archived" : n.state !== "archived",
    );
    if (view === "inbox") filtered = filtered.filter((n) => !n.topic_id);
    if (group) {
      const g = groups.find((x) => x.id === group);
      if (g?.kind === "domain" || g?.kind === "topic")
        filtered = filtered.filter((n) =>
          descendants(group).has(n.topic_id || ""),
        );
      else {
        const items = memberships.filter((m) => m.group_id === group);
        filtered = items
          .map((m) => notes.find((n) => n.id === m.note_id))
          .filter((n): n is Note => !!n && n.state !== "archived");
      }
    }
    return activeGroup?.kind === "path" || activeGroup?.kind === "project"
      ? filtered
      : filtered.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [notes, view, group, groups, memberships]);
  const results = useMemo(
    () =>
      searchNotes(
        notes.filter(
          (n) =>
            (includeArchived || n.state !== "archived") &&
            (!searchScope || descendants(searchScope).has(n.topic_id || "")),
        ),
        query,
      ),
    [notes, query, searchScope, includeArchived, groups],
  );
  useEffect(() => {
    const section = new URLSearchParams(location.hash.slice(1)).get("section");
    if (current && section)
      requestAnimationFrame(() =>
        document.getElementById(section)?.scrollIntoView(),
      );
  }, [current?.id, current?.body]);
  useEffect(() => {
    setSearchCount(30);
  }, [query, searchScope, includeArchived]);
  const toc = useMemo(
    () => headings(current ? readingBody(current.body, current.title) : ""),
    [current?.body, current?.title],
  );
  function navigate(v: View, g = "") {
    if (
      editing &&
      editorDirty.current?.() &&
      !confirm("离开写作工作台？未同步内容会保留在本机。")
    )
      return;
    setView(v);
    setVisibleCount(20);
    setGroup(g);
    setReading("");
    setEditing(null);
    setDrawer(false);
    history.pushState(
      null,
      "",
      "#" +
        new URLSearchParams({ view: v, ...(g ? { group: g } : {}) }).toString(),
    );
    setError("");
    window.scrollTo(0, 0);
  }
  function read(n: Note) {
    setEditing(null);
    setReading(n.id);
    location.hash = new URLSearchParams({
      view,
      note: n.id,
      ...(group ? { group } : {}),
    }).toString();
    window.scrollTo(0, 0);
  }
  function newNote() {
    if (
      editing &&
      editorDirty.current?.() &&
      !confirm("开始另一篇笔记？当前未同步内容会保留在本机。")
    )
      return;
    setEditing({
      id: crypto.randomUUID(),
      slug: "",
      title: "",
      body: "",
      topic_id: activeGroup?.kind === "topic" ? group : null,
      state: "draft",
      visibility: "owner",
      tags: "[]",
      version: 0,
      updated_at: new Date().toISOString(),
      deleted_at: null,
    });
    setDrawer(false);
  }
  function saved(note: Note) {
    setNotes((old) => [note, ...old.filter((n) => n.id !== note.id)]);
  }
  async function login() {
    setError("");
    try {
      const r = await fetch("/auth/local", { method: "POST" });
      if (!r.ok) throw new Error("本机登录仅在本地验收服务可用");
      const s = await api<{ data: { csrf: string } }>("/session");
      setCSRF(s.data.csrf);
      setAuthenticated(true);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    }
  }
  async function logout() {
    if (!confirm("退出会清除本机草稿，请先导出未同步内容。确定退出吗？"))
      return;
    try {
      await api("/session", { method: "DELETE" });
      await draftStore("clear");
      setNotes([]);
      setGroups([]);
      setEditing(null);
      setAuthenticated(false);
      setCSRF("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "退出失败，请重试。");
    }
  }
  async function createGroup() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    setDialogError("");
    try {
      await api("/groups", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          kind: newKind,
          parent_id: newKind === "topic" ? newParent : null,
        }),
      });
      await refresh();
      setCreateOpen(false);
      setNewName("");
    } catch (e) {
      setDialogError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }
  async function saveOrder(ids: string[]) {
    setSavingOrder(true);
    setDialogError("");
    try {
      await api("/groups/" + group + "/items", {
        method: "PUT",
        body: JSON.stringify({ ids, expectedVersion: activeGroup!.version }),
      });
      await refresh();
      setOrganize(false);
    } catch (e) {
      setDialogError((e as Error).message);
    } finally {
      setSavingOrder(false);
    }
  }
  async function remove(n: Note) {
    if (!confirm(`将「${n.title}」移入回收站？之后可以在回收站恢复。`)) return;
    try {
      if ((await pendingDraftIds()).includes(n.id))
        throw new Error("请先保存这篇文章的本机修改。");
      await api("/notes/" + n.id, {
        method: "DELETE",
        body: JSON.stringify({ expectedVersion: n.version }),
      });
      navigate("library");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const side = (
    <>
      <button className="brand" onClick={() => navigate("library")}>
        <span className="brand-mark">
          <Leaf size={22} />
        </span>
        <span>
          Color 手记<small>给自己留的一间小书房</small>
        </span>
      </button>
      <button className="search-trigger" onClick={() => navigate("search")}>
        <Search size={17} />
        <span>搜索所有笔记</span>
        <kbd>⌘ K</kbd>
      </button>
      <div className="nav-caption">我的知识空间</div>
      <nav aria-label="主导航">
        {nav.map(([id, label, Icon]) => (
          <button
            key={id}
            className={"nav-item " + (view === id && !group ? "active" : "")}
            aria-current={view === id && !group ? "page" : undefined}
            onClick={() => navigate(id)}
          >
            <Icon size={18} />
            {label}
            {id === "inbox" && (
              <span className="count">
                {
                  notes.filter((n) => !n.topic_id && n.state !== "archived")
                    .length
                }
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="nav-caption row">
        知识领域
        <button
          className="icon-button small"
          aria-label="新增领域或主题"
          onClick={() => {
            setNewKind("domain");
            setDialogError("");
            setCreateOpen(true);
          }}
        >
          <Plus size={16} />
        </button>
      </div>
      <nav aria-label="知识目录">
        {domains.map((d, i) => (
          <div key={d.id}>
            <div className="domain-nav-heading">
              <button
                className={"nav-item " + (group === d.id ? "active" : "")}
                aria-current={group === d.id ? "page" : undefined}
                onClick={() => navigate("library", d.id)}
              >
                <span className={"domain-dot dot-" + (i % 4)} />
                {d.name}
              </button>
              <button
                className="icon-button small"
                aria-label={`${collapsed.has(d.id) ? "展开" : "收起"}${d.name}`}
                aria-expanded={!collapsed.has(d.id)}
                onClick={() =>
                  setCollapsed((old) => {
                    const next = new Set(old);
                    next.has(d.id) ? next.delete(d.id) : next.add(d.id);
                    return next;
                  })
                }
              >
                <ChevronRight
                  size={16}
                  style={{
                    transform: collapsed.has(d.id)
                      ? undefined
                      : "rotate(90deg)",
                  }}
                />
              </button>
            </div>
            {!collapsed.has(d.id) && renderTopics(d.id)}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button
          className={"nav-item " + (view === "archive" ? "active" : "")}
          aria-current={view === "archive" ? "page" : undefined}
          onClick={() => navigate("archive")}
        >
          <Archive size={18} />
          已归档
        </button>
        <button
          className={"nav-item " + (view === "trash" ? "active" : "")}
          aria-current={view === "trash" ? "page" : undefined}
          onClick={() => navigate("trash")}
        >
          <Trash2 size={18} />
          回收站
        </button>
        <button
          className={"nav-item " + (view === "brand" ? "active" : "")}
          aria-current={view === "brand" ? "page" : undefined}
          onClick={() => navigate("brand")}
        >
          <BookOpen size={18} />
          关于这间小书房
        </button>
        <div className="profile">
          <span className="avatar">C</span>
          <div>
            Color<small>个人知识库</small>
          </div>
          <button
            className="icon-button"
            aria-label="退出登录"
            onClick={() => void logout()}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </>
  );
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!editing) navigate("search");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [editing]);
  if (checking)
    return (
      <div className="login">
        <Leaf size={36} />
        <p>正在打开小书房…</p>
      </div>
    );
  if (!authenticated)
    return (
      <main className="login">
        <span className="brand-mark large">
          <Leaf size={34} />
        </span>
        <p className="eyebrow">Color 手记</p>
        <h1>
          把零散的记录，
          <br />
          慢慢连成自己的知识。
        </h1>
        <p>
          按主题归档，沿路径学习。
          <br />
          给思考留一些空间，给未来的自己留一份笔记。
        </p>
        {error && (
          <div className="error" role="alert">
            <p>{error}</p>
            <button onClick={() => location.reload()}>重新连接</button>
          </div>
        )}
        {["127.0.0.1", "localhost", "[::1]"].includes(location.hostname) ? (
          <>
            <button className="primary" onClick={() => void login()}>
              进入本地工作台 <ArrowRight size={18} />
            </button>
            <small>仅监听本机地址 · 笔记默认私有 · 原始数据保持不变</small>
          </>
        ) : (
          <small>私人知识工作台 · 仅限所有者登录</small>
        )}
        <a href="/auth/github">使用 GitHub 登录线上后台</a>
      </main>
    );
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        跳至正文
      </a>
      <aside className="sidebar">{side}</aside>
      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="drawer">
            <Dialog.Title className="sr-only">知识目录</Dialog.Title>
            <Dialog.Close
              className="drawer-close icon-button"
              aria-label="关闭知识目录"
            >
              <X />
            </Dialog.Close>
            {side}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <main id="main" tabIndex={-1} className="main">
        <header className="topbar">
          <button
            className="mobile-only icon-button"
            aria-label="打开知识目录"
            onClick={() => setDrawer(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>我的空间</span>
            <ChevronRight size={14} />
            <span>
              {editing
                ? "写作工作台"
                : current
                  ? "笔记"
                  : activeGroup?.name ||
                    {
                      library: "知识库",
                      paths: "学习路径",
                      projects: "项目",
                      inbox: "收件箱",
                      publish: "博客发布",
                      archive: "已归档",
                      trash: "回收站",
                      search: "知识库查询",
                      brand: "关于",
                    }[view]}
            </span>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="切换明暗主题"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="primary compact" onClick={newNote}>
              <Plus size={17} />
              <span>新建笔记</span>
            </button>
          </div>
        </header>
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => void refresh()}>重新加载</button>
          </div>
        )}
        {publishError && (
          <div className="error-banner" role="alert">
            {publishError}
            <button onClick={() => void refreshPublishing().catch(() => {})}>
              重新核对
            </button>
          </div>
        )}
        {editing ? (
          <Suspense fallback={<p>正在加载写作工作台…</p>}>
            <Editor
              key={editing.id}
              initial={editing}
              groups={groups}
              onBack={() => {
                setEditing(null);
                void refresh();
              }}
              onSaved={saved}
              publishingState={publishingState}
              publishingBusy={buildBusy || !!publishError}
              onDirtyCheck={(check) => {
                editorDirty.current = check;
              }}
              onPublish={(note) => prepareAction(note, "publish")}
              onUnpublish={(note) => prepareAction(note, "unpublish")}
            />
          </Suspense>
        ) : current ? (
          <div className="reader-layout">
            <article className={"reader " + (large ? "large-text" : "")}>
              <div className="reader-actions">
                <button className="quiet" onClick={() => navigate(view, group)}>
                  <ArrowLeft size={16} />
                  返回列表
                </button>
                <div>
                  <button
                    className="quiet"
                    onClick={() => setLarge(!large)}
                    aria-label="调整正文字号"
                  >
                    字号 {large ? "大" : "标准"}
                  </button>
                  <button className="quiet" onClick={() => setEditing(current)}>
                    <PenLine size={16} />
                    编辑
                  </button>
                  <button
                    className="quiet"
                    disabled={
                      !publishingState ||
                      !!articleStatus(current, publishingState).live ||
                      articleStatus(current, publishingState).active
                    }
                    title={
                      articleStatus(current, publishingState).live
                        ? "请先从博客下线，再归档"
                        : "归档后可随时恢复"
                    }
                    onClick={() => void archive(current)}
                  >
                    <Archive size={16} />
                    {current.state === "archived" ? "恢复为草稿" : "归档"}
                  </button>
                  <button
                    className="icon-button"
                    aria-label="移入回收站"
                    disabled={
                      !publishingState ||
                      !!articleStatus(current, publishingState).live ||
                      articleStatus(current, publishingState).active
                    }
                    title={
                      articleStatus(current, publishingState).live
                        ? "请先从博客下线，再移入回收站"
                        : "可在回收站恢复"
                    }
                    onClick={() => void remove(current)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className="eyebrow">
                {groups.find((g) => g.id === current.topic_id)?.name ||
                  "收件箱"}
              </p>
              <h1>{current.title}</h1>
              <div className="reader-publishing">
                <BlogStatus note={current} state={publishingState} />
                <div className="article-actions">
                  {current.state !== "archived" && (
                    <button
                      className="primary"
                      disabled={
                        buildBusy ||
                        !!publishError ||
                        !publishingState?.enabled ||
                        current.version === 0
                      }
                      onClick={() => prepareAction(current, "publish")}
                    >
                      <UploadCloud size={16} />
                      {articleStatus(current, publishingState).live
                        ? "更新博客"
                        : "发布文章"}
                    </button>
                  )}
                  {articleStatus(current, publishingState).live && (
                    <button
                      className="quiet"
                      disabled={buildBusy || !!publishError}
                      onClick={() => prepareAction(current, "unpublish")}
                    >
                      <EyeOff size={16} />
                      从博客下线
                    </button>
                  )}
                </div>
                {articleStatus(current, publishingState).failed && (
                  <p className="error" role="status">
                    {articleStatus(current, publishingState).job?.detail}
                  </p>
                )}
              </div>
              <div className="note-meta">
                <span>
                  {Math.max(1, Math.ceil(current.body.length / 450))} 分钟阅读
                </span>
                <span>
                  更新于{" "}
                  {new Date(current.updated_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <nav aria-label="笔记所属项目与学习路径">
                {groups
                  .filter(
                    (g) =>
                      (g.kind === "project" || g.kind === "path") &&
                      memberships.some(
                        (m) => m.group_id === g.id && m.note_id === current.id,
                      ),
                  )
                  .map((g) => (
                    <button
                      key={g.id}
                      className="quiet"
                      onClick={() =>
                        navigate(
                          g.kind === "project" ? "projects" : "paths",
                          g.id,
                        )
                      }
                    >
                      {g.kind === "project" ? "项目" : "学习路径"} · {g.name}
                    </button>
                  ))}
              </nav>
              <button
                className="mobile-toc quiet"
                onClick={() => setTocOpen(true)}
              >
                <List size={17} />
                本篇目录 · {toc.length} 节
              </button>
              <Markdown body={readingBody(current.body, current.title)} />
              <div className="reading-end">
                <Leaf size={20} />
                <p>读到这里，留一点时间想一想。</p>
              </div>
              <div className="next-notes">
                {[-1, 1].map((offset) => {
                  const index = displayed.findIndex((n) => n.id === current.id),
                    n = displayed[index + offset];
                  return n ? (
                    <button key={offset} onClick={() => read(n)}>
                      <small>
                        {offset < 0 ? "上一篇" : "下一篇"} ·{" "}
                        {activeGroup?.name || "当前列表"}
                      </small>
                      <span>{n.title}</span>
                      {offset > 0 && <ArrowRight size={17} />}
                    </button>
                  ) : (
                    <span key={offset} />
                  );
                })}
              </div>
            </article>
            <aside className="toc">
              <p>本篇目录</p>
              {toc.map((h) => (
                <a
                  key={h.id}
                  style={{ paddingLeft: h.level === 3 ? 20 : 0 }}
                  href={"#" + h.id}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpToHeading(h.id);
                  }}
                >
                  {h.title}
                </a>
              ))}
            </aside>
            <Dialog.Root open={tocOpen} onOpenChange={setTocOpen}>
              <Dialog.Portal>
                <Dialog.Backdrop className="backdrop" />
                <Dialog.Popup className="dialog">
                  <Dialog.Title>本篇目录</Dialog.Title>
                  <Dialog.Close
                    className="dialog-x icon-button"
                    aria-label="关闭本篇目录"
                  >
                    <X />
                  </Dialog.Close>
                  <div className="toc-list">
                    {toc.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          setTocOpen(false);
                          setTimeout(() => jumpToHeading(h.id), 50);
                        }}
                      >
                        {h.title}
                      </button>
                    ))}
                  </div>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        ) : reading && !loading ? (
          <section className="page empty">
            <h1>这篇笔记暂时无法打开</h1>
            <p>它可能已移入回收站，或链接已失效。</p>
            <button onClick={() => navigate("trash")}>查看回收站</button>
            <button onClick={() => navigate("library")}>返回知识库</button>
          </section>
        ) : view === "search" ? (
          <section className="page search-page">
            <p className="eyebrow">把问题带进来</p>
            <h1>找到你记过的答案</h1>
            <p className="lead">
              按关键词、标题或正文查找，支持中文、英文与常用同义表达。
            </p>
            <div className="search-box">
              <Search />
              <input
                autoFocus
                aria-label="搜索问题"
                placeholder="例如：广告有人点，却没有人下单，该排查什么？"
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 200))}
              />
            </div>
            <div className="search-options">
              <select
                aria-label="搜索主题范围"
                value={searchScope}
                onChange={(e) => setSearchScope(e.target.value)}
              >
                <option value="">全部主题</option>
                {groups
                  .filter((g) => g.kind === "topic")
                  .map((g) => (
                    <option value={g.id} key={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
              />
              包含已归档笔记
            </label>
            <div className="section-heading">
              <h2>
                {query ? `找到 ${results.length} 篇相关笔记` : "最近的笔记"}
              </h2>
              <span className="muted">
                全文检索 · 已展示 {Math.min(searchCount, results.length)} /{" "}
                {results.length} 篇
              </span>
            </div>
            {results.slice(0, searchCount).map(({ note, snippet }) => (
              <button
                className="search-result"
                key={note.id}
                onClick={() => read(note)}
              >
                <small>
                  {groups.find((g) => g.id === note.topic_id)?.name || "收件箱"}{" "}
                  · {articleStatus(note, publishingState).label}
                </small>
                <h3>
                  {note.title}
                  <ArrowUpRight size={18} />
                </h3>
                <p>{snippet}</p>
              </button>
            ))}
            {searchCount < results.length && (
              <button
                className="load-more"
                onClick={() => setSearchCount((n) => n + 30)}
              >
                继续查看 · 还有 {results.length - searchCount} 篇
              </button>
            )}
            {results.length === 0 && (
              <div className="empty">
                <Search />
                <h2>还没有找到匹配的笔记</h2>
                <p>试试更短的关键词，或切换到全部主题。</p>
              </div>
            )}
          </section>
        ) : view === "publish" ? (
          <BlogPanel
            notes={notes}
            groups={groups}
            state={publishingState}
            busy={buildBusy || !!publishError}
            onRead={read}
            onAction={prepareAction}
            onRecover={(job) => void recover(job)}
          />
        ) : view === "trash" ? (
          <section className="page">
            <p className="eyebrow">为误操作留一条退路</p>
            <h1>回收站</h1>
            <p className="lead">这里的文章已移出知识库，可随时恢复为草稿。</p>
            {!trash.length && (
              <div className="empty">
                <h2>回收站是空的</h2>
                <p>移入回收站的文章会出现在这里。</p>
              </div>
            )}
            {trash.map((n) => (
              <div className="trash-row" key={n.id}>
                <div>
                  <h3>{n.title}</h3>
                  <p className="muted">
                    {new Date(n.deleted_at!).toLocaleString("zh-CN")}
                  </p>
                </div>
                <button onClick={() => void restore(n)}>
                  <Undo2 size={16} />
                  恢复为草稿
                </button>
              </div>
            ))}
          </section>
        ) : view === "brand" ? (
          <section className="page brand-page">
            <p className="eyebrow">柔和 · 舒缓 · 学习 · 个人记录</p>
            <h1>给自己留的一间小书房</h1>
            <p className="lead">
              学习可以没写完。工程文记语境，生活碎片也算数。
            </p>
            <div className="brand-examples">
              <h2>一次读一件事</h2>
              <p>
                暖一点的底色，宽一些的行距。正文用清楚的中文字体，代码保留等宽；标题、目录和留白，帮你找到自己的位置。
              </p>
              <blockquote>记下此刻的理解，留给未来的自己。</blockquote>
              <h2>知识不必只有一种顺序</h2>
              <p>
                按主题慢慢翻，也能沿着一个目标往前读。技术、商业、营销与生活，都可以有自己的位置。
              </p>
            </div>
            <button
              onClick={() =>
                void api("/export").then((r) =>
                  download(
                    "color-notes-export.json",
                    JSON.stringify(r, null, 2),
                    "application/json",
                  ),
                )
              }
            >
              <Download size={18} />
              导出所有笔记与组织关系
            </button>
            <p className="muted">
              完整图片备份请运行 pnpm knowledge:export:local。
            </p>
          </section>
        ) : (
          <section className="page">
            <div className="page-heading">
              <div>
                <p className="eyebrow">
                  {view === "paths"
                    ? "有方向地，慢慢往前"
                    : view === "projects"
                      ? "把知识带到实践里"
                      : view === "inbox"
                        ? "先记下来，再慢慢整理"
                        : "记录，是理解的开始"}
                </p>
                <h1>
                  {activeGroup?.name ||
                    {
                      archive: "已归档",
                      library: "我的知识库",
                      paths: "学习路径",
                      projects: "项目",
                      inbox: "收件箱",
                    }[view as "library"]}
                </h1>
                <p className="lead">
                  {activeGroup
                    ? "在这里整理思考，连接相关的知识。"
                    : view === "archive"
                      ? "暂时收起的文章都在这里。打开文章后可以恢复为草稿。"
                      : view === "library"
                        ? "把散落的经验归好类，让每一次学习都有迹可循。"
                        : view === "paths"
                          ? "围绕一个目标，按顺序理解一组知识。"
                          : view === "projects"
                            ? "将不同领域的笔记，组织成一次实践。"
                            : "不急着找到归属，先留住此刻的想法。"}
                </p>
              </div>
              <div className="heading-actions">
                {activeGroup && (
                  <>
                    <button
                      className="quiet"
                      onClick={() => {
                        setRenameTarget(activeGroup);
                        setRenameValue(activeGroup.name);
                        setDialogError("");
                      }}
                    >
                      重命名
                    </button>
                    <button
                      className="icon-button"
                      aria-label="删除当前目录"
                      onClick={() => {
                        if (
                          confirm(
                            "删除这个目录或集合？笔记正文不会被删除；非空主题需要先移动笔记。",
                          )
                        )
                          void api("/groups/" + group, {
                            method: "DELETE",
                            body: JSON.stringify({
                              expectedVersion: activeGroup.version,
                            }),
                          })
                            .then(() => {
                              navigate(view);
                              return refresh();
                            })
                            .catch((e) => setError(e.message));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button
                  className="quiet"
                  onClick={() => {
                    setNewKind(
                      view === "paths"
                        ? "path"
                        : view === "projects"
                          ? "project"
                          : "topic",
                    );
                    setNewParent(domains[0]?.id || "");
                    setDialogError("");
                    setCreateOpen(true);
                  }}
                >
                  <Plus size={17} />
                  {view === "paths"
                    ? "新建路径"
                    : view === "projects"
                      ? "新建项目"
                      : "新建主题"}
                </button>
              </div>
            </div>
            {view === "library" && !group && (
              <>
                <div className="domain-grid">
                  {domains.map((d, i) => {
                    const count = notes.filter(
                      (n) =>
                        n.state !== "archived" &&
                        descendants(d.id).has(n.topic_id || ""),
                    ).length;
                    return (
                      <button
                        className={"domain-card tone-" + (i % 4)}
                        onClick={() => navigate("library", d.id)}
                        key={d.id}
                      >
                        <div className="row">
                          <span className="domain-icon">
                            {i === 0 ? (
                              <CodeIcon />
                            ) : i === 1 ? (
                              <Route size={22} />
                            ) : i === 2 ? (
                              <BookOpen size={22} />
                            ) : (
                              <Leaf size={22} />
                            )}
                          </span>
                          <ArrowUpRight size={18} />
                        </div>
                        <h2>{d.name}</h2>
                        <p>
                          {groups
                            .filter((t) => t.parent_id === d.id)
                            .map((t) => t.name)
                            .join(" · ") || "从第一篇记录开始"}
                        </p>
                        <small>{count} 篇笔记</small>
                      </button>
                    );
                  })}
                </div>
                <div className="path-feature">
                  <div>
                    <p className="eyebrow">不只归档，也有顺序</p>
                    <h2>沿着学习路径，一步一步理解</h2>
                    <p>从知识全景到具体实践，让笔记之间有清楚的先后关系。</p>
                    <button className="quiet" onClick={() => navigate("paths")}>
                      查看学习路径 <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="path-illustration" aria-hidden="true">
                    <span>01</span>
                    <i />
                    <span>02</span>
                    <i />
                    <span>03</span>
                  </div>
                </div>
              </>
            )}
            {(view === "paths" || view === "projects") && !group ? (
              <div className="collection-grid">
                {groups
                  .filter(
                    (g) => g.kind === (view === "paths" ? "path" : "project"),
                  )
                  .map((g) => (
                    <button
                      key={g.id}
                      className="collection-card"
                      onClick={() => navigate(view, g.id)}
                    >
                      <Route size={25} />
                      <h2>{g.name}</h2>
                      <p>
                        {
                          memberships.filter(
                            (m) =>
                              m.group_id === g.id &&
                              notes.some(
                                (n) =>
                                  n.id === m.note_id && n.state !== "archived",
                              ),
                          ).length
                        }{" "}
                        篇笔记 · {view === "paths" ? "按顺序学习" : "实践资料"}
                      </p>
                      <span>
                        开始阅读 <ArrowRight size={17} />
                      </span>
                    </button>
                  ))}
              </div>
            ) : (
              <>
                <div className="section-heading">
                  <h2>
                    {group || view === "inbox" ? "笔记" : "最近记录"}{" "}
                    <span className="muted">{displayed.length}</span>
                  </h2>
                  {activeGroup &&
                  ["path", "project"].includes(activeGroup.kind) ? (
                    <button
                      className="quiet"
                      onClick={() => {
                        setSelected(
                          memberships
                            .filter((m) => m.group_id === group)
                            .map((m) => m.note_id),
                        );
                        setDialogError("");
                        setOrganize(true);
                      }}
                    >
                      编排笔记
                    </button>
                  ) : (
                    <button
                      className="quiet"
                      onClick={() => navigate("search")}
                    >
                      搜索笔记 <Search size={15} />
                    </button>
                  )}
                </div>
                {loading ? (
                  <p>正在加载笔记…</p>
                ) : displayed.length === 0 ? (
                  <div className="empty">
                    <FileText />
                    <h2>
                      {view === "archive"
                        ? "没有已归档的笔记"
                        : view === "inbox"
                          ? "收件箱已整理好"
                          : "这里还没有笔记"}
                    </h2>
                    <p>
                      {view === "archive"
                        ? "归档用于收起暂时不用的文章，随时可以恢复。"
                        : view === "inbox"
                          ? "未选择分类的新笔记会出现在这里。"
                          : "先写一篇，或从已有笔记中选择。"}
                    </p>
                    {view !== "archive" && (
                      <button className="primary" onClick={newNote}>
                        写一篇笔记
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="notes-list">
                    {displayed.slice(0, visibleCount).map((n, i) => (
                      <button
                        className="note-row"
                        onClick={() => read(n)}
                        key={n.id}
                      >
                        {activeGroup?.kind === "path" ? (
                          <span className="chapter">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        ) : (
                          <FileText size={21} className="note-icon" />
                        )}
                        <div className="note-info">
                          <h3>{n.title}</h3>
                          <p>
                            {n.body.replace(/[#*`>\n]/g, " ").slice(0, 100)}
                          </p>
                          <div className="note-meta">
                            <span>
                              {groups.find((g) => g.id === n.topic_id)?.name ||
                                "待整理"}
                            </span>
                            <span>
                              {articleStatus(n, publishingState).label}
                            </span>
                          </div>
                        </div>
                        <span className="note-date">
                          {new Date(n.updated_at).toLocaleDateString("zh-CN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    ))}
                    {displayed.length > visibleCount && (
                      <button
                        className="load-more"
                        onClick={() => setVisibleCount((c) => c + 20)}
                      >
                        再看 20 篇 · 共 {displayed.length} 篇
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}
        <footer className="footer">
          慢慢写，慢慢读。<span>Color 手记 · 草稿与博客分开保存</span>
        </footer>
      </main>
      <Dialog.Root
        open={!!intent}
        onOpenChange={(open) => {
          if (!open && !submitting) setIntent(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="dialog publish-dialog">
            <Dialog.Title>
              {intent?.action === "unpublish"
                ? "从博客下线这篇文章"
                : articleStatus(intent?.note || ({} as Note), publishingState)
                      .live
                  ? "更新这篇博客"
                  : "发布这篇文章"}
            </Dialog.Title>
            <Dialog.Close
              className="dialog-x icon-button"
              aria-label="关闭发布确认"
              disabled={submitting}
            >
              <X />
            </Dialog.Close>
            <h3>{intent?.note.title}</h3>
            <Dialog.Description>
              {intent?.action === "unpublish"
                ? "下线完成后，博客列表和原链接将不再提供这篇文章。后台文稿会保留，之后可以重新发布。"
                : "将这篇已保存的文稿公开到博客。其他文章保持现有的线上版本，未发布的草稿不会一同上线。"}
            </Dialog.Description>
            <p className="muted">
              {intent?.action === "unpublish"
                ? "完成前原页面仍可能访问；核验撤下后才会显示“已下线”。"
                : "发布需要一点时间。你可以继续编辑，页面会自动更新发布结果。"}
            </p>
            {operationError && (
              <p className="error" role="alert">
                {operationError}
              </p>
            )}
            <div className="dialog-actions">
              <Dialog.Close disabled={submitting}>取消</Dialog.Close>
              <button
                className={
                  intent?.action === "unpublish" ? "danger" : "primary"
                }
                disabled={submitting || buildBusy || !!publishError}
                onClick={() => void confirmAction()}
              >
                {submitting
                  ? "正在提交…"
                  : intent?.action === "unpublish"
                    ? "确认下线"
                    : "确认发布"}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="dialog">
            <Dialog.Title>添加知识结构</Dialog.Title>
            <Dialog.Close className="dialog-x icon-button" aria-label="关闭">
              <X />
            </Dialog.Close>
            <label>
              类型
              <select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as Group["kind"])}
              >
                <option value="domain">领域</option>
                <option value="topic">主题</option>
                <option value="path">学习路径</option>
                <option value="project">项目</option>
              </select>
            </label>
            <label>
              名称
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：广告投放与归因"
              />
            </label>
            {newKind === "topic" && (
              <label>
                所属领域或主题
                <select
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                >
                  <option value="">请选择</option>
                  {groups
                    .filter((g) => ["domain", "topic"].includes(g.kind))
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <button
              className="primary"
              disabled={
                !newName.trim() ||
                creating ||
                (newKind === "topic" && !newParent)
              }
              onClick={() => void createGroup()}
            >
              {creating ? "正在创建…" : "创建"}
            </button>
            {dialogError && (
              <p className="error" role="alert">
                {dialogError}
              </p>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open && !creating) setRenameTarget(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="dialog">
            <Dialog.Title>重命名目录</Dialog.Title>
            <Dialog.Close className="dialog-x icon-button" aria-label="关闭">
              <X />
            </Dialog.Close>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!renameTarget) return;
                setCreating(true);
                setDialogError("");
                void api("/groups/" + renameTarget.id, {
                  method: "PATCH",
                  body: JSON.stringify({
                    name: renameValue.trim(),
                    expectedVersion: renameTarget.version,
                  }),
                })
                  .then(async () => {
                    await refresh();
                    setRenameTarget(null);
                  })
                  .catch((e) => setDialogError(e.message))
                  .finally(() => setCreating(false));
              }}
            >
              <label>
                目录名称
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />
              </label>
              {dialogError && (
                <p className="error" role="alert">
                  {dialogError}
                </p>
              )}
              <button
                className="primary"
                disabled={creating || !renameValue.trim()}
              >
                {creating ? "正在保存…" : "保存名称"}
              </button>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={organize} onOpenChange={setOrganize}>
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="dialog wide">
            <Dialog.Title>编排「{activeGroup?.name}」</Dialog.Title>
            <Dialog.Close className="dialog-x icon-button" aria-label="关闭">
              <X />
            </Dialog.Close>
            <p className="muted">
              同一篇笔记可以出现在不同路径，无需复制正文。
            </p>
            <div className="ordered-list">
              {selected.map((id, i) => (
                <div className="row" key={id}>
                  <span>
                    {i + 1}. {notes.find((n) => n.id === id)?.title}
                  </span>
                  <div className="row">
                    <button
                      className="icon-button"
                      aria-label="上移"
                      disabled={i === 0}
                      onClick={() =>
                        setSelected((a) => {
                          const b = [...a];
                          [b[i - 1], b[i]] = [b[i], b[i - 1]];
                          return b;
                        })
                      }
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="下移"
                      disabled={i === selected.length - 1}
                      onClick={() =>
                        setSelected((a) => {
                          const b = [...a];
                          [b[i], b[i + 1]] = [b[i + 1], b[i]];
                          return b;
                        })
                      }
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="移出路径"
                      onClick={() =>
                        setSelected((a) => a.filter((x) => x !== id))
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label>
              添加已有笔记
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value)
                    setSelected((a) => [...a, e.target.value]);
                }}
              >
                <option value="">选择一篇笔记…</option>
                {notes
                  .filter(
                    (n) => n.state !== "archived" && !selected.includes(n.id),
                  )
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="primary"
              disabled={savingOrder}
              onClick={() => void saveOrder(selected)}
            >
              {savingOrder ? "正在保存…" : "保存顺序"}
            </button>
            {dialogError && (
              <p className="error" role="alert">
                {dialogError}
              </p>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
function CodeIcon() {
  return <span style={{ fontFamily: "monospace", fontSize: 22 }}>{"</>"}</span>;
}
