#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  argument,
  assertConfirmedTarget,
  databaseSnapshot,
  postgresTarget,
  requiredEnv,
  runPostgresTool,
  sha256File,
  userTableCount,
} from "./postgres-drill-lib.mjs";

const backupArg = argument("--backup");
if (!backupArg) {
  throw new Error("用法: pg-restore-drill.mjs --backup /absolute/path/file.dump");
}
if (!path.isAbsolute(backupArg)) throw new Error("--backup 必须是绝对路径");
const backup = path.resolve(backupArg);
const manifestPath = `${backup}.manifest.json`;
if (!fs.existsSync(backup) || !fs.existsSync(manifestPath)) {
  throw new Error("备份文件或 manifest 不存在");
}

const restoreUrl = requiredEnv("RESTORE_DATABASE_URL");
assertConfirmedTarget(
  restoreUrl,
  process.env.CBLOG_RESTORE_CONFIRM_TARGET,
  "CBLOG_RESTORE_CONFIRM_TARGET"
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const restoreTarget = postgresTarget(restoreUrl);
if (manifest.sourceTarget === restoreTarget) {
  throw new Error("恢复演练目标不得与备份源数据库相同");
}
if (sha256File(backup) !== manifest.dump?.sha256) {
  throw new Error("备份文件 SHA-256 与 manifest 不一致");
}

const existingTables = userTableCount(restoreUrl);
if (existingTables !== 0) {
  throw new Error(
    `恢复目标不是空数据库（发现 ${existingTables} 张表），拒绝覆盖；请新建隔离数据库`
  );
}

runPostgresTool(
  "pg_restore",
  [
    "--exit-on-error",
    "--no-owner",
    "--no-privileges",
    "--dbname",
    new URL(restoreUrl).pathname.replace(/^\//, ""),
  ],
  restoreUrl,
  { input: fs.readFileSync(backup) }
);

const restoredSnapshot = databaseSnapshot(restoreUrl);
const matches =
  JSON.stringify(restoredSnapshot) === JSON.stringify(manifest.databaseSnapshot);
console.log(
  JSON.stringify(
    {
      ok: matches,
      sourceTarget: manifest.sourceTarget,
      restoreTarget,
      backupSha256: manifest.dump.sha256,
      expected: manifest.databaseSnapshot,
      actual: restoredSnapshot,
    },
    null,
    2
  )
);
if (!matches) process.exitCode = 1;
