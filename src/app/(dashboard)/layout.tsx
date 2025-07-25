"use client";
import React from "react";
import * as MUI from "@mui/material";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MUI.AppBar position="static">
        <MUI.Toolbar>
          <MUI.Typography variant="h6">Paddle Dashboard</MUI.Typography>
        </MUI.Toolbar>
      </MUI.AppBar>
      <MUI.Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </MUI.Container>
    </>
  );
}
