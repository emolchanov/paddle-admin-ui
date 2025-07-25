import { PaddleKeys } from "@/modules/paddle-keys";
import type { Metadata } from "next";
import React from "react";
import * as MUI from "@mui/material";
import { PaddleUsers } from "@/modules/paddle-users/paddle-users";

export const metadata: Metadata = {
  title: "Dashboard ",
};

export default function Dashboard() {
  return (
    <MUI.Stack gap={2}>
      <PaddleKeys />
      <PaddleUsers />
    </MUI.Stack>
  );
}
export const dynamic = "force-dynamic"; // This page should always be server-rendered
export const revalidate = 0; // Disable static generation caching
