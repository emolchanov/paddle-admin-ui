import { getKeys } from "@/database/keys/get-keys";
import { NextResponse } from "next/server";
import ky from "ky";
import { User } from "@/database/users/types";
import {
  deleteAllUsers,
  getAllUsers,
  insertUsers,
} from "@/database/users/actions";

const API_URL =
  "https://stoplight.io/mocks/paddle/api-reference/30744711/2.0/subscription/users";

export async function POST() {
  const keys = getKeys();

  const params = {
    headers: {
      Prefer: "code=200",
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      vendor_id: keys?.vendor_id ?? "",
      vendor_auth_code: keys?.vendor_auth_code ?? "",
      page: "1",
      results_per_page: "250",
    }),
  };

  const maxPages = 10;
  let currentPage = 1;

  while (currentPage <= maxPages) {
    params.body.set("page", String(currentPage));
    currentPage += 1;

    // Fetch users for the current page
    const response = await ky
      .post(API_URL, params)
      .json<{ success: boolean; response: User[] }>();

    console.log(
      "[paddle-api] Fetched users for page:",
      currentPage - 1,
      "Users in page:",
      response.response.length
    );

    if (!response.success) {
      console.error("Failed to fetch users:", response);
      return NextResponse.json({
        success: false,
        message: "Failed to fetch users",
      });
    }

    if (response.response.length === 0) {
      break; // No more users to fetch
    }

    if (response.success) {
      insertUsers(response.response);
    }
  }

  return NextResponse.json(getAllUsers());
}

export async function GET() {
  const users = getAllUsers();
  return NextResponse.json(users);
}

export async function DELETE() {
  deleteAllUsers();
  return NextResponse.json({ success: true, message: "All users deleted" });
}
