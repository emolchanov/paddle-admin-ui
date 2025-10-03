import { getSettings } from "@/database/settings/get-settings";
import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { User } from "@/database/users/types";
import {
  deleteAllUsers,
  getAllUsers,
  getUsersBySignupDateRange,
  insertUsers,
} from "@/database/users/actions";
import { API_URLS, USERS_API_STATUS } from "@/constants";
import { statusEvents } from "@/modules/paddle-users/status";

export const config = {
  maxDuration: 300000, // 5 minutes in milliseconds
};

const STATUSES = [undefined, "deleted"];
export async function POST() {
  const settings = getSettings();

  if (!settings) {
    return NextResponse.json({ error: "Missing settings" }, { status: 400 });
  }

  const bodyParams = new URLSearchParams({
    vendor_id: settings.vendor_id ?? "",
    vendor_auth_code: settings.vendor_auth_code ?? "",
    page: settings.start_page.toString(),
    results_per_page: "250",
  });

  if (settings.subscription_id) {
    bodyParams.set("subscription_id", String(settings.subscription_id));
  }

  const params = {
    headers: {
      Prefer: "code=200",
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: bodyParams,
    timeout: false as const,
  };

  const key = Buffer.from(JSON.stringify(bodyParams)).toString("base64");

  statusEvents.emit("statusUpdate", {
    key,
    status: USERS_API_STATUS.Uploading,
    progress: 0,
  });

  for (const status of STATUSES) {
    let currentPage = params.body.get("page")
      ? parseInt(params.body.get("page") as string, 10)
      : settings.start_page;

    while (currentPage <= settings.max_pages) {
      console.log(`[paddle-api] Fetching users:${status}, page:`, {
        currentPage,
        ...settings,
      });

      params.body.set("page", String(currentPage));

      if (status) {
        params.body.set("state", String(status));
      }

      currentPage += 1;

      // Fetch users for the current page
      const response = await ky.post(API_URLS[settings.api_type], params).json<{
        success: boolean;
        response: User[];
        error?: { message: string; code: number };
      }>();

      if (response.error) {
        console.log("Error fetching users:", response.error);
        return NextResponse.json(response.error, { status: 500 });
      }

      console.log(
        `[paddle-api] Fetched users:${status} for page:`,
        currentPage - 1,
        "Users in page:",
        response.response.length
      );

      if (!response.success) {
        console.error("Failed to fetch users:", response);

        statusEvents.emit("statusUpdate", {
          key,
          status: USERS_API_STATUS.Idle,
          progress: 0,
        });

        return NextResponse.json(
          {
            success: false,
            message: `Failed to fetch users:${status}; ${
              response || "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }

      if (response.response.length === 0) {
        console.log("No more users to fetch, ending.", response);
        params.body.set("page", String(settings.start_page));
        break; // No more users to fetch
      }

      insertUsers(response.response);
      statusEvents.emit("statusUpdate", {
        key,
        status: USERS_API_STATUS.Uploading,
        progress: Math.round((currentPage / settings.max_pages) * 100),
      });
    }
  }

  statusEvents.emit("statusUpdate", {
    key,
    status: USERS_API_STATUS.Idle,
    progress: 0,
  });

  return NextResponse.json(getAllUsers());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");

  const users = getAllUsers();

  if (start_date || end_date) {
    return NextResponse.json(
      getUsersBySignupDateRange(start_date ?? "", end_date ?? "")
    );
  }

  return NextResponse.json(users);
}

export async function DELETE() {
  deleteAllUsers();
  return NextResponse.json({ success: true, message: "All users deleted" });
}
