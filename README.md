# Global Trade Network — Community Directory

A small, private, member-maintained directory for the Global Trade Network WhatsApp
Community. WhatsApp stays the conversation layer; this is the structured memory:
who is in the network, what they do, which markets they cover, what they are working
on, what they need, and the active requests circulating in the Community.

Access is by invitation only. There is no public registration and no directory data
is served to an unauthenticated visitor.

## Stack

| Concern     | Choice                                                    |
| ----------- | --------------------------------------------------------- |
| Framework   | Next.js 15 (App Router, server actions), React 19          |
| Language    | TypeScript, `strict`                                       |
| Database    | PostgreSQL via Prisma                                      |
| Auth        | Auth.js (NextAuth v5), credentials provider, bcrypt hashes |
| Validation  | Zod, applied server-side on every mutation                 |
| Styling     | Tailwind CSS v4                                            |
| Tests       | Vitest                                                     |
| Hosting     | Vercel                                                     |

## Local setup

Requires Node 20+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run db:push                # create the tables
npm run db:seed                # load the founding members and their requests
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' npm run create:admin
npm run dev                    # http://localhost:3000
```

## Environment variables

Set these in `.env.local` locally and in Vercel → Settings → Environment Variables.
Never commit real values; `.env.example` lists names only.

| Variable       | Required | Purpose                                                          |
| -------------- | -------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | yes      | PostgreSQL connection string. Use the pooled URL in production.   |
| `AUTH_SECRET`  | yes      | Signs session cookies. Generate with `openssl rand -base64 32`.   |
| `NEXTAUTH_URL` | local    | Base URL when developing. Vercel sets this automatically.         |

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are read only by `npm run create:admin`. Pass them on
the command line rather than storing them in a file.

## Database setup

`npm run db:push` applies `prisma/schema.prisma` directly — enough for a project this
size. If you later want migration history, switch to `npx prisma migrate dev`.

`npm run db:seed` is idempotent: members are matched by name and requests by requester
plus type, so re-running updates rather than duplicates.

Three entities, deliberately lightly normalised:

- **Member** — the directory profile. Markets and expertise are string arrays.
- **User** — a login. At most one per member profile, linked by `memberId`.
- **Opportunity** — an active request, optionally linked to a requester profile and to
  the members who could contribute to it.

## Authentication

Email plus password, one account per person — never a shared Community password.
Passwords are hashed with bcrypt (cost 12) and never stored, logged or exported in
plaintext. Sessions are JWT cookies signed with `AUTH_SECRET`.

The token carries the user id only. Role, enabled/disabled state and profile ownership
are re-read from the database on every request in `getCurrentUser()`, so when an admin
disables an account or changes a role it takes effect on the member's very next page
load rather than whenever their token happens to expire.

Members can change their own password at **My Profile → Change my password**. Admins can
reset any password from the Accounts page. There is no email-based self-service reset —
that would need an email provider, which V1 deliberately does not have.

## Creating the initial admin

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' npm run create:admin
```

Run it against production by setting `DATABASE_URL` to the production database in the
same command. Re-running with an existing email resets that account's password and
ensures it is an enabled admin — this is also the recovery path if you lock yourself out.

An admin account does not need a member profile. If you are also a Community member,
create your profile first and link it when creating the account.

## Creating and disabling member accounts

All of this lives under **Admin → Accounts**:

- **Create a login** — pick the member profile to link, set the role, set an initial
  password, and share it with the member securely. They are flagged to change it.
- **Disable access** — revokes access immediately while keeping the profile and its
  history. Reversible with *Enable access*.
- **Make admin / Make member** — changes the role.
- **Reset** — sets a new password.

You cannot disable your own account or remove your own admin role, so the directory can
never be left without an administrator.

Only member profiles that do not already have an account appear in the link dropdown,
which enforces one account per member.

To remove someone from the directory entirely, disable their login *and* archive their
profile under **Admin → Members**.

## How member-profile ownership works

Each account links to at most one member profile via `User.memberId`. That link is the
only thing that grants edit rights.

The rules are pure functions in `src/lib/authz.ts` and are enforced in every server
action before any write:

- A member may edit **only** their linked profile. `updateMyProfile` derives the target
  id from the session, never from the submitted form, so a crafted request naming
  another member's id simply cannot reach that record.
- `status` is admin-only. A member's submission has it stripped, so nobody can
  un-archive themselves.
