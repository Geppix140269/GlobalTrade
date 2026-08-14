import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Trade Network — Community Directory",
  description: "Private directory for the Global Trade Network Community.",
  // The directory is private and must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
