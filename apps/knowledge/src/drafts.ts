import type { Note } from "./types";
export type Draft = { note: Note; baseVersion: number; updatedAt: number };
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("color-notes-drafts", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("drafts");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function draftStore(
  mode: "get" | "put" | "delete" | "clear",
  id = "",
  value?: Draft,
): Promise<Draft | undefined> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(
        "drafts",
        mode === "get" ? "readonly" : "readwrite",
      ),
      store = tx.objectStore("drafts");
    const req =
      mode === "get"
        ? store.get(id)
        : mode === "put"
          ? store.put(value, id)
          : mode === "clear"
            ? store.clear()
            : store.delete(id);
    let result: Draft | undefined;
    req.onsuccess = () => {
      result = req.result;
    };
    tx.oncomplete = () => {
      database.close();
      resolve(result);
    };
    tx.onerror = () => {
      database.close();
      reject(tx.error);
    };
  });
}
export async function listDrafts(): Promise<Draft[]> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("drafts", "readonly");
    const req = tx.objectStore("drafts").getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => database.close();
  });
}
