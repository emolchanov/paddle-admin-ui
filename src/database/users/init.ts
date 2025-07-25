import Database from "better-sqlite3";

export function initUsersTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_email TEXT NOT NULL,
      marketing_consent BOOLEAN NOT NULL,
      update_url TEXT,
      cancel_url TEXT,
      state TEXT,
      signup_date TEXT,
      quantity INTEGER,
      last_payment_json TEXT,         -- JSON string
      next_payment_json TEXT,         -- JSON string
      payment_information_json TEXT   -- JSON string
    );
  `);
}
