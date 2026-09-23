import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
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
  Sparkles,
  Library,
  Leaf,
  List,
} from "lucide-react";
import type { Note, Group, Membership } from "./types";
import { api, download, loadCorpus, setCSRF } from "./api";
import { draftStore, listDrafts } from "./drafts";
import { searchNotes } from "./search";
import { Markdown, headings, readingBody, jumpToHeading } from "./Markdown";
const Editor = lazy(() =>
  import("./Editor").then((m) => ({ default: m.Editor })),
);
type View =
  "library" | "paths" | "projects" | "inbox" | "publish" | "search" | "brand";
const nav = [
  ["library", "知识库", Library],
  ["paths", "学习路径", Route],
  ["projects", "项目", Folder],
  ["inbox", "收件箱", Inbox],
] as const;
export default function App() {
  const [authenticated, setAuthenticated] = useState(false),
    [checking, setChecking] = useState(true),
    [notes, setNotes] = useState<Note[]>([]),
    [groups, setGroups] = useState<Group[]>([]),
    [memberships, setMemberships] = useState<Membership[]>([]),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("library"),
    [group, setGroup] = useState(""),
    [reading, setReading] = useState(""),
    [editing, setEditing] = useState<Note | null>(null),
    [query, setQuery] = useState(""),
    [searchScope, setSearchScope] = useState(""),
    [ask, setAsk] = useState(false),
    [answer, setAnswer] = useState(""),
    [drawer, setDrawer] = useState(false),
    [tocOpen, setTocOpen] = useState(false),
    [large, setLarge] = useState(false),
    [dark, setDark] = useState(
      () => localStorage.getItem("color-theme") === "dark",
    ),
    [publications, setPublications] = useState<
      { id: number; created_at: string; status: string }[]
    >([]);
  const [createOpen, setCreateOpen] = useState(false),
    [newKind, setNewKind] = useState<Group["kind"]>("domain"),
    [newName, setNewName] = useState(""),
    [newParent, setNewParent] = useState(""),
    [creating, setCreating] = useState(false),
    [visibleCount, setVisibleCount] = useState(20);
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
      setRevision(corpus.revision);
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
      .catch(() => {})
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
    const update = () => {
      const p = new URLSearchParams(location.hash.slice(1));
      if (location.hash && !p.has("note")) return;
      setReading(p.get("note") || "");
      if (p.get("group")) setGroup(p.get("group")!);
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (view === "publish")
      void api<{ data: typeof publications }>("/publications")
        .then((p) => setPublications(p.data))
        .catch((e) => setError(e.message));
  }, [view]);
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
            onClick={() => navigate("library", t.id)}
          >
            {t.name}
            <span>
              {
                notes.filter((n) => descendants(t.id).has(n.topic_id || ""))
                  .length
              }
            </span>
          </button>
          {renderTopics(t.id, depth + 1)}
        </div>
      ));
  }
  const displayed = useMemo(() => {
    let filtered = notes.filter((n) => n.state !== "archived");
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
          .filter((n): n is Note => !!n);
      }
    }
    return activeGroup?.kind === "path" || activeGroup?.kind === "project"
      ? filtered
      : filtered.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [notes, view, group, groups, memberships]);
  const results = useMemo(
    () =>
      searchNotes(
        searchScope ? notes.filter((n) => n.topic_id === searchScope) : notes,
        query,
      ),
    [notes, query, searchScope],
  );
  useEffect(() => {
    const section = new URLSearchParams(location.hash.slice(1)).get("section");
    if (current && section)
      requestAnimationFrame(() =>
        document.getElementById(section)?.scrollIntoView(),
      );
  }, [current?.id, current?.body]);
  const toc = useMemo(
    () => headings(current ? readingBody(current.body, current.title) : ""),
    [current?.body],
  );
  function navigate(v: View, g = "") {
    if (editing && !confirm("离开写作工作台？未同步内容会保留在本机。")) return;
    setView(v);
    setVisibleCount(20);
    setGroup(g);
    setReading("");
    setEditing(null);
    setDrawer(false);
    location.hash = "";
    setError("");
    window.scrollTo(0, 0);
  }
  function read(n: Note) {
    setEditing(null);
    setReading(n.id);
    location.hash = new URLSearchParams({
      note: n.id,
      ...(group ? { group } : {}),
    }).toString();
    window.scrollTo(0, 0);
  }
  function newNote() {
    if (editing && !confirm("开始另一篇笔记？当前未同步内容会保留在本机。"))
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
    await api("/session", { method: "DELETE" });
    await draftStore("clear");
    setNotes([]);
    setGroups([]);
    setEditing(null);
    setAuthenticated(false);
    setCSRF("");
  }
  async function createGroup() {
    if (!newName.trim() || creating) return;
    setCreating(true);
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
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }
  async function saveOrder(ids: string[]) {
    try {
      await api("/groups/" + group + "/items", {
        method: "PUT",
        body: JSON.stringify({ ids, expectedVersion: activeGroup!.version }),
      });
      await refresh();
      setOrganize(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(n: Note) {
    if (!confirm(`将「${n.title}」移到已删除？原始迁移文件不会被修改。`))
      return;
    try {
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
            onClick={() => navigate(id)}
          >
            <Icon size={18} />
            {label}
            {id === "inbox" && (
              <span className="count">
                {notes.filter((n) => !n.topic_id).length}
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
            setCreateOpen(true);
          }}
        >
          <Plus size={16} />
        </button>
      </div>
      <nav aria-label="知识目录">
        {domains.map((d, i) => (
          <div key={d.id}>
            <button
              className={"nav-item " + (group === d.id ? "active" : "")}
              onClick={() => navigate("library", d.id)}
            >
              <span className={"domain-dot dot-" + (i % 4)} />
              {d.name}
            </button>
            {renderTopics(d.id)}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => navigate("publish")}>
          <UploadCloud size={18} />
          发布记录
        </button>
        <button className="nav-item" onClick={() => navigate("brand")}>
          <BookOpen size={18} />
          关于这间小书房
        </button>
        <div className="profile">
          <span className="avatar">C</span>
          <div>
            Color<small>个人知识库 · 本地验收</small>
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
        {error && <p className="error">{error}</p>}
        <button className="primary" onClick={() => void login()}>
          进入本地工作台 <ArrowRight size={18} />
        </button>
        <small>仅监听本机地址 · 笔记默认私有 · 原始数据保持不变</small>
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
      <main id="main" className="main">
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
                      publish: "发布记录",
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
                    className="icon-button"
                    aria-label="删除笔记"
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
              <div className="note-meta">
                <span>
                  {current.visibility === "owner" ? "仅自己" : "允许公开"}
                </span>
                <span>
                  {Math.max(1, Math.ceil(current.body.length / 450))} 分钟阅读
                </span>
                <span>
                  更新于{" "}
                  {new Date(current.updated_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
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
        ) : view === "search" ? (
          <section className="page search-page">
            <p className="eyebrow">把问题带进来</p>
            <h1>找到你记过的答案</h1>
            <p className="lead">查一个关键词，或用自己的话描述想了解的内容。</p>
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
              <div className="segmented">
                <button
                  className={!ask ? "selected" : ""}
                  onClick={() => setAsk(false)}
                >
                  <Search size={16} />
                  找笔记
                </button>
                <button
                  className={ask ? "selected" : ""}
                  onClick={() => setAsk(true)}
                >
                  <Sparkles size={16} />
                  问笔记
                </button>
              </div>
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
            {ask && (
              <div className="notice">
                <strong>引用问答尚未连接模型</strong>
                <p>
                  本地检索已支持中文、英文与常用同义表达。模型连接完成前，不生成未经验证的答案。
                </p>
                <button
                  className="quiet"
                  onClick={() =>
                    void api("/search/answer", {
                      method: "POST",
                      body: JSON.stringify({ query }),
                    }).catch((e) => setAnswer(e.message))
                  }
                >
                  检查问答状态
                </button>
                {answer && <p role="status">{answer}</p>}
              </div>
            )}
            <div className="section-heading">
              <h2>
                {query ? `找到 ${results.length} 篇相关笔记` : "最近的笔记"}
              </h2>
              <span className="muted">
                全文与同义词检索 · 当前 {notes.length} 篇
              </span>
            </div>
            {results.slice(0, 30).map(({ note, snippet }) => (
              <button
                className="search-result"
                key={note.id}
                onClick={() => read(note)}
              >
                <small>
                  {groups.find((g) => g.id === note.topic_id)?.name || "收件箱"}{" "}
                  · {note.state === "draft" ? "草稿" : "笔记"}
                </small>
                <h3>
                  {note.title}
                  <ArrowUpRight size={18} />
                </h3>
                <p>{snippet}</p>
              </button>
            ))}
            {results.length === 0 && (
              <div className="empty">
                <Search />
                <h2>还没有找到匹配的笔记</h2>
                <p>试试更短的关键词，或切换到全部主题。</p>
              </div>
            )}
          </section>
        ) : view === "publish" ? (
          <section className="page">
            <p className="eyebrow">保存与发布，各有一步</p>
            <h1>发布记录</h1>
            <p className="lead">
              先确认公开范围，再生成固定版本的快照。本地快照不会自动上线。
            </p>
            <div className="notice">
              <strong>
                当前可进入公开快照：
                {
                  notes.filter(
                    (n) =>
                      n.visibility === "public" &&
                      n.state === "ready" &&
                      n.topic_id,
                  ).length
                }{" "}
                篇
              </strong>
              <p>
                需要同时满足「可发布」「允许公开」「已选择主题」。迁移笔记默认仅自己。
              </p>
            </div>
            {notes
              .filter(
                (n) =>
                  n.visibility === "public" &&
                  n.state === "ready" &&
                  n.topic_id,
              )
              .map((n) => (
                <p key={n.id}>
                  {n.title} · v{n.version}
                </p>
              ))}
            <button
              className="primary"
              onClick={() =>
                void api("/publications", {
                  method: "POST",
                  body: JSON.stringify({ expectedRevision: revision }),
                })
                  .then(() =>
                    api<{ data: typeof publications }>("/publications"),
                  )
                  .then((r) => setPublications(r.data))
                  .catch((e) => setError(e.message))
              }
            >
              <UploadCloud size={18} />
              生成本地发布快照
            </button>
            <div className="section-heading">
              <h2>快照历史</h2>
            </div>
            {publications.length === 0 ? (
              <p className="muted">还没有发布快照。</p>
            ) : (
              publications.map((p) => (
                <div className="publication" key={p.id}>
                  <div>
                    <strong>快照 #{p.id}</strong>
                    <small>
                      {new Date(p.created_at).toLocaleString("zh-CN")}
                    </small>
                  </div>
                  <button
                    onClick={() =>
                      void api<{ data: { url: string } }>(
                        "/local/publish/" + p.id,
                        { method: "POST", body: "{}" },
                      )
                        .then((r) => {
                          window.open(r.data.url, "_blank", "noopener");
                          return api<{ data: typeof publications }>(
                            "/publications",
                          );
                        })
                        .then((r) => setPublications(r.data))
                        .catch((e) => setError(e.message))
                    }
                  >
                    构建阅读站
                  </button>
                  <span className="pill">
                    {p.status === "snapshot"
                      ? "已生成 · 未部署"
                      : p.status === "deployed"
                        ? "已构建本地阅读站"
                        : p.status}
                  </span>
                  <button
                    onClick={() =>
                      void api<{ data: { manifest: string } }>(
                        "/publications/" + p.id,
                      ).then((r) =>
                        download(
                          `publication-${p.id}.json`,
                          r.data.manifest,
                          "application/json",
                        ),
                      )
                    }
                  >
                    <Download size={17} />
                    导出
                  </button>
                </div>
              ))
            )}
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
                      library: "我的知识库",
                      paths: "学习路径",
                      projects: "项目",
                      inbox: "收件箱",
                    }[view as "library"]}
                </h1>
                <p className="lead">
                  {activeGroup
                    ? "在这里整理思考，连接相关的知识。"
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
                        const name = prompt("新的名称", activeGroup.name);
                        if (name)
                          void api("/groups/" + group, {
                            method: "PATCH",
                            body: JSON.stringify({
                              name,
                              expectedVersion: activeGroup.version,
                            }),
                          })
                            .then(refresh)
                            .catch((e) => setError(e.message));
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
                    const count = notes.filter((n) =>
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
                        {memberships.filter((m) => m.group_id === g.id).length}{" "}
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
                        setSelected(displayed.map((n) => n.id));
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
                    <h2>从一篇笔记开始</h2>
                    <p>想法还没成形也没关系，先记下来。</p>
                    <button className="primary" onClick={newNote}>
                      写第一篇笔记
                    </button>
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
                              {n.state === "draft"
                                ? "草稿"
                                : n.visibility === "owner"
                                  ? "仅自己"
                                  : "允许公开"}
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
          慢慢写，慢慢读。<span>Color 手记 · 本地验收版</span>
        </footer>
      </main>
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
              disabled={!newName.trim() || creating}
              onClick={() => void createGroup()}
            >
              创建
            </button>
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
                  .filter((n) => !selected.includes(n.id))
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="primary"
              onClick={() => void saveOrder(selected)}
            >
              保存顺序
            </button>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
function CodeIcon() {
  return <span style={{ fontFamily: "monospace", fontSize: 22 }}>{"</>"}</span>;
}
