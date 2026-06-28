import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackBack | PLSP Lost & Found",
  description:
    "Digital lost and found system for Pamantasan ng Lungsod ng San Pablo. Report, search, and claim lost or found items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}