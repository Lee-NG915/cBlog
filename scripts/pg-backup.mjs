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
} from "./postgres-drill-lib.mjs";

const databaseUrl = requiredEnv("DATABASE_URL");
assertConfirmedTarget(
  databaseUrl,
  process.env.CBLOG_BACKUP_CONFIRM_TARGET,
  "CBLOG_BACKUP_CONFIRM_TARGET"
);

const outputArg = argument("--output");
if (!outputArg) throw new Error("用法: pg-backup.mjs --output /absolute/path/file.dump");
if (!path.isAbsolute(outputArg)) throw new Error("--output 必须是绝对路径");
const output = path.resolve(outputArg);
const manifestPath = `${output}.manifest.json`;
if (!fs.existsSync(path.dirname(output))) {
  throw new Error(`备份父目录不存在: ${path.dirname(output)}`);
}
if (fs.existsSync(output) || fs.existsSync(manifestPath)) {
  throw new Error("拒绝覆盖已有备份或 manifest");
}

try {
  const dump = runPostgresTool(
    "pg_dump",
    [
      "--format=custom",
      "--no-owner",
      "--no-privileges",
    ],
    databaseUrl,
    { binary: true }
  );
  fs.writeFileSync(output, dump, { mode: 0o600 });
  const manifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    sourceTarget: postgresTarget(databaseUrl),
    gitCommit:
      process.env.GITHUB_SHA?.trim() ||
      process.env.GIT_COMMIT?.trim() ||
      null,
    dump: {
      fileName: path.basename(output),
      byteSize: fs.statSync(output).size,
      sha256: sha256File(output),
    },
    databaseSnapshot: databaseSnapshot(databaseUrl),
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        output,
        manifest: manifestPath,
        sourceTarget: manifest.sourceTarget,
        byteSize: manifest.dump.byteSize,
        sha256: manifest.dump.sha256,
      },
      null,
      2
    )
  );
} catch (error) {
  fs.rmSync(output, { force: true });
  fs.rmSync(manifestPath, { force: true });
  throw error;
}
