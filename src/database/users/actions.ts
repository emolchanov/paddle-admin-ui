import { getDatabase } from "../get-database";
import { User, UserDB } from "./types";

export function insertUser(user: User) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO users (
      subscription_id, plan_id, user_id, user_email, marketing_consent,
      update_url, cancel_url, state, signup_date, quantity,
      last_payment_json, next_payment_json, payment_information_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    user.subscription_id,
    user.plan_id,
    user.user_id,
    user.user_email,
    user.marketing_consent ? 1 : 0,
    user.update_url,
    user.cancel_url,
    user.state,
    user.signup_date,
    user.quantity,
    JSON.stringify(user.last_payment),
    JSON.stringify(user.next_payment),
    JSON.stringify(user.payment_information)
  );
}

export function updateUser(user: User) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE users SET
      plan_id = ?,
      user_id = ?,
      user_email = ?,
      marketing_consent = ?,
      update_url = ?,
      cancel_url = ?,
      state = ?,
      signup_date = ?,
      quantity = ?,
      last_payment_json = ?,
      next_payment_json = ?,
      payment_information_json = ?
    WHERE subscription_id = ?
  `);

  stmt.run(
    user.plan_id,
    user.user_id,
    user.user_email,
    user.marketing_consent ? 1 : 0,
    user.update_url,
    user.cancel_url,
    user.state,
    user.signup_date,
    user.quantity,
    JSON.stringify(user.last_payment),
    JSON.stringify(user.next_payment),
    JSON.stringify(user.payment_information),
    user.subscription_id
  );
}

export function getUserBySubscriptionId(subscription_id: number): User | null {
  const db = getDatabase();
  const row = db
    .prepare<[number], UserDB>(`SELECT * FROM users WHERE subscription_id = ?`)
    .get(subscription_id);

  if (!row) return null;

  return {
    id: row.id,
    subscription_id: row.subscription_id,
    plan_id: row.plan_id,
    user_id: row.user_id,
    user_email: row.user_email,
    marketing_consent: !!row.marketing_consent,
    update_url: row.update_url,
    cancel_url: row.cancel_url,
    state: row.state,
    signup_date: row.signup_date,
    quantity: row.quantity,
    last_payment: JSON.parse(row.last_payment_json),
    next_payment: JSON.parse(row.next_payment_json),
    payment_information: JSON.parse(row.payment_information_json),
  };
}

export function insertUsers(users: User[]) {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO users (
      subscription_id, plan_id, user_id, user_email, marketing_consent,
      update_url, cancel_url, state, signup_date, quantity,
      last_payment_json, next_payment_json, payment_information_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((users: User[]) => {
    for (const user of users) {
      insert.run(
        user.subscription_id,
        user.plan_id,
        user.user_id,
        user.user_email,
        user.marketing_consent ? 1 : 0,
        user.update_url,
        user.cancel_url,
        user.state,
        user.signup_date,
        user.quantity,
        JSON.stringify(user.last_payment),
        JSON.stringify(user.next_payment),
        JSON.stringify(user.payment_information)
      );
    }
  });

  insertMany(users);

  // Get total count of users after insert
  const { count } = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  return count;
}

export function getUsersBySignupDateRange(
  startDate: string,
  endDate: string
): User[] {
  const db = getDatabase();
  const stmt = db.prepare<[string, string], UserDB>(`
    SELECT * FROM users
    WHERE signup_date BETWEEN ? AND ?
    ORDER BY signup_date ASC
  `);

  const rows = stmt.all(startDate, endDate);

  return rows.map((row) => ({
    id: row.id,
    subscription_id: row.subscription_id,
    plan_id: row.plan_id,
    user_id: row.user_id,
    user_email: row.user_email,
    marketing_consent: !!row.marketing_consent,
    update_url: row.update_url,
    cancel_url: row.cancel_url,
    state: row.state,
    signup_date: row.signup_date,
    quantity: row.quantity,
    last_payment: JSON.parse(row.last_payment_json),
    next_payment: JSON.parse(row.next_payment_json),
    payment_information: JSON.parse(row.payment_information_json),
  }));
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  const rows = db
    .prepare<[], UserDB>(`SELECT * FROM users ORDER BY signup_date ASC`)
    .all();

  return rows.map((row) => ({
    id: row.id,
    subscription_id: row.subscription_id,
    plan_id: row.plan_id,
    user_id: row.user_id,
    user_email: row.user_email,
    marketing_consent: !!row.marketing_consent,
    update_url: row.update_url,
    cancel_url: row.cancel_url,
    state: row.state,
    signup_date: row.signup_date,
    quantity: row.quantity,
    last_payment: JSON.parse(row.last_payment_json),
    next_payment: JSON.parse(row.next_payment_json),
    payment_information: JSON.parse(row.payment_information_json),
  }));
}
export function deleteAllUsers() {
  const db = getDatabase();
  db.exec(`
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name = 'users';
  `);
}
