import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
export const root = fileURLToPath(new URL("../../", import.meta.url));
export const stateDir = path.join(root, ".knowledge");
export function database(filename = path.join(stateDir, "notes.db")) {
  mkdirSync(stateDir, { recursive: true });
  const sqlite = new DatabaseSync(filename);
  sqlite.exec(
    readFileSync(
      path.join(root, "apps/api/migrations/0001_knowledge.sql"),
      "utf8",
    ),
  );
  if (
    !sqlite
      .prepare("PRAGMA table_info(notes)")
      .all()
      .some((c) => c.name === "source_metadata")
  )
    sqlite.exec(
      readFileSync(
        path.join(root, "apps/api/migrations/0002_source_metadata.sql"),
        "utf8",
      ),
    );
  sqlite.exec(
    readFileSync(
      path.join(root, "apps/api/migrations/0003_build_jobs.sql"),
      "utf8",
    ),
  );
  class Statement {
    constructor(sql, values = []) {
      this.sql = sql;
      this.values = values;
    }
    bind(...values) {
      return new Statement(this.sql, values);
    }
    result() {
      const stmt = sqlite.prepare(this.sql);
      const results = stmt.columns().length ? stmt.all(...this.values) : [];
      const info = stmt.columns().length
        ? { changes: 0, lastInsertRowid: 0 }
        : stmt.run(...this.values);
      return {
        success: true,
        results,
        meta: {
          changes: Number(info.changes),
          last_row_id: Number(info.lastInsertRowid),
          duration: 0,
          rows_read: results.length,
          rows_written: Number(info.changes),
        },
      };
    }
    async all() {
      return this.result();
    }
    async run() {
      return this.result();
    }
    async first(column) {
      const row = sqlite.prepare(this.sql).get(...this.values);
      return row ? (column ? row[column] : row) : null;
    }
    async raw() {
      return this.result().results.map(Object.values);
    }
  }
  const DB = {
    prepare: (sql) => new Statement(sql),
    async batch(statements) {
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const result = statements.map((s) => s.result());
        sqlite.exec("COMMIT");
        return result;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
    async exec(sql) {
      sqlite.exec(sql);
      return { count: 1, duration: 0 };
    },
  };
  return { DB, sqlite };
}
export function localImages(directory = path.join(stateDir, "images")) {
  mkdirSync(directory, { recursive: true });
  return {
    async put(id, value) {
      if (!/^[a-f0-9]{64}$/.test(id)) throw new Error("Invalid image key");
      writeFileSync(path.join(directory, id), new Uint8Array(value));
    },
    async get(id) {
      if (!/^[a-f0-9]{64}$/.test(id) || !existsSync(path.join(directory, id)))
        return null;
      const bytes = readFileSync(path.join(directory, id));
      return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      );
    },
  };
}
