import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { PostgresDbHandle } from "./client";

export function postgresMigrationsFolder(): string {
  return fileURLToPath(
    new URL("../../../drizzle-postgres", import.meta.url)
  );
}

export async function migratePostgres(
  handle: PostgresDbHandle
): Promise<void> {
  await migrate(handle.db, { migrationsFolder: postgresMigrationsFolder() });
}
