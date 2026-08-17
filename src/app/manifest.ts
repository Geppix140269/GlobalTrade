import type { MetadataRoute } from "next";

/**
 * Lets a member "Add to Home Screen" from their phone and get an app-like
 * launcher instead of a browser bookmark — most of them arrive from WhatsApp.
 * Contains no directory data; it is served before authentication.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Global Trade Network — Community Directory",
    short_name: "Trade Network",
    description: "Private directory for the Global Trade Network Community.",
    start_url: "/members",
    display: "standalone",
    background_color: "#0F0F0E",
    theme_color: "#0F0F0E",
    icons: [
      { src: "/brand/ponte-app-icon-512.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/ponte-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/ponte-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/ponte-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
