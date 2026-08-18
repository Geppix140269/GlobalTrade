import { NextResponse, type NextRequest } from "next/server";

/**
 * Sends a member who is already signed in from the public share card straight
 * to the full profile.
 *
 * This lives in middleware rather than in the page so that /m/<slug> can be
 * cached. Reading cookies inside the page would make it dynamic, and the whole
 * point of that route is to answer a link-preview crawler in a few
 * milliseconds without waking the database.
 *
 * This is NOT an authorization check, it only notices that a session cookie
 * exists. The destination re-reads the session from the database and redirects
 * to the login itself if the cookie is stale or the account was disabled, so a
 * forged cookie buys nothing but a redirect.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function middleware(request: NextRequest) {
  const signedIn = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!signedIn) return NextResponse.next();

  const slug = request.nextUrl.pathname.slice("/m/".length);
  if (!slug) return NextResponse.next();

  return NextResponse.redirect(new URL(`/members/${slug}`, request.url));
}

export const config = { matcher: "/m/:slug" };
