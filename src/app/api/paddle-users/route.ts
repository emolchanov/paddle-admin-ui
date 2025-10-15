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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const settings = getSettings();

  if (!settings) {
    return NextResponse.json({ error: "Missing settings" }, { status: 400 });
  }

  // Track if request was aborted
  let isAborted = false;
  const abortHandler = () => {
    isAborted = true;
    console.log("[paddle-api] Request aborted by client");
  };
  
  request.signal.addEventListener("abort", abortHandler);

  const bodyParams = new URLSearchParams({
    vendor_id: settings.vendor_id ?? "",
    vendor_auth_code: settings.vendor_auth_code ?? "",
    results_per_page: "250",
  });

  if (settings.subscription_id) {
    bodyParams.set("subscription_id", String(settings.subscription_id));
  }

  if (settings.plan_id) {
    bodyParams.set("plan_id", String(settings.plan_id));
  }

  const key = Buffer.from(JSON.stringify(bodyParams)).toString("base64");

  statusEvents.emit("statusUpdate", {
    key,
    status: USERS_API_STATUS.Uploading,
    message: `Starting download users...`,
  });

  for (const status of STATUSES) {
    let currentPage = settings.start_page;

    while (currentPage <= settings.max_pages && !isAborted) {
      // Prepare parameters for this request
      const currentParams = new URLSearchParams(bodyParams.toString());
      
      // Add page number
      currentParams.set("page", String(currentPage));
      
      // Add status if present
      if (status) {
        currentParams.set("state", String(status));
      }

      const params = {
        headers: {
          Prefer: "code=200",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: currentParams.toString(), // Convert to string immediately
        timeout: false as const,
      };

      console.log(`[paddle-api] Fetching users:${status}, page:`, {
        currentPage,
        params: Object.fromEntries(currentParams.entries()),
      });

      // Fetch users for the current page
      const response = await ky.post(API_URLS[settings.api_type], params).json<{
        success: boolean;
        response: User[];
        error?: { message: string; code: number };
      }>();

      const { error, success, response: users } = response;

      if (error) {
        console.log("Error fetching users:", error);
        return NextResponse.json(error, { status: 500 });
      }

      console.log(
        `[paddle-api] Fetched users:${status} for page:`,
        currentPage,
        "Users in page:",
        users.length
      );

      if (!success) {
        console.error("Failed to fetch users:", error);

        statusEvents.emit("statusUpdate", {
          key,
          status: USERS_API_STATUS.Idle,
          message: `Upload error: Failed to fetch users:${status}`,
        });

        return NextResponse.json(
          {
            success: false,
            message: `Failed to fetch users:${status}; ${
              error || "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }

      if (users.length === 0) {
        console.log("No more users to fetch, ending.");
        break; // No more users to fetch
      }

      const count = insertUsers(users);

      statusEvents.emit("statusUpdate", {
        key,
        status: USERS_API_STATUS.Uploading,
        message: `Uploaded ${count} users${
          status ? ` (${status})` : ""
        } from page ${currentPage}`,
      });

      await delay(500);

      currentPage += 1;
    }
    
    // If aborted, break outer loop too
    if (isAborted) {
      break;
    }
  }

  // Clean up abort listener
  request.signal.removeEventListener("abort", abortHandler);

  // If request was aborted, send appropriate response
  if (isAborted) {
    statusEvents.emit("statusUpdate", {
      key,
      status: USERS_API_STATUS.Idle,
      message: `Upload cancelled by user`,
    });

    return NextResponse.json(
      { success: false, message: "Request cancelled" },
      { status: 499 } // Client Closed Request
    );
  }

  statusEvents.emit("statusUpdate", {
    key,
    status: USERS_API_STATUS.Idle,
    message: `Upload complete`,
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
