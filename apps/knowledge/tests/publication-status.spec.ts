import { test, expect, type Page } from "@playwright/test";
const note = {
  id: "article",
  slug: "article",
  title: "架构设计：共享工程，独立交付",
  body: "## 架构\n\n| 模块 | 职责 |\n| --- | --- |\n| 店铺 | 交付 |",
  topic_id: "topic",
  state: "draft",
  visibility: "owner",
  tags: "[]",
  version: 2,
  updated_at: "2026-11-01",
  deleted_at: null,
};
async function fixtures(page: Page) {
  const state = {
    enabled: true,
    siteUrl: "https://blog.example",
    repository: "fixture/blog",
    live: [{ id: note.id, route: "posts/article", version: 1 }],
    history: [] as any[],
  };
  const submitted: any[] = [];
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/api/v1", "");
    if (path === "/publishing" && route.request().method() === "POST") {
      const input = route.request().postDataJSON();
      submitted.push(input);
      state.history.unshift({
        id: "job-" + submitted.length,
        publication_id: submitted.length,
        status: "queued",
        run_id: "123",
        created_at: "2026-11-01",
        detail: "",
        intent: {
          action: input.action,
          noteId: note.id,
          title: note.title,
          version: note.version,
        },
      });
      return route.fulfill({ json: { data: state.history[0] }, status: 202 });
    }
    const response: Record<string, unknown> = {
      "/session": { data: { csrf: "fixture" } },
      "/corpus": { data: [note], revision: 1, nextCursor: null },
      "/groups": {
        data: [{ id: "topic", name: "架构与工程实践", kind: "topic" }],
        memberships: [],
      },
      "/publishing": state,
    };
    if (!(path in response)) return route.abort();
    await route.fulfill({ json: response[path] });
  });
  await page.goto("/");
  return { state, submitted };
}
test("saved private flag cannot hide a live page; withdrawal stays pending until verified and retains readable manuscript", async ({
  page,
}) => {
  const { state, submitted } = await fixtures(page);
  await page.getByRole("button", { name: "博客发布", exact: true }).click();
  const article = page.locator(".blog-article");
  await expect(article.locator(".status-badge")).toHaveText("有未发布修改");
  await expect(article.getByRole("link", { name: "查看博客" })).toBeVisible();
  await article
    .getByRole("button", { name: "从博客下线", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("后台文稿会保留");
  await page.getByRole("button", { name: "确认下线", exact: true }).click();
  await expect.poll(() => submitted.length).toBe(1);
  expect(submitted[0].noteId).toBe(note.id);
  expect(submitted[0].action).toBe("unpublish");
  await expect(article.locator(".status-badge")).toHaveText("下线中");
  await expect(article.getByRole("link", { name: "查看博客" })).toBeVisible();
  await expect(
    article.getByRole("button", { name: "更新博客" }),
  ).toBeDisabled();
  state.history[0].status = "deploying";
  await expect(page.locator(".operation-progress")).toContainText(
    "正在核验博客",
    { timeout: 8000 },
  );
  state.history[0].status = "succeeded";
  state.live = [];
  await expect(article.locator(".status-badge")).toHaveText("已下线", {
    timeout: 8000,
  });
  await expect(article.getByRole("link", { name: "查看博客" })).toHaveCount(0);
  await article.getByRole("button", { name: note.title }).click();
  await expect(page.locator(".prose table")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "发布文章", exact: true }),
  ).toBeEnabled();
  await page.screenshot({
    path: "test-results/verified-withdrawal.png",
    fullPage: false,
  });
});
for (const width of [1440, 390, 320])
  test(`publication controls remain readable at ${width}px and failed operations can retry`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const { state } = await fixtures(page);
    if (width < 768)
      await page.getByRole("button", { name: "打开知识目录" }).click();
    await page.getByRole("button", { name: "博客发布", exact: true }).click();
    await page
      .locator(".blog-article")
      .getByRole("button", { name: "更新博客" })
      .click();
    await page.getByRole("button", { name: "确认发布", exact: true }).click();
    await expect.poll(() => state.history.length).toBe(1);
    state.history[0].status = "failed";
    state.history[0].detail = "示例：图片尚未同步，请保存后重试。";
    await expect(page.locator(".blog-article .status-badge")).toHaveText(
      "发布失败",
      { timeout: 8000 },
    );
    await expect(page.locator(".blog-article")).toContainText(
      "原页面仍在博客公开",
    );
    await expect(
      page.locator(".blog-article").getByRole("button", { name: "重试发布" }),
    ).toBeEnabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/blog-center-${width}.png`,
      fullPage: false,
    });
  });
