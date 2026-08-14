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
    background_color: "#0d1a31",
    theme_color: "#0d1a31",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
