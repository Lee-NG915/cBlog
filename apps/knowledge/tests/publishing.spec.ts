import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "进入本地工作台" }).click();
  await expect(
    page.getByRole("heading", { name: "我的知识库", exact: true }),
  ).toBeVisible();
});
test("save barrier waits for last edit then opens publication review", async ({
  page,
}) => {
  const title = "发布屏障验收-" + Date.now();
  let savedId = "";
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page.getByRole("textbox", { name: "笔记标题" }).fill(title);
  await page.locator(".cm-content").fill("确认保存的最后版本");
  await page.route("**/api/v1/notes/*", async (route) => {
    if (["POST", "PATCH"].includes(route.request().method())) {
      savedId = route.request().url().split("/").pop()!;
      await new Promise((r) => setTimeout(r, 700));
    }
    await route.continue();
  });
  await page
    .getByRole("button", { name: "保存并前往发布", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "发布记录", exact: true }),
  ).toBeVisible();
  const data = await page.evaluate(
    async (id) => (await (await fetch("/api/v1/notes/" + id)).json()).data,
    savedId,
  );
  expect(data.body).toBe("确认保存的最后版本");
  await page.unroute("**/api/v1/notes/*");
  await page.evaluate(
    async ({ id, version }) => {
      const s = await (await fetch("/api/v1/session")).json();
      await fetch("/api/v1/notes/" + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": s.data.csrf,
        },
        body: JSON.stringify({ expectedVersion: version }),
      });
    },
    { id: savedId, version: data.version },
  );
});
test("failed save cannot enter publication flow", async ({ page }) => {
  await page.getByRole("button", { name: "新建笔记", exact: true }).click();
  await page
    .getByRole("textbox", { name: "笔记标题" })
    .fill("失败保存不得发布");
  await page.locator(".cm-content").fill("尚未同步");
  await page.route("**/api/v1/notes/*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "模拟保存失败" } }),
    }),
  );
  await page
    .getByRole("button", { name: "保存并前往发布", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("保存失败");
  await expect(page.locator(".cm-content")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "发布记录", exact: true }),
  ).toHaveCount(0);
});
