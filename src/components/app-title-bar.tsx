"use client";

import { memo, PropsWithChildren, useState, useEffect } from "react";
import * as MUI from "@mui/material";
import * as MUIcons from "@mui/icons-material";
import { NavTabs } from "./nav-tabs";

export const AppTitleBar = memo((props: PropsWithChildren) => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
            <MUI.Stack
              direction="row"
              sx={{ position: "absolute", right: 16, bottom: 12 }}
            >
              <MUI.Chip
                label={isOffline ? "Offline" : "Online"}
                icon={isOffline ? <MUIcons.WifiOff /> : <MUIcons.Wifi />}
                color={isOffline ? "error" : "primary"}
                size="small"
              />
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
