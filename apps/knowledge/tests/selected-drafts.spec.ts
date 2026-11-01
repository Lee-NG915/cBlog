import { test, expect } from "@playwright/test";

for (const draftId of ["chosen", "retained", "unrelated"]) {
  test(`publication with ${draftId} local draft`, async ({ page }) => {
    let dispatches = 0;
    const note = {
      id: "chosen",
      slug: "chosen",
      title: "选中的文章",
      body: "已保存的正文",
      topic_id: "topic",
      state: "ready",
      visibility: "public",
      tags: "[]",
      version: 1,
      updated_at: "2026-11-01",
      deleted_at: null,
      source_path: null,
    };
    await page.route("**/api/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname.replace(
        "/api/v1",
        "",
      );
      const post = route.request().method() === "POST";
      let response: unknown;
      if (path === "/session") response = { data: { csrf: "fixture" } };
      else if (path === "/corpus")
        response = { data: [note], revision: 7, nextCursor: null };
      else if (path === "/groups") response = { data: [], memberships: [] };
      else if (path === "/publishing" && post) {
        expect(route.request().postDataJSON().noteId).toBe("chosen");
        dispatches++;
        response = { data: {} };
      } else if (path === "/publishing")
        response = {
          enabled: true,
          repository: "fixture/blog",
          siteUrl: "https://blog.example",
          live: [],
          history: [],
        };
      else return route.abort();
      await route.fulfill({ json: response });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "博客发布", exact: true }).click();
    await page.evaluate(
      async ({ id, note }) => {
        await new Promise<void>((resolve, reject) => {
          const q = indexedDB.open("color-notes-drafts", 1);
          q.onupgradeneeded = () => q.result.createObjectStore("drafts");
          q.onsuccess = () => {
            const db = q.result,
              tx = db.transaction("drafts", "readwrite");
            tx.objectStore("drafts").put(
              {
                note: { ...note, id, body: "未同步的正文" },
                baseVersion: 1,
                updatedAt: 1,
              },
              id,
            );
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => reject(tx.error);
          };
        });
      },
      { id: draftId, note },
    );
    await page.getByRole("button", { name: "发布文章", exact: true }).click();
    await page.getByRole("button", { name: "确认发布", exact: true }).click();
    if (draftId !== "chosen") await expect.poll(() => dispatches).toBe(1);
    else await expect(page.getByRole("alert")).toContainText("未保存");
    expect(dispatches).toBe(draftId !== "chosen" ? 1 : 0);
    const preserved = await page.evaluate(
      (id) =>
        new Promise<string>((resolve) => {
          const q = indexedDB.open("color-notes-drafts", 1);
          q.onsuccess = () => {
            const db = q.result,
              r = db.transaction("drafts").objectStore("drafts").get(id);
            r.onsuccess = () => {
              resolve(r.result.note.body);
              db.close();
            };
          };
        }),
      draftId,
    );
    expect(preserved).toBe("未同步的正文");
  });
}
