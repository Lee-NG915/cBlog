import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

export function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return value;
}

export function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function postgresTarget(connectionString) {
  const url = new URL(connectionString);
  const database = url.pathname.replace(/^\//, "");
  if (!url.hostname || !database) throw new Error("PostgreSQL URL 缺少 host/database");
  return `${url.hostname}:${url.port || "5432"}/${database}`;
}

export function assertConfirmedTarget(connectionString, confirmation, envName) {
  const target = postgresTarget(connectionString);
  if (confirmation !== target) {
    throw new Error(`${envName} 必须精确填写 ${target}`);
  }
}

function postgresEnvironment(connectionString) {
  const url = new URL(connectionString);
  const env = {
    ...process.env,
    PGHOST: process.env.POSTGRES_TOOL_HOST?.trim() || url.hostname,
    PGPORT: process.env.POSTGRES_TOOL_PORT?.trim() || url.port || "5432",
    PGDATABASE: url.pathname.replace(/^\//, ""),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
  };
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode) env.PGSSLMODE = sslMode;
  return env;
}

export function runPostgresTool(
  command,
  args,
  connectionString,
  options = {}
) {
  const toolEnv = postgresEnvironment(connectionString);
  const container = process.env.POSTGRES_TOOL_DOCKER_CONTAINER?.trim();
  const executable = container ? "docker" : command;
  const executableArgs = container
    ? [
        "exec",
        "-i",
        ...["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGSSLMODE"]
          .filter((name) => toolEnv[name])
          .flatMap((name) => ["--env", `${name}=${toolEnv[name]}`]),
        container,
        command,
        ...args,
      ]
    : args;
  const result = spawnSync(executable, executableArgs, {
    env: toolEnv,
    encoding: options.binary ? null : "utf8",
    input: options.input,
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.error) {
    throw new Error(`${executable} 无法启动: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} 失败（exit ${result.status}）: ${String(result.stderr ?? "").trim()}`
    );
  }
  if (options.binary) return Buffer.from(result.stdout ?? []);
  return String(result.stdout ?? "").trim();
}

const SNAPSHOT_SQL = `
select json_build_object(
  'categories', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(c)::text, '|' order by id), ''))
    ) from categories c
  ),
  'tags', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by id), ''))
    ) from tags t
  ),
  'collections', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(c)::text, '|' order by id), ''))
    ) from collections c
  ),
  'posts', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(p)::text, '|' order by id), ''))
    ) from posts p
  ),
  'collectionItems', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(i)::text, '|' order by id), ''))
    ) from collection_items i
  ),
  'assets', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(a)::text, '|' order by id), ''))
    ) from assets a
  ),
  'revisions', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(r)::text, '|' order by id), ''))
    ) from content_revisions r
  ),
  'postTags', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(
        to_jsonb(pt)::text, '|' order by post_id, position, tag_id
      ), ''))
    ) from post_tags pt
  ),
  'publicationEvents', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(e)::text, '|' order by id), ''))
    ) from publication_events e
  ),
  'publicationDeployments', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(d)::text, '|' order by id), ''))
    ) from publication_deployments d
  ),
  'publicationDeploymentEvents', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(
        to_jsonb(de)::text, '|' order by deployment_id, event_id
      ), ''))
    ) from publication_deployment_events de
  ),
  'migrationRuns', (
    select json_build_object(
      'count', count(*),
      'digest', md5(coalesce(string_agg(to_jsonb(m)::text, '|' order by run_id), ''))
    ) from content_migration_runs m
  )
)::text;
`;

export function databaseSnapshot(connectionString) {
  const output = runPostgresTool(
    "psql",
    ["--tuples-only", "--no-align", "--set", "ON_ERROR_STOP=1", "--command", SNAPSHOT_SQL],
    connectionString
  );
  return JSON.parse(output);
}

export function sha256File(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function sqlIdent(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`非法 PostgreSQL 标识符: ${name}`);
  }
  return `"${name}"`;
}

export function maintenanceUrl(connectionString) {
  const url = new URL(connectionString);
  url.pathname = "/postgres";
  return url.toString();
}

export function databaseName(connectionString) {
  return new URL(connectionString).pathname.replace(/^\//, "");
}

export function assertSafeRestoreTarget(sourceUrl, restoreUrl) {
  const sourceTarget = postgresTarget(sourceUrl);
  const restoreTarget = postgresTarget(restoreUrl);
  if (sourceTarget === restoreTarget) {
    throw new Error("恢复演练目标不得与备份源数据库相同");
  }
  const restoreDb = databaseName(restoreUrl);
  if (!restoreDb || restoreDb === "postgres") {
    throw new Error("禁止以 postgres 维护库或空库名作为恢复目标");
  }
  const container = process.env.POSTGRES_TOOL_DOCKER_CONTAINER?.trim();
  if (container && databaseName(sourceUrl) === restoreDb) {
    throw new Error(
      `docker 工具模式下恢复库名不得与源库相同（容器 ${container} 内实际连接由 POSTGRES_TOOL_* 决定）`
    );
  }
}

export function recreateEmptyDatabase(restoreUrl, sourceUrl) {
  if (!sourceUrl) {
    throw new Error("recreateEmptyDatabase 必须提供源库 URL，防止误删");
  }
  assertSafeRestoreTarget(sourceUrl, restoreUrl);
  const ident = sqlIdent(databaseName(restoreUrl));
  const maintenance = maintenanceUrl(restoreUrl);
  runPostgresTool(
    "psql",
    [
      "--set",
      "ON_ERROR_STOP=1",
      "--command",
      `DROP DATABASE IF EXISTS ${ident} WITH (FORCE)`,
    ],
    maintenance
  );
  runPostgresTool(
    "psql",
    [
      "--set",
      "ON_ERROR_STOP=1",
      "--command",
      `CREATE DATABASE ${ident}`,
    ],
    maintenance
  );
}

export function userTableCount(connectionString) {
  return Number(
    runPostgresTool(
      "psql",
      [
        "--tuples-only",
        "--no-align",
        "--set",
        "ON_ERROR_STOP=1",
        "--command",
        "select count(*) from pg_tables where schemaname not in ('pg_catalog','information_schema');",
      ],
      connectionString
    )
  );
}
