import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertConfirmedTarget,
  postgresTarget,
  sqlIdent,
  assertSafeRestoreTarget,
  recreateEmptyDatabase,
} from "./postgres-drill-lib.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("postgresTarget / confirm", () => {
  it("补默认端口 5432，并保留显式端口", () => {
    assert.equal(
      postgresTarget("postgresql://u:p@db.example.com/cblog"),
      "db.example.com:5432/cblog"
    );
    assert.equal(
      postgresTarget("postgresql://cblog:cblog@127.0.0.1:54329/cblog"),
      "127.0.0.1:54329/cblog"
    );
  });

  it("确认值必须与 host:port/database 精确相等", () => {
    const url = "postgresql://cblog:cblog@127.0.0.1:54329/cblog";
    assert.throws(
      () => assertConfirmedTarget(url, undefined, "CBLOG_BACKUP_CONFIRM_TARGET"),
      /CBLOG_BACKUP_CONFIRM_TARGET/
    );
    assert.throws(
      () =>
        assertConfirmedTarget(
          url,
          "127.0.0.1:54329/other",
          "CBLOG_BACKUP_CONFIRM_TARGET"
        ),
      /CBLOG_BACKUP_CONFIRM_TARGET/
    );
    assert.doesNotThrow(() =>
      assertConfirmedTarget(
        url,
        "127.0.0.1:54329/cblog",
        "CBLOG_BACKUP_CONFIRM_TARGET"
      )
    );
  });

  it("只接受安全数据库标识符", () => {
    assert.equal(sqlIdent("cblog_restore"), '"cblog_restore"');
    assert.throws(() => sqlIdent("cblog;drop"), /非法 PostgreSQL 标识符/);
    assert.throws(() => sqlIdent("cblog-restore"), /非法 PostgreSQL 标识符/);
  });

  it("拒绝 drop 源库、维护库，以及 docker 模式下同名库", () => {
    const source = "postgresql://cblog:cblog@127.0.0.1:54329/cblog";
    assert.throws(
      () => assertSafeRestoreTarget(source, source),
      /不得与备份源数据库相同/
    );
    assert.throws(
      () =>
        recreateEmptyDatabase(
          source,
          source
        ),
      /不得与备份源数据库相同/
    );
    assert.throws(
      () =>
        assertSafeRestoreTarget(
          source,
          "postgresql://cblog:cblog@127.0.0.1:54329/postgres"
        ),
      /postgres 维护库/
    );
    const previous = process.env.POSTGRES_TOOL_DOCKER_CONTAINER;
    process.env.POSTGRES_TOOL_DOCKER_CONTAINER = "infra-postgres-1";
    try {
      assert.throws(
        () =>
          assertSafeRestoreTarget(
            source,
            "postgresql://cblog:cblog@127.0.0.1:5432/cblog"
          ),
        /恢复库名不得与源库相同/
      );
      assert.doesNotThrow(() =>
        assertSafeRestoreTarget(
          source,
          "postgresql://cblog:cblog@127.0.0.1:54329/cblog_restore"
        )
      );
    } finally {
      if (previous === undefined) {
        delete process.env.POSTGRES_TOOL_DOCKER_CONTAINER;
      } else {
        process.env.POSTGRES_TOOL_DOCKER_CONTAINER = previous;
      }
    }
  });
});

describe("CUT-005 backup/restore dry-run 负例", () => {
  it("缺少确认值时拒绝备份", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/pg-backup.mjs", "--output", "/tmp/cblog-should-not-exist.dump"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_URL: "postgresql://cblog:cblog@127.0.0.1:54329/cblog",
          CBLOG_BACKUP_CONFIRM_TARGET: "",
        },
      }
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /CBLOG_BACKUP_CONFIRM_TARGET/);
    assert.equal(fs.existsSync("/tmp/cblog-should-not-exist.dump"), false);
  });

  it("拒绝覆盖已有 dump/manifest", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-backup-"));
    const output = path.join(dir, "existing.dump");
    fs.writeFileSync(output, "nope");
    const result = spawnSync(
      process.execPath,
      ["scripts/pg-backup.mjs", "--output", output],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_URL: "postgresql://cblog:cblog@127.0.0.1:54329/cblog",
          CBLOG_BACKUP_CONFIRM_TARGET: "127.0.0.1:54329/cblog",
        },
      }
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /拒绝覆盖/);
    assert.equal(fs.readFileSync(output, "utf8"), "nope");
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("恢复目标与源相同时拒绝", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-restore-"));
    const backup = path.join(dir, "sample.dump");
    const manifest = `${backup}.manifest.json`;
    fs.writeFileSync(backup, "not-a-real-dump");
    fs.writeFileSync(
      manifest,
      JSON.stringify({
        sourceTarget: "127.0.0.1:54329/cblog",
        dump: { sha256: "deadbeef" },
      })
    );
    const result = spawnSync(
      process.execPath,
      ["scripts/pg-restore-drill.mjs", "--backup", backup],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          RESTORE_DATABASE_URL:
            "postgresql://cblog:cblog@127.0.0.1:54329/cblog",
          CBLOG_RESTORE_CONFIRM_TARGET: "127.0.0.1:54329/cblog",
        },
      }
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /不得与备份源数据库相同/);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
