import { getKeys } from "@/database/keys/get-keys";
import { saveKeys } from "@/database/keys/save-keys";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { vendor_id, vendor_auth_code } = await req.json();

  if (typeof vendor_id !== "string" || typeof vendor_auth_code !== "string") {
    return NextResponse.json(
      { error: "Both keys must be strings" },
      { status: 400 },
    );
  }

  saveKeys(vendor_id, vendor_auth_code);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const row = getKeys();

  return NextResponse.json({
    vendor_id: row?.vendor_id,
    vendor_auth_code: row?.vendor_auth_code,
  });
}
