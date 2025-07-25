import { getDatabase } from "../get-database";

export async function saveKeys(vendor_id: string, vendor_auth_code: string) {
  const db = getDatabase();
  db.prepare("DELETE FROM keys").run();
  db.prepare("INSERT INTO keys (vendor_id, vendor_auth_code) VALUES (?, ?)").run(vendor_id, vendor_auth_code);
}