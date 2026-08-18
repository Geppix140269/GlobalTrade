# Global Trade Network, Community Directory

## Writing rules

**NEVER USE EM DASHES.** Not in chat replies, not in code comments, not in UI
copy, not in commit messages, not in anything written for the Community. Use a
comma, a colon, a full stop, or parentheses instead. Rewrite the sentence if
none of those fit. This is an absolute rule, stated by the owner, and it has no
exceptions.

Do not substitute an en dash (–) either. If a range or a pause needs marking,
use words or punctuation that is not a long dash.

Text a member wrote about themselves is theirs. Do not rewrite it to satisfy a
style rule, including this one. Correct an outright typo, tidy a duplicated tag,
and leave the prose alone.

## Product rules

The directory is private. No page renders or queries member data before the
session is checked, and every server action re-checks authorisation itself.
Hiding a button is presentation, never the security boundary.

The one public surface is `/m/<slug>`, the share card. It carries exactly four
things: name, role, company, base country. Everything else stays behind the
login. Do not widen it without asking.

## Design rules

The design language and the brand are Ponte Trade's, adopted from
`Geppix140269/ponte-trade`. `src/app/tokens.css` is the only source of colour,
type, spacing and motion. A hard coded hex anywhere else is a defect.

Three voices, and they do not borrow each other's job:
serif names a thing, sans explains it, mono classifies it.

No shadows. No border radius, apart from 2px on a focus ring. Structure is drawn
with rules, not floating cards. Gold is the keystone and the brand fill; it is
never a status, never verification, never success.

The mark is referenced, never drawn. `src/components/BrandMark.tsx` loads the
exported asset, and `npm run check:brand` fails the build if the geometry
reappears in source. The `Ponte.trade` lockup is not used here: this product
carries the mark and the design, and keeps its own name in type beside it.

In Tailwind, write a font size from the token set as `text-(length:--pt-body)`.
The bare `text-[var(--pt-body)]` form is ambiguous and resolves as a colour.
Element level styles belong in `@layer base`, or they outrank every utility.

## Data rules

`db:seed` matches a member by exact name, so it is only safe for people who have
no account yet. Once somebody claims a profile they maintain it themselves;
remove them from `prisma/seed-data.ts` and use Admin, Members after that.

Slugs are issued once and then left alone. A link already pasted into a chat has
to keep working when somebody edits their name.

Anything cached from a member's row must be revalidated when the row changes.
Profile writes and status changes both call `revalidatePath("/m/<slug>")`.

## Deployment

Vercel, deployed from `claude/global-trade-network-directory-edi37j`. Postgres is
Neon, reached over HTTPS from this sandbox because the database ports are
blocked here. `scripts/setup-neon.ts` does schema, seed and admin over port 443.
