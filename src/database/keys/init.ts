import Database from "better-sqlite3";

export function initKeyTable(db: Database.Database) {
  db.exec(`
      CREATE TABLE IF NOT EXISTS keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id TEXT NOT NULL,
        vendor_auth_code TEXT NOT NULL
      );
    `);
}
