import { test, expect, type Page } from "@playwright/test";

async function fixtures(page: Page, publications: Array<{id: number; status: string; build_status: string | null}>) {
  let writes = 0;
  await page.route("**/api/v1/**", async route => {
    if (route.request().method() !== "GET") { writes++; return route.abort(); }
    const path = new URL(route.request().url()).pathname.replace("/api/v1", "");
    const responses: Record<string, unknown> = {
      "/session": { data: { csrf: "test" } },
      "/corpus": { data: [], revision: 1, nextCursor: null },
      "/groups": { data: [], memberships: [] },
      "/publications": { data: publications.map(p => ({...p, created_at: "2026-11-01T03:00:00Z"})) },
      // The successful snapshot may be outside the recent build-job page.
      "/builds": { data: [], enabled: true, repository: "fixture/blog" },
    };
    if (!(path in responses)) return route.abort();
    await route.fulfill({ json: responses[path] });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "发布记录", exact: true }).click();
  return () => writes;
}

test("history distinguishes deployed, failed, unsubmitted and local-only snapshots", async ({page}) => {
  const writes = await fixtures(page, [
    {id: 3, status: "snapshot", build_status: "succeeded"},
    {id: 2, status: "snapshot", build_status: "failed"},
    {id: 1, status: "snapshot", build_status: null},
    {id: 4, status: "deployed", build_status: null},
  ]);
  const row = (id: number) => page.getByRole("group", {name: `快照 #${id} 历史记录`,exact:true});
  await expect(row(3).getByRole("status")).toHaveText("已上线");
  await expect(row(3).getByRole("button", {name:"已上线",exact:true})).toBeDisabled();
  await expect(row(3).getByRole("button", {name:"导出",exact:true})).toBeEnabled();
  await expect(row(2).getByRole("status")).toHaveText("失败");
  await expect(row(2).getByRole("button", {name:"重试发布",exact:true})).toBeEnabled();
  await expect(row(1).getByRole("status")).toHaveText("已生成 · 尚未发布");
  await expect(row(1).getByRole("button", {name:"构建此快照",exact:true})).toBeEnabled();
  await expect(row(4).getByRole("status")).toHaveText("已构建本地阅读站");
  expect(writes()).toBe(0);
});

test("polling updates history through publishing states and prevents competing submissions", async ({page}) => {
  const publications = [
    {id: 3, status:"snapshot", build_status:"dispatching"},
    {id: 2, status:"snapshot", build_status:"failed"},
  ];
  await fixtures(page, publications);
  const row = page.getByRole("group", {name:"快照 #3 历史记录",exact:true});
  await expect(row.getByRole("status")).toHaveText("触发中");
  for (const [state,label] of [["queued","等待构建"],["building","构建中"],["deploying","部署中"],["succeeded","已上线"]]) {
    publications[0].build_status = state;
    await expect(row.getByRole("status")).toHaveText(label, {timeout:8000});
    await expect(row.getByRole("button", {name:label,exact:true})).toBeDisabled();
    if (state !== "succeeded") {
      await expect(page.getByRole("button", {name:"发布到博客",exact:true})).toBeDisabled();
      await expect(page.getByRole("button", {name:"重试发布",exact:true})).toBeDisabled();
    }
  }
  await expect(page.getByRole("button", {name:"重试发布",exact:true})).toBeEnabled();
});
