import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { DbHandle } from "./client";

export function defaultMigrationsFolder(): string {
  return fileURLToPath(new URL("../../drizzle", import.meta.url));
}

export function migrateDb(
  handle: DbHandle,
  migrationsFolder: string = defaultMigrationsFolder()
): void {
  migrate(handle.db, { migrationsFolder });
}
