import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ContextProviders from "@/context";

export const metadata = {
  title: "RoadLens - Smart Traffic Monitoring System",
  description:
    "Intelligent traffic monitoring system with dynamic traffic lights and advanced detection features",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProviders>{children}</ContextProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
