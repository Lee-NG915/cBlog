import { closePostgresDb, createPostgresDb } from "../db/postgres/client";
import { migratePostgres } from "../db/postgres/migrate";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("缺少 DATABASE_URL，拒绝执行 PostgreSQL migration");
}

const handle = createPostgresDb(databaseUrl, { max: 1 });
try {
  await migratePostgres(handle);
  console.log("PostgreSQL migration 完成");
} finally {
  await closePostgresDb(handle);
}
