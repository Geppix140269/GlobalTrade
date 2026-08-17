/**
 * The public origin, used to build absolute URLs for link previews.
 *
 * A link preview is fetched by somebody else's server — WhatsApp's, not the
 * reader's browser — so every URL in the metadata has to be absolute. Vercel
 * exposes the production host at build and run time; NEXT_PUBLIC_APP_URL
 * overrides it if the app ever moves to its own domain.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/** The link a member pastes into a chat. */
export function shareUrl(slug: string): string {
  return `${siteUrl()}/m/${slug}`;
}