- Admin routes are gated in the route layout *and* re-checked inside each action. UI
  hiding is presentation only, never the security boundary.

`tests/authz.test.ts` covers the rules; `tests/integration/actions.test.ts` exercises the
real server actions against a real database, including the crafted-form case.

## Adding and editing opportunities

**Admin → Active Requests**. In V1 members can read requests but not publish them —
they raise things in WhatsApp and the admin curates them in, which keeps quality and
phrasing under editorial control.

Each request records the requester, type, market, the request itself, support needed,
notes, and a status: Open → In Progress → Matched → Closed, plus On Hold. The list view
has one-click transitions; the edit form covers everything.

**Members who could contribute** reflects how the Community actually works: one member
has the supplier, another the buyer, another logistics, finance or inspection. Tick
everyone relevant and the request surfaces on each of their profiles under *Could
contribute to*. There is no automated matchmaking — the data model just makes the
answer visible.

Ordinary profile edits save directly; there is no moderation queue. If you later want
one, every profile write already funnels through `applyMemberProfileUpdate()` in
`src/actions/profile.ts`, so a pending-review workflow can be added in that one place.

## Vercel deployment

1. Push this repository to GitHub (private).
2. In Vercel, **Add New → Project** and import it. The framework preset is detected;
   the build command `prisma generate && next build` is already in `package.json`.
3. Provision PostgreSQL — Vercel Postgres, Neon or Supabase all work.
4. Set `DATABASE_URL` and `AUTH_SECRET` for Production (and Preview if you use it).
5. Deploy.
6. Prepare the database once, from your machine, pointing at production:

   ```bash
   DATABASE_URL='<production-url>' npm run db:push
   DATABASE_URL='<production-url>' npm run db:seed
   DATABASE_URL='<production-url>' ADMIN_EMAIL=you@example.com \
     ADMIN_PASSWORD='a-long-passphrase' npm run create:admin
   ```

7. Sign in and create the member logins from **Admin → Accounts**.

Keep Vercel's Deployment Protection on for Preview deployments so drafts are not
reachable, and keep the GitHub repository private.

## Backup and export

```bash
npm run db:export      # writes exports/directory-YYYY-MM-DD.json
```

Exports every member, request and account record as JSON — plain, portable, and easy to
move to another store. **Password hashes are deliberately excluded**, so an export is
never credential material. `exports/` is git-ignored because the file contains member
contact details; store it somewhere private.

Run it against production by prefixing `DATABASE_URL='<production-url>'`. If your
database provider offers automated snapshots, keep those on as well.

## Security notes

- Repository must stay **private**. It contains member professional contact data.
- No secrets in git. `.env*` is git-ignored; `.env.example` carries names only.
- No directory data is rendered or fetched before authentication — the authenticated
  layout resolves the session first, and every page and action re-checks.
- Every mutation is validated with Zod and authorized server-side. There are no
  unauthenticated data APIs.
- Failed logins return one generic message and take comparable time whether the email
  exists or not, so the form cannot be used to enumerate members.
- Passwords are never written to logs, and `create:admin` prints only the email.
- Indexing is disabled via `robots.txt`, a `noindex` meta tag and an `X-Robots-Tag`
  header, alongside `nosniff`, `DENY` framing and a strict referrer policy.
- Rotating `AUTH_SECRET` invalidates every session — the fastest way to sign everyone
  out if a device is lost.

## Scripts

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Development server                            |
| `npm run build`         | Production build (runs `prisma generate`)     |
| `npm run lint`          | ESLint                                        |
| `npm run typecheck`     | TypeScript, no emit                           |
| `npm test`              | Vitest                                        |
| `npm run db:push`       | Apply the schema                              |
| `npm run db:seed`       | Load / refresh seed data                      |
| `npm run db:export`     | Export the directory to JSON                  |
| `npm run create:admin`  | Create or reset the admin account             |

Run the integration tests against a throwaway database:

```bash
TEST_DATABASE_URL='postgresql://...' npx prisma db push
TEST_DATABASE_URL='postgresql://...' npm test
```

They are skipped when `TEST_DATABASE_URL` is unset.

## Out of scope for V1

Member self-registration, member-to-member messaging, notifications, email, automated
WhatsApp ingestion, matchmaking, analytics and multilingual UI are intentionally absent.
The goal is a directory that preserves the Community's knowledge and opportunities, not
another platform.
