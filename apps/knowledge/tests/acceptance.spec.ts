import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "进入本地工作台" }).click();
  await expect(
    page.getByRole("heading", { name: "我的知识库", exact: true }),
  ).toBeVisible();
});
test("desktop knowledge, search and long-form reader", async ({ page }) => {
  await page.screenshot({
    path: "test-results/desktop-library.png",
    fullPage: false,
  });
  await page.getByRole("button", { name: "搜索所有笔记" }).click();
  await page.getByRole("textbox", { name: "搜索问题" }).fill("广告");
  await expect(page.locator(".search-result").first()).toBeVisible();
  await page.locator(".search-result").first().click();
  await expect(page.locator(".reader h1")).toBeVisible();
  await expect(page.locator(".prose")).toBeVisible();
  await page.screenshot({
    path: "test-results/desktop-reader.png",
    fullPage: false,
  });
});
test("mobile navigation, paths and readable layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "打开知识目录" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/mobile-library.png",
    fullPage: false,
  });
  await page.getByRole("button", { name: "打开知识目录" }).click();
  await page
    .getByRole("button", { name: "学习路径", exact: true })
    .last()
    .click();
  await page.locator(".collection-card").first().click();
  await page.locator(".note-row").first().click();
  await expect(page.getByRole("button", { name: /本篇目录/ })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/mobile-reader.png",
    fullPage: false,
  });
});
test("save while typing preserves subsequent text and reload", async ({
  page,
}) => {
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  const title = "验收保存-" + Date.now();
  await page.getByRole("textbox", { name: "笔记标题" }).fill(title);
  await page.locator(".cm-content").fill("内容 A");
  await expect(page.getByRole("status")).toHaveText("已同步", {
    timeout: 10000,
  });
  let held = false;
  await page.route("**/api/v1/notes/*", async (route) => {
    if (route.request().method() === "PATCH" && !held) {
      held = true;
      const response = await route.fetch();
      await new Promise((r) => setTimeout(r, 1800));
      await route.fulfill({ response });
    } else await route.continue();
  });
  await page.locator(".cm-content").fill("内容 A 第一段");
  await page.waitForTimeout(1600);
  await page.locator(".cm-content").fill("内容 A 第一段 新输入 B");
  await expect(page.getByRole("status")).toHaveText("已同步", {
    timeout: 12000,
  });
  await expect(page.locator(".cm-content")).toContainText("新输入 B");
  await page.getByRole("button", { name: "返回笔记列表" }).click();
  await expect(
    page.locator(".note-row").filter({ hasText: title }),
  ).toBeVisible();
  await page.locator(".note-row").filter({ hasText: title }).click();
  await expect(page.locator(".prose")).toContainText("新输入 B");
});
test("create a topic without editing code", async ({ page }) => {
  await page.getByRole("button", { name: "新建主题", exact: true }).click();
  const name = "验收主题-" + Date.now();
  await page.getByRole("textbox", { name: "名称", exact: true }).fill(name);
  await page.getByRole("button", { name: "创建", exact: true }).click();
  await expect(
    page.locator(".topic-item").filter({ hasText: name }),
  ).toBeVisible();
});
test("immutable local public build excludes private notes and supports withdrawal", async ({
  page,
  browser,
}) => {
  const result = await page.evaluate(async () => {
    const session = await (await fetch("/api/v1/session")).json();
    const send = async (path: string, body: unknown, method = "POST") => {
      const r = await fetch("/api/v1" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": session.data.csrf,
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    };
    const groups = await (await fetch("/api/v1/groups")).json();
    const id = crypto.randomUUID();
    await send("/notes/" + id, {
      title: "验收公开笔记",
      body: "PUBLIC_CANARY_2026\n\n## 测试章节\n这是公开内容。",
      topic_id: groups.data.find((g: { kind: string }) => g.kind === "topic")
        .id,
      state: "ready",
      visibility: "public",
      tags: [],
      expectedVersion: 0,
      clientMutationId: crypto.randomUUID(),
    });
    const c = await (await fetch("/api/v1/corpus")).json();
    const p = await send("/publications", { expectedRevision: c.revision });
    await send("/local/publish/" + p.data.id, {});
    return { id };
  });
  const visitor = await browser.newContext();
  const reader = await visitor.newPage();
  await reader.goto("http://127.0.0.1:8787/published/");
  await reader.getByRole("link", { name: /验收公开笔记/ }).click();
  await expect(reader.locator("article")).toContainText("PUBLIC_CANARY_2026");
  await expect(reader.locator("body")).not.toContainText("复习索引");
  expect(
    (await reader.request.get("http://127.0.0.1:8787/api/v1/corpus")).status(),
  ).toBe(401);
  await page.evaluate(async (id) => {
    const session = await (await fetch("/api/v1/session")).json();
    const headers = {
      "Content-Type": "application/json",
      "X-CSRF-Token": session.data.csrf,
    };
    await fetch("/api/v1/notes/" + id, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ expectedVersion: 1 }),
    });
    const c = await (await fetch("/api/v1/corpus")).json();
    const p = await (
      await fetch("/api/v1/publications", {
        method: "POST",
        headers,
        body: JSON.stringify({ expectedRevision: c.revision }),
      })
    ).json();
    await fetch("/api/v1/local/publish/" + p.data.id, {
      method: "POST",
      headers,
      body: "{}",
    });
  }, result.id);
  expect(
    (
      await reader.request.get(
        "http://127.0.0.1:8787/published/notes/" + result.id + ".html",
      )
    ).status(),
  ).toBe(404);
  await visitor.close();
});
test("offline draft survives reload without overriding server", async ({
  page,
  context,
}) => {
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page
    .getByRole("textbox", { name: "笔记标题" })
    .fill("验收离线-" + Date.now());
  await page.locator(".cm-content").fill("最初内容");
  await expect(page.getByRole("status")).toHaveText("已同步");
  await context.setOffline(true);
  await page.locator(".cm-content").fill("离线期间的新内容");
  await expect(page.getByRole("status")).toContainText("本机");
  await page.waitForTimeout(1700);
  await expect(page.getByRole("status")).toContainText("离线");
  await context.setOffline(false);
  await expect(page.getByRole("status")).toHaveText("已同步");
  await page.getByRole("button", { name: "返回笔记列表" }).click();
  await page
    .locator(".note-row")
    .filter({ hasText: "验收离线-" })
    .first()
    .click();
  await expect(page.locator(".prose")).toContainText("离线期间的新内容");
});
test("320px and dark theme stay within viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole("button", { name: "切换明暗主题" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/mobile-dark.png",
    fullPage: false,
  });
});
test("persisted unsynced draft restores after page is closed", async ({
  page,
  context,
}) => {
  const title = "验收恢复-" + Date.now();
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page.getByRole("textbox", { name: "笔记标题" }).fill(title);
  await page.locator(".cm-content").fill("服务器版本");
  await expect(page.getByRole("status")).toHaveText("已同步");
  await context.setOffline(true);
  await page.locator(".cm-content").fill("关闭前保存在本机的恢复内容");
  await expect(page.getByRole("status")).toContainText("本机");
  await page.close();
  await context.setOffline(false);
  const reopened = await context.newPage();
  await reopened.goto("/");
  await reopened.locator(".note-row").filter({ hasText: title }).click();
  await reopened.getByRole("button", { name: "编辑", exact: true }).click();
  await expect(reopened.locator(".cm-content")).toContainText(
    "关闭前保存在本机的恢复内容",
  );
  await expect(reopened.getByRole("status")).toHaveText("已同步");
});
test("server conflict does not overwrite local draft", async ({ page }) => {
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page
    .getByRole("textbox", { name: "笔记标题" })
    .fill("验收冲突-" + Date.now());
  await page.locator(".cm-content").fill("初始正文");
  await expect(page.getByRole("status")).toHaveText("已同步");
  await page.evaluate(async () => {
    const s = await (await fetch("/api/v1/session")).json();
    const c = await (await fetch("/api/v1/corpus")).json();
    let all = c.data,
      cursor = c.nextCursor;
    while (cursor) {
      const next = await (
        await fetch("/api/v1/corpus?cursor=" + cursor)
      ).json();
      all.push(...next.data);
      cursor = next.nextCursor;
    }
    const n = all
      .filter((n: { title: string }) => n.title.startsWith("验收冲突-"))
      .sort((a: { updated_at: string }, b: { updated_at: string }) =>
        b.updated_at.localeCompare(a.updated_at),
      )[0];
    await fetch("/api/v1/notes/" + n.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": s.data.csrf,
      },
      body: JSON.stringify({
        ...n,
        body: "另一设备的正文",
        tags: JSON.parse(n.tags),
        expectedVersion: n.version,
        clientMutationId: crypto.randomUUID(),
      }),
    });
  });
  await page.locator(".cm-content").fill("本机需要保留的正文");
  await expect(page.locator(".warning")).toContainText("版本冲突");
  await expect(page.locator(".cm-content")).toContainText("本机需要保留的正文");
});
test("Mermaid diagrams render lazily with source preserved", async ({
  page,
}) => {
  await page.getByRole("button", { name: "搜索所有笔记" }).click();
  await page
    .getByRole("textbox", { name: "搜索问题" })
    .fill("工程实践札记索引");
  await page.locator(".search-result").first().click();
  await expect(page.locator(".diagram svg").first()).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator(".diagram details").first()).toContainText(
    "flowchart",
  );
});
test("image upload inserts a readable private image and keeps writing", async ({
  page,
}) => {
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page
    .getByRole("textbox", { name: "笔记标题" })
    .fill("验收图片-" + Date.now());
  await page.locator(".cm-content").fill("图片测试");
  await expect(page.getByRole("status")).toHaveText("已同步");
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 80;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#526847";
    ctx.fillRect(0, 0, 160, 80);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    });
  await expect(page.locator(".cm-content")).toContainText("/api/v1/assets/");
  await expect(page.getByRole("status")).toHaveText("已同步");
  await page.getByRole("button", { name: "阅读预览" }).click();
  await expect(page.locator(".prose img")).toBeVisible();
  expect(
    await page
      .locator(".prose img")
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
});

test("chapter URL survives refresh without leaving the note", async ({ page }) => {
  await page.getByRole("button", { name: "搜索所有笔记" }).click();
  await page.getByRole("textbox", { name: "搜索问题" }).fill("工程实践札记索引");
  await page.locator(".search-result").first().click();
  const title = await page.locator(".reader h1").textContent();
  await page.locator(".toc a").first().click();
  await expect(page).toHaveURL(/section=/);
  await page.reload();
  await expect(page.locator(".reader h1")).toHaveText(title!);
});
