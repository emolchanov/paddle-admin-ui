import { API_TYPE } from "@/constants";
import { getDatabase } from "../get-database";

export async function saveSettings(
  vendor_id: string,
  vendor_auth_code: string,
  subscription_id: number = 0,
  start_page: number = 1,
  max_pages: number = 10,
  api_type: API_TYPE = API_TYPE.MOCK
) {
  const db = getDatabase();
  db.prepare("DELETE FROM settings").run();
  db.prepare(
    "INSERT INTO settings (vendor_id, vendor_auth_code, subscription_id, start_page, max_pages, api_type) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    vendor_id,
    vendor_auth_code,
    subscription_id,
    start_page,
    max_pages,
    api_type
  );
}
