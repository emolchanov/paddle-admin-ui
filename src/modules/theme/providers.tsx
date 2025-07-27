"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CssBaseline,
  InitColorSchemeScript,
  ThemeProvider,
} from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { theme } from "@/modules/theme/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 2, // 2 minutes
      staleTime: 1000 * 60, // 1 minute
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
    },
  },
});

export function Providers(props: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <InitColorSchemeScript attribute="class" />
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {props.children}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
