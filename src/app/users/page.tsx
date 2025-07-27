"use client";
import * as MUI from "@mui/material";
import { PaddleUsers } from "@/modules/paddle-users/paddle-users";

export default function Dashboard() {
  return (
    <MUI.Box sx={{ m: 4 }}>
      <PaddleUsers />
    </MUI.Box>
  );
}

export const dynamic = "force-dynamic";
