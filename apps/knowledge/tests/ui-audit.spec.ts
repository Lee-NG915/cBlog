import { test, expect, type Page } from "@playwright/test";
async function fixture(page: Page) {
  const notes = Array.from({ length: 65 }, (_, i) => ({
    id: `audit-${i}`,
    slug: `audit-${i}`,
    title: `审计笔记 ${i}`,
    body: "## 共同关键词\n\n测试正文与查找。",
    topic_id: "topic",
    state: i === 64 ? "archived" : "draft",
    visibility: "owner",
    tags: "[]",
    version: 1,
    updated_at: "2026-11-01",
    deleted_at: null,
  }));
  const groups = [
    { id: "domain", kind: "domain", name: "审计领域", version: 1 },
    {
      id: "topic",
      parent_id: "domain",
      kind: "topic",
      name: "审计主题",
      version: 1,
    },
    { id: "path", kind: "path", name: "审计路径", version: 1 },
  ];
  await page.route("**/api/v1/**", async (route) => {
    const p = new URL(route.request().url()).pathname.replace("/api/v1", "");
    if (route.request().method() !== "GET")
      return route.fulfill({
        status: 409,
        json: { error: { message: "目录已更新，请重新加载后再试。" } },
      });
    const responses: any = {
      "/session": { data: { csrf: "fixture" } },
      "/corpus": { data: notes, revision: 1, nextCursor: null },
      "/groups": {
        data: groups,
        memberships: [
          { group_id: "path", note_id: "audit-64", position: 0 },
          { group_id: "path", note_id: "audit-0", position: 1 },
        ],
      },
      "/publishing": {
        enabled: true,
        siteUrl: "https://blog.example",
        repository: "fixture/blog",
        live: [],
        history: [],
      },
      "/trash": { data: [] },
    };
    return p in responses
      ? route.fulfill({ json: responses[p] })
      : route.abort();
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "我的知识库" })).toBeVisible();
}
test("search exposes all results and deliberately includes archived notes", async ({
  page,
}) => {
  await fixture(page);
  await page.getByRole("button", { name: "搜索所有笔记 ⌘ K" }).click();
  await page.getByRole("textbox", { name: "搜索问题" }).fill("共同关键词");
  await expect(
    page.getByRole("heading", { name: "找到 64 篇相关笔记" }),
  ).toBeVisible();
  await expect(page.locator(".search-result")).toHaveCount(30);
  await page.getByRole("button", { name: "继续查看 · 还有 34 篇" }).click();
  await expect(page.locator(".search-result")).toHaveCount(60);
  await page.getByRole("checkbox", { name: "包含已归档笔记" }).check();
  await expect(
    page.getByRole("heading", { name: "找到 65 篇相关笔记" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "搜索问题" }).fill("审计笔记 64");
  await expect(page.locator(".search-result").first()).toContainText("已归档");
});
test("archive counts, paths, hash reload/back and modal error recovery agree", async ({
  page,
}) => {
  await fixture(page);
  await expect(
    page.getByRole("button", { name: "审计主题 64", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "学习路径", exact: true }).click();
  await page.locator(".collection-card").click();
  await expect(page.locator(".note-row")).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "审计路径", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "重命名", exact: true }).click();
  await page.getByRole("textbox", { name: "目录名称" }).fill("新目录名称");
  await page.getByRole("button", { name: "保存名称" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "目录已更新",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "博客发布", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "博客发布", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "审计路径", exact: true }),
  ).toBeVisible();
});
for (const width of [1440, 390, 320])
  test(`admin complete surface audit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await fixture(page);
    for (const view of [
      "library",
      "paths",
      "projects",
      "inbox",
      "publish",
      "archive",
      "trash",
      "search",
      "brand",
    ]) {
      await page.goto("/#view=" + view);
      await expect(page.locator("main h1")).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        view,
      ).toBe(true);
    }
    if (width < 768)
      await page.getByRole("button", { name: "打开知识目录" }).click();
    await page.getByRole("button", { name: "博客发布", exact: true }).click();
    await page.getByRole("button", { name: "新建笔记" }).click();
    await page.getByRole("textbox", { name: "笔记标题" }).fill("审计编辑器");
    await page.getByRole("button", { name: "文章设置", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: "分类", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "阅读预览", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "阅读预览", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.locator(".editor-foot").scrollIntoViewIfNeeded();
    const rects = await page.evaluate(() => ({
      top: document.querySelector(".editor-bar")!.getBoundingClientRect().top,
      bottom: document.querySelector(".topbar")!.getBoundingClientRect().bottom,
    }));
    expect(rects.top).toBeGreaterThanOrEqual(rects.bottom - 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: `test-results/audit-admin-${width}.png` });
  });

test("browser back asks before leaving unsynced editing", async ({ page }) => {
  await fixture(page);
  await page.getByRole("button", { name: "博客发布", exact: true }).click();
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page.getByRole("textbox", { name: "笔记标题" }).fill("保留当前编辑");
  const dialog = page.waitForEvent("dialog");
  await page.evaluate(() => history.back());
  await (await dialog).dismiss();
  await expect(page.getByRole("textbox", { name: "笔记标题" })).toHaveValue(
    "保留当前编辑",
  );
  await expect(page).toHaveURL(/view=publish/);
});
