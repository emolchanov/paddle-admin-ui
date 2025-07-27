"use client";

import { memo, PropsWithChildren, useState } from "react";
import * as MUI from "@mui/material";
import { NavTabs } from "./nav-tabs";

export const AppTitleBar = memo((props: PropsWithChildren) => {
  return (
    <>
      <MUI.AppBar position="sticky" color="default" elevation={0}>
        <MUI.AppBar position="static" color="primary" elevation={0}>
          <MUI.Toolbar
            variant="dense"
            sx={{ userSelect: "none", appRegion: "drag" }}
          >
            <MUI.Stack
              direction="row"
              sx={{ width: "100%" }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <MUI.Typography variant="h6">Paddle Dashboard</MUI.Typography>
            </MUI.Stack>
          </MUI.Toolbar>
        </MUI.AppBar>
        <NavTabs />
        <MUI.Divider />
      </MUI.AppBar>
      {props.children}
    </>
  );
});
