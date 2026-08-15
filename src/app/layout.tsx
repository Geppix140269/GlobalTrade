import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/*
 * The three faces the design language names. They are vendored under
 * `src/app/fonts/` with their OFL licences and declared with
 * `next/font/local`, so nothing is fetched from a font CDN at build or run
 * time — a font that arrives over the network is a brand that depends on
 * somebody else's uptime.
 */
const playfair = localFont({
  src: [
    { path: "./fonts/PlayfairDisplay-latin.woff2", weight: "400 600", style: "normal" },
    { path: "./fonts/PlayfairDisplay-Italic-latin.woff2", weight: "400 600", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const inter = localFont({
  src: [{ path: "./fonts/Inter-latin.woff2", weight: "300 600", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
});

const mono = localFont({
  src: [{ path: "./fonts/JetBrainsMono-latin.woff2", weight: "400 500", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Global Trade Network — Community Directory",
  description: "Private directory for the Global Trade Network Community.",
  // The directory is private and must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
