import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { repoPath } from "../paths";

export type DbHandle = {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: Database.Database;
  dbPath: string;
};

export function defaultDbPath(): string {
  return repoPath("data", "blog.db");
}

export function createDb(dbPath: string): DbHandle {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  // 不启用 WAL：db 文件随仓库提交，需保证单文件自包含
  sqlite.pragma("journal_mode = DELETE");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { db, sqlite, dbPath };
}

/** 迁移 plan/verify 使用只读 SQLite，避免扫描命令意外创建或修改源库。 */
export function createReadonlyDb(dbPath: string): DbHandle {
  const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { db, sqlite, dbPath };
}

let defaultHandle: DbHandle | null = null;

/** 默认库（data/blog.db）单例；测试请使用 createDb(临时路径) */
export function getDb(): DbHandle {
  if (!defaultHandle) {
    defaultHandle = createDb(defaultDbPath());
  }
  return defaultHandle;
}
