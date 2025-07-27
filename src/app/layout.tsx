import { AppTitleBar } from "@/components/app-title-bar";
import { Providers } from "@/modules/theme/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppTitleBar>{children}</AppTitleBar>
        </Providers>
      </body>
    </html>
  );
}
