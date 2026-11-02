import type { Note } from "./types";
export type PublishAction = "publish" | "unpublish";
export type PublishJob = {
  id: string;
  publication_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  detail: string;
  run_id: string | null;
  intent: {
    action: PublishAction | "dates";
    noteId: string;
    title: string;
    version: number;
    route: string;
  } | null;
};
export type PublishingState = {
  enabled: boolean;
  siteUrl: string;
  repository: string;
  live: {
    id: string;
    route: string;
    version: number | null;
    contentHash?: string | null;
    publishedAt?: string | null;
    displayPublishedAt?: string | null;
    editedAt?: string | null;
  }[];
  history: PublishJob[];
};
export const isActive = (j: PublishJob) =>
  ["dispatching", "queued", "building", "deploying"].includes(j.status);
export function articleStatus(note: Note, state: PublishingState | null) {
  const live = state?.live.find((n) => n.id === note.id),
    job = state?.history.find((j) => j.intent?.noteId === note.id);
  const active = !!job && isActive(job),
    failed = job?.status === "failed" && !job.detail.startsWith("已取消");
  const changed =
    !!live && ((live.version !== null && live.version !== note.version) ||
      (live.displayPublishedAt ?? null) !== (note.display_published_at ?? null) ||
      (live.version === null && !!note.content_updated_at && note.content_updated_at !== live.editedAt));
  let label = !state
    ? "正在核对"
    : live
      ? changed
        ? "有未发布修改"
        : "已上线"
      : note.state === "archived"
        ? "已归档"
        : job?.intent?.action === "unpublish" && job.status === "succeeded"
          ? "已下线"
          : "草稿";
  if (active) label = job.intent?.action === "unpublish" ? "下线中" : "发布中";
  else if (failed)
    label = job.intent?.action === "unpublish" ? "下线失败" : "发布失败";
  return {
    live,
    job,
    active,
    failed,
    changed,
    label,
    tone: failed ? "error" : active ? "progress" : live ? "live" : "draft",
    description: !state
      ? "正在核对访客实际看到的版本。"
      : active
        ? job.intent?.action === "unpublish"
          ? "正在撤下博客页面；完成前旧版本仍可能访问。"
          : live
            ? "正在更新博客；访客暂时看到原版本。"
            : "正在发布；确认上线后才会公开可见。"
        : failed
          ? live
            ? "本次操作未完成，原页面仍在博客公开。"
            : "本次发布未完成，草稿仍保存在后台。"
          : live
            ? changed
              ? "修改已留在草稿，点击“更新博客”后才会对外生效。"
              : live.version === null
                ? "这是已在博客公开的历史文章。保存草稿不会更改线上版本。"
                : "访客可以在博客阅读这篇文章。"
            : "仅保存在后台，访客无法从博客访问。",
  };
}
export function articleUrl(
  state: PublishingState,
  n: NonNullable<ReturnType<typeof articleStatus>["live"]>,
) {
  return (
    state.siteUrl.replace(/\/$/, "") +
    "/" +
    n.route.split("/").map(encodeURIComponent).join("/") +
    "/"
  );
}
export function jobLabel(job: PublishJob) {
  const withdraw = job.intent?.action === "unpublish";
  if (job.status === "succeeded") return withdraw ? "已下线" : "已上线";
  if (job.status === "failed" && job.detail.startsWith("已取消"))
    return "已取消";
  if (job.status === "failed") return withdraw ? "下线失败" : "发布失败";
  return (
    (
      {
        dispatching: "正在提交",
        queued: "正在排队",
        building: "正在准备页面",
        deploying: "正在核验博客",
      } as Record<string, string>
    )[job.status] || "正在处理"
  );
}
