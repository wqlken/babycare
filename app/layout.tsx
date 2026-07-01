import type { Metadata, Viewport } from "next";
import { OfflineFormGuard } from "@/components/offline-form-guard";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Babycare",
  title: "Babycare",
  description: "Family care coordination app",
  appleWebApp: {
    capable: true,
    title: "Babycare",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <OfflineFormGuard />
      </body>
    </html>
  );
}
