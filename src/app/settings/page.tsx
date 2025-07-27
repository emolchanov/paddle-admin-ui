"use client";
import * as MUI from "@mui/material";
import { PaddleSettings } from "@/modules/paddle-settings";

export default function Settings() {
  return (
    <MUI.Box sx={{ m: 4 }}>
      <PaddleSettings />
    </MUI.Box>
  );
}

export const dynamic = "force-dynamic";
