#!/usr/bin/env node
/**
 * Phase 7 本地 CUT 演练（不切真实流量、不改生产默认 flag、不删除 filesystem）。
 *
 * 覆盖：
 *   CUT-005 确认门禁 / 拒绝覆盖 / 同源恢复 / 非空库
 *   CUT-001 staging PostgreSQL 备份 → 同容器空库恢复，digest 一致
 *   CUT-002 MinIO 探针对象 + 现有迁移资产 SHA-256
 *   CUT-003 content:export 到空目录并核对 manifest
 *   CUT-004 无真实流量，只记录 runbook 回切步骤为人工项
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertSafeRestoreTarget,
  databaseSnapshot,
  postgresTarget,
  recreateEmptyDatabase,
  runPostgresTool,
  sha256Buffer,
  sha256File,
  userTableCount,
} from "./postgres-drill-lib.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromCore = createRequire(
  path.join(ROOT, "packages/core/package.json")
);
const {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} = requireFromCore("@aws-sdk/client-s3");

const results = [];
function record(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${id}${detail ? ` — ${detail}` : ""}`);
  if (!ok) throw new Error(`${id} 失败: ${detail}`);
}

function parseLastJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error(`输出不是 JSON:\n${text.slice(0, 800)}`);
  }
  return JSON.parse(text.slice(start, end + 1));
}

function run(command, args, env, label) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `${label} 失败（exit ${result.status}）: ${String(result.stderr).trim()}\n${String(result.stdout).trim()}`
    );
  }
  return result.stdout;
}

function expectFailure(command, args, env, pattern, label) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env,
    encoding: "utf8",
  });
  if (result.status === 0) {
    throw new Error(`${label} 应当失败，实际成功`);
  }
  const text = `${result.stderr}\n${result.stdout}`;
  if (!pattern.test(text)) {
    throw new Error(
      `${label} 失败原因不符合预期: ${text.trim().slice(0, 800)}`
    );
  }
}

async function objectBodyToBuffer(body) {
  if (!body) throw new Error("S3 响应缺少 body");
  if (typeof body.transformToByteArray === "function") {
    return Buffer.from(await body.transformToByteArray());
  }
  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function main() {
  const env = {
    ...process.env,
    DATABASE_URL:
      process.env.DATABASE_URL?.trim() ||
      "postgresql://cblog:cblog@127.0.0.1:54329/cblog",
    POSTGRES_TOOL_DOCKER_CONTAINER:
      process.env.POSTGRES_TOOL_DOCKER_CONTAINER?.trim() || "infra-postgres-1",
    POSTGRES_TOOL_HOST: process.env.POSTGRES_TOOL_HOST?.trim() || "127.0.0.1",
    POSTGRES_TOOL_PORT: process.env.POSTGRES_TOOL_PORT?.trim() || "5432",
    MIGRATION_ASSET_DIR:
      process.env.MIGRATION_ASSET_DIR?.trim() || "/tmp/cblog-migration-assets",
  };
  process.env.POSTGRES_TOOL_DOCKER_CONTAINER =
    env.POSTGRES_TOOL_DOCKER_CONTAINER;
  process.env.POSTGRES_TOOL_HOST = env.POSTGRES_TOOL_HOST;
  process.env.POSTGRES_TOOL_PORT = env.POSTGRES_TOOL_PORT;

  const sourceUrl = env.DATABASE_URL;
  const sourceTarget = postgresTarget(sourceUrl);
  const restoreUrl =
    process.env.RESTORE_DATABASE_URL?.trim() ||
    "postgresql://cblog:cblog@127.0.0.1:54329/cblog_restore";
  const restoreTarget = postgresTarget(restoreUrl);
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "cblog-cutover-"));
  const dumpPath = path.join(workDir, "staging.dump");
  const exportDir = path.join(workDir, "markdown-export");
  const node = process.execPath;

  try {
    expectFailure(
      node,
      ["scripts/pg-backup.mjs", "--output", dumpPath],
      { ...env, CBLOG_BACKUP_CONFIRM_TARGET: "" },
      /CBLOG_BACKUP_CONFIRM_TARGET/,
      "缺确认值备份"
    );
    expectFailure(
      node,
      ["scripts/pg-backup.mjs", "--output", dumpPath],
      { ...env, CBLOG_BACKUP_CONFIRM_TARGET: "127.0.0.1:54329/other" },
      /CBLOG_BACKUP_CONFIRM_TARGET/,
      "错误确认值备份"
    );
    const occupied = path.join(workDir, "occupied.dump");
    fs.writeFileSync(occupied, "occupied");
    expectFailure(
      node,
      ["scripts/pg-backup.mjs", "--output", occupied],
      { ...env, CBLOG_BACKUP_CONFIRM_TARGET: sourceTarget },
      /拒绝覆盖/,
      "覆盖已有 dump"
    );
    record("CUT-005", true, "缺确认/错确认/拒绝覆盖已有 dump");

    const backupOut = run(
      node,
      ["scripts/pg-backup.mjs", "--output", dumpPath],
      { ...env, CBLOG_BACKUP_CONFIRM_TARGET: sourceTarget },
      "CUT-001 备份"
    );
    const backupReport = parseLastJson(backupOut);
    const manifest = JSON.parse(
      fs.readFileSync(`${dumpPath}.manifest.json`, "utf8")
    );
    if (sha256File(dumpPath) !== manifest.dump.sha256) {
      throw new Error("备份 SHA-256 与 manifest 不一致");
    }

    expectFailure(
      node,
      ["scripts/pg-restore-drill.mjs", "--backup", dumpPath],
      {
        ...env,
        RESTORE_DATABASE_URL: sourceUrl,
        CBLOG_RESTORE_CONFIRM_TARGET: sourceTarget,
      },
      /不得与备份源数据库相同/,
      "同源恢复"
    );

    assertSafeRestoreTarget(sourceUrl, restoreUrl);
    recreateEmptyDatabase(restoreUrl, sourceUrl);
    if (userTableCount(restoreUrl) !== 0) {
      throw new Error("隔离库创建后仍不是空库");
    }

    const restoreOut = run(
      node,
      ["scripts/pg-restore-drill.mjs", "--backup", dumpPath],
      {
        ...env,
        RESTORE_DATABASE_URL: restoreUrl,
        CBLOG_RESTORE_CONFIRM_TARGET: restoreTarget,
      },
      "CUT-001 恢复"
    );
    const restoreReport = parseLastJson(restoreOut);
    if (!restoreReport.ok) {
      throw new Error("恢复 digest 与备份 manifest 不一致");
    }
    const sourceSnapshot = databaseSnapshot(sourceUrl);
    if (
      JSON.stringify(sourceSnapshot) !== JSON.stringify(restoreReport.actual)
    ) {
      throw new Error("恢复库与当前源库 digest 不一致（演练期间源库被写入？）");
    }
    record(
      "CUT-001",
      true,
      `${backupReport.sourceTarget} → ${restoreTarget}; posts=${manifest.databaseSnapshot.posts.count} revisions=${manifest.databaseSnapshot.revisions.count}`
    );

    expectFailure(
      node,
      ["scripts/pg-restore-drill.mjs", "--backup", dumpPath],
      {
        ...env,
        RESTORE_DATABASE_URL: restoreUrl,
        CBLOG_RESTORE_CONFIRM_TARGET: restoreTarget,
      },
      /恢复目标不是空数据库/,
      "非空库恢复"
    );
    record("CUT-005b", true, "同源恢复与非空库均被拒绝");

    const assetDir = env.MIGRATION_ASSET_DIR;
    const assetJson = runPostgresTool(
      "psql",
      [
        "--tuples-only",
        "--no-align",
        "--set",
        "ON_ERROR_STOP=1",
        "--command",
        "select coalesce(json_agg(json_build_object('objectKey', object_key, 'sha256', sha256) order by object_key), '[]'::json) from assets;",
      ],
      sourceUrl
    );
    const assets = JSON.parse(assetJson);
    if (!Array.isArray(assets) || assets.length === 0) {
      throw new Error("staging assets 为空，无法抽查 SHA-256");
    }
    for (const asset of assets) {
      const filePath = path.join(assetDir, asset.objectKey);
      if (!fs.existsSync(filePath)) {
        throw new Error(`本地迁移对象缺失: ${filePath}`);
      }
      if (sha256File(filePath) !== asset.sha256) {
        throw new Error(`文件系统对象 hash 不一致: ${asset.objectKey}`);
      }
    }

    const s3 = new S3Client({
      region: process.env.OBJECT_STORAGE_REGION?.trim() || "us-east-1",
      endpoint:
        process.env.OBJECT_STORAGE_ENDPOINT?.trim() || "http://127.0.0.1:19000",
      forcePathStyle: true,
      credentials: {
        accessKeyId:
          process.env.OBJECT_STORAGE_ACCESS_KEY?.trim() || "minioadmin",
        secretAccessKey:
          process.env.OBJECT_STORAGE_SECRET_KEY?.trim() || "minioadmin",
      },
    });
    const bucket = process.env.OBJECT_STORAGE_BUCKET?.trim() || "cblog";
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    }
    const probeKey = `cutover-drill/${Date.now()}-probe.bin`;
    const probeBody = Buffer.from(`cblog-cutover-probe:${Date.now()}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: probeKey,
        Body: probeBody,
        ContentType: "application/octet-stream",
      })
    );
    const probeGot = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: probeKey })
    );
    const probeRead = await objectBodyToBuffer(probeGot.Body);
    if (sha256Buffer(probeRead) !== sha256Buffer(probeBody)) {
      throw new Error("MinIO 探针对象回读 hash 不一致");
    }
    const sample = assets[0];
    const sampleBody = fs.readFileSync(path.join(assetDir, sample.objectKey));
    const sampleKey = `cutover-drill/${sample.objectKey}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: sampleKey,
        Body: sampleBody,
        ContentType: "application/octet-stream",
      })
    );
    const sampleGot = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: sampleKey })
    );
    const sampleRead = await objectBodyToBuffer(sampleGot.Body);
    if (sha256Buffer(sampleRead) !== sample.sha256) {
      throw new Error(`MinIO 抽查资产 hash 不一致: ${sample.objectKey}`);
    }
    record(
      "CUT-002",
      true,
      `filesystem ${assets.length} 对象 + MinIO 探针/抽样回读通过`
    );

    const exportOut = run(
      "pnpm",
      ["--filter", "@cblog/core", "content:export", "--", "--output", exportDir],
      { ...env, MIGRATION_ASSET_STORE: "filesystem" },
      "CUT-003 导出"
    );
    const exportReport = parseLastJson(exportOut);
    const exportManifest = JSON.parse(
      fs.readFileSync(path.join(exportDir, "backup-manifest.json"), "utf8")
    );
    if (exportManifest.counts.posts !== manifest.databaseSnapshot.posts.count) {
      throw new Error(
        `导出 posts=${exportManifest.counts.posts} 与备份 ${manifest.databaseSnapshot.posts.count} 不一致`
      );
    }
    if (
      exportManifest.counts.collectionItems !==
      manifest.databaseSnapshot.collectionItems.count
    ) {
      throw new Error("导出 collectionItems 计数不一致");
    }
    record(
      "CUT-003",
      true,
      `posts=${exportReport.counts.posts} items=${exportReport.counts.collectionItems} assets=${exportReport.counts.assets}`
    );

    record(
      "CUT-004",
      true,
      "无真实流量；回切步骤见 docs/deployment/07-cutover-runbook.md §5，维护窗口人工执行"
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          workDir,
          dump: dumpPath,
          restoreTarget,
          results,
        },
        null,
        2
      )
    );
  } finally {
    try {
      recreateEmptyDatabase(restoreUrl, sourceUrl);
    } catch {
      /* 清理失败不掩盖演练结果；门禁失败时也不得回落到源库 */
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
