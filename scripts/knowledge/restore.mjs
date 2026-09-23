import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  cpSync,
} from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { database, stateDir } from "./local-db.mjs";
export function restoreDrill(source) {
  const data = JSON.parse(
    readFileSync(path.join(source, "manifest.json"), "utf8"),
  );
  if (data.schemaVersion !== 1) throw new Error("不支持的备份版本");
  const checksums = JSON.parse(
    readFileSync(path.join(source, "checksums.json"), "utf8"),
  );
  for (const item of checksums) {
    const content = readFileSync(path.join(source, "notes", item.id + ".md"));
    if (createHash("sha256").update(content).digest("hex") !== item.sha256)
      throw new Error("笔记备份哈希不匹配：" + item.id);
    if (
      data.notes.find((n) => n.id === item.id)?.body !==
      content.toString("utf8")
    )
      throw new Error("正文和清单不一致");
  }
  if (checksums.length !== data.notes.length) throw new Error("备份计数不一致");
  for (const a of data.assets) {
    if (a.state !== "ready") continue;
    const file = path.join(source, "images", a.id);
    if (
      !existsSync(file) ||
      createHash("sha256").update(readFileSync(file)).digest("hex") !== a.id
    )
      throw new Error("附件缺失或哈希错误：" + a.id);
  }
  const dir = path.join(stateDir, "restore-drills", String(Date.now()));
  mkdirSync(dir, { recursive: true });
  const { sqlite } = database(path.join(dir, "notes.db"));
  try {
    sqlite.exec("BEGIN; PRAGMA defer_foreign_keys=ON;");
    for (const table of [
      "groups",
      "notes",
      "memberships",
      "assets",
      "publications",
    ])
      for (const row of data[table]) {
        const columns = Object.keys(row);
        if (columns.some((k) => !/^[a-z_]+$/.test(k)))
          throw new Error("非法字段");
        sqlite
          .prepare(
            `INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
          )
          .run(...Object.values(row));
      }
    sqlite.exec("COMMIT");
    const violations = sqlite.prepare("PRAGMA foreign_key_check").all();
    if (violations.length) throw new Error("恢复后引用关系有误");
    for (const n of data.notes) {
      const row = sqlite
        .prepare("SELECT body,version FROM notes WHERE id=?")
        .get(n.id);
      if (row.body !== n.body || row.version !== n.version)
        throw new Error("恢复校验失败");
    }
    if (existsSync(path.join(source, "images")))
      cpSync(path.join(source, "images"), path.join(dir, "images"), {
        recursive: true,
      });
    return {
      notes: data.notes.length,
      assets: data.assets.length,
      destination: dir,
    };
  } finally {
    sqlite.close();
  }
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const backups = path.join(stateDir, "backups");
  const source =
    process.argv[2] || path.join(backups, readdirSync(backups).sort().at(-1));
  console.log(JSON.stringify(restoreDrill(source), null, 2));
}
