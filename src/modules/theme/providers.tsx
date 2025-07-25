"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CssBaseline,
  InitColorSchemeScript,
  ThemeProvider,
} from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { theme } from "@/modules/theme/theme";

export function Providers({children}: {children: React.ReactNode}) {
  const queryClient = new QueryClient();

  return (
    <>
      <InitColorSchemeScript attribute="class" />
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </>
  );
}
