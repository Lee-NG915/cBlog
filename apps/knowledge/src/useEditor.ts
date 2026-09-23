import { useEffect, useRef, useState } from "react";
import type { Note } from "./types";
import { api, ApiError } from "./api";
import { draftStore } from "./drafts";
export function useEditor(initial: Note, onSaved: (n: Note) => void) {
  const [note, setNote] = useState(initial),
    [status, setStatus] = useState("已同步"),
    [conflict, setConflict] = useState(false),
    [ready, setReady] = useState(false);
  const current = useRef(initial),
    version = useRef(initial.version),
    generation = useRef(0),
    acked = useRef(0),
    busy = useRef(false),
    blocked = useRef(false),
    mounted = useRef(true),
    timer = useRef<ReturnType<typeof setTimeout>>(),
    pending = useRef<{ generation: number; body: string } | null>(null),
    saveCallback = useRef(onSaved);
  saveCallback.current = onSaved;
  async function persist(n: Note) {
    try {
      await draftStore("put", n.id, {
        note: n,
        baseVersion: version.current,
        updatedAt: Date.now(),
      });
      return true;
    } catch {
      setStatus("仅当前页面 · 本机存储失败，请导出");
      return false;
    }
  }
  async function save() {
    if (busy.current || blocked.current || generation.current === acked.current)
      return;
    if (!navigator.onLine) {
      setStatus("已保存到本机 · 离线");
      return;
    }
    const snapshot = current.current;
    if (!snapshot.title.trim()) {
      setStatus("已保存到本机 · 请填写标题");
      return;
    }
    busy.current = true;
    setStatus("同步中…");
    if (!pending.current)
      pending.current = {
        generation: generation.current,
        body: JSON.stringify({
          title: snapshot.title,
          body: snapshot.body,
          topic_id: snapshot.topic_id,
          state: snapshot.state,
          visibility: snapshot.visibility,
          tags: JSON.parse(snapshot.tags),
          expectedVersion: version.current,
          clientMutationId: crypto.randomUUID(),
        }),
      };
    const mutation = pending.current;
    try {
      const r = await api<{ data: { version: number } }>(
        "/notes/" + snapshot.id,
        {
          method: version.current === 0 ? "POST" : "PATCH",
          body: mutation.body,
        },
      );
      version.current = r.data.version;
      acked.current = mutation.generation;
      pending.current = null;
      const next = { ...current.current, version: version.current };
      current.current = next;
      if (mounted.current) {
        setNote(next);
        saveCallback.current({
          ...snapshot,
          ...JSON.parse(mutation.body),
          tags: JSON.stringify(JSON.parse(mutation.body).tags),
          version: version.current,
        });
        if (generation.current === acked.current) {
          await draftStore("delete", next.id);
          if (generation.current === acked.current) setStatus("已同步");
          else {
            await persist(current.current);
            setStatus("已保存到本机");
          }
        } else {
          await persist(next);
          setStatus("已保存到本机");
        }
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        blocked.current = true;
        setConflict(true);
      }
      setStatus(e instanceof Error ? e.message : "同步失败，内容保留在本机");
    } finally {
      busy.current = false;
      if (
        mounted.current &&
        !blocked.current &&
        pending.current === null &&
        generation.current !== acked.current
      )
        timer.current = setTimeout(() => void save(), 500);
    }
  }
  function change(patch: Partial<Note>) {
    const next = { ...current.current, ...patch };
    current.current = next;
    generation.current++;
    setNote(next);
    setStatus("保存到本机…");
    void persist(next).then((ok) => {
      if (ok && !busy.current) setStatus("已保存到本机");
    });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), 1500);
  }
  useEffect(() => {
    mounted.current = true;
    void draftStore("get", initial.id)
      .then((draft) => {
        if (!mounted.current) return;
        if (draft) {
          current.current = { ...draft.note, version: initial.version };
          setNote(current.current);
          generation.current = 1;
          version.current = draft.baseVersion;
          if (draft.baseVersion !== initial.version) {
            blocked.current = true;
            setConflict(true);
            setStatus("发现本机草稿与服务器版本不同，请比较后合并");
          } else {
            setStatus("已恢复本机草稿");
            timer.current = setTimeout(() => void save(), 1500);
          }
        }
        setReady(true);
      })
      .catch(() => {
        setReady(true);
        setStatus("本机存储不可用，请及时导出");
      });
    const online = () => void save();
    const before = (e: BeforeUnloadEvent) => {
      if (generation.current !== acked.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("online", online);
    window.addEventListener("beforeunload", before);
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
      window.removeEventListener("online", online);
      window.removeEventListener("beforeunload", before);
    };
  }, []);
  async function flush() {
    if (!ready || blocked.current || !navigator.onLine)
      throw new Error("请先联网并解决保存冲突");
    const deadline = Date.now() + 20000;
    while (busy.current || generation.current !== acked.current) {
      if (Date.now() > deadline) throw new Error("保存尚未完成，请稍后重试");
      if (busy.current) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      const previous = acked.current;
      await save();
      if (blocked.current || acked.current === previous)
        throw new Error("保存失败，未进入发布流程");
    }
    // Do not leave until the local draft deletion transaction has completed.
    const confirmed = acked.current;
    await draftStore("delete", current.current.id);
    if (generation.current !== confirmed) {
      await persist(current.current);
      throw new Error("保存确认期间又有编辑，请再次保存后发布");
    }
  }
  async function merge() {
    const response = await api<{ data: Note }>("/notes/" + initial.id);
    return response.data;
  }
  function acceptMerge(serverVersion: number, body: string) {
    version.current = serverVersion;
    blocked.current = false;
    pending.current = null;
    setConflict(false);
    change({ body });
  }
  return {
    note,
    status,
    ready,
    conflict,
    change,
    save,
    merge,
    acceptMerge,
    flush,
    isDirty: () => generation.current !== acked.current,
  };
}
