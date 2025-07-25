import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { initKeyTable } from "./keys/init";
import { initUsersTable } from "./users/init";

const dbDirName = path.join(process.cwd(), "database");
const dbPath = path.join(dbDirName, "database.db");

let db: Database.Database | null = null;

export function getDatabase() {
  if (db) {
    return db;
  }

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.join(process.cwd(), "database"), { recursive: true });
  }

  db = new Database(dbPath);

  initKeyTable(db);
  initUsersTable(db);

  return db;
}
