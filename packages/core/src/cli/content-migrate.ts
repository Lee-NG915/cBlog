import { createReadonlyDb, defaultDbPath } from "../db/client";
import { closePostgresDb, createPostgresDb } from "../db/postgres/client";
import { migratePostgres } from "../db/postgres/migrate";
import { repoPath } from "../paths";
import { FileSystemMigrationAssetStore } from "../migration/assets";
import {
  applyMigrationSnapshot,
  assertConfirmedMigrationTarget,
  verifyMigrationSnapshot,
} from "../migration/runner";
import { buildMigrationSnapshot } from "../migration/source";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return value;
}

const command = process.argv[2];
if (!command || !["plan", "apply", "verify"].includes(command)) {
  throw new Error("用法: content-migrate.ts <plan|apply|verify> [--run-id ID]");
}

const sourceDbPath = argument("--source-db") ?? defaultDbPath();
const contentDir = argument("--content-dir") ?? repoPath("content");
const publicDir = argument("--public-dir") ?? repoPath("apps", "web", "public");
const assetDir =
  argument("--asset-dir") ??
  (process.env.MIGRATION_ASSET_DIR?.trim() ||
    repoPath("data", "migration-assets"));
const publicBaseUrl =
  argument("--asset-base-url") ??
  (process.env.MIGRATION_ASSET_PUBLIC_BASE_URL?.trim() ||
    "http://127.0.0.1:3001/assets");

const source = createReadonlyDb(sourceDbPath);
try {
  const snapshot = buildMigrationSnapshot(source, {
    contentDir,
    publicDir,
    publicBaseUrl,
  });
  if (command === "plan") {
    console.log(
      JSON.stringify(
        {
          schemaVersion: snapshot.schemaVersion,
          sourceDigest: snapshot.sourceDigest,
          publishedAtRule: snapshot.publishedAtRule,
          publishedWithoutEditorialDate: snapshot.posts.filter(
            (post) => post.status === "published" && post.editorialDate === null
          ).length,
          counts: {
            categories: snapshot.categories.length,
            posts: snapshot.posts.length,
            tags: snapshot.tags.length,
            collections: snapshot.collections.length,
            collectionItems: snapshot.collectionItems.length,
            assets: snapshot.assets.length,
          },
          statusCounts: [...snapshot.posts, ...snapshot.collectionItems].reduce(
            (counts, entity) => {
              counts[entity.status] += 1;
              return counts;
            },
            { draft: 0, published: 0, archived: 0 }
          ),
          slugs: {
            posts: snapshot.posts.map((post) => post.slug),
            collections: snapshot.collections.map((item) => item.slug),
            collectionItems: snapshot.collectionItems.map(
              (item) => `${item.collectionSlug}/${item.slug}`
            ),
          },
          contentHashes: {
            posts: Object.fromEntries(
              snapshot.posts.map((post) => [post.slug, post.contentHash])
            ),
            collectionItems: Object.fromEntries(
              snapshot.collectionItems.map((item) => [
                `${item.collectionSlug}/${item.slug}`,
                item.contentHash,
              ])
            ),
          },
          assets: snapshot.assets,
          unresolvedAssets: snapshot.unresolvedAssets,
          remoteAssets: snapshot.remoteAssets,
        },
        null,
        2
      )
    );
  } else {
    const databaseUrl = requiredEnvironment("DATABASE_URL");
    const handle = createPostgresDb(databaseUrl, { max: 4 });
    try {
      if (command === "apply") {
        assertConfirmedMigrationTarget(
          databaseUrl,
          process.env.CBLOG_MIGRATION_CONFIRM_TARGET
        );
        const runId = argument("--run-id");
        if (!runId) throw new Error("apply 必须提供 --run-id");
        await migratePostgres(handle);
        const report = await applyMigrationSnapshot(handle, snapshot, {
          runId,
          assetStore: new FileSystemMigrationAssetStore(assetDir, {
            contentDir,
            publicDir,
          }),
        });
        console.log(JSON.stringify(report, null, 2));
      } else {
        const report = await verifyMigrationSnapshot(handle, snapshot);
        console.log(JSON.stringify(report, null, 2));
        if (!report.ok) process.exitCode = 1;
      }
    } finally {
      await closePostgresDb(handle);
    }
  }
} finally {
  source.sqlite.close();
}
