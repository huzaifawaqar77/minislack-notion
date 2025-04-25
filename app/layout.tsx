import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { ChannelProvider } from "@/contexts/channel-context";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { DMProvider } from "@/contexts/dm-context";
import { NotificationProvider } from "@/contexts/notification-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "MinSlack - Modern Communication Platform",
  description:
    "A modern communication platform for teams of all sizes. Stay connected, organized, and productive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
          storageKey="minislack-theme"
        >
          <AuthProvider>
            <WorkspaceProvider>
              <ChannelProvider>
                <WebSocketProvider>
                  <NotificationProvider>
                    <DMProvider>
                      {children}
                      <Toaster />
                    </DMProvider>
                  </NotificationProvider>
                </WebSocketProvider>
              </ChannelProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
