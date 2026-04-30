import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zone — AI Content Portal",
  description: "A continuously generating AI image and video portal.",
};

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-zone-bg text-zone-text antialiased">
        <Header />
        <main className="max-w-screen-2xl mx-auto px-2 sm:px-6 pt-4 pb-8">{children}</main>
      </body>
    </html>
  );
}
