import { API_TYPE } from "@/constants";
import { getDatabase } from "../get-database";

export function getSettings() {
  const db = getDatabase();
  return db
    .prepare<
      [],
      {
        vendor_id: string;
        vendor_auth_code: string;
        subscription_id: number;
        plan_id: number;
        start_page: number;
        max_pages: number;
        api_type: API_TYPE;
      }
    >(
      "SELECT vendor_id, vendor_auth_code, subscription_id, plan_id, start_page, max_pages, api_type FROM settings ORDER BY id DESC LIMIT 1"
    )
    .get();
}
