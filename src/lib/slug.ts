/**
 * Readable identifiers for the shareable link at /m/<slug>.
 *
 * A slug is issued once and then left alone: a link already pasted into a
 * WhatsApp thread has to keep working, so renaming a profile must not break
 * the link somebody sent last week.
 */

/** "Elmarie van Noorden" -> "elmarie-van-noorden". */
export function slugify(name: string): string {
  return (
    name
      .normalize("NFKD")
      // Strip the diacritics NFKD just separated, so "Ceylán" -> "ceylan"
      // rather than losing the letter entirely.
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "")
  );
}

/**
 * Picks a slug not already taken. Two people with the same name get -2, -3,
 * and so on, rather than one of them silently failing a unique constraint.
 */
export function uniqueSlug(name: string, taken: ReadonlySet<string>): string {
  const base = slugify(name) || "member";
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`Could not find a free slug for "${name}"`);
}
