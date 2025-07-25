import { getDatabase } from "../get-database";

export function getKeys() {
  const db = getDatabase();
  return db
    .prepare<
      [],
      { vendor_id: string; vendor_auth_code: string }
    >("SELECT vendor_id, vendor_auth_code FROM keys ORDER BY id DESC LIMIT 1")
    .get();
}
