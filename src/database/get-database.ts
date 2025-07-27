import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { initSettingsTable } from "./settings/init";
import { initUsersTable } from "./users/init";

let db: Database.Database | null = null;

export function getDatabase() {
  if (db) {
    return db;
  }

  const dbDirName = path.join(process.cwd(), "database");
  const dbPath = path.join(
    process.env.DATABASE_DIR ?? dbDirName,
    "database.db"
  );

  console.log(`Using database at: ${dbPath}`);

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  db = new Database(dbPath);

  initSettingsTable(db);
  initUsersTable(db);

  return db;
}
