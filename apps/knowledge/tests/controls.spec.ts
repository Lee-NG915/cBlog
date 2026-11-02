import { test, expect } from "@playwright/test";
for (const mobile of [false, true])
  test(`calendar apply, cancel, validation and keyboard (${mobile ? "mobile" : "desktop"})`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "进入本地工作台" }).click();
    await page.getByRole("button", { name: "新建笔记", exact: true }).click();
    await page
      .getByRole("textbox", { name: "笔记标题" })
      .fill(`控件验收-${Date.now()}`);
    await page.locator(".cm-content").fill("仅供本机隔离测试");
    await page.getByRole("button", { name: "文章设置", exact: true }).click();
    const field = page.getByLabel("发布展示时间", { exact: true });
    await field.fill("2024-02-29 10:24");
    await field.press("Enter");
    await expect(page.locator(".save-label")).toHaveText("草稿已保存");
    await field.fill("2026-02-29 10:24");
    await field.press("Enter");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("alert")).toContainText("有效的日期");
    await page.getByRole("button", { name: "打开日期选择器" }).click();
    await page.getByRole("textbox", { name: "选择年份" }).fill("2025");
    await page.getByRole("combobox", { name: "选择月份" }).click();
    await page.getByRole("option", { name: "12 月", exact: true }).click();
    await page
      .getByRole("button", { name: "2025年12月18日", exact: true })
      .click();
    await page
      .getByRole("button", { name: "2025年12月18日", exact: true })
      .press("ArrowRight");
    await expect(
      page.getByRole("button", { name: "2025年12月19日", exact: true }),
    ).toBeFocused();
    await page.getByRole("textbox", { name: "时间（24小时制）" }).fill("21:35");
    expect(
      await page.getByRole("grid").locator('button[tabindex="0"]').count(),
    ).toBe(1);
    await page.screenshot({
      path: `test-results/calendar-${mobile ? "mobile" : "desktop"}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.getByRole("button", { name: "应用时间", exact: true }).click();
    await expect(field).toHaveValue("2025-12-19 21:35");
    await expect(
      page.getByRole("button", { name: "打开日期选择器" }),
    ).toBeFocused();
    await page.getByRole("button", { name: "打开日期选择器" }).click();
    await page.getByRole("button", { name: "昨天", exact: true }).click();
    await page.getByRole("button", { name: "取消", exact: true }).click();
    await expect(field).toHaveValue("2025-12-19 21:35");
    await page.getByRole("button", { name: "打开日期选择器" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(field).toHaveValue("2025-12-19 21:35");
  });
test("deleted remote note with local edits stays out of inbox and can be restored", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "进入本地工作台" }).click();
  const title = `回收站缓存验收-${Date.now()}`;
  const note = await page.evaluate(async (title) => {
    const {
      data: { csrf },
    } = await (await fetch("/api/v1/session")).json();
    return (
      await (
        await fetch("/api/v1/notes/" + crypto.randomUUID(), {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
          body: JSON.stringify({
            title,
            body: "服务器正文",
            topic_id: null,
            state: "draft",
            visibility: "owner",
            tags: [],
            expectedVersion: 0,
            clientMutationId: crypto.randomUUID(),
          }),
        })
      ).json()
    ).data;
  }, title);
  await page.evaluate(async (note) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("color-notes-drafts", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("drafts");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      tx.objectStore("drafts").put(
        {
          note: { ...note, body: "未同步的本机正文" },
          baseVersion: note.version,
          updatedAt: Date.now(),
        },
        note.id,
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, note);
  await page.goto("/#view=inbox");
  await page.reload();
  await page.locator(".note-row").filter({ hasText: title }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "移入回收站", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "已移入回收站" }),
  ).toBeVisible();
  await expect(
    page.locator(".note-row").filter({ hasText: title }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.locator(".note-row").filter({ hasText: title }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "回收站", exact: true }).click();
  const row = page.locator(".trash-row").filter({ hasText: title });
  await expect(row).toContainText("本机仍有未同步修改");
  await row.getByRole("button", { name: "恢复为草稿", exact: true }).click();
  await expect(row).toHaveCount(0);
  await page.getByRole("button", { name: /^收件箱/ }).click();
  await page.locator(".note-row").filter({ hasText: title }).click();
  await expect(page.locator(".prose")).toContainText("服务器正文");
});
