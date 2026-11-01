import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const output = path.resolve("../web/out");
const files = fs
  .readdirSync(output, { recursive: true })
  .map(String)
  .filter(
    (f) => f.endsWith("/index.html") || f === "index.html" || f === "404.html",
  );
for (const width of [1440, 390, 320]) {
  test.describe(`${width}px public pages`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const file of files)
      test(file, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        const response = await page.goto(
          "./" + file.replace(/index.html$/, ""),
        );
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.getByRole("main")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        expect(errors).toEqual([]);
        // Every image must resolve locally, including images below the lazy-load boundary.
        const sources = await page
          .locator("img")
          .evaluateAll((images) =>
            images
              .map((i) => (i as HTMLImageElement).src)
              .filter((src) => src.startsWith(location.origin)),
          );
        for (const src of new Set(sources))
          expect((await page.request.get(src)).status(), src).toBe(200);
      });
  });
}
test("reading search, pagination, navigation, mobile TOC and modal keyboard recovery", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "再看 9 篇" }).click();
  await expect(page.getByRole("status")).toContainText("18 / 23");
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "搜索", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "搜索手记" })).toBeVisible();
  await page.getByRole("searchbox", { name: "关键词" }).fill("Monorepo");
  await expect(
    page.getByRole("main").getByRole("link", { name: /多店铺主题/ }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "关键词" })
    .fill("there-is-no-such-entry-zzzz");
  await expect(
    page.getByRole("heading", { name: "没有找到相关手记" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "清除筛选" }).click();
  await expect(page.getByRole("status")).toContainText("84");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./posts/storefront-monorepo-architecture/");
  await page.locator(".mobile-toc > summary").click();
  await page
    .locator(".mobile-toc")
    .getByRole("link", { name: "三、用内容清单识别候选版本" })
    .click();
  await expect(page.locator(".mobile-toc")).not.toHaveAttribute("open", "");
  const diagram = page.getByRole("button", { name: "展开 Mermaid 图例" });
  await expect(diagram.locator("svg")).toBeVisible({ timeout: 20000 });
  await diagram.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭查看器" }).focus();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(diagram).toBeFocused();
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("navigation", { name: "移动端导航" })
    .getByRole("link", { name: "主题" })
    .click();
  await expect(
    page.getByRole("heading", { name: "按顺序读的专栏" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "打开导航菜单" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "切换深色模式" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
test("pages remain readable without JavaScript, and brand samples cannot take keyboard focus", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const nojs = await context.newPage();
  await nojs.goto(
    "http://127.0.0.1:4173/cBlog/posts/storefront-monorepo-architecture/",
  );
  await expect(nojs.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await nojs
      .locator("[data-post-body]")
      .evaluate((e) => getComputedStyle(e).opacity),
  ).toBe("1");
  await context.close();
  await page.goto("./brand/");
  await expect(page.locator("[data-showcase-preview]").first()).toHaveAttribute(
    "inert",
    "",
  );
});
