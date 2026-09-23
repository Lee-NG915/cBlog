import { mkdirSync, writeFileSync, cpSync, existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { database, stateDir } from "./local-db.mjs";
const { sqlite } = database();
const dir = path.join(
  stateDir,
  "backups",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
mkdirSync(path.join(dir, "notes"), { recursive: true });
const tables = ["notes", "groups", "memberships", "assets", "publications"];
const data = Object.fromEntries(
  tables.map((t) => [t, sqlite.prepare(`SELECT * FROM ${t}`).all()]),
);
for (const n of data.notes as any[])
  writeFileSync(path.join(dir, "notes", n.id + ".md"), n.body);
writeFileSync(
  path.join(dir, "manifest.json"),
  JSON.stringify({ schemaVersion: 1, ...data }, null, 2),
);
if (existsSync(path.join(stateDir, "images")))
  cpSync(path.join(stateDir, "images"), path.join(dir, "images"), {
    recursive: true,
  });
writeFileSync(
  path.join(dir, "checksums.json"),
  JSON.stringify(
    (data.notes as any[]).map((n) => ({
      id: n.id,
      sha256: createHash("sha256").update(n.body).digest("hex"),
    })),
    null,
    2,
  ),
);
sqlite.close();
console.log(`备份已导出：${dir}`);
