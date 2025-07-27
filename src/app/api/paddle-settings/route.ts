import { clearDatabase } from "@/database/clear-database";
import { getSettings } from "@/database/settings/get-settings";
import { saveSettings } from "@/database/settings/save-settings";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    vendor_id,
    vendor_auth_code,
    max_pages,
    start_page,
    subscription_id,
    api_type,
  } = await req.json();

  if (
    typeof vendor_id !== "string" ||
    typeof vendor_auth_code !== "string" ||
    typeof max_pages !== "number" ||
    typeof start_page !== "number" ||
    typeof subscription_id !== "number"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  saveSettings(
    vendor_id,
    vendor_auth_code,
    subscription_id,
    start_page,
    max_pages,
    api_type
  );

  return NextResponse.json({ success: true });
}

export async function GET() {
  const row = getSettings();

  return NextResponse.json({
    vendor_id: row?.vendor_id,
    vendor_auth_code: row?.vendor_auth_code,
    subscription_id: row?.subscription_id,
    start_page: row?.start_page,
    max_pages: row?.max_pages,
    api_type: row?.api_type,
  });
}
export async function DELETE() {
  clearDatabase();
  return NextResponse.json({ success: true, message: "Reset database" });
}
