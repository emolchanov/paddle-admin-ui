import Database from "better-sqlite3";

export function initSettingsTable(db: Database.Database) {
  db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id TEXT NOT NULL,
        vendor_auth_code TEXT NOT NULL,
        subscription_id INTEGER NOT NULL,
        start_page INTEGER NOT NULL,
        max_pages INTEGER NOT NULL,
        api_type INTEGER NOT NULL
      );
    `);
}
